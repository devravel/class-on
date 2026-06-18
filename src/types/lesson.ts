export interface LessonStudent {
  id: string
  full_name: string
  rm: string
  attendance: {
    id: string
    status: 'PRESENT' | 'ABSENT'
    created_at: string
  } | null
}

export interface Lesson {
  id: string
  assignment_id: string
  date: string
  lesson_order: number
  content: string
  created_at: string
  students?: LessonStudent[]
}

export interface CreateLessonRequest {
  assignment_id: string
  date: string
  lesson_order: number
  content: string
}
