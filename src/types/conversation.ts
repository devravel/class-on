export interface ConversationContact {
  id: string
  name: string
  subtitle: string
  last_message: { content: string; created_at: string; mine: boolean } | null
  unread: number
  pending_tasks: number
  /** Motivo pelo qual o aluno pede atenção (visão do professor), ex.: "Média 4,8". */
  attention: string | null
}

/** Professor recebe as conversas abertas e os alunos que pedem atenção (ou o resultado da busca). */
export interface TeacherContacts {
  open: ConversationContact[]
  suggested: ConversationContact[]
}

export interface ConversationMessage {
  id: string
  content: string
  created_at: string
  mine: boolean
  read: boolean
}

export interface ConversationTask {
  id: string
  title: string
  subject: string
  deadline: string
}

export interface ConversationThread {
  other: { id: string; name: string; subtitle: string }
  messages: ConversationMessage[]
  context: {
    subjects: Array<{ subject: string; average: number | null; attendance_rate: number | null; lessons: number }>
    pending: ConversationTask[]
    overdue: ConversationTask[]
    delivered: number
  }
  suggestions: Array<{ label: string; text: string }>
}
