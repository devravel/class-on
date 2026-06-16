import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { handlePrismaError } from '../common/errors/handle-prisma-error'
import { CreateAssignmentDto } from './dto/create-assignment.dto'

const ASSIGNMENT_INCLUDE = {
  teachers: {
    select: {
      id: true,
      full_name: true,
      registration_code: true,
      users: {
        select: {
          email: true,
          is_active: true,
        },
      },
    },
  },
  subjects: {
    select: {
      id: true,
      name: true,
      description: true,
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
} as const

@Injectable()
export class AssignmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAssignmentDto) {
    try {
      const teacherId = BigInt(dto.teacher_id)
      const classId = BigInt(dto.class_id)
      const subjectId = BigInt(dto.subject_id)

      await this.ensureTeacherExists(teacherId)
      await this.ensureClassExists(classId)
      await this.ensureSubjectExists(subjectId)
      await this.ensureUniqueAssignment(teacherId, classId, subjectId)

      const maxIdRecord = await this.prisma.assignments.findFirst({
        orderBy: { id: 'desc' },
        select: { id: true },
      })

      const nextId = (maxIdRecord?.id ?? BigInt(0)) + BigInt(1)
      const now = new Date()

      return await this.prisma.assignments.create({
        data: {
          id: nextId,
          teacher_id: teacherId,
          class_id: classId,
          subject_id: subjectId,
          created_at: now,
        },
        include: ASSIGNMENT_INCLUDE,
      })
    } catch (error) {
      handlePrismaError(error)
    }
  }

  async findAll() {
    try {
      return await this.prisma.assignments.findMany({
        orderBy: [
          { classes: { year_id: 'desc' } },
          { classes: { series: 'asc' } },
          { classes: { letter: 'asc' } },
          { subjects: { name: 'asc' } },
        ],
        include: ASSIGNMENT_INCLUDE,
      })
    } catch (error) {
      handlePrismaError(error)
    }
  }

  async findOne(id: bigint) {
    try {
      const assignment = await this.prisma.assignments.findUnique({
        where: { id },
        include: ASSIGNMENT_INCLUDE,
      })

      if (!assignment) {
        throw new NotFoundException('Registro não encontrado')
      }

      return assignment
    } catch (error) {
      handlePrismaError(error)
    }
  }

  async findByTeacher(teacherId: bigint) {
    try {
      await this.ensureTeacherExists(teacherId)

      return await this.prisma.assignments.findMany({
        where: { teacher_id: teacherId },
        orderBy: [
          { classes: { year_id: 'desc' } },
          { classes: { series: 'asc' } },
          { classes: { letter: 'asc' } },
          { subjects: { name: 'asc' } },
        ],
        include: ASSIGNMENT_INCLUDE,
      })
    } catch (error) {
      handlePrismaError(error)
    }
  }

  async findByClass(classId: bigint) {
    try {
      await this.ensureClassExists(classId)

      return await this.prisma.assignments.findMany({
        where: { class_id: classId },
        orderBy: [{ subjects: { name: 'asc' } }, { teachers: { full_name: 'asc' } }],
        include: ASSIGNMENT_INCLUDE,
      })
    } catch (error) {
      handlePrismaError(error)
    }
  }

  async remove(id: bigint) {
    try {
      await this.findOne(id)

      const gradesCount = await this.prisma.grades.count({
        where: { assignment_id: id },
      })

      const lessonsCount = await this.prisma.lessons.count({
        where: { assignment_id: id },
      })

      const tasksCount = await this.prisma.tasks.count({
        where: { assignment_id: id },
      })

      if (gradesCount > 0 || lessonsCount > 0 || tasksCount > 0) {
        throw new BadRequestException(
          'Não é possível excluir esta atribuição pois existem dados vinculados (notas, aulas ou tarefas).',
        )
      }

      return await this.prisma.assignments.delete({
        where: { id },
      })
    } catch (error) {
      handlePrismaError(error)
    }
  }

  private async ensureTeacherExists(teacherId: bigint) {
    try {
      const teacher = await this.prisma.teachers.findUnique({
        where: { id: teacherId },
        select: { id: true },
      })

      if (!teacher) {
        throw new NotFoundException('Professor não encontrado')
      }
    } catch (error) {
      handlePrismaError(error)
    }
  }

  private async ensureClassExists(classId: bigint) {
    try {
      const classRecord = await this.prisma.classes.findUnique({
        where: { id: classId },
        select: { id: true },
      })

      if (!classRecord) {
        throw new NotFoundException('Turma não encontrada')
      }
    } catch (error) {
      handlePrismaError(error)
    }
  }

  private async ensureSubjectExists(subjectId: bigint) {
    try {
      const subject = await this.prisma.subjects.findUnique({
        where: { id: subjectId },
        select: { id: true },
      })

      if (!subject) {
        throw new NotFoundException('Disciplina não encontrada')
      }
    } catch (error) {
      handlePrismaError(error)
    }
  }

  private async ensureUniqueAssignment(
    teacherId: bigint,
    classId: bigint,
    subjectId: bigint,
    excludeId?: bigint,
  ) {
    try {
      const existing = await this.prisma.assignments.findFirst({
        where: {
          teacher_id: teacherId,
          class_id: classId,
          subject_id: subjectId,
          ...(excludeId !== undefined && { id: { not: excludeId } }),
        },
        select: { id: true },
      })

      if (existing) {
        throw new BadRequestException(
          'Este professor já está atribuído a esta disciplina nesta turma',
        )
      }
    } catch (error) {
      handlePrismaError(error)
    }
  }
}
