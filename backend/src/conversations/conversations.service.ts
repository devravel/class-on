import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { AiService } from '../ai/ai.service'
import type { AuthenticatedUser } from '../auth/strategies/jwt.strategy'
import { PrismaService } from '../prisma/prisma.service'

/** Par aluno ↔ professor de uma conversa, resolvido a partir de quem está logado. */
interface Pair {
  studentId: bigint
  teacherId: bigint
  studentUserId: bigint
  teacherUserId: bigint
  studentName: string
  teacherName: string
  /** Vínculos (turma + disciplina) em que esse professor dá aula pra esse aluno. */
  assignments: Array<{ id: bigint; subject: string; classLabel: string }>
}

export interface SubjectContext {
  subject: string
  average: number | null
  attendance_rate: number | null
  lessons: number
}

export interface TaskContext {
  id: string
  title: string
  subject: string
  deadline: Date
}

export interface PairContext {
  subjects: SubjectContext[]
  pending: TaskContext[]
  overdue: TaskContext[]
  delivered: number
}

const PENDING_STATUS = 'SENT'

function firstName(name: string) {
  return name.split(' ')[0]
}

function br(value: number) {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
}

function day(date: Date) {
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'America/Sao_Paulo' })
}

@Injectable()
export class ConversationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: AiService,
  ) {}

  // ───────────────────────── Lista lateral ─────────────────────────

  /**
   * Aluno: todos os professores que dão aula pra ele, já prontos pra conversar
   * (com ou sem conversa aberta). Professor: as conversas abertas + os alunos
   * dele que pedem atenção (média < 6 ou tarefa atrasada nas disciplinas dele).
   */
  async contacts(user: AuthenticatedUser, query?: string) {
    return user.role === 'ALUNO'
      ? this.studentContacts(user)
      : this.teacherContacts(user, query?.trim() ?? '')
  }

  private async studentContacts(user: AuthenticatedUser) {
    const student = this.requireStudent(user)
    const classIds = await this.activeClassIds(student.id)
    const assignments = await this.prisma.assignments.findMany({
      where: { class_id: { in: classIds } },
      select: {
        id: true,
        teachers: { select: { id: true, full_name: true } },
        subjects: { select: { name: true } },
      },
    })

    const byTeacher = new Map<string, { id: bigint; name: string; subjects: string[]; assignmentIds: bigint[] }>()
    for (const a of assignments) {
      const key = a.teachers.id.toString()
      const entry = byTeacher.get(key) ?? { id: a.teachers.id, name: a.teachers.full_name, subjects: [], assignmentIds: [] }
      entry.subjects.push(a.subjects.name)
      entry.assignmentIds.push(a.id)
      byTeacher.set(key, entry)
    }

    const conversations = await this.prisma.conversations.findMany({
      where: { student_id: student.id },
      select: {
        teacher_id: true,
        messages: { orderBy: { created_at: 'desc' }, take: 1, select: { content: true, created_at: true, sender_id: true } },
        _count: { select: { messages: { where: { status: PENDING_STATUS, sender_id: { not: BigInt(user.id) } } } } },
      },
    })
    const convByTeacher = new Map(conversations.map((c) => [c.teacher_id.toString(), c]))
    const pendingByAssignment = await this.pendingTaskCounts(student.id, assignments.map((a) => a.id))

    return [...byTeacher.values()]
      .map((t) => {
        const conv = convByTeacher.get(t.id.toString())
        const last = conv?.messages[0]
        return {
          id: t.id.toString(),
          name: t.name,
          subtitle: t.subjects.join(' · '),
          last_message: last ? { content: last.content, created_at: last.created_at, mine: last.sender_id === BigInt(user.id) } : null,
          unread: conv?._count.messages ?? 0,
          pending_tasks: t.assignmentIds.reduce((sum, id) => sum + (pendingByAssignment.get(id.toString()) ?? 0), 0),
          attention: null as string | null,
        }
      })
      .sort(
        (a, b) =>
          b.unread - a.unread ||
          (b.last_message?.created_at?.getTime() ?? 0) - (a.last_message?.created_at?.getTime() ?? 0) ||
          b.pending_tasks - a.pending_tasks ||
          a.name.localeCompare(b.name, 'pt-BR'),
      )
  }

  private async teacherContacts(user: AuthenticatedUser, query: string) {
    const teacher = this.requireTeacher(user)
    const assignments = await this.prisma.assignments.findMany({
      where: { teacher_id: teacher.id, classes: { is_active: true } },
      select: { id: true, class_id: true, subjects: { select: { name: true } }, classes: { select: { series: true, letter: true, education_level: true } } },
    })
    const assignmentIds = assignments.map((a) => a.id)

    const conversations = await this.prisma.conversations.findMany({
      where: { teacher_id: teacher.id },
      select: {
        student_id: true,
        students: { select: { full_name: true } },
        messages: { orderBy: { created_at: 'desc' }, take: 1, select: { content: true, created_at: true, sender_id: true } },
        _count: { select: { messages: { where: { status: PENDING_STATUS, sender_id: { not: BigInt(user.id) } } } } },
      },
    })

    // Alunos das turmas dele, com média nas disciplinas dele.
    const enrollments = await this.prisma.enrollments.findMany({
      where: { class_id: { in: [...new Set(assignments.map((a) => a.class_id))] } },
      select: {
        id: true,
        class_id: true,
        students: { select: { id: true, full_name: true, status: true } },
        grades: { where: { assignment_id: { in: assignmentIds } }, select: { average: true, final_average: true } },
      },
    })
    const classLabel = new Map(
      assignments.map((a) => [a.class_id.toString(), `${a.classes.series}º ${a.classes.education_level === 'MEDIO' ? 'EM ' : ''}${a.classes.letter}`]),
    )
    const overdue = await this.overdueByStudent(assignmentIds)

    const students = enrollments
      .filter((e) => e.students.status === 'ACTIVE')
      .map((e) => {
        const values = e.grades.map((g) => Number(g.final_average ?? g.average))
        const average = values.length ? values.reduce((s, v) => s + v, 0) / values.length : null
        const late = overdue.get(e.students.id.toString()) ?? 0
        const attention =
          average != null && average < 6
            ? `Média ${br(average)}`
            : late > 0
              ? `${late} ${late === 1 ? 'tarefa atrasada' : 'tarefas atrasadas'}`
              : null
        return { id: e.students.id, name: e.students.full_name, classLabel: classLabel.get(e.class_id.toString()) ?? '', average, attention }
      })

    const studentInfo = new Map(students.map((s) => [s.id.toString(), s]))
    const withConversation = new Set(conversations.map((c) => c.student_id.toString()))

    const open = conversations
      .map((c) => {
        const last = c.messages[0]
        const info = studentInfo.get(c.student_id.toString())
        return {
          id: c.student_id.toString(),
          name: c.students.full_name,
          subtitle: info?.classLabel ?? '',
          last_message: last ? { content: last.content, created_at: last.created_at, mine: last.sender_id === BigInt(user.id) } : null,
          unread: c._count.messages,
          pending_tasks: 0,
          attention: info?.attention ?? null,
        }
      })
      .sort((a, b) => b.unread - a.unread || (b.last_message?.created_at?.getTime() ?? 0) - (a.last_message?.created_at?.getTime() ?? 0))

    const normalized = query.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
    const candidates = students.filter((s) => !withConversation.has(s.id.toString()))
    const suggested = (normalized
      ? candidates.filter((s) => s.name.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().includes(normalized))
      : candidates.filter((s) => s.attention).sort((a, b) => (a.average ?? 10) - (b.average ?? 10))
    )
      .slice(0, normalized ? 20 : 8)
      .map((s) => ({
        id: s.id.toString(),
        name: s.name,
        subtitle: s.classLabel,
        last_message: null,
        unread: 0,
        pending_tasks: 0,
        attention: s.attention,
      }))

    return { open, suggested }
  }

  // ───────────────────────── Conversa aberta ─────────────────────────

  async thread(user: AuthenticatedUser, otherId: string) {
    const pair = await this.resolvePair(user, otherId)
    const conversation = await this.prisma.conversations.findUnique({
      where: { student_id_teacher_id: { student_id: pair.studentId, teacher_id: pair.teacherId } },
      select: { id: true },
    })

    if (conversation) {
      await this.prisma.messages.updateMany({
        where: { conversation_id: conversation.id, sender_id: { not: BigInt(user.id) }, status: PENDING_STATUS },
        data: { status: 'READ' },
      })
    }

    const messages = conversation
      ? await this.prisma.messages.findMany({
          where: { conversation_id: conversation.id },
          orderBy: { created_at: 'asc' },
          select: { id: true, content: true, created_at: true, sender_id: true, status: true },
        })
      : []

    const context = await this.pairContext(pair)
    const asStudent = user.role === 'ALUNO'

    return {
      other: {
        id: otherId,
        name: asStudent ? pair.teacherName : pair.studentName,
        subtitle: asStudent
          ? pair.assignments.map((a) => a.subject).join(' · ')
          : `${pair.assignments[0]?.classLabel ?? ''} · ${pair.assignments.map((a) => a.subject).join(', ')}`,
      },
      messages: messages.map((m) => ({
        id: m.id.toString(),
        content: m.content,
        created_at: m.created_at,
        mine: m.sender_id === BigInt(user.id),
        read: m.status === 'READ',
      })),
      context,
      suggestions: this.suggestions(pair, context, asStudent),
    }
  }

  async send(user: AuthenticatedUser, otherId: string, content: string) {
    const pair = await this.resolvePair(user, otherId)
    const now = new Date()
    const conversation = await this.prisma.conversations.upsert({
      where: { student_id_teacher_id: { student_id: pair.studentId, teacher_id: pair.teacherId } },
      update: {},
      create: { student_id: pair.studentId, teacher_id: pair.teacherId, created_at: now },
      select: { id: true },
    })
    const message = await this.prisma.messages.create({
      data: { conversation_id: conversation.id, sender_id: BigInt(user.id), content: content.trim(), status: PENDING_STATUS, created_at: now },
      select: { id: true, content: true, created_at: true },
    })
    return { id: message.id.toString(), content: message.content, created_at: message.created_at, mine: true, read: false }
  }

  /** Rascunho escrito pela IA a partir do contexto real do par. Sem IA, cai na melhor sugestão local. */
  async draft(user: AuthenticatedUser, otherId: string) {
    const pair = await this.resolvePair(user, otherId)
    const context = await this.pairContext(pair)
    const asStudent = user.role === 'ALUNO'
    const fallback = this.suggestions(pair, context, asStudent)[0]?.text ?? ''

    const facts = [
      ...context.subjects.map(
        (s) =>
          `${s.subject}: média ${s.average != null ? br(s.average) : 'sem nota'}, frequência ${s.attendance_rate != null ? `${Math.round(s.attendance_rate)}%` : 'sem aulas'}`,
      ),
      ...context.pending.map((t) => `Tarefa pendente: "${t.title}" (${t.subject}), prazo ${day(t.deadline)}`),
      ...context.overdue.map((t) => `Tarefa atrasada, não entregue: "${t.title}" (${t.subject}), prazo era ${day(t.deadline)}`),
    ].join('\n')

    const author = asStudent
      ? `o(a) aluno(a) ${pair.studentName} escrevendo para o(a) professor(a) ${pair.teacherName}`
      : `o(a) professor(a) ${pair.teacherName} escrevendo para o(a) aluno(a) ${pair.studentName}`

    try {
      const text = await this.ai.writeShortMessage(
        `Você escreve mensagens curtas de chat escolar em português do Brasil. Quem escreve é ${author}. ` +
          'Use no máximo 3 frases, tom respeitoso e natural (nada de "Prezado" nem "bom dia"/"boa tarde"). Use só os fatos fornecidos; ' +
          'não invente notas, datas nem tarefas. Responda apenas com o texto da mensagem.',
        `Situação atual entre os dois:\n${facts || 'Sem pendências registradas.'}\n\nEscreva a mensagem mais útil para este momento.`,
      )
      return { text: text.trim().replace(/^"|"$/g, ''), source: 'ai' as const }
    } catch {
      return { text: fallback, source: 'local' as const }
    }
  }

  // ───────────────────────── Inteligência local ─────────────────────────

  /** Sugestões calculadas a partir dos dados do par: sempre funcionam, mesmo sem internet. */
  private suggestions(pair: Pair, ctx: PairContext, asStudent: boolean) {
    const list: Array<{ label: string; text: string }> = []
    const teacher = firstName(pair.teacherName)
    const student = firstName(pair.studentName)
    const low = ctx.subjects.find((s) => s.average != null && s.average < 6)
    const absent = ctx.subjects.find((s) => s.attendance_rate != null && s.attendance_rate < 85)
    const strong = ctx.subjects.find((s) => s.average != null && s.average >= 8.5)
    const next = ctx.pending[0]
    const late = ctx.overdue[0]

    if (asStudent) {
      if (late) list.push({ label: `Entrega atrasada: ${late.title}`, text: `Professor(a) ${teacher}, não consegui entregar "${late.title}" no prazo (${day(late.deadline)}). Ainda consigo enviar?` })
      if (next) list.push({ label: `Dúvida na ${next.title}`, text: `Professor(a) ${teacher}, estou com uma dúvida na tarefa "${next.title}", que vence em ${day(next.deadline)}. Pode me ajudar?` })
      if (low) list.push({ label: `Recuperar ${low.subject}`, text: `Professor(a) ${teacher}, minha média em ${low.subject} está ${br(low.average as number)}. O que posso fazer para recuperar?` })
      if (absent) list.push({ label: 'Ver o que perdi nas faltas', text: `Professor(a) ${teacher}, faltei em algumas aulas de ${absent.subject}. O que foi passado que eu preciso ver?` })
      if (list.length < 3) list.push({ label: 'Pedir material extra', text: `Professor(a) ${teacher}, pode me indicar algum material extra de ${pair.assignments[0]?.subject ?? 'sua disciplina'} para estudar?` })
    } else {
      if (late) list.push({ label: `Cobrar ${late.title}`, text: `Oi, ${student}! Não recebi sua entrega de "${late.title}" (prazo ${day(late.deadline)}). Aconteceu alguma coisa? Me avisa que a gente vê um jeito.` })
      if (low) list.push({ label: `Média ${br(low.average as number)} em ${low.subject}`, text: `Oi, ${student}. Vi que sua média em ${low.subject} está ${br(low.average as number)}. Vamos conversar sobre um plano para melhorar? Posso te passar exercícios extras.` })
      if (next) list.push({ label: `Lembrar da ${next.title}`, text: `${student}, lembrete: "${next.title}" vence em ${day(next.deadline)}. Qualquer dúvida, me chama aqui.` })
      if (absent) list.push({ label: `Faltas em ${absent.subject}`, text: `Oi, ${student}. Percebi algumas faltas nas aulas de ${absent.subject}. Está tudo bem? Se precisar, te passo o conteúdo.` })
      if (strong && list.length < 3) list.push({ label: 'Elogiar o desempenho', text: `Parabéns pelo desempenho em ${strong.subject}, ${student}! Continue assim.` })
    }
    return list.slice(0, 3)
  }

  private async pairContext(pair: Pair): Promise<PairContext> {
    const now = new Date()
    const subjects: SubjectContext[] = []

    for (const assignment of pair.assignments) {
      const [grades, attendance] = await Promise.all([
        this.prisma.grades.findMany({
          where: { assignment_id: assignment.id, enrollments: { student_id: pair.studentId } },
          select: { average: true, final_average: true },
        }),
        this.prisma.attendances.groupBy({
          by: ['status'],
          where: { student_id: pair.studentId, lessons: { assignment_id: assignment.id } },
          _count: { _all: true },
        }),
      ])
      const values = grades.map((g) => Number(g.final_average ?? g.average))
      const lessons = attendance.reduce((sum, row) => sum + row._count._all, 0)
      const present = attendance.find((row) => row.status === 'PRESENT')?._count._all ?? 0
      subjects.push({
        subject: assignment.subject,
        average: values.length ? values.reduce((s, v) => s + v, 0) / values.length : null,
        attendance_rate: lessons ? (present / lessons) * 100 : null,
        lessons,
      })
    }

    const tasks = await this.prisma.tasks.findMany({
      where: {
        assignment_id: { in: pair.assignments.map((a) => a.id) },
        task_targets: { some: { student_id: pair.studentId } },
      },
      orderBy: { deadline: 'asc' },
      select: {
        id: true,
        title: true,
        deadline: true,
        assignment_id: true,
        task_submissions: { where: { student_id: pair.studentId }, select: { id: true } },
      },
    })
    const subjectOf = new Map(pair.assignments.map((a) => [a.id.toString(), a.subject]))
    const toCtx = (t: (typeof tasks)[number]): TaskContext => ({
      id: t.id.toString(),
      title: t.title,
      subject: subjectOf.get(t.assignment_id.toString()) ?? '',
      deadline: t.deadline,
    })

    return {
      subjects,
      pending: tasks.filter((t) => !t.task_submissions.length && t.deadline >= now).map(toCtx),
      overdue: tasks.filter((t) => !t.task_submissions.length && t.deadline < now).map(toCtx),
      delivered: tasks.filter((t) => t.task_submissions.length).length,
    }
  }

  // ───────────────────────── Apoio ─────────────────────────

  /** Garante que o professor realmente dá aula pro aluno — senão ninguém conversa com ninguém. */
  private async resolvePair(user: AuthenticatedUser, otherId: string): Promise<Pair> {
    if (!/^\d+$/.test(otherId)) throw new NotFoundException('Contato não encontrado.')
    const other = BigInt(otherId)

    let studentId: bigint
    let teacherId: bigint
    if (user.role === 'ALUNO') {
      studentId = this.requireStudent(user).id
      teacherId = other
    } else {
      teacherId = this.requireTeacher(user).id
      studentId = other
    }

    const [student, teacher, classIds] = await Promise.all([
      this.prisma.students.findUnique({ where: { id: studentId }, select: { user_id: true, full_name: true } }),
      this.prisma.teachers.findUnique({ where: { id: teacherId }, select: { user_id: true, full_name: true } }),
      this.activeClassIds(studentId),
    ])
    if (!student || !teacher) throw new NotFoundException('Contato não encontrado.')

    const assignments = await this.prisma.assignments.findMany({
      where: { teacher_id: teacherId, class_id: { in: classIds } },
      select: { id: true, subjects: { select: { name: true } }, classes: { select: { series: true, letter: true, education_level: true } } },
    })
    if (assignments.length === 0) {
      throw new ForbiddenException('Este professor não dá aula para este aluno.')
    }

    return {
      studentId,
      teacherId,
      studentUserId: student.user_id,
      teacherUserId: teacher.user_id,
      studentName: student.full_name,
      teacherName: teacher.full_name,
      assignments: assignments.map((a) => ({
        id: a.id,
        subject: a.subjects.name,
        classLabel: `${a.classes.series}º ${a.classes.education_level === 'MEDIO' ? 'Ano EM' : 'Ano'} ${a.classes.letter}`,
      })),
    }
  }

  private async activeClassIds(studentId: bigint) {
    const enrollments = await this.prisma.enrollments.findMany({
      where: { student_id: studentId, classes: { is_active: true } },
      select: { class_id: true },
    })
    return enrollments.map((e) => e.class_id)
  }

  private async pendingTaskCounts(studentId: bigint, assignmentIds: bigint[]) {
    const tasks = await this.prisma.tasks.findMany({
      where: { assignment_id: { in: assignmentIds }, deadline: { gte: new Date() }, task_targets: { some: { student_id: studentId } } },
      select: { assignment_id: true, task_submissions: { where: { student_id: studentId }, select: { id: true } } },
    })
    const counts = new Map<string, number>()
    for (const t of tasks) {
      if (t.task_submissions.length) continue
      const key = t.assignment_id.toString()
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
    return counts
  }

  /** Alunos com tarefa vencida e não entregue nas disciplinas do professor. */
  private async overdueByStudent(assignmentIds: bigint[]) {
    const tasks = await this.prisma.tasks.findMany({
      where: { assignment_id: { in: assignmentIds }, deadline: { lt: new Date() } },
      select: { task_targets: { select: { student_id: true } }, task_submissions: { select: { student_id: true } } },
    })
    const counts = new Map<string, number>()
    for (const t of tasks) {
      const delivered = new Set(t.task_submissions.map((s) => s.student_id.toString()))
      for (const target of t.task_targets) {
        const key = target.student_id.toString()
        if (!delivered.has(key)) counts.set(key, (counts.get(key) ?? 0) + 1)
      }
    }
    return counts
  }

  private requireStudent(user: AuthenticatedUser) {
    if (!user.student) throw new ForbiddenException('Perfil de aluno não encontrado.')
    return user.student
  }

  private requireTeacher(user: AuthenticatedUser) {
    if (!user.teacher) throw new ForbiddenException('Perfil de professor não encontrado.')
    return user.teacher
  }
}
