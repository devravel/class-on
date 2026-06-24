import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { handlePrismaError } from '../common/errors/handle-prisma-error'
import { validateSeriesForEducationLevel } from './class-series.validation'
import { CreateClassDto, EducationLevel } from './dto/create-class.dto'
import { UpdateClassDto } from './dto/update-class.dto'

@Injectable()
export class ClassesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateClassDto) {
    try {
      const yearId = BigInt(dto.year_id)

      validateSeriesForEducationLevel(dto.series, dto.education_level)
      await this.ensureAcademicYearExists(yearId)
      await this.ensureUniqueIdentity(
        yearId,
        dto.education_level,
        dto.series,
        dto.letter,
        dto.shift,
      )

      return await this.prisma.classes.create({
        data: {
          year_id: yearId,
          education_level: dto.education_level,
          series: dto.series,
          letter: dto.letter,
          shift: dto.shift,
        },
        include: {
          academic_years: true,
        },
      })
    } catch (error) {
      handlePrismaError(error)
    }
  }

  async findAll(includeInactive = false) {
    try {
      return await this.prisma.classes.findMany({
        where: includeInactive ? undefined : { is_active: true },
        orderBy: [
          { year_id: 'desc' },
          { education_level: 'asc' },
          { series: 'asc' },
          { letter: 'asc' },
        ],
        include: {
          academic_years: true,
        },
      })
    } catch (error) {
      handlePrismaError(error)
    }
  }

  async findOne(id: bigint) {
    try {
      const classRecord = await this.prisma.classes.findUnique({
        where: { id },
        include: {
          academic_years: true,
        },
      })

      if (!classRecord) {
        throw new NotFoundException('Registro não encontrado')
      }

      return classRecord
    } catch (error) {
      handlePrismaError(error)
    }
  }

  async findOneDetails(id: bigint) {
    try {
      const classRecord = await this.prisma.classes.findUnique({
        where: { id },
        include: {
          academic_years: true,
          enrollments: {
            include: {
              students: {
                include: {
                  users: {
                    select: {
                      id: true,
                      email: true,
                      is_active: true,
                    },
                  },
                },
              },
            },
            orderBy: {
              students: { full_name: 'asc' },
            },
          },
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
            },
            orderBy: {
              subjects: { name: 'asc' },
            },
          },
        },
      })

      if (!classRecord) {
        throw new NotFoundException('Registro não encontrado')
      }

      return classRecord
    } catch (error) {
      handlePrismaError(error)
    }
  }

  async update(id: bigint, dto: UpdateClassDto) {
    try {
      const current = await this.findOne(id)

      if (!current.is_active) {
        throw new BadRequestException(
          'Não é possível editar uma turma desativada',
        )
      }

      const yearId =
        dto.year_id !== undefined ? BigInt(dto.year_id) : current.year_id
      const educationLevel =
        dto.education_level ??
        (current.education_level as EducationLevel)
      const series = dto.series ?? current.series
      const letter = dto.letter ?? current.letter
      const shift = dto.shift ?? current.shift

      validateSeriesForEducationLevel(series, educationLevel)

      if (dto.year_id !== undefined) {
        await this.ensureAcademicYearExists(yearId)
      }

      const identityChanged =
        yearId !== current.year_id ||
        educationLevel !== current.education_level ||
        series !== current.series ||
        letter !== current.letter ||
        shift !== current.shift

      if (identityChanged) {
        await this.ensureUniqueIdentity(
          yearId,
          educationLevel,
          series,
          letter,
          shift,
          id,
        )
      }

      return await this.prisma.classes.update({
        where: { id },
        data: {
          ...(dto.year_id !== undefined && { year_id: yearId }),
          ...(dto.education_level !== undefined && {
            education_level: dto.education_level,
          }),
          ...(dto.series !== undefined && { series: dto.series }),
          ...(dto.letter !== undefined && { letter: dto.letter }),
          ...(dto.shift !== undefined && { shift: dto.shift }),
        },
        include: {
          academic_years: true,
        },
      })
    } catch (error) {
      handlePrismaError(error)
    }
  }

  async remove(id: bigint) {
    try {
      const classRecord = await this.findOne(id)

      if (!classRecord.is_active) {
        throw new BadRequestException('Esta turma já está desativada')
      }

      return await this.prisma.classes.update({
        where: { id },
        data: { is_active: false },
        include: {
          academic_years: true,
        },
      })
    } catch (error) {
      handlePrismaError(error)
    }
  }

  async permanentRemove(id: bigint) {
    try {
      const classRecord = await this.findOne(id)

      if (classRecord.is_active) {
        throw new BadRequestException(
          'Apenas turmas desativadas podem ser excluídas permanentemente',
        )
      }

      await this.prisma.$transaction(async (tx) => {
        const assignments = await tx.assignments.findMany({
          where: { class_id: id },
          select: { id: true },
        })
        const assignmentIds = assignments.map((assignment) => assignment.id)

        const enrollments = await tx.enrollments.findMany({
          where: { class_id: id },
          select: { id: true },
        })
        const enrollmentIds = enrollments.map((enrollment) => enrollment.id)

        if (assignmentIds.length > 0) {
          const tasks = await tx.tasks.findMany({
            where: { assignment_id: { in: assignmentIds } },
            select: { id: true },
          })
          const taskIds = tasks.map((task) => task.id)

          if (taskIds.length > 0) {
            await tx.task_submissions.deleteMany({
              where: { task_id: { in: taskIds } },
            })
            await tx.task_targets.deleteMany({
              where: { task_id: { in: taskIds } },
            })
            await tx.tasks.deleteMany({
              where: { id: { in: taskIds } },
            })
          }

          const lessons = await tx.lessons.findMany({
            where: { assignment_id: { in: assignmentIds } },
            select: { id: true },
          })
          const lessonIds = lessons.map((lesson) => lesson.id)

          if (lessonIds.length > 0) {
            await tx.attendances.deleteMany({
              where: { lesson_id: { in: lessonIds } },
            })
            await tx.lessons.deleteMany({
              where: { id: { in: lessonIds } },
            })
          }
        }

        const gradeFilters: Array<
          | { assignment_id: { in: bigint[] } }
          | { enrollment_id: { in: bigint[] } }
        > = []
        if (assignmentIds.length > 0) {
          gradeFilters.push({ assignment_id: { in: assignmentIds } })
        }
        if (enrollmentIds.length > 0) {
          gradeFilters.push({ enrollment_id: { in: enrollmentIds } })
        }
        if (gradeFilters.length > 0) {
          await tx.grades.deleteMany({
            where: { OR: gradeFilters },
          })
        }

        if (assignmentIds.length > 0) {
          await tx.assignments.deleteMany({
            where: { class_id: id },
          })
        }

        if (enrollmentIds.length > 0) {
          await tx.enrollments.deleteMany({
            where: { class_id: id },
          })
        }

        await tx.announcements_targets.deleteMany({
          where: { class_id: id },
        })

        await tx.event_targets.deleteMany({
          where: { class_id: id },
        })

        await tx.classes.delete({
          where: { id },
        })
      })
    } catch (error) {
      handlePrismaError(error)
    }
  }

  private async ensureAcademicYearExists(yearId: bigint) {
    try {
      const academicYear = await this.prisma.academic_years.findUnique({
        where: { id: yearId },
      })

      if (!academicYear) {
        throw new NotFoundException('Registro não encontrado')
      }
    } catch (error) {
      handlePrismaError(error)
    }
  }

  private async ensureUniqueIdentity(
    yearId: bigint,
    educationLevel: string,
    series: number,
    letter: string,
    shift: string,
    excludeId?: bigint,
  ) {
    try {
      const existing = await this.prisma.classes.findFirst({
        where: {
          year_id: yearId,
          education_level: educationLevel,
          series,
          letter,
          shift,
          is_active: true,
          ...(excludeId !== undefined && { id: { not: excludeId } }),
        },
      })

      if (existing) {
        throw new BadRequestException('Já existe um registro com esses dados')
      }
    } catch (error) {
      handlePrismaError(error)
    }
  }
}
