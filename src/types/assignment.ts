export interface AssignmentTeacherUser {
  email: string
  is_active: boolean
}

export interface AssignmentTeacher {
  id: string
  full_name: string
  registration_code: string
  users: AssignmentTeacherUser
}

export interface AssignmentSubject {
  id: string
  name: string
  description: string
}

export interface AssignmentAcademicYear {
  id: string
  year: number
  status: string
}

export interface AssignmentClass {
  id: string
  year_id: string
  series: number
  letter: string
  shift: string
  academic_years: AssignmentAcademicYear
}

export interface Assignment {
  id: string
  teacher_id: string
  class_id: string
  subject_id: string
  created_at: string
  teachers: AssignmentTeacher
  subjects: AssignmentSubject
  classes: AssignmentClass
}

export interface CreateAssignmentRequest {
  teacher_id: string
  class_id: string
  subject_id: string
}
