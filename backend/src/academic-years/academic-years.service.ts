import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { handlePrismaError } from '../common/errors/handle-prisma-error'
import { CreateAcademicYearDto } from './dto/create-academic-year.dto'
import { UpdateAcademicYearDto } from './dto/update-academic-year.dto'

@Injectable()
export class AcademicYearsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAcademicYearDto) {
    try {
      const duplicateYear = await this.prisma.academic_years.findUnique({
        where: { year: dto.year },
      })

      if (duplicateYear) {
        throw new BadRequestException('Já existe um registro com esses dados')
      }

      const maxIdRecord = await this.prisma.academic_years.findFirst({
        orderBy: { id: 'desc' },
        select: { id: true },
      })

      const nextId = (maxIdRecord?.id ?? BigInt(0)) + BigInt(1)

      return await this.prisma.academic_years.create({
        data: {
          id: nextId,
          year: dto.year,
          start_date: new Date(dto.start_date),
          end_date: new Date(dto.end_date),
        },
      })
    } catch (error) {
      handlePrismaError(error)
    }
  }

  async findAll() {
    try {
      return await this.prisma.academic_years.findMany({
        orderBy: { year: 'desc' },
      })
    } catch (error) {
      handlePrismaError(error)
    }
  }

  async findOne(id: bigint) {
    try {
      const academicYear = await this.prisma.academic_years.findUnique({
        where: { id },
      })

      if (!academicYear) {
        throw new NotFoundException('Registro não encontrado')
      }

      return academicYear
    } catch (error) {
      handlePrismaError(error)
    }
  }

  async update(id: bigint, dto: UpdateAcademicYearDto) {
    try {
      await this.findOne(id)

      if (dto.year !== undefined) {
        const duplicateYear = await this.prisma.academic_years.findFirst({
          where: {
            year: dto.year,
            id: { not: id },
          },
        })

        if (duplicateYear) {
          throw new BadRequestException('Já existe um registro com esses dados')
        }
      }

      return await this.prisma.academic_years.update({
        where: { id },
        data: {
          ...(dto.year !== undefined && { year: dto.year }),
          ...(dto.start_date !== undefined && { start_date: new Date(dto.start_date) }),
          ...(dto.end_date !== undefined && { end_date: new Date(dto.end_date) }),
        },
      })
    } catch (error) {
      handlePrismaError(error)
    }
  }

  async remove(id: bigint) {
    try {
      await this.findOne(id)

      return await this.prisma.academic_years.delete({
        where: { id },
      })
    } catch (error) {
      handlePrismaError(error)
    }
  }
}
