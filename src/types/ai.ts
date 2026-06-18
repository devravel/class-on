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
