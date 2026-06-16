import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { handlePrismaError } from '../common/errors/handle-prisma-error'
import { CreateLessonDto } from './dto/create-lesson.dto'

const LESSON_INCLUDE = {
  assignments: {
    include: {
      teachers: {
        select: {
          id: true,
          full_name: true,
        },
      },
      subjects: {
        select: {
          id: true,
          name: true,
        },
      },
      classes: {
        select: {
          id: true,
          series: true,
          letter: true,
          shift: true,
        },
      },
    },
  },
} as const

@Injectable()
export class LessonsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateLessonDto, teacherId: bigint) {
    try {
      const assignmentId = BigInt(dto.assignment_id)
      
      // Verificar se a atribuição existe e pertence ao professor
      await this.ensureAssignmentOwnership(assignmentId, teacherId)
      
      // Verificar se a data não é futura
      const lessonDate = new Date(dto.date)
      const today = new Date()
      today.setHours(23, 59, 59, 999)
      
      if (lessonDate > today) {
        throw new BadRequestException('Não é possível criar aula para data futura')
      }

      // Verificar se já existe aula duplicada
      await this.ensureUniqueLessonOrder(assignmentId, dto.date, dto.lesson_order)

      const maxIdRecord = await this.prisma.lessons.findFirst({
        orderBy: { id: 'desc' },
        select: { id: true },
      })

      const nextId = (maxIdRecord?.id ?? BigInt(0)) + BigInt(1)
      const now = new Date()

      return await this.prisma.lessons.create({
        data: {
          id: nextId,
          assignment_id: assignmentId,
          date: lessonDate,
          lesson_order: dto.lesson_order,
          content: dto.content,
          created_at: now,
        },
        include: LESSON_INCLUDE,
      })
    } catch (error) {
      handlePrismaError(error)
    }
  }

  async findByAssignment(assignmentId: bigint, teacherId: bigint) {
    try {
      // Verificar se a atribuição pertence ao professor
      await this.ensureAssignmentOwnership(assignmentId, teacherId)

      return await this.prisma.lessons.findMany({
        where: { assignment_id: assignmentId },
        orderBy: [{ date: 'desc' }, { lesson_order: 'asc' }],
        include: LESSON_INCLUDE,
      })
    } catch (error) {
      handlePrismaError(error)
    }
  }

  async findOne(id: bigint, teacherId: bigint) {
    try {
      const lesson = await this.prisma.lessons.findUnique({
        where: { id },
        include: {
          ...LESSON_INCLUDE,
          attendances: {
            include: {
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
          },
        },
      })

      if (!lesson) {
        throw new NotFoundException('Aula não encontrada')
      }

      // Verificar se a aula pertence ao professor
      if (lesson.assignments.teacher_id !== teacherId) {
        throw new BadRequestException('Você não tem permissão para acessar esta aula')
      }

      // Buscar todos os alunos matriculados na turma
      const enrolledStudents = await this.prisma.students.findMany({
        where: {
          enrollments: {
            some: {
              class_id: lesson.assignments.class_id,
            },
          },
        },
        select: {
          id: true,
          full_name: true,
          rm: true,
        },
        orderBy: { full_name: 'asc' },
      })

      // Combinar dados dos alunos com suas presenças
      const studentsWithAttendance = enrolledStudents.map((student) => {
        const attendance = lesson.attendances.find(
          (att) => att.student_id === student.id,
        )
        return {
          ...student,
          attendance: attendance ? {
            id: attendance.id,
            status: attendance.status,
            created_at: attendance.created_at,
          } : null,
        }
      })

      return {
        ...lesson,
        students: studentsWithAttendance,
        attendances: undefined, // Remover o campo original
      }
    } catch (error) {
      handlePrismaError(error)
    }
  }

  private async ensureAssignmentOwnership(assignmentId: bigint, teacherId: bigint) {
    try {
      const assignment = await this.prisma.assignments.findUnique({
        where: { id: assignmentId },
        select: { teacher_id: true },
      })

      if (!assignment) {
        throw new NotFoundException('Atribuição não encontrada')
      }

      if (assignment.teacher_id !== teacherId) {
        throw new BadRequestException('Você não tem permissão para esta atribuição')
      }
    } catch (error) {
      handlePrismaError(error)
    }
  }

  private async ensureUniqueLessonOrder(
    assignmentId: bigint,
    date: string,
    lessonOrder: number,
  ) {
    try {
      const existing = await this.prisma.lessons.findFirst({
        where: {
          assignment_id: assignmentId,
          date: new Date(date),
          lesson_order: lessonOrder,
        },
        select: { id: true },
      })

      if (existing) {
        throw new BadRequestException(
          'Já existe uma aula com esta ordem para esta data',
        )
      }
    } catch (error) {
      handlePrismaError(error)
    }
  }
}