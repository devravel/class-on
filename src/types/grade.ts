export type GradeStatus = 'APROVADO' | 'REPROVADO'
export type GradeDisplayStatus = 'APROVADO' | 'EM_RECUPERACAO' | 'REPROVADO'

export interface GradeStudent {
  id: string
  full_name: string
  rm: string
}

export interface GradeEnrollment {
  id: string
  student: GradeStudent
}

export interface GradeRecord {
  id: string
  enrollment_id: string
  assignment_id: string
  bimester_id: string
  n1: string | number
  n2: string | number
  n3: string | number
  n4: string | number
  average: string | number
  recovery_grade: string | number | null
  final_average: string | number | null
  status: GradeStatus
  created_at: string
}

export interface GradeRow {
  enrollment: GradeEnrollment
  grade: GradeRecord | null
}

export interface CreateGradeRequest {
  enrollment_id: number
  assignment_id: number
  bimester_id: number
  n1: number
  n2: number
  n3: number
  n4: number
}

export interface AddRecoveryRequest {
  recovery_grade: number
}

export interface StudentGradeSubject {
  id: string
  name: string
}

export interface StudentGradeBimester {
  id: string
  number: number
  status: string
}

export interface StudentGradeRecord extends GradeRecord {
  assignments: {
    subjects: StudentGradeSubject
  }
  bimesters: StudentGradeBimester
}
