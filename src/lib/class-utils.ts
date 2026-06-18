import { AssignmentClass } from '@/types/assignment'
import {
  EducationLevel,
  formatClassShortLabel,
  formatSeriesLabel,
  SHIFT_LABELS,
  Shift,
} from '@/types/class'
import { GradeDisplayStatus } from '@/types/grade'

type ClassLabelInfo = Pick<
  AssignmentClass,
  'series' | 'letter' | 'shift' | 'education_level'
>

export function getClassLabel(classInfo: ClassLabelInfo): string {
  const educationLevel = normalizeEducationLevel(classInfo.education_level)
  const seriesLabel = formatSeriesLabel(classInfo.series, educationLevel)
  const shiftLabel = SHIFT_LABELS[classInfo.shift as Shift] ?? classInfo.shift
  return `${seriesLabel} ${classInfo.letter} — ${shiftLabel}`
}

export function getClassShortLabel(classInfo: Pick<ClassLabelInfo, 'series' | 'letter' | 'education_level'>): string {
  return formatClassShortLabel({
    ...classInfo,
    education_level: normalizeEducationLevel(classInfo.education_level),
  })
}

export function normalizeEducationLevel(
  value: string | undefined | null,
): EducationLevel {
  return value === 'MEDIO' ? 'MEDIO' : 'FUNDAMENTAL'
}

export function calculateAverage(n1: number, n2: number, n3: number, n4: number): number {
  const avg = (n1 + n2 + n3 + n4) / 4
  return Math.round(avg * 100) / 100
}

export function parseGradeValue(value: string | number | null | undefined): number {
  if (value === null || value === undefined || value === '') return 0
  const num = typeof value === 'string' ? parseFloat(value) : value
  return Number.isNaN(num) ? 0 : num
}

export function formatDateForInput(date: Date = new Date()): string {
  return date.toISOString().split('T')[0]
}

export function getGradeDisplayStatus(
  average: number,
  recoveryGrade: number | null,
  finalAverage: number | null,
): GradeDisplayStatus {
  const effectiveAverage = finalAverage ?? average

  if (effectiveAverage >= 6) {
    return 'APROVADO'
  }

  if (average < 6 && recoveryGrade === null) {
    return 'EM_RECUPERACAO'
  }

  return 'REPROVADO'
}

export function formatGradeCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return '—'
  const num = parseGradeValue(value)
  return num.toFixed(1)
}
