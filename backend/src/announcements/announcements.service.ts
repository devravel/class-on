import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { handlePrismaError } from '../common/errors/handle-prisma-error'
import { CreateAnnouncementDto } from './dto/create-announcement.dto'
import { ArchiveAnnouncementDto } from './dto/archive-announcement.dto'

const ANNOUNCEMENT_INCLUDE = {
  users: {
    select: {
      id: true,
      email: true,
      role: true,
      teachers: {
        select: {
          id: true,
          full_name: true,
        },
      },
    },
  },
  announcements_targets: {
    include: {
      classes: {
        include: {
          academic_years: {
            select: {
              id: true,
              year: true,
            },
          },
        },
      },
      students: {
        select: {
          id: true,
          full_name: true,
          rm: true,
        },
      },
    },
  },
  _count: {
    select: {
      announcement_reads: true,
    },
  },
}

@Injectable()
export class AnnouncementsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateAnnouncementDto, userId: bigint, userRole: string) {
    try {
      // Validação de permissões para professores
      if (userRole === 'PROFESSOR') {
        if (dto.scope_type === 'ALL_SCHOOL' || dto.scope_type === 'TEACHERS') {
          throw new ForbiddenException(
            'Professor não pode criar comunicados para toda escola ou apenas professores.'
          )
        }

        // Verificar se professor tem atribuição nas turmas especificadas
        if (dto.target_type === 'CLASS' && dto.class_ids) {
          const teacher = await this.prisma.teachers.findUnique({
            where: { user_id: userId },
            select: { id: true },
          })

          if (!teacher) {
            throw new BadRequestException('Perfil de professor não encontrado.')
          }

          const teacherAssignments = await this.prisma.assignments.findMany({
            where: {
              teacher_id: teacher.id,
              class_id: { in: dto.class_ids.map((id) => BigInt(id)) },
            },
            select: { class_id: true },
          })

          const assignedClassIds = teacherAssignments.map((a) => a.class_id.toString())
          const unauthorizedClasses = dto.class_ids.filter(
            (classId) => !assignedClassIds.includes(classId)
          )

          if (unauthorizedClasses.length > 0) {
            throw new ForbiddenException(
              `Professor não tem atribuição nas turmas: ${unauthorizedClasses.join(', ')}`
            )
          }
        }
      }

      // Criar comunicado
      const announcement = await this.prisma.announcements.create({
        data: {
          id: BigInt(Date.now()), // Usar timestamp como ID único
          creator_id: userId,
          title: dto.title,
          message: dto.message,
          status: 'ACTIVE',
          scope_type: dto.scope_type,
          target_type: dto.target_type,
          created_at: new Date(),
        },
      })

      // Criar targets se necessário
      if (dto.target_type === 'CLASS' && dto.class_ids) {
        const targets = dto.class_ids.map((classId, index) => ({
          id: BigInt(Date.now() + index + 1),
          announcement_id: announcement.id,
          class_id: BigInt(classId),
          student_id: null,
        }))

        await this.prisma.announcements_targets.createMany({
          data: targets,
        })
      }

      if (dto.target_type === 'STUDENT' && dto.student_ids) {
        const targets = dto.student_ids.map((studentId, index) => ({
          id: BigInt(Date.now() + index + 1),
          announcement_id: announcement.id,
          class_id: null,
          student_id: BigInt(studentId),
        }))

        await this.prisma.announcements_targets.createMany({
          data: targets,
        })
      }

      return this.findOne(announcement.id)
    } catch (error) {
      handlePrismaError(error)
    }
  }

  async findAll(userId: bigint, userRole: string) {
    try {
      let whereCondition: any = {}

      if (userRole === 'SECRETARIA') {
        // Secretaria vê todos os comunicados
        whereCondition = {}
      } else if (userRole === 'PROFESSOR') {
        // Professor vê comunicados criados por ele + recebidos por ele
        whereCondition = {
          OR: [
            { creator_id: userId }, // Criados por ele
            { scope_type: 'ALL_SCHOOL' }, // Para toda escola
            { scope_type: 'TEACHERS' }, // Para professores
          ],
        }
      } else if (userRole === 'ALUNO') {
        // Aluno vê apenas comunicados direcionados a ele
        const student = await this.prisma.students.findUnique({
          where: { user_id: userId },
          select: { id: true },
        })

        if (!student) {
          throw new BadRequestException('Perfil de aluno não encontrado.')
        }

        // Buscar turmas do aluno
        const enrollments = await this.prisma.enrollments.findMany({
          where: { student_id: student.id },
          select: { class_id: true },
        })

        const studentClassIds = enrollments.map((e) => e.class_id)

        whereCondition = {
          OR: [
            { scope_type: 'ALL_SCHOOL' },
            {
              AND: [
                { scope_type: 'STUDENTS' },
                { target_type: 'ALL' },
              ],
            },
            {
              AND: [
                { scope_type: 'STUDENTS' },
                { target_type: 'CLASS' },
                {
                  announcements_targets: {
                    some: {
                      class_id: { in: studentClassIds },
                    },
                  },
                },
              ],
            },
            {
              AND: [
                { scope_type: 'STUDENTS' },
                { target_type: 'STUDENT' },
                {
                  announcements_targets: {
                    some: {
                      student_id: student.id,
                    },
                  },
                },
              ],
            },
          ],
        }
      }

      const announcements = await this.prisma.announcements.findMany({
        where: {
          ...whereCondition,
          status: 'ACTIVE',
        },
        include: ANNOUNCEMENT_INCLUDE,
        orderBy: {
          created_at: 'desc',
        },
      })

      return announcements
    } catch (error) {
      handlePrismaError(error)
    }
  }

  async findOne(id: bigint, userId?: bigint, userRole?: string) {
    try {
      const announcement = await this.prisma.announcements.findUnique({
        where: { id },
        include: ANNOUNCEMENT_INCLUDE,
      })

      if (!announcement) {
        throw new NotFoundException('Comunicado não encontrado.')
      }

      // Verificar permissões se userId e userRole forem fornecidos
      if (userId && userRole) {
        const hasAccess = await this.checkUserAccess(announcement, userId, userRole)
        if (!hasAccess) {
          throw new ForbiddenException('Acesso negado a este comunicado.')
        }
      }

      return announcement
    } catch (error) {
      handlePrismaError(error)
    }
  }

  async markAsRead(announcementId: bigint, userId: bigint) {
    try {
      // Verificar se já foi lido
      const existingRead = await this.prisma.announcement_reads.findFirst({
        where: {
          announcement_id: announcementId,
          user_id: userId,
        },
      })

      if (existingRead) {
        return { message: 'Comunicado já foi marcado como lido.' }
      }

      // Marcar como lido
      await this.prisma.announcement_reads.create({
        data: {
          id: BigInt(Date.now()),
          announcement_id: announcementId,
          user_id: userId,
          read_at: new Date(),
        },
      })

      return { message: 'Comunicado marcado como lido.' }
    } catch (error) {
      handlePrismaError(error)
    }
  }

  async archive(id: bigint, dto: ArchiveAnnouncementDto, userId: bigint, userRole: string) {
    try {
      const announcement = await this.findOne(id)

      // Apenas criador ou secretaria podem arquivar
      if (userRole !== 'SECRETARIA' && announcement.creator_id !== userId) {
        throw new ForbiddenException('Apenas o criador ou secretaria podem arquivar comunicados.')
      }

      const updatedAnnouncement = await this.prisma.announcements.update({
        where: { id },
        data: { status: dto.status },
        include: ANNOUNCEMENT_INCLUDE,
      })

      return updatedAnnouncement
    } catch (error) {
      handlePrismaError(error)
    }
  }

  async getStats(id: bigint, userId: bigint, userRole: string) {
    try {
      const announcement = await this.findOne(id)

      // Apenas criador ou secretaria podem ver estatísticas
      if (userRole !== 'SECRETARIA' && announcement.creator_id !== userId) {
        throw new ForbiddenException('Apenas o criador ou secretaria podem ver estatísticas.')
      }

      // Calcular total de destinatários
      let totalRecipients = 0

      if (announcement.scope_type === 'ALL_SCHOOL') {
        // Contar todos os usuários ativos
        totalRecipients = await this.prisma.users.count({
          where: { is_active: true },
        })
      } else if (announcement.scope_type === 'TEACHERS') {
        // Contar apenas professores ativos
        totalRecipients = await this.prisma.users.count({
          where: {
            role: 'PROFESSOR',
            is_active: true,
          },
        })
      } else if (announcement.scope_type === 'STUDENTS') {
        if (announcement.target_type === 'ALL') {
          // Todos os alunos
          totalRecipients = await this.prisma.users.count({
            where: {
              role: 'ALUNO',
              is_active: true,
            },
          })
        } else if (announcement.target_type === 'CLASS') {
          // Alunos das turmas específicas
          const classIds = announcement.announcements_targets.map((t) => t.class_id).filter(Boolean)
          totalRecipients = await this.prisma.enrollments.count({
            where: {
              class_id: { in: classIds },
              students: {
                users: {
                  is_active: true,
                },
              },
            },
          })
        } else if (announcement.target_type === 'STUDENT') {
          // Alunos específicos
          const studentIds = announcement.announcements_targets.map((t) => t.student_id).filter(Boolean)
          totalRecipients = await this.prisma.students.count({
            where: {
              id: { in: studentIds },
              users: {
                is_active: true,
              },
            },
          })
        }
      }

      // Contar leituras
      const readCount = await this.prisma.announcement_reads.count({
        where: { announcement_id: id },
      })

      return {
        totalRecipients,
        readCount,
        unreadCount: totalRecipients - readCount,
      }
    } catch (error) {
      handlePrismaError(error)
    }
  }

  private async checkUserAccess(announcement: any, userId: bigint, userRole: string): Promise<boolean> {
    if (userRole === 'SECRETARIA') {
      return true
    }

    if (userRole === 'PROFESSOR') {
      // Professor pode ver comunicados criados por ele ou direcionados a professores
      return (
        announcement.creator_id === userId ||
        announcement.scope_type === 'ALL_SCHOOL' ||
        announcement.scope_type === 'TEACHERS'
      )
    }

    if (userRole === 'ALUNO') {
      // Verificar se aluno tem acesso ao comunicado
      const student = await this.prisma.students.findUnique({
        where: { user_id: userId },
        select: { id: true },
      })

      if (!student) return false

      if (announcement.scope_type === 'ALL_SCHOOL') return true
      
      if (announcement.scope_type === 'STUDENTS') {
        if (announcement.target_type === 'ALL') return true

        if (announcement.target_type === 'CLASS') {
          // Verificar se aluno está matriculado em alguma das turmas
          const enrollments = await this.prisma.enrollments.findMany({
            where: { student_id: student.id },
            select: { class_id: true },
          })
          
          const studentClassIds = enrollments.map((e) => e.class_id)
          const targetClassIds = announcement.announcements_targets
            .map((t) => t.class_id)
            .filter(Boolean)

          return targetClassIds.some((classId) => studentClassIds.includes(classId))
        }

        if (announcement.target_type === 'STUDENT') {
          // Verificar se aluno está na lista de destinatários
          return announcement.announcements_targets.some((t) => t.student_id === student.id)
        }
      }
    }

    return false
  }
}