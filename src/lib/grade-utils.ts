import {
  getGradeDisplayStatus,
  parseGradeValue,
} from '@/lib/class-utils'
import { GradeDisplayStatus, StudentGradeRecord } from '@/types/grade'

export interface SubjectGrades {
  assignmentId: string
  subjectName: string
  teacherName: string
  bimesters: Map<number, StudentGradeRecord>
}

export function groupGradesBySubject(
  grades: StudentGradeRecord[],
  assignmentIds?: string[],
): SubjectGrades[] {
  const allowedIds = assignmentIds ? new Set(assignmentIds) : null
  const subjectMap = new Map<string, SubjectGrades>()

  for (const grade of grades) {
    const assignmentId = grade.assignment_id
    if (allowedIds && !allowedIds.has(assignmentId)) {
      continue
    }

    const subjectName = grade.assignments.subjects.name
    const teacherName = grade.assignments.teachers?.full_name ?? '—'
    const existing = subjectMap.get(subjectName)

    if (existing) {
      existing.bimesters.set(grade.bimesters.number, grade)
    } else {
      subjectMap.set(subjectName, {
        assignmentId,
        subjectName,
        teacherName,
        bimesters: new Map([[grade.bimesters.number, grade]]),
      })
    }
  }

  return Array.from(subjectMap.values()).sort((a, b) =>
    a.subjectName.localeCompare(b.subjectName, 'pt-BR'),
  )
}

export function getLatestGradeForSubject(subject: SubjectGrades): StudentGradeRecord | null {
  const bimesterNumbers = Array.from(subject.bimesters.keys())
  if (bimesterNumbers.length === 0) {
    return null
  }

  const latestNumber = Math.max(...bimesterNumbers)
  return subject.bimesters.get(latestNumber) ?? null
}

export function getSubjectOverallStatus(subject: SubjectGrades): GradeDisplayStatus {
  const latestGrade = getLatestGradeForSubject(subject)
  if (!latestGrade) {
    return 'EM_RECUPERACAO'
  }

  const average = parseGradeValue(latestGrade.average)
  const recovery =
    latestGrade.recovery_grade != null
      ? parseGradeValue(latestGrade.recovery_grade)
      : null
  const finalAverage =
    latestGrade.final_average != null
      ? parseGradeValue(latestGrade.final_average)
      : null

  return getGradeDisplayStatus(average, recovery, finalAverage)
}

export function getSubjectOverallAverage(subject: SubjectGrades): number | null {
  const latestGrade = getLatestGradeForSubject(subject)
  if (!latestGrade) {
    return null
  }

  const average = parseGradeValue(latestGrade.average)
  const finalAverage =
    latestGrade.final_average != null
      ? parseGradeValue(latestGrade.final_average)
      : null

  return finalAverage ?? average
}

export const GRADE_STATUS_LABELS: Record<GradeDisplayStatus, string> = {
  APROVADO: 'Aprovado',
  EM_RECUPERACAO: 'Em Recuperação',
  REPROVADO: 'Reprovado',
}

export const GRADE_STATUS_STYLES: Record<GradeDisplayStatus, string> = {
  APROVADO: 'bg-success/10 text-success',
  EM_RECUPERACAO: 'bg-warning/10 text-warning',
  REPROVADO: 'bg-danger/10 text-danger',
}
