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

export function getClassLabelLoose(classInfo: {
  series: number | string
  letter: string
  shift: string
  education_level?: string | null
}): string {
  return getClassLabel({
    series: Number(classInfo.series),
    letter: classInfo.letter,
    shift: classInfo.shift,
    education_level: normalizeEducationLevel(classInfo.education_level),
  })
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

function parseDecimalJsShape(value: { s: number; e: number; d: number[] }): number {
  let coefficient = value.d[0] ?? 0
  for (let index = 1; index < value.d.length; index += 1) {
    coefficient = coefficient * 1e7 + value.d[index]
  }

  const digitCount = String(value.d[0] ?? 0).length + (value.d.length - 1) * 7
  const parsed = value.s * coefficient * 10 ** (value.e - digitCount + 1)
  return Number.isNaN(parsed) ? 0 : parsed
}

export function parseGradeValue(
  value: string | number | { s: number; e: number; d: number[] } | null | undefined,
): number {
  if (value === null || value === undefined || value === '') return 0
  if (typeof value === 'number') return Number.isNaN(value) ? 0 : value
  if (typeof value === 'string') {
    const num = parseFloat(value)
    return Number.isNaN(num) ? 0 : num
  }
  if (typeof value === 'object' && Array.isArray(value.d)) {
    return parseDecimalJsShape(value)
  }
  const num = Number(value)
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
