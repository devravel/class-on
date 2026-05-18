export interface ClassAcademicYear {
  id: string
  year: number
  status: string
}

export interface Class {
  id: string
  year_id: string
  series: number
  letter: string
  shift: string
  academic_years: ClassAcademicYear
}

export type Shift = 'MORNING' | 'AFTERNOON' | 'NIGHT'

export const SHIFT_LABELS: Record<Shift, string> = {
  MORNING: 'Manhã',
  AFTERNOON: 'Tarde',
  NIGHT: 'Noite',
}

export const SERIES_LABELS: Record<number, string> = {
  1: '1º Ano',
  2: '2º Ano',
  3: '3º Ano',
}

export const LETTER_OPTIONS = ['A', 'B', 'C', 'D', 'E'] as const
export type Letter = (typeof LETTER_OPTIONS)[number]

export const SHIFT_OPTIONS: Shift[] = ['MORNING', 'AFTERNOON', 'NIGHT']
export const SERIES_OPTIONS = [1, 2, 3] as const

export interface CreateClassRequest {
  year_id: number
  series: number
  letter: string
  shift: string
}

export interface UpdateClassRequest {
  year_id?: number
  series?: number
  letter?: string
  shift?: string
}
