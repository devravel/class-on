import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { handlePrismaError } from '../common/errors/handle-prisma-error'
import { CreateGradeDto } from './dto/create-grade.dto'
import { AddRecoveryDto } from './dto/add-recovery.dto'

const GRADE_INCLUDE = {
  enrollments: {
    include: {
      students: {
        select: {
          id: true,
          full_name: true,
          rm: true,
          users: {
            select: {
              email: true,
            },
          },
        },
      },
      classes: {
        include: {
          academic_years: {
            select: {
              id: true,
              year: true,
              status: true,
            },
          },
        },
      },
    },
  },
  assignments: {
    include: {
      teachers: {
        select: {
          id: true,
          full_name: true,
          registration_code: true,
        },
      },
      subjects: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
  bimesters: {
    select: {
      id: true,
      number: true,
      status: true,
    },
  },
} as const

@Injectable()
export class GradesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateGradeDto, userId?: bigint) {
    try {
      const enrollmentId = BigInt(dto.enrollment_id)
      const assignmentId = BigInt(dto.assignment_id)
      const bimesterId = BigInt(dto.bimester_id)

      // Validar se a atribuição existe
      const assignment = await this.prisma.assignments.findUnique({
        where: { id: assignmentId },
        select: { id: true, teacher_id: true },
      })

      if (!assignment) {
        throw new NotFoundException('Atribuição não encontrada')
      }

      // Validar se o professor pode lançar notas desta atribuição
      if (userId) {
        const teacher = await this.prisma.teachers.findUnique({
          where: { user_id: userId },
          select: { id: true },
        })

        if (!teacher || assignment.teacher_id !== teacher.id) {
          throw new ForbiddenException(
            'Você não tem permissão para lançar notas desta atribuição',
          )
        }
      }

      // Validar se a matrícula existe
      await this.ensureEnrollmentExists(enrollmentId)

      // Validar se o bimestre existe
      await this.ensureBimesterExists(bimesterId)

      // Calcular médias
      const average = this.calculateAverage(dto.n1, dto.n2, dto.n3, dto.n4)
      const final_average = average // Sem recuperação inicialmente

      const maxIdRecord = await this.prisma.grades.findFirst({
        orderBy: { id: 'desc' },
        select: { id: true },
      })

      const nextId = (maxIdRecord?.id ?? BigInt(0)) + BigInt(1)
      const now = new Date()

      // Usar upsert para criar ou atualizar
      const grade = await this.prisma.grades.upsert({
        where: {
          enrollment_id_assignment_id_bimester_id: {
            enrollment_id: enrollmentId,
            assignment_id: assignmentId,
            bimester_id: bimesterId,
          },
        },
        update: {
          n1: dto.n1,
          n2: dto.n2,
          n3: dto.n3,
          n4: dto.n4,
          average,
          final_average,
        },
        create: {
          id: nextId,
          enrollment_id: enrollmentId,
          assignment_id: assignmentId,
          bimester_id: bimesterId,
          n1: dto.n1,
          n2: dto.n2,
          n3: dto.n3,
          n4: dto.n4,
          average,
          final_average,
          created_at: now,
        },
        include: GRADE_INCLUDE,
      })

      return this.addStatusToGrade(grade)
    } catch (error) {
      handlePrismaError(error)
    }
  }

  async findByAssignmentAndBimester(
    assignmentId: bigint,
    bimesterId: bigint,
    userId?: bigint,
  ) {
    try {
      // Validar se a atribuição existe
      const assignment = await this.prisma.assignments.findUnique({
        where: { id: assignmentId },
        select: { id: true, teacher_id: true },
      })

      if (!assignment) {
        throw new NotFoundException('Atribuição não encontrada')
      }

      // Validar se o professor pode ver notas desta atribuição
      if (userId) {
        const teacher = await this.prisma.teachers.findUnique({
          where: { user_id: userId },
          select: { id: true },
        })

        if (!teacher || assignment.teacher_id !== teacher.id) {
          throw new ForbiddenException(
            'Você não tem permissão para ver notas desta atribuição',
          )
        }
      }

      // Validar se o bimestre existe
      await this.ensureBimesterExists(bimesterId)

      // Buscar todas as matrículas da turma da atribuição
      const enrollments = await this.prisma.enrollments.findMany({
        where: {
          classes: {
            assignments: {
              some: { id: assignmentId },
            },
          },
        },
        include: {
          students: {
            select: {
              id: true,
              full_name: true,
              rm: true,
            },
          },
          grades: {
            where: {
              assignment_id: assignmentId,
              bimester_id: bimesterId,
            },
            include: GRADE_INCLUDE,
          },
        },
        orderBy: {
          students: {
            full_name: 'asc',
          },
        },
      })

      // Formatar resultado
      const result = enrollments.map((enrollment) => {
        const grade = enrollment.grades[0] || null
        return {
          enrollment: {
            id: enrollment.id,
            student: enrollment.students,
          },
          grade: grade ? this.addStatusToGrade(grade) : null,
        }
      })

      return result
    } catch (error) {
      handlePrismaError(error)
    }
  }

  async findOne(id: bigint) {
    try {
      const grade = await this.prisma.grades.findUnique({
        where: { id },
        include: GRADE_INCLUDE,
      })

      if (!grade) {
        throw new NotFoundException('Nota não encontrada')
      }

      return this.addStatusToGrade(grade)
    } catch (error) {
      handlePrismaError(error)
    }
  }

  async addRecovery(id: bigint, dto: AddRecoveryDto, userId?: bigint) {
    try {
      const grade = await this.findOne(id)

      // Validar se o professor pode editar esta nota
      if (userId) {
        const teacher = await this.prisma.teachers.findUnique({
          where: { user_id: userId },
          select: { id: true },
        })

        if (!teacher || grade.assignments.teachers.id !== teacher.id) {
          throw new ForbiddenException(
            'Você não tem permissão para editar esta nota',
          )
        }
      }

      // Validar se a média atual é menor que 6.0
      if (grade.average >= 6.0) {
        throw new BadRequestException(
          'Só é possível adicionar recuperação para notas com média menor que 6.0',
        )
      }

      // Calcular nova média final
      const final_average = this.calculateFinalAverage(
        grade.average,
        dto.recovery_grade,
      )

      const updatedGrade = await this.prisma.grades.update({
        where: { id },
        data: {
          recovery_grade: dto.recovery_grade,
          final_average,
        },
        include: GRADE_INCLUDE,
      })

      return this.addStatusToGrade(updatedGrade)
    } catch (error) {
      handlePrismaError(error)
    }
  }

  async findMyGrades(userId: bigint) {
    try {
      // Buscar o student_id baseado no user_id
      const student = await this.prisma.students.findUnique({
        where: { user_id: userId },
        select: { id: true },
      })

      if (!student) {
        throw new NotFoundException('Aluno não encontrado')
      }

      const grades = await this.prisma.grades.findMany({
        where: {
          enrollments: {
            student_id: student.id,
          },
        },
        include: GRADE_INCLUDE,
        orderBy: [
          { assignments: { classes: { series: 'asc' } } },
          { assignments: { subjects: { name: 'asc' } } },
          { bimesters: { number: 'asc' } },
        ],
      })

      return grades.map((grade) => this.addStatusToGrade(grade))
    } catch (error) {
      handlePrismaError(error)
    }
  }

  async findByStudent(studentId: bigint) {
    try {
      // Validar se o aluno existe
      const student = await this.prisma.students.findUnique({
        where: { id: studentId },
        select: { id: true },
      })

      if (!student) {
        throw new NotFoundException('Aluno não encontrado')
      }

      const grades = await this.prisma.grades.findMany({
        where: {
          enrollments: {
            student_id: studentId,
          },
        },
        include: GRADE_INCLUDE,
        orderBy: [
          { assignments: { classes: { series: 'asc' } } },
          { assignments: { subjects: { name: 'asc' } } },
          { bimesters: { number: 'asc' } },
        ],
      })

      return grades.map((grade) => this.addStatusToGrade(grade))
    } catch (error) {
      handlePrismaError(error)
    }
  }

  private calculateAverage(n1: number, n2: number, n3: number, n4: number): number {
    const average = (n1 + n2 + n3 + n4) / 4
    return Math.round(average * 100) / 100 // Arredondar para 2 casas decimais
  }

  private calculateFinalAverage(average: number, recoveryGrade: number): number {
    const final_average = (average + recoveryGrade) / 2
    return Math.round(final_average * 100) / 100 // Arredondar para 2 casas decimais
  }

  private addStatusToGrade(grade: any) {
    const finalAverage = Number(grade.final_average || grade.average)
    const status = finalAverage >= 6.0 ? 'APROVADO' : 'REPROVADO'

    return {
      ...grade,
      status,
    }
  }

  private async ensureEnrollmentExists(enrollmentId: bigint) {
    try {
      const enrollment = await this.prisma.enrollments.findUnique({
        where: { id: enrollmentId },
        select: { id: true },
      })

      if (!enrollment) {
        throw new NotFoundException('Matrícula não encontrada')
      }
    } catch (error) {
      handlePrismaError(error)
    }
  }

  private async ensureBimesterExists(bimesterId: bigint) {
    try {
      const bimester = await this.prisma.bimesters.findUnique({
        where: { id: bimesterId },
        select: { id: true },
      })

      if (!bimester) {
        throw new NotFoundException('Bimestre não encontrado')
      }
    } catch (error) {
      handlePrismaError(error)
    }
  }
}