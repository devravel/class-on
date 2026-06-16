import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import * as bcrypt from 'bcryptjs'
import { PrismaService } from '../prisma/prisma.service'
import { handlePrismaError } from '../common/errors/handle-prisma-error'
import { CreateStudentDto } from './dto/create-student.dto'
import { UpdateStudentDto } from './dto/update-student.dto'
import { CreateBulkStudentsDto } from './dto/create-bulk-students.dto'
import { EnrollStudentDto } from './dto/enroll-student.dto'

const USER_SELECT = {
  id: true,
  email: true,
  role: true,
  is_active: true,
  created_at: true,
} as const

@Injectable()
export class StudentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateStudentDto) {
    try {
      await this.ensureEmailUnique(dto.email)
      await this.ensureRmUnique(dto.rm)

      const provisionalPassword = this.generateProvisionalPassword()
      const hashedPassword = await bcrypt.hash(provisionalPassword, 10)
      const now = new Date()

      const maxUserId = await this.prisma.users.findFirst({
        orderBy: { id: 'desc' },
        select: { id: true },
      })
      const nextUserId = (maxUserId?.id ?? BigInt(0)) + BigInt(1)

      const maxStudentId = await this.prisma.students.findFirst({
        orderBy: { id: 'desc' },
        select: { id: true },
      })
      const nextStudentId = (maxStudentId?.id ?? BigInt(0)) + BigInt(1)

      const student = await this.prisma.$transaction(async (tx) => {
        await tx.users.create({
          data: {
            id: nextUserId,
            email: dto.email,
            password: hashedPassword,
            role: 'ALUNO',
            is_active: true,
            created_at: now,
          },
        })

        return tx.students.create({
          data: {
            id: nextStudentId,
            user_id: nextUserId,
            full_name: dto.full_name,
            rm: dto.rm,
            status: 'ACTIVE',
          },
          include: { users: { select: USER_SELECT } },
        })
      })

      return { student, provisional_password: provisionalPassword }
    } catch (error) {
      handlePrismaError(error)
    }
  }

  async createBulk(dto: CreateBulkStudentsDto) {
    try {
      // Validar duplicatas internas (dentro do array)
      const emails = dto.students.map((s) => s.email.toLowerCase())
      const rms = dto.students.map((s) => s.rm.toUpperCase())

      const duplicateEmails = emails.filter(
        (email, index) => emails.indexOf(email) !== index,
      )
      const duplicateRms = rms.filter((rm, index) => rms.indexOf(rm) !== index)

      if (duplicateEmails.length > 0 || duplicateRms.length > 0) {
        throw new BadRequestException(
          'Existem e-mails ou RMs duplicados na lista enviada',
        )
      }

      // Validar duplicatas no banco
      const existingUsers = await this.prisma.users.findMany({
        where: { email: { in: emails } },
        select: { email: true },
      })

      const existingStudents = await this.prisma.students.findMany({
        where: { rm: { in: rms } },
        select: { rm: true },
      })

      if (existingUsers.length > 0 || existingStudents.length > 0) {
        const existingEmails = existingUsers.map((u) => u.email)
        const existingRms = existingStudents.map((s) => s.rm)
        throw new BadRequestException(
          `Os seguintes dados já existem no sistema - E-mails: ${existingEmails.join(', ')} | RMs: ${existingRms.join(', ')}`,
        )
      }

      // Criar todos os alunos em uma transação
      const now = new Date()
      const created = await this.prisma.$transaction(async (tx) => {
        const results = []

        for (const studentDto of dto.students) {
          const provisionalPassword = this.generateProvisionalPassword()
          const hashedPassword = await bcrypt.hash(provisionalPassword, 10)

          const maxUserId = await tx.users.findFirst({
            orderBy: { id: 'desc' },
            select: { id: true },
          })
          const nextUserId = (maxUserId?.id ?? BigInt(0)) + BigInt(1)

          const maxStudentId = await tx.students.findFirst({
            orderBy: { id: 'desc' },
            select: { id: true },
          })
          const nextStudentId = (maxStudentId?.id ?? BigInt(0)) + BigInt(1)

          await tx.users.create({
            data: {
              id: nextUserId,
              email: studentDto.email,
              password: hashedPassword,
              role: 'ALUNO',
              is_active: true,
              created_at: now,
            },
          })

          const student = await tx.students.create({
            data: {
              id: nextStudentId,
              user_id: nextUserId,
              full_name: studentDto.full_name,
              rm: studentDto.rm,
              status: 'ACTIVE',
            },
            include: { users: { select: USER_SELECT } },
          })

          results.push({ student, provisional_password: provisionalPassword })
        }

        return results
      })

      return { created }
    } catch (error) {
      handlePrismaError(error)
    }
  }

  async findAll() {
    try {
      return await this.prisma.students.findMany({
        orderBy: { full_name: 'asc' },
        include: { 
          users: { select: USER_SELECT },
          enrollments: {
            include: {
              classes: {
                include: {
                  academic_years: true,
                },
              },
            },
          },
        },
      })
    } catch (error) {
      handlePrismaError(error)
    }
  }

  async findOne(id: bigint) {
    try {
      const student = await this.prisma.students.findUnique({
        where: { id },
        include: { 
          users: { select: USER_SELECT },
          enrollments: {
            include: {
              classes: {
                include: {
                  academic_years: true,
                },
              },
            },
          },
        },
      })

      if (!student) {
        throw new NotFoundException('Registro não encontrado')
      }

      return student
    } catch (error) {
      handlePrismaError(error)
    }
  }

  async update(id: bigint, dto: UpdateStudentDto) {
    try {
      const current = await this.findOne(id)

      if (dto.email !== undefined && dto.email !== current.users.email) {
        await this.ensureEmailUnique(dto.email)
      }

      if (dto.rm !== undefined && dto.rm !== current.rm) {
        await this.ensureRmUnique(dto.rm, id)
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

        return tx.students.update({
          where: { id },
          data: {
            ...(dto.full_name !== undefined && { full_name: dto.full_name }),
            ...(dto.rm !== undefined && { rm: dto.rm }),
            ...(dto.status !== undefined && { status: dto.status }),
          },
          include: { 
            users: { select: USER_SELECT },
            enrollments: {
              include: {
                classes: {
                  include: {
                    academic_years: true,
                  },
                },
              },
            },
          },
        })
      })
    } catch (error) {
      handlePrismaError(error)
    }
  }

  async enroll(studentId: bigint, dto: EnrollStudentDto) {
    try {
      const student = await this.findOne(studentId)

      if (student.status !== 'ACTIVE') {
        throw new BadRequestException(
          'Apenas alunos com status ACTIVE podem ser matriculados',
        )
      }

      const classId = BigInt(dto.class_id)

      const classRecord = await this.prisma.classes.findUnique({
        where: { id: classId },
        include: { academic_years: true },
      })

      if (!classRecord) {
        throw new NotFoundException('Turma não encontrada')
      }

      // Verificar se já está matriculado nesta turma
      const existingEnrollment = await this.prisma.enrollments.findFirst({
        where: {
          student_id: studentId,
          class_id: classId,
        },
      })

      if (existingEnrollment) {
        throw new BadRequestException('Aluno já está matriculado nesta turma')
      }

      const maxEnrollmentId = await this.prisma.enrollments.findFirst({
        orderBy: { id: 'desc' },
        select: { id: true },
      })
      const nextEnrollmentId = (maxEnrollmentId?.id ?? BigInt(0)) + BigInt(1)

      const now = new Date()

      return await this.prisma.enrollments.create({
        data: {
          id: nextEnrollmentId,
          student_id: studentId,
          class_id: classId,
          final_result: 'IN_PROGRESS',
          created_at: now,
        },
        include: {
          students: {
            include: { users: { select: USER_SELECT } },
          },
          classes: {
            include: { academic_years: true },
          },
        },
      })
    } catch (error) {
      handlePrismaError(error)
    }
  }

  async removeEnrollment(studentId: bigint, enrollmentId: bigint) {
    try {
      const enrollment = await this.prisma.enrollments.findUnique({
        where: { id: enrollmentId },
      })

      if (!enrollment) {
        throw new NotFoundException('Matrícula não encontrada')
      }

      if (enrollment.student_id !== studentId) {
        throw new BadRequestException(
          'Esta matrícula não pertence ao aluno informado',
        )
      }

      return await this.prisma.enrollments.delete({
        where: { id: enrollmentId },
      })
    } catch (error) {
      handlePrismaError(error)
    }
  }

  private generateProvisionalPassword(): string {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
    let suffix = ''
    for (let i = 0; i < 6; i++) {
      suffix += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return `Aluno@${suffix}`
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

  private async ensureRmUnique(rm: string, excludeId?: bigint) {
    try {
      const existing = await this.prisma.students.findUnique({
        where: { rm },
        select: { id: true },
      })

      if (existing && existing.id !== excludeId) {
        throw new BadRequestException('Já existe um aluno com este RM')
      }
    } catch (error) {
      handlePrismaError(error)
    }
  }
}
