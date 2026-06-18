export interface StudentUser {
  id: string
  email: string
  role: string
  is_active: boolean
  created_at: string
}

export interface AcademicYear {
  id: string
  year: number
  status: string
  created_at: string
  updated_at: string
}

export interface Class {
  id: string
  year_id: string
  education_level: 'FUNDAMENTAL' | 'MEDIO'
  series: number
  letter: string
  shift: string
  academic_years: AcademicYear
}

export interface Enrollment {
  id: string
  student_id: string
  class_id: string
  final_result: string
  created_at: string
  classes: Class
}

export interface Student {
  id: string
  user_id: string
  full_name: string
  rm: string
  status: string
  users: StudentUser
  enrollments?: Enrollment[]
}

export interface CreateStudentResponse {
  student: Student
  provisional_password: string
}

export interface CreateStudentRequest {
  full_name: string
  email: string
  rm: string
}

export interface UpdateStudentRequest {
  full_name?: string
  email?: string
  rm?: string
  status?: string
  is_active?: boolean
}

export interface BulkStudentItem {
  full_name: string
  email: string
  rm: string
}

export interface CreateBulkStudentsRequest {
  students: BulkStudentItem[]
}

export interface BulkStudentResult {
  student: Student
  provisional_password: string
}

export interface CreateBulkStudentsResponse {
  created: BulkStudentResult[]
}

export interface EnrollStudentRequest {
  class_id: number
}
