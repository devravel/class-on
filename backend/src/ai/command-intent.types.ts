export type CommandIntentStatus = 'recognized' | 'unknown'

export type ProfessorCommandAction = 'chamada' | 'notas' | 'tarefa'
export type SecretariaCommandAction = 'dashboard' | 'alunos' | 'comunicados'
export type AlunoCommandAction = 'boletim' | 'frequencia' | 'tarefas'

export interface CommandIntentResult {
  status: CommandIntentStatus
  action: string | null
  detectedClass: string | null
  route: string | null
}
