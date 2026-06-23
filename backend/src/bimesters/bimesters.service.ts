import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { handlePrismaError } from '../common/errors/handle-prisma-error'
import { CreateBimesterDto } from './dto/create-bimester.dto'
import { UpdateBimesterStatusDto } from './dto/update-bimester-status.dto'

@Injectable()
export class BimestersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateBimesterDto) {
    try {
      const yearId = BigInt(dto.year_id)

      await this.ensureYearExists(yearId)
      await this.ensureNumberUniqueForYear(yearId, dto.number)

      return await this.prisma.bimesters.create({
        data: {
          number: dto.number,
          status: dto.status,
          year_id: yearId,
        },
      })
    } catch (error) {
      handlePrismaError(error)
    }
  }

  async findByYear(yearId: bigint) {
    try {
      await this.ensureYearExists(yearId)

      return await this.prisma.bimesters.findMany({
        where: { year_id: yearId },
        orderBy: { number: 'asc' },
      })
    } catch (error) {
      handlePrismaError(error)
    }
  }

  async updateStatus(id: bigint, dto: UpdateBimesterStatusDto) {
    try {
      await this.findOne(id)

      return await this.prisma.bimesters.update({
        where: { id },
        data: { status: dto.status },
      })
    } catch (error) {
      handlePrismaError(error)
    }
  }

  async findOne(id: bigint) {
    try {
      const bimester = await this.prisma.bimesters.findUnique({
        where: { id },
      })

      if (!bimester) {
        throw new NotFoundException('Bimestre não encontrado')
      }

      return bimester
    } catch (error) {
      handlePrismaError(error)
    }
  }

  private async ensureYearExists(yearId: bigint) {
    try {
      const year = await this.prisma.academic_years.findUnique({
        where: { id: yearId },
        select: { id: true },
      })

      if (!year) {
        throw new NotFoundException('Ano letivo não encontrado')
      }
    } catch (error) {
      handlePrismaError(error)
    }
  }

  private async ensureNumberUniqueForYear(yearId: bigint, number: number) {
    try {
      const existing = await this.prisma.bimesters.findUnique({
        where: {
          year_id_number: {
            year_id: yearId,
            number,
          },
        },
        select: { id: true },
      })

      if (existing) {
        throw new BadRequestException(
          `Já existe o ${number}º bimestre cadastrado para este ano letivo`,
        )
      }
    } catch (error) {
      handlePrismaError(error)
    }
  }
}
