export interface AiGeneratedContent {
  content: string
}

export interface GenerateLessonPlanPayload {
  subject: string
  class_name: string
  topic?: string
}

export interface GenerateParentReportPayload {
  student_name: string
  grade_average?: number
  attendance_rate?: number
  risk_score?: number
}

export interface CommandIntentPayload {
  input: string
  role: 'SECRETARIA' | 'PROFESSOR' | 'ALUNO'
  availableClasses?: string[]
}

export interface GenerateTaskPayload {
  title: string
  schoolYear: string
  searchWeb: boolean
  links: string[]
  refinePrompt?: string
  historyText?: string
  file?: File | null
}

export interface AiTaskSource {
  label: string
  url: string
}

export interface GenerateTaskResponse {
  content: string
  usedWebSearch: boolean
  usedPdf: boolean
  sources: AiTaskSource[]
  fallbackUsed: boolean
}
