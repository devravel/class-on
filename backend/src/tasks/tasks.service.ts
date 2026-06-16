import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { handlePrismaError } from '../common/errors/handle-prisma-error'
import { CreateTaskDto } from './dto/create-task.dto'
import { SubmitTaskDto } from './dto/submit-task.dto'

const TASK_INCLUDE = {
  assignments: {
    include: {
      teachers: {
        select: {
          id: true,
          full_name: true,
          registration_code: true,
        },
      },
      subjects: {
        select: {
          id: true,
          name: true,
        },
      },
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
} as const

const SUBMISSION_INCLUDE = {
  students: {
    select: {
      id: true,
      full_name: true,
      rm: true,
    },
  },
} as const

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTaskDto, teacherId: bigint) {
    try {
      const assignmentId = BigInt(dto.assignment_id)
      const deadline = new Date(dto.deadline)

      // Validar que o deadline é futuro
      if (deadline <= new Date()) {
        throw new BadRequestException('O prazo deve ser uma data futura')
      }

      // Validar que a atribuição existe e pertence ao professor
      const assignment = await this.prisma.assignments.findUnique({
        where: { id: assignmentId },
        include: {
          classes: {
            include: {
              enrollments: {
                select: {
                  student_id: true,
                },
              },
            },
          },
        },
      })

      if (!assignment) {
        throw new NotFoundException('Atribuição não encontrada')
      }

      if (assignment.teacher_id !== teacherId) {
        throw new BadRequestException(
          'Você só pode criar tarefas para suas próprias atribuições',
        )
      }

      // Gerar próximo ID
      const maxTaskId = await this.prisma.tasks.findFirst({
        orderBy: { id: 'desc' },
        select: { id: true },
      })
      const nextTaskId = (maxTaskId?.id ?? BigInt(0)) + BigInt(1)

      const now = new Date()

      // Criar tarefa em transação
      const task = await this.prisma.$transaction(async (tx) => {
        // Criar a tarefa
        const newTask = await tx.tasks.create({
          data: {
            id: nextTaskId,
            assignment_id: assignmentId,
            title: dto.title,
            description: dto.description,
            deadline: deadline,
            status: 'OPEN',
            target_mode: 'ALL_CLASS', // Sempre para toda turma no escopo simplificado
            created_at: now,
          },
          include: TASK_INCLUDE,
        })

        // Criar task_targets para todos os alunos matriculados na turma
        const enrollments = assignment.classes.enrollments
        if (enrollments.length > 0) {
          for (const enrollment of enrollments) {
            const maxTargetId = await tx.task_targets.findFirst({
              orderBy: { id: 'desc' },
              select: { id: true },
            })
            const nextTargetId = (maxTargetId?.id ?? BigInt(0)) + BigInt(1)

            await tx.task_targets.create({
              data: {
                id: nextTargetId,
                task_id: nextTaskId,
                student_id: enrollment.student_id,
                created_at: now,
              },
            })
          }
        }

        return newTask
      })

      return task
    } catch (error) {
      handlePrismaError(error)
    }
  }

  async findByTeacher(teacherId: bigint) {
    try {
      return await this.prisma.tasks.findMany({
        where: {
          assignments: {
            teacher_id: teacherId,
          },
        },
        orderBy: { created_at: 'desc' },
        include: TASK_INCLUDE,
      })
    } catch (error) {
      handlePrismaError(error)
    }
  }

  async findOne(id: bigint, teacherId?: bigint) {
    try {
      const task = await this.prisma.tasks.findUnique({
        where: { id },
        include: TASK_INCLUDE,
      })

      if (!task) {
        throw new NotFoundException('Tarefa não encontrada')
      }

      // Se é professor, verificar se a tarefa pertence a ele
      if (teacherId && task.assignments.teacher_id !== teacherId) {
        throw new BadRequestException(
          'Você só pode visualizar suas próprias tarefas',
        )
      }

      return task
    } catch (error) {
      handlePrismaError(error)
    }
  }

  async findByStudent(studentId: bigint) {
    try {
      return await this.prisma.tasks.findMany({
        where: {
          task_targets: {
            some: {
              student_id: studentId,
            },
          },
        },
        orderBy: { deadline: 'asc' },
        include: {
          ...TASK_INCLUDE,
          task_submissions: {
            where: {
              student_id: studentId,
            },
            select: {
              id: true,
              status: true,
              observation: true,
              submitted_at: true,
            },
          },
        },
      })
    } catch (error) {
      handlePrismaError(error)
    }
  }

  async findOneForStudent(id: bigint, studentId: bigint) {
    try {
      const task = await this.prisma.tasks.findUnique({
        where: { id },
        include: {
          ...TASK_INCLUDE,
          task_targets: {
            where: {
              student_id: studentId,
            },
          },
          task_submissions: {
            where: {
              student_id: studentId,
            },
            select: {
              id: true,
              status: true,
              observation: true,
              submitted_at: true,
              created_at: true,
            },
          },
        },
      })

      if (!task) {
        throw new NotFoundException('Tarefa não encontrada')
      }

      // Verificar se o aluno tem acesso a esta tarefa
      if (task.task_targets.length === 0) {
        throw new BadRequestException(
          'Você não tem acesso a esta tarefa',
        )
      }

      return task
    } catch (error) {
      handlePrismaError(error)
    }
  }

  async submit(taskId: bigint, studentId: bigint, dto: SubmitTaskDto) {
    try {
      const task = await this.findOneForStudent(taskId, studentId)

      if (task.status !== 'OPEN') {
        throw new BadRequestException('Esta tarefa não aceita mais entregas')
      }

      const now = new Date()
      const isLate = now > task.deadline

      // Verificar se já existe uma submissão
      const existingSubmission = await this.prisma.task_submissions.findFirst({
        where: {
          task_id: taskId,
          student_id: studentId,
        },
      })

      if (existingSubmission) {
        // Atualizar submissão existente
        return await this.prisma.task_submissions.update({
          where: { id: existingSubmission.id },
          data: {
            status: isLate ? 'LATE' : 'SUBMITTED',
            observation: dto.observation || null,
            submitted_at: now,
          },
          include: SUBMISSION_INCLUDE,
        })
      } else {
        // Criar nova submissão
        const maxSubmissionId = await this.prisma.task_submissions.findFirst({
          orderBy: { id: 'desc' },
          select: { id: true },
        })
        const nextSubmissionId = (maxSubmissionId?.id ?? BigInt(0)) + BigInt(1)

        return await this.prisma.task_submissions.create({
          data: {
            id: nextSubmissionId,
            task_id: taskId,
            student_id: studentId,
            status: isLate ? 'LATE' : 'SUBMITTED',
            observation: dto.observation || null,
            submitted_at: now,
            created_at: now,
          },
          include: SUBMISSION_INCLUDE,
        })
      }
    } catch (error) {
      handlePrismaError(error)
    }
  }

  async findSubmissions(taskId: bigint, teacherId: bigint) {
    try {
      const task = await this.findOne(taskId, teacherId)

      const submissions = await this.prisma.task_submissions.findMany({
        where: { task_id: taskId },
        orderBy: { submitted_at: 'desc' },
        include: SUBMISSION_INCLUDE,
      })

      // Buscar todos os alunos que deveriam entregar (task_targets)
      const targets = await this.prisma.task_targets.findMany({
        where: { task_id: taskId },
        include: {
          students: {
            select: {
              id: true,
              full_name: true,
              rm: true,
            },
          },
        },
      })

      // Combinar informações para mostrar status completo
      const submissionsMap = new Map(
        submissions.map((sub) => [sub.student_id.toString(), sub]),
      )

      const result = targets.map((target) => {
        const submission = submissionsMap.get(target.student_id.toString())
        return {
          student: target.students,
          submission: submission || {
            status: 'PENDING',
            observation: null,
            submitted_at: null,
          },
        }
      })

      return { task, submissions: result }
    } catch (error) {
      handlePrismaError(error)
    }
  }

  async findAll() {
    try {
      return await this.prisma.tasks.findMany({
        orderBy: { created_at: 'desc' },
        include: TASK_INCLUDE,
      })
    } catch (error) {
      handlePrismaError(error)
    }
  }

  async remove(id: bigint, teacherId: bigint) {
    try {
      const task = await this.findOne(id, teacherId)

      // Verificar se existem submissões
      const submissionsCount = await this.prisma.task_submissions.count({
        where: { task_id: id },
      })

      if (submissionsCount > 0) {
        throw new BadRequestException(
          'Não é possível excluir esta tarefa pois já existem entregas',
        )
      }

      // Excluir em cascata: task_targets primeiro, depois task
      return await this.prisma.$transaction(async (tx) => {
        await tx.task_targets.deleteMany({
          where: { task_id: id },
        })

        return tx.tasks.delete({
          where: { id },
        })
      })
    } catch (error) {
      handlePrismaError(error)
    }
  }
}