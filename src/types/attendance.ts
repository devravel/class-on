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
}
