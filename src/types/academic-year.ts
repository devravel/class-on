export interface AcademicYear {
  id: string
  year: number
  status: 'ACTIVE' | 'CLOSED'
  created_at: string
  updated_at: string
}

export interface CreateAcademicYearRequest {
  year: number
  status?: 'ACTIVE' | 'CLOSED'
}

export interface UpdateAcademicYearRequest {
  year?: number
  status?: 'ACTIVE' | 'CLOSED'
}

export type AcademicYearStatus = 'ACTIVE' | 'CLOSED'

export const ACADEMIC_YEAR_STATUS_LABELS: Record<AcademicYearStatus, string> = {
  ACTIVE: 'Ativo',
  CLOSED: 'Fechado',
}

export const ACADEMIC_YEAR_STATUS_COLORS: Record<AcademicYearStatus, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  CLOSED: 'bg-gray-100 text-gray-800',
}