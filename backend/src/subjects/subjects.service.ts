import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { handlePrismaError } from '../common/errors/handle-prisma-error'
import { CreateSubjectDto } from './dto/create-subject.dto'
import { UpdateSubjectDto } from './dto/update-subject.dto'

@Injectable()
export class SubjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSubjectDto) {
    try {
      await this.ensureNameUnique(dto.name)

      const maxIdRecord = await this.prisma.subjects.findFirst({
        orderBy: { id: 'desc' },
        select: { id: true },
      })

      const nextId = (maxIdRecord?.id ?? BigInt(0)) + BigInt(1)

      return await this.prisma.subjects.create({
        data: {
          id: nextId,
          name: dto.name,
          description: dto.description,
        },
      })
    } catch (error) {
      handlePrismaError(error)
    }
  }

  async findAll() {
    try {
      return await this.prisma.subjects.findMany({
        orderBy: { name: 'asc' },
      })
    } catch (error) {
      handlePrismaError(error)
    }
  }

  async findOne(id: bigint) {
    try {
      const subject = await this.prisma.subjects.findUnique({
        where: { id },
      })

      if (!subject) {
        throw new NotFoundException('Registro não encontrado')
      }

      return subject
    } catch (error) {
      handlePrismaError(error)
    }
  }

  async update(id: bigint, dto: UpdateSubjectDto) {
    try {
      const current = await this.findOne(id)

      if (dto.name !== undefined && dto.name !== current.name) {
        await this.ensureNameUnique(dto.name)
      }

      return await this.prisma.subjects.update({
        where: { id },
        data: {
          ...(dto.name !== undefined && { name: dto.name }),
          ...(dto.description !== undefined && { description: dto.description }),
        },
      })
    } catch (error) {
      handlePrismaError(error)
    }
  }

  async remove(id: bigint) {
    try {
      await this.findOne(id)

      const assignmentsCount = await this.prisma.assignments.count({
        where: { subject_id: id },
      })

      if (assignmentsCount > 0) {
        throw new BadRequestException(
          'Não é possível excluir esta disciplina pois ela está vinculada a atribuições de professores. Remova as atribuições antes de excluir a disciplina.',
        )
      }

      return await this.prisma.subjects.delete({
        where: { id },
      })
    } catch (error) {
      handlePrismaError(error)
    }
  }

  private async ensureNameUnique(name: string, excludeId?: bigint) {
    try {
      const existing = await this.prisma.subjects.findUnique({
        where: { name },
        select: { id: true },
      })

      if (existing && existing.id !== excludeId) {
        throw new BadRequestException(
          'Já existe uma disciplina com este nome',
        )
      }
    } catch (error) {
      handlePrismaError(error)
    }
  }
}
