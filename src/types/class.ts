export interface ClassAcademicYear {
  id: string
  year: number
  status: string
}

export type EducationLevel = 'FUNDAMENTAL' | 'MEDIO'

export interface Class {
  id: string
  year_id: string
  education_level: EducationLevel
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

export const EDUCATION_LEVEL_LABELS: Record<EducationLevel, string> = {
  FUNDAMENTAL: 'Ensino Fundamental',
  MEDIO: 'Ensino Médio',
}

export const EDUCATION_LEVEL_OPTIONS: EducationLevel[] = ['FUNDAMENTAL', 'MEDIO']

export const FUNDAMENTAL_SERIES = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const
export const MEDIO_SERIES = [1, 2, 3] as const

export function getSeriesOptionsForLevel(educationLevel: EducationLevel): number[] {
  return educationLevel === 'MEDIO' ? [...MEDIO_SERIES] : [...FUNDAMENTAL_SERIES]
}

export function isValidSeriesForLevel(
  series: number,
  educationLevel: EducationLevel,
): boolean {
  return getSeriesOptionsForLevel(educationLevel).includes(series)
}

export function formatSeriesLabel(
  series: number,
  educationLevel: EducationLevel = 'FUNDAMENTAL',
): string {
  if (educationLevel === 'MEDIO') {
    return `${series}º Ano EM`
  }
  return `${series}º Ano`
}

export function formatClassShortLabel(
  classInfo: Pick<Class, 'series' | 'letter'> & { education_level?: EducationLevel },
): string {
  const level = classInfo.education_level ?? 'FUNDAMENTAL'
  return `${formatSeriesLabel(classInfo.series, level)} ${classInfo.letter}`
}

export const LETTER_OPTIONS = ['A', 'B', 'C', 'D', 'E'] as const
export type Letter = (typeof LETTER_OPTIONS)[number]

export const SHIFT_OPTIONS: Shift[] = ['MORNING', 'AFTERNOON', 'NIGHT']

export interface CreateClassRequest {
  year_id: number
  education_level: EducationLevel
  series: number
  letter: string
  shift: string
}

export interface UpdateClassRequest {
  year_id?: number
  education_level?: EducationLevel
  series?: number
  letter?: string
  shift?: string
}
