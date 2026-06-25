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
import {
  addUtcDaysToYmd,
  compareYmd,
  extractCalendarYmd,
  inclusiveAllDayRangeToUtcBounds,
  utcYmd,
} from './event-dates'

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
      let startDate: Date
      let endDate: Date

      if (dto.all_day) {
        const startYmd = extractCalendarYmd(dto.start_date)
        const endYmd = extractCalendarYmd(dto.end_date)
        if (compareYmd(startYmd, endYmd) > 0) {
          throw new BadRequestException(
            'A data de término deve ser a mesma que a de início ou posterior.',
          )
        }
        const bounds = inclusiveAllDayRangeToUtcBounds(startYmd, endYmd)
        startDate = bounds.start
        endDate = bounds.end
      } else {
        startDate = new Date(dto.start_date)
        endDate = new Date(dto.end_date)
        if (startDate > endDate) {
          throw new BadRequestException(
            'A data e hora de término devem ser iguais ou posteriores às de início.',
          )
        }
      }

      // Buscar ano letivo ativo
      const activeYear = await this.prisma.academic_years.findFirst({
        where: { status: 'ACTIVE' },
        select: { id: true },
      })

      if (!activeYear) {
        throw new BadRequestException(
          'Não encontramos um ano letivo ativo. Em Secretaria, abra Anos letivos e marque um ano como ativo para continuar.',
        )
      }

      let yearId = activeYear.id

      // Validação de permissões para professores
      if (userRole === 'PROFESSOR') {
        if (dto.scope_type === 'ALL_SCHOOL' || dto.scope_type === 'TEACHERS') {
          throw new ForbiddenException(
            'No ClassOn, professores podem criar eventos para alunos ou para turmas em que lecionam. Escolha outro escopo.',
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
              'Você só pode incluir turmas em que está vinculado como professor. Ajuste a seleção e tente de novo.',
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

      // Criar evento
      const event = await this.prisma.events.create({
        data: {
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
        await this.prisma.event_targets.createMany({
          data: dto.class_ids.map((classId) => ({
            event_id: event.id,
            class_id: BigInt(classId),
          })),
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
          throw new ForbiddenException(
            'Você não tem permissão para ver este evento. Peça ajuda à secretaria se precisar de acesso.',
          )
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
        throw new ForbiddenException(
          'Só quem criou o evento ou a secretaria pode alterá-lo.',
        )
      }

      const mergedAllDay = dto.all_day !== undefined ? dto.all_day : event.all_day

      let nextStart = event.start_date
      let nextEnd = event.end_date

      if (dto.start_date !== undefined || dto.end_date !== undefined) {
        if (mergedAllDay) {
          const startYmd =
            dto.start_date !== undefined
              ? extractCalendarYmd(dto.start_date)
              : utcYmd(event.start_date)
          const endYmd =
            dto.end_date !== undefined
              ? extractCalendarYmd(dto.end_date)
              : utcYmd(event.end_date)
          if (compareYmd(startYmd, endYmd) > 0) {
            throw new BadRequestException(
              'A data de término deve ser a mesma que a de início ou posterior.',
            )
          }
          const bounds = inclusiveAllDayRangeToUtcBounds(startYmd, endYmd)
          nextStart = bounds.start
          nextEnd = bounds.end
        } else {
          if (dto.start_date !== undefined) {
            nextStart = new Date(dto.start_date)
          }
          if (dto.end_date !== undefined) {
            nextEnd = new Date(dto.end_date)
          }
          if (nextStart > nextEnd) {
            throw new BadRequestException(
              'A data e hora de término devem ser iguais ou posteriores às de início.',
            )
          }
        }
      }

      const updatedEvent = await this.prisma.events.update({
        where: { id },
        data: {
          ...(dto.title && { title: dto.title }),
          ...(dto.description && { description: dto.description }),
          ...(dto.start_date !== undefined || dto.end_date !== undefined
            ? { start_date: nextStart, end_date: nextEnd }
            : {}),
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
        throw new ForbiddenException(
          'Só quem criou o evento ou a secretaria pode removê-lo.',
        )
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

      // Converter para formato FullCalendar (dia inteiro: fim exclusivo em YYYY-MM-DD)
      return filteredEvents.map((event) => {
        if (event.all_day) {
          const startYmd = utcYmd(event.start_date)
          const endInclusiveYmd = utcYmd(event.end_date)
          const endExclusiveYmd = addUtcDaysToYmd(endInclusiveYmd, 1)
          return {
            id: event.id.toString(),
            title: event.title,
            start: startYmd,
            end: endExclusiveYmd,
            allDay: true,
            extendedProps: {
              description: event.description,
              creator: event.users.teachers?.[0]?.full_name || event.users.email,
              creator_id: event.creator_id.toString(),
              status: event.status,
              scope_type: event.scope_type,
            },
          }
        }
        return {
          id: event.id.toString(),
          title: event.title,
          start: event.start_date.toISOString(),
          end: event.end_date.toISOString(),
          allDay: false,
          extendedProps: {
            description: event.description,
            creator: event.users.teachers?.[0]?.full_name || event.users.email,
            creator_id: event.creator_id.toString(),
            status: event.status,
            scope_type: event.scope_type,
          },
        }
      })
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