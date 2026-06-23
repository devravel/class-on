import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import * as bcrypt from 'bcryptjs'
import { PrismaService } from '../prisma/prisma.service'
import { handlePrismaError } from '../common/errors/handle-prisma-error'
import { CreateTeacherDto } from './dto/create-teacher.dto'
import { UpdateTeacherDto } from './dto/update-teacher.dto'

const USER_SELECT = {
  id: true,
  email: true,
  role: true,
  is_active: true,
  created_at: true,
} as const

@Injectable()
export class TeachersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTeacherDto) {
    try {
      await this.ensureEmailUnique(dto.email)
      await this.ensureRegistrationCodeUnique(dto.registration_code)

      const provisionalPassword = this.generateProvisionalPassword()
      const hashedPassword = await this.hashPassword(provisionalPassword)
      const now = new Date()

      const teacher = await this.prisma.$transaction(async (tx) => {
        const user = await tx.users.create({
          data: {
            email: dto.email,
            password: hashedPassword,
            role: 'PROFESSOR',
            is_active: true,
            created_at: now,
          },
        })

        return tx.teachers.create({
          data: {
            user_id: user.id,
            full_name: dto.full_name,
            registration_code: dto.registration_code,
          },
          include: { users: { select: USER_SELECT } },
        })
      })

      return { teacher, provisional_password: provisionalPassword }
    } catch (error) {
      handlePrismaError(error)
    }
  }

  async findAll() {
    try {
      return await this.prisma.teachers.findMany({
        orderBy: { full_name: 'asc' },
        include: { users: { select: USER_SELECT } },
      })
    } catch (error) {
      handlePrismaError(error)
    }
  }

  async findOne(id: bigint) {
    try {
      const teacher = await this.prisma.teachers.findUnique({
        where: { id },
        include: { users: { select: USER_SELECT } },
      })

      if (!teacher) {
        throw new NotFoundException('Registro não encontrado')
      }

      return teacher
    } catch (error) {
      handlePrismaError(error)
    }
  }

  async updatePassword(id: bigint, password: string) {
    try {
      const current = await this.findOne(id)
      const hashedPassword = await this.hashPassword(password)

      await this.prisma.users.update({
        where: { id: current.user_id },
        data: { password: hashedPassword },
      })

      return { message: 'Senha atualizada com sucesso.' }
    } catch (error) {
      handlePrismaError(error)
    }
  }

  async update(id: bigint, dto: UpdateTeacherDto) {
    try {
      const current = await this.findOne(id)

      if (dto.email !== undefined && dto.email !== current.users.email) {
        await this.ensureEmailUnique(dto.email)
      }

      if (
        dto.registration_code !== undefined &&
        dto.registration_code !== current.registration_code
      ) {
        await this.ensureRegistrationCodeUnique(dto.registration_code, id)
      }

      const hasUserChanges =
        dto.email !== undefined || dto.is_active !== undefined

      return await this.prisma.$transaction(async (tx) => {
        if (hasUserChanges) {
          await tx.users.update({
            where: { id: current.user_id },
            data: {
              ...(dto.email !== undefined && { email: dto.email }),
              ...(dto.is_active !== undefined && { is_active: dto.is_active }),
            },
          })
        }

        return tx.teachers.update({
          where: { id },
          data: {
            ...(dto.full_name !== undefined && { full_name: dto.full_name }),
            ...(dto.registration_code !== undefined && {
              registration_code: dto.registration_code,
            }),
          },
          include: { users: { select: USER_SELECT } },
        })
      })
    } catch (error) {
      handlePrismaError(error)
    }
  }

  private async hashPassword(plain: string): Promise<string> {
    return bcrypt.hash(plain, 10)
  }

  private generateProvisionalPassword(): string {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
    let suffix = ''
    for (let i = 0; i < 6; i++) {
      suffix += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return `Prof@${suffix}`
  }

  private async ensureEmailUnique(email: string) {
    try {
      const existing = await this.prisma.users.findUnique({
        where: { email },
        select: { id: true },
      })

      if (existing) {
        throw new BadRequestException('Já existe um usuário com este e-mail')
      }
    } catch (error) {
      handlePrismaError(error)
    }
  }

  private async ensureRegistrationCodeUnique(code: string, excludeId?: bigint) {
    try {
      const existing = await this.prisma.teachers.findUnique({
        where: { registration_code: code },
        select: { id: true },
      })

      if (existing && existing.id !== excludeId) {
        throw new BadRequestException(
          'Já existe um professor com este código de registro',
        )
      }
    } catch (error) {
      handlePrismaError(error)
    }
  }
}
