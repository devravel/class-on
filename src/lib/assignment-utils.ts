import { Assignment, AssignmentClass } from '@/types/assignment'
import {
  EDUCATION_LEVEL_LABELS,
  formatSeriesLabel,
  SHIFT_LABELS,
  Shift,
} from '@/types/class'

export function getPrimarySubjectName(assignments: Assignment[]): string {
  if (assignments.length === 0) {
    return 'Sem disciplina atribuída'
  }

  const counts = new Map<string, { name: string; count: number }>()

  for (const assignment of assignments) {
    const subjectId = assignment.subjects.id
    const existing = counts.get(subjectId)
    if (existing) {
      existing.count += 1
    } else {
      counts.set(subjectId, {
        name: assignment.subjects.name,
        count: 1,
      })
    }
  }

  const sorted = [...counts.values()].sort((a, b) => {
    if (b.count !== a.count) {
      return b.count - a.count
    }
    return a.name.localeCompare(b.name, 'pt-BR')
  })

  return sorted[0]?.name ?? 'Sem disciplina atribuída'
}

export interface TeacherClassEntry {
  classId: string
  classInfo: AssignmentClass
  subjects: string[]
}

export function getUniqueClassesFromAssignments(
  assignments: Assignment[],
): TeacherClassEntry[] {
  const classMap = new Map<string, TeacherClassEntry>()

  for (const assignment of assignments) {
    const classId = assignment.class_id
    const existing = classMap.get(classId)

    if (existing) {
      if (!existing.subjects.includes(assignment.subjects.name)) {
        existing.subjects.push(assignment.subjects.name)
      }
    } else {
      classMap.set(classId, {
        classId,
        classInfo: assignment.classes,
        subjects: [assignment.subjects.name],
      })
    }
  }

  return [...classMap.values()].sort((a, b) => {
    const yearA = a.classInfo.academic_years.year
    const yearB = b.classInfo.academic_years.year
    if (yearA !== yearB) {
      return yearB - yearA
    }
    if (a.classInfo.series !== b.classInfo.series) {
      return a.classInfo.series - b.classInfo.series
    }
    return a.classInfo.letter.localeCompare(b.classInfo.letter, 'pt-BR')
  })
}

export function formatClassEducationDetails(classInfo: AssignmentClass): string {
  const series = formatSeriesLabel(
    classInfo.series,
    classInfo.education_level,
  )
  const shift = SHIFT_LABELS[classInfo.shift as Shift] ?? classInfo.shift
  const level = EDUCATION_LEVEL_LABELS[classInfo.education_level]

  return `${series} · ${classInfo.letter} · ${shift} · ${level}`
}

export function groupAssignmentsByTeacher(
  assignments: Assignment[],
): Map<string, Assignment[]> {
  const map = new Map<string, Assignment[]>()

  for (const assignment of assignments) {
    const teacherId = assignment.teacher_id
    const existing = map.get(teacherId) ?? []
    existing.push(assignment)
    map.set(teacherId, existing)
  }

  return map
}
