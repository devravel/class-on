import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { handlePrismaError } from '../common/errors/handle-prisma-error'
import { CreateEventDto } from './dto/create-event.dto'
import { UpdateEventDto } from './dto/update-event.dto'

const EVENT_INCLUDE = {
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
  academic_years: {
    select: {
      id: true,
      year: true,
    },
  },
  event_targets: {
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
    },
  },
}

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateEventDto, userId: bigint, userRole: string) {
    try {
      // Validar se start_date <= end_date
      const startDate = new Date(dto.start_date)
      const endDate = new Date(dto.end_date)

      if (startDate > endDate) {
        throw new BadRequestException('start_date deve ser anterior ou igual a end_date.')
      }

      // Buscar ano letivo ativo
      const activeYear = await this.prisma.academic_years.findFirst({
        where: { status: 'ACTIVE' },
        select: { id: true },
      })

      if (!activeYear) {
        throw new BadRequestException('Nenhum ano letivo ativo encontrado.')
      }

      let yearId = activeYear.id

      // Validação de permissões para professores
      if (userRole === 'PROFESSOR') {
        if (dto.scope_type === 'ALL_SCHOOL' || dto.scope_type === 'TEACHERS') {
          throw new ForbiddenException(
            'Professor não pode criar eventos para toda escola ou apenas professores.'
          )
        }

        // Verificar se professor tem atribuição nas turmas especificadas
        if (dto.scope_type === 'SPECIFIC_CLASSES' && dto.class_ids) {
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

      // Para SPECIFIC_CLASSES, usar year_id da primeira turma (todas do mesmo ano)
      if (dto.scope_type === 'SPECIFIC_CLASSES' && dto.class_ids) {
        const classYear = await this.prisma.classes.findFirst({
          where: { id: BigInt(dto.class_ids[0]) },
          select: { year_id: true },
        })

        if (classYear) {
          yearId = classYear.year_id
        }
      }

      // Buscar próximo ID
      const maxIdRecord = await this.prisma.events.findFirst({
        orderBy: { id: 'desc' },
        select: { id: true },
      })

      const nextId = (maxIdRecord?.id ?? BigInt(0)) + BigInt(1)

      // Criar evento
      const event = await this.prisma.events.create({
        data: {
          id: nextId,
          creator_id: userId,
          year_id: yearId,
          title: dto.title,
          description: dto.description,
          start_date: startDate,
          end_date: endDate,
          all_day: dto.all_day,
          status: 'ACTIVE',
          scope_type: dto.scope_type as any,
          created_at: new Date(),
          updated_at: new Date(),
        },
      })

      // Criar targets se necessário
      if (dto.scope_type === 'SPECIFIC_CLASSES' && dto.class_ids) {
        const maxTargetId = await this.prisma.event_targets.findFirst({
          orderBy: { id: 'desc' },
          select: { id: true },
        })

        const targets = dto.class_ids.map((classId, index) => ({
          id: (maxTargetId?.id ?? BigInt(0)) + BigInt(index + 1),
          event_id: event.id,
          class_id: BigInt(classId),
        }))

        await this.prisma.event_targets.createMany({
          data: targets,
        })
      }

      return this.findOne(event.id)
    } catch (error) {
      handlePrismaError(error)
    }
  }

  async findAll(userId: bigint, userRole: string) {
    try {
      let whereCondition: any = {}

      // Buscar ano letivo ativo
      const activeYear = await this.prisma.academic_years.findFirst({
        where: { status: 'ACTIVE' },
        select: { id: true },
      })

      const baseCondition = activeYear ? { year_id: activeYear.id } : {}

      if (userRole === 'SECRETARIA') {
        // Secretaria vê todos os eventos do ano ativo
        whereCondition = baseCondition
      } else if (userRole === 'PROFESSOR') {
        // Professor vê eventos criados por ele + recebidos por ele
        const teacher = await this.prisma.teachers.findUnique({
          where: { user_id: userId },
          select: { id: true },
        })

        if (!teacher) {
          throw new BadRequestException('Perfil de professor não encontrado.')
        }

        // Buscar turmas do professor
        const teacherAssignments = await this.prisma.assignments.findMany({
          where: { teacher_id: teacher.id },
          select: { class_id: true },
        })

        const teacherClassIds = teacherAssignments.map((a) => a.class_id)

        whereCondition = {
          ...baseCondition,
          OR: [
            { creator_id: userId }, // Criados por ele
            { scope_type: 'ALL_SCHOOL' }, // Para toda escola
            { scope_type: 'TEACHERS' }, // Para professores
            {
              AND: [
                { scope_type: 'SPECIFIC_CLASSES' },
                {
                  event_targets: {
                    some: {
                      class_id: { in: teacherClassIds },
                    },
                  },
                },
              ],
            },
          ],
        }
      } else if (userRole === 'ALUNO') {
        // Aluno vê apenas eventos direcionados a ele
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
          ...baseCondition,
          OR: [
            { scope_type: 'ALL_SCHOOL' },
            { scope_type: 'STUDENTS' },
            {
              AND: [
                { scope_type: 'SPECIFIC_CLASSES' },
                {
                  event_targets: {
                    some: {
                      class_id: { in: studentClassIds },
                    },
                  },
                },
              ],
            },
          ],
        }
      }

      const events = await this.prisma.events.findMany({
        where: {
          ...whereCondition,
          status: 'ACTIVE',
        },
        include: EVENT_INCLUDE,
        orderBy: {
          start_date: 'asc',
        },
      })

      return events
    } catch (error) {
      handlePrismaError(error)
    }
  }

  async findOne(id: bigint, userId?: bigint, userRole?: string) {
    try {
      const event = await this.prisma.events.findUnique({
        where: { id },
        include: EVENT_INCLUDE,
      })

      if (!event) {
        throw new NotFoundException('Evento não encontrado.')
      }

      // Verificar permissões se userId e userRole forem fornecidos
      if (userId && userRole) {
        const hasAccess = await this.checkUserAccess(event, userId, userRole)
        if (!hasAccess) {
          throw new ForbiddenException('Acesso negado a este evento.')
        }
      }

      return event
    } catch (error) {
      handlePrismaError(error)
    }
  }

  async update(id: bigint, dto: UpdateEventDto, userId: bigint, userRole: string) {
    try {
      const event = await this.findOne(id, userId, userRole)

      // Apenas criador ou secretaria podem editar
      if (userRole !== 'SECRETARIA' && event.creator_id !== userId) {
        throw new ForbiddenException('Apenas o criador ou secretaria podem editar eventos.')
      }

      // Validar datas se fornecidas
      if (dto.start_date && dto.end_date) {
        const startDate = new Date(dto.start_date)
        const endDate = new Date(dto.end_date)

        if (startDate > endDate) {
          throw new BadRequestException('start_date deve ser anterior ou igual a end_date.')
        }
      }

      const updatedEvent = await this.prisma.events.update({
        where: { id },
        data: {
          ...(dto.title && { title: dto.title }),
          ...(dto.description && { description: dto.description }),
          ...(dto.start_date && { start_date: new Date(dto.start_date) }),
          ...(dto.end_date && { end_date: new Date(dto.end_date) }),
          ...(dto.all_day !== undefined && { all_day: dto.all_day }),
          ...(dto.status && { status: dto.status as any }),
          updated_at: new Date(),
        },
        include: EVENT_INCLUDE,
      })

      return updatedEvent
    } catch (error) {
      handlePrismaError(error)
    }
  }

  async remove(id: bigint, userId: bigint, userRole: string) {
    try {
      const event = await this.findOne(id, userId, userRole)

      // Apenas criador ou secretaria podem deletar
      if (userRole !== 'SECRETARIA' && event.creator_id !== userId) {
        throw new ForbiddenException('Apenas o criador ou secretaria podem deletar eventos.')
      }

      // Soft delete: marcar como CANCELLED ao invés de remover
      await this.prisma.events.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          updated_at: new Date(),
        },
      })

      return { message: 'Evento cancelado com sucesso.' }
    } catch (error) {
      handlePrismaError(error)
    }
  }

  async getCalendar(userId: bigint, userRole: string, classId?: string) {
    try {
      const events = await this.findAll(userId, userRole)

      // Filtrar por turma se especificado (para secretaria)
      let filteredEvents = events
      if (classId && userRole === 'SECRETARIA') {
        const classIdBigInt = BigInt(classId)
        filteredEvents = events.filter((event) => {
          if (event.scope_type === 'ALL_SCHOOL' || event.scope_type === 'STUDENTS') {
            return true
          }
          if (event.scope_type === 'SPECIFIC_CLASSES') {
            return event.event_targets.some((target) => target.class_id === classIdBigInt)
          }
          return false
        })
      }

      // Converter para formato FullCalendar
      return filteredEvents.map((event) => ({
        id: event.id.toString(),
        title: event.title,
        start: event.start_date.toISOString(),
        end: event.end_date.toISOString(),
        allDay: event.all_day,
        extendedProps: {
          description: event.description,
          creator: event.users.teachers?.[0]?.full_name || event.users.email,
          status: event.status,
          scope_type: event.scope_type,
        },
      }))
    } catch (error) {
      handlePrismaError(error)
    }
  }

  private async checkUserAccess(event: any, userId: bigint, userRole: string): Promise<boolean> {
    if (userRole === 'SECRETARIA') {
      return true
    }

    if (userRole === 'PROFESSOR') {
      // Professor pode ver eventos criados por ele ou direcionados a professores
      if (event.creator_id === userId || event.scope_type === 'ALL_SCHOOL' || event.scope_type === 'TEACHERS') {
        return true
      }

      // Verificar se tem acesso via assignments
      if (event.scope_type === 'SPECIFIC_CLASSES') {
        const teacher = await this.prisma.teachers.findUnique({
          where: { user_id: userId },
          select: { id: true },
        })

        if (!teacher) return false

        const teacherAssignments = await this.prisma.assignments.findMany({
          where: { teacher_id: teacher.id },
          select: { class_id: true },
        })

        const teacherClassIds = teacherAssignments.map((a) => a.class_id)
        const eventClassIds = event.event_targets.map((t) => t.class_id)

        return eventClassIds.some((classId) => teacherClassIds.includes(classId))
      }
    }

    if (userRole === 'ALUNO') {
      // Verificar se aluno tem acesso ao evento
      const student = await this.prisma.students.findUnique({
        where: { user_id: userId },
        select: { id: true },
      })

      if (!student) return false

      if (event.scope_type === 'ALL_SCHOOL' || event.scope_type === 'STUDENTS') return true

      if (event.scope_type === 'SPECIFIC_CLASSES') {
        // Verificar se aluno está matriculado em alguma das turmas
        const enrollments = await this.prisma.enrollments.findMany({
          where: { student_id: student.id },
          select: { class_id: true },
        })

        const studentClassIds = enrollments.map((e) => e.class_id)
        const eventClassIds = event.event_targets.map((t) => t.class_id)

        return eventClassIds.some((classId) => studentClassIds.includes(classId))
      }
    }

    return false
  }
}