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

      const maxIdRecord = await this.prisma.classes.findFirst({
        orderBy: { id: 'desc' },
        select: { id: true },
      })

      const nextId = (maxIdRecord?.id ?? BigInt(0)) + BigInt(1)

      return await this.prisma.classes.create({
        data: {
          id: nextId,
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

  async findAll() {
    try {
      return await this.prisma.classes.findMany({
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

  async update(id: bigint, dto: UpdateClassDto) {
    try {
      const current = await this.findOne(id)

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
      await this.findOne(id)

      return await this.prisma.classes.delete({
        where: { id },
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
