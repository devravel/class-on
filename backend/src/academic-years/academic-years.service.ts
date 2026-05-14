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
        throw new BadRequestException('Já existe um ano letivo cadastrado para esse ano')
      }

      const status = dto.status ?? 'ACTIVE'

      if (status === 'ACTIVE') {
        await this.ensureOnlyOneActiveYear()
      }

      const maxIdRecord = await this.prisma.academic_years.findFirst({
        orderBy: { id: 'desc' },
        select: { id: true },
      })

      const nextId = (maxIdRecord?.id ?? BigInt(0)) + BigInt(1)
      const now = new Date()

      return await this.prisma.academic_years.create({
        data: {
          id: nextId,
          year: dto.year,
          status,
          created_at: now,
          updated_at: now,
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

  async findActive() {
    try {
      const activeYear = await this.prisma.academic_years.findFirst({
        where: { status: 'ACTIVE' },
      })

      if (!activeYear) {
        throw new NotFoundException('Nenhum ano letivo ativo encontrado')
      }

      return activeYear
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
        throw new NotFoundException('Ano letivo não encontrado')
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
          throw new BadRequestException('Já existe um ano letivo cadastrado para esse ano')
        }
      }

      // Se está ativando um ano, desativar outros anos ativos
      if (dto.status === 'ACTIVE') {
        await this.ensureOnlyOneActiveYear(id)
      }

      const now = new Date()

      return await this.prisma.academic_years.update({
        where: { id },
        data: {
          ...(dto.year !== undefined && { year: dto.year }),
          ...(dto.status !== undefined && { status: dto.status }),
          updated_at: now,
        },
      })
    } catch (error) {
      handlePrismaError(error)
    }
  }

  async closeYear(id: bigint) {
    try {
      const academicYear = await this.findOne(id)

      if (academicYear.status === 'CLOSED') {
        throw new BadRequestException('Este ano letivo já está fechado')
      }

      const now = new Date()

      return await this.prisma.academic_years.update({
        where: { id },
        data: {
          status: 'CLOSED',
          updated_at: now,
        },
      })
    } catch (error) {
      handlePrismaError(error)
    }
  }

  async remove(id: bigint) {
    try {
      const academicYear = await this.findOne(id)

      // Verificar se há classes ou bimestres vinculados
      const hasClasses = await this.prisma.classes.findFirst({
        where: { year_id: id },
      })

      const hasBimesters = await this.prisma.bimesters.findFirst({
        where: { year_id: id },
      })

      if (hasClasses || hasBimesters) {
        throw new BadRequestException('Não é possível excluir um ano letivo que possui turmas ou bimestres cadastrados')
      }

      return await this.prisma.academic_years.delete({
        where: { id },
      })
    } catch (error) {
      handlePrismaError(error)
    }
  }

  private async ensureOnlyOneActiveYear(excludeId?: bigint) {
    try {
      const activeYears = await this.prisma.academic_years.findMany({
        where: {
          status: 'ACTIVE',
          ...(excludeId && { id: { not: excludeId } }),
        },
      })

      if (activeYears.length > 0) {
        const now = new Date()
        await this.prisma.academic_years.updateMany({
          where: {
            status: 'ACTIVE',
            ...(excludeId && { id: { not: excludeId } }),
          },
          data: {
            status: 'CLOSED',
            updated_at: now,
          },
        })
      }
    } catch (error) {
      handlePrismaError(error)
    }
  }
}
