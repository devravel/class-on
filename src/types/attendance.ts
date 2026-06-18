export type AttendanceStatus = 'PRESENT' | 'ABSENT'

export interface MarkAttendanceItem {
  student_id: string
  status: AttendanceStatus
}

export interface MarkAttendanceRequest {
  attendances: MarkAttendanceItem[]
}

export interface MarkAttendanceResponse {
  lesson_id: string
  total_marked: number
  attendances: Array<{
    id: string
    student_id: string
    lesson_id: string
    status: AttendanceStatus
    students: {
      id: string
      full_name: string
      rm: string
    }
  }>
}

export interface StudentAttendanceSummary {
  student: {
    id: string
    full_name: string
    rm: string
  }
  total_lessons: number
  present: number
  absent: number
  attendance_rate: number
  general_attendance_rate?: number
  discipline_attendance?: DisciplineAttendanceEntry[]
}

export interface DisciplineAttendanceEntry {
  assignment_id: string
  subject_name: string
  teacher_name: string
  total_lessons: number
  present: number
  absent: number
  attendance_rate: number
}

export interface ClassStudentAttendanceSummary {
  student: {
    id: string
    full_name: string
    rm: string
  }
  general_attendance_rate: number
  discipline_attendance: DisciplineAttendanceEntry[]
}
