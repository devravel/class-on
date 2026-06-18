import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { handlePrismaError } from '../common/errors/handle-prisma-error'
import { MarkAttendanceDto } from './dto/mark-attendance.dto'

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  async markAttendance(lessonId: bigint, dto: MarkAttendanceDto, teacherId: bigint) {
    try {
      // Verificar se a aula existe e pertence ao professor
      const lesson = await this.ensureLessonOwnership(lessonId, teacherId)

      // Verificar se todos os alunos estão matriculados na turma
      const studentIds = dto.attendances.map((att) => BigInt(att.student_id))
      await this.ensureStudentsEnrolled(studentIds, lesson.assignments.class_id)

      const now = new Date()

      // Processar cada registro de presença
      const results = []
      for (const attendance of dto.attendances) {
        const studentId = BigInt(attendance.student_id)

        // Verificar se já existe registro de presença
        const existing = await this.prisma.attendances.findFirst({
          where: {
            student_id: studentId,
            lesson_id: lessonId,
          },
          select: { id: true },
        })

        if (existing) {
          // Atualizar registro existente
          const updated = await this.prisma.attendances.update({
            where: { id: existing.id },
            data: {
              status: attendance.status,
            },
            include: {
              students: {
                select: {
                  id: true,
                  full_name: true,
                  rm: true,
                },
              },
            },
          })
          results.push(updated)
        } else {
          // Criar novo registro
          const maxIdRecord = await this.prisma.attendances.findFirst({
            orderBy: { id: 'desc' },
            select: { id: true },
          })

          const nextId = (maxIdRecord?.id ?? BigInt(0)) + BigInt(1)

          const created = await this.prisma.attendances.create({
            data: {
              id: nextId,
              student_id: studentId,
              lesson_id: lessonId,
              status: attendance.status,
              created_at: now,
            },
            include: {
              students: {
                select: {
                  id: true,
                  full_name: true,
                  rm: true,
                },
              },
            },
          })
          results.push(created)
        }
      }

      return {
        lesson_id: lessonId,
        total_marked: results.length,
        attendances: results,
      }
    } catch (error) {
      handlePrismaError(error)
    }
  }

  async findByLesson(lessonId: bigint, teacherId?: bigint) {
    try {
      // Se for professor, verificar ownership
      if (teacherId) {
        await this.ensureLessonOwnership(lessonId, teacherId)
      }

      const attendances = await this.prisma.attendances.findMany({
        where: { lesson_id: lessonId },
        include: {
          students: {
            select: {
              id: true,
              full_name: true,
              rm: true,
            },
          },
          lessons: {
            select: {
              date: true,
              lesson_order: true,
              content: true,
              assignments: {
                select: {
                  subjects: {
                    select: {
                      name: true,
                    },
                  },
                  classes: {
                    select: {
                      series: true,
                      letter: true,
                      shift: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: {
          students: { full_name: 'asc' },
        },
      })

      return attendances
    } catch (error) {
      handlePrismaError(error)
    }
  }

  async getStudentSummary(
    studentId: bigint,
    teacherId?: bigint,
    classId?: bigint,
  ) {
    try {
      const student = await this.prisma.students.findUnique({
        where: { id: studentId },
        select: {
          id: true,
          full_name: true,
          rm: true,
        },
      })

      if (!student) {
        throw new NotFoundException('Aluno não encontrado')
      }

      if (teacherId) {
        await this.ensureStudentAccess(studentId, teacherId)
      }

      const attendances = await this.prisma.attendances.findMany({
        where: {
          student_id: studentId,
          ...(classId !== undefined && {
            lessons: {
              assignments: {
                class_id: classId,
              },
            },
          }),
        },
        select: {
          status: true,
          lessons: {
            select: {
              date: true,
              assignments: {
                select: {
                  id: true,
                  class_id: true,
                  subjects: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                  teachers: {
                    select: {
                      id: true,
                      full_name: true,
                    },
                  },
                },
              },
            },
          },
        },
      })

      const classAssignments =
        classId !== undefined
          ? await this.prisma.assignments.findMany({
              where: { class_id: classId },
              select: {
                id: true,
                subjects: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
                teachers: {
                  select: {
                    id: true,
                    full_name: true,
                  },
                },
              },
              orderBy: {
                subjects: { name: 'asc' },
              },
            })
          : undefined

      const disciplineAttendance = this.buildDisciplineAttendance(
        attendances,
        classAssignments,
      )
      const generalAttendanceRate = this.computeGeneralAttendanceRate(
        disciplineAttendance.map((entry) => entry.attendance_rate),
      )

      const totalLessons = attendances.length
      const present = attendances.filter((att) => att.status === 'PRESENT').length
      const absent = attendances.filter((att) => att.status === 'ABSENT').length
      const attendanceRate = this.computeAttendanceRate(present, totalLessons)

      return {
        student,
        total_lessons: totalLessons,
        present,
        absent,
        attendance_rate: attendanceRate,
        general_attendance_rate: generalAttendanceRate,
        discipline_attendance: disciplineAttendance,
        attendances,
      }
    } catch (error) {
      handlePrismaError(error)
    }
  }

  async getClassStudentsAttendance(classId: bigint) {
    try {
      const classRecord = await this.prisma.classes.findUnique({
        where: { id: classId },
        select: { id: true },
      })

      if (!classRecord) {
        throw new NotFoundException('Turma não encontrada')
      }

      const enrollments = await this.prisma.enrollments.findMany({
        where: { class_id: classId },
        select: {
          students: {
            select: {
              id: true,
              full_name: true,
              rm: true,
            },
          },
        },
        orderBy: {
          students: { full_name: 'asc' },
        },
      })

      const classAssignments = await this.prisma.assignments.findMany({
        where: { class_id: classId },
        select: {
          id: true,
          subjects: {
            select: {
              id: true,
              name: true,
            },
          },
          teachers: {
            select: {
              id: true,
              full_name: true,
            },
          },
        },
        orderBy: {
          subjects: { name: 'asc' },
        },
      })

      const summaries = await Promise.all(
        enrollments.map(async ({ students: student }) => {
          const attendances = await this.prisma.attendances.findMany({
            where: {
              student_id: student.id,
              lessons: {
                assignments: {
                  class_id: classId,
                },
              },
            },
            select: {
              status: true,
              lessons: {
                select: {
                  assignments: {
                    select: {
                      id: true,
                    },
                  },
                },
              },
            },
          })

          const disciplineAttendance = this.buildDisciplineAttendance(
            attendances,
            classAssignments,
          )

          return {
            student,
            general_attendance_rate: this.computeGeneralAttendanceRate(
              disciplineAttendance.map((entry) => entry.attendance_rate),
            ),
            discipline_attendance: disciplineAttendance,
          }
        }),
      )

      return summaries
    } catch (error) {
      handlePrismaError(error)
    }
  }

  private computeAttendanceRate(present: number, total: number): number {
    return total > 0 ? Math.round((present / total) * 100 * 100) / 100 : 0
  }

  private computeGeneralAttendanceRate(rates: number[]): number {
    if (rates.length === 0) {
      return 0
    }

    const sum = rates.reduce((acc, rate) => acc + rate, 0)
    return Math.round((sum / rates.length) * 100) / 100
  }

  private buildDisciplineAttendance(
    attendances: Array<{
      status: string
      lessons: {
        assignments: {
          id: bigint
          subjects?: { id: bigint; name: string }
          teachers?: { id: bigint; full_name: string }
        }
      }
    }>,
    classAssignments?: Array<{
      id: bigint
      subjects: { id: bigint; name: string }
      teachers: { id: bigint; full_name: string }
    }>,
  ) {
    const statsByAssignment = new Map<
      bigint,
      { present: number; total: number }
    >()

    for (const attendance of attendances) {
      const assignmentId = attendance.lessons.assignments.id
      const current = statsByAssignment.get(assignmentId) ?? {
        present: 0,
        total: 0,
      }

      current.total += 1
      if (attendance.status === 'PRESENT') {
        current.present += 1
      }

      statsByAssignment.set(assignmentId, current)
    }

    const assignments =
      classAssignments ??
      Array.from(
        attendances.reduce(
          (map, attendance) => {
            const assignment = attendance.lessons.assignments
            if (!map.has(assignment.id)) {
              map.set(assignment.id, {
                id: assignment.id,
                subjects: assignment.subjects ?? {
                  id: assignment.id,
                  name: '—',
                },
                teachers: assignment.teachers ?? {
                  id: assignment.id,
                  full_name: '—',
                },
              })
            }
            return map
          },
          new Map<
            bigint,
            {
              id: bigint
              subjects: { id: bigint; name: string }
              teachers: { id: bigint; full_name: string }
            }
          >(),
        ).values(),
      )

    return assignments.map((assignment) => {
      const stats = statsByAssignment.get(assignment.id) ?? {
        present: 0,
        total: 0,
      }

      return {
        assignment_id: assignment.id,
        subject_name: assignment.subjects.name,
        teacher_name: assignment.teachers.full_name,
        total_lessons: stats.total,
        present: stats.present,
        absent: stats.total - stats.present,
        attendance_rate: this.computeAttendanceRate(stats.present, stats.total),
      }
    })
  }

  private async ensureLessonOwnership(lessonId: bigint, teacherId: bigint) {
    try {
      const lesson = await this.prisma.lessons.findUnique({
        where: { id: lessonId },
        include: {
          assignments: {
            select: {
              teacher_id: true,
              class_id: true,
            },
          },
        },
      })

      if (!lesson) {
        throw new NotFoundException('Aula não encontrada')
      }

      if (lesson.assignments.teacher_id !== teacherId) {
        throw new BadRequestException('Você não tem permissão para esta aula')
      }

      return lesson
    } catch (error) {
      handlePrismaError(error)
    }
  }

  private async ensureStudentsEnrolled(studentIds: bigint[], classId: bigint) {
    try {
      const enrolledStudents = await this.prisma.students.findMany({
        where: {
          id: { in: studentIds },
          enrollments: {
            some: {
              class_id: classId,
            },
          },
        },
        select: { id: true },
      })

      const enrolledIds = enrolledStudents.map((s) => s.id)
      const notEnrolledIds = studentIds.filter((id) => !enrolledIds.includes(id))

      if (notEnrolledIds.length > 0) {
        throw new BadRequestException(
          `Alunos com IDs ${notEnrolledIds.join(', ')} não estão matriculados nesta turma`,
        )
      }
    } catch (error) {
      handlePrismaError(error)
    }
  }

  private async ensureStudentAccess(studentId: bigint, teacherId: bigint) {
    try {
      // Verificar se o professor tem acesso ao aluno através de suas atribuições
      const hasAccess = await this.prisma.students.findFirst({
        where: {
          id: studentId,
          enrollments: {
            some: {
              classes: {
                assignments: {
                  some: {
                    teacher_id: teacherId,
                  },
                },
              },
            },
          },
        },
        select: { id: true },
      })

      if (!hasAccess) {
        throw new BadRequestException('Você não tem acesso aos dados deste aluno')
      }
    } catch (error) {
      handlePrismaError(error)
    }
  }
}