'use client'

import { useEffect, useState } from 'react'
import { GraduationCap, Loader2 } from 'lucide-react'

import { Checkbox } from '@/components/ui/checkbox'
import { assignmentsApi, teachersApi } from '@/lib/api'
import { Assignment } from '@/types/assignment'
import { Teacher } from '@/types/teacher'

interface ClassWizardTeachersSectionProps {
  selectedTeacherIds: string[]
  onSelectedTeacherIdsChange: (ids: string[]) => void
}

export function ClassWizardTeachersSection({
  selectedTeacherIds,
  onSelectedTeacherIdsChange,
}: ClassWizardTeachersSectionProps) {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [assignmentsByTeacher, setAssignmentsByTeacher] = useState<
    Record<string, Assignment[]>
  >({})
  const [loadingTeachers, setLoadingTeachers] = useState(true)
  const [loadingAssignments, setLoadingAssignments] = useState<
    Record<string, boolean>
  >({})

  useEffect(() => {
    teachersApi
      .list()
      .then((data) => setTeachers(data.filter((teacher) => teacher.users.is_active)))
      .catch(console.error)
      .finally(() => setLoadingTeachers(false))
  }, [])

  useEffect(() => {
    for (const teacherId of selectedTeacherIds) {
      if (assignmentsByTeacher[teacherId] || loadingAssignments[teacherId]) {
        continue
      }

      setLoadingAssignments((current) => ({ ...current, [teacherId]: true }))

      assignmentsApi
        .getByTeacher(teacherId)
        .then((assignments) => {
          setAssignmentsByTeacher((current) => ({
            ...current,
            [teacherId]: assignments,
          }))
        })
        .catch(console.error)
        .finally(() => {
          setLoadingAssignments((current) => ({ ...current, [teacherId]: false }))
        })
    }
  }, [assignmentsByTeacher, loadingAssignments, selectedTeacherIds])

  const toggleTeacher = (teacherId: string, checked: boolean) => {
    if (checked) {
      onSelectedTeacherIdsChange([...selectedTeacherIds, teacherId])
      return
    }

    onSelectedTeacherIdsChange(
      selectedTeacherIds.filter((id) => id !== teacherId),
    )
  }

  const getUniqueSubjects = (assignments: Assignment[]) => {
    const subjects = new Map<string, string>()
    for (const assignment of assignments) {
      subjects.set(assignment.subjects.id, assignment.subjects.name)
    }
    return [...subjects.entries()].map(([id, name]) => ({ id, name }))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <GraduationCap size={18} className="text-text-secondary" />
        <h3 className="text-base font-semibold text-text-primary">Professores</h3>
      </div>

      <p className="text-sm text-text-secondary">
        Selecione os professores da turma. As disciplinas serão identificadas
        automaticamente com base nas atribuições existentes de cada professor.
      </p>

      {loadingTeachers ? (
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <Loader2 size={16} className="animate-spin" />
          Carregando professores...
        </div>
      ) : teachers.length === 0 ? (
        <p className="text-sm text-text-secondary">
          Nenhum professor ativo cadastrado.
        </p>
      ) : (
        <ul className="divide-y divide-border rounded-component border border-border">
          {teachers.map((teacher) => {
            const isSelected = selectedTeacherIds.includes(teacher.id)
            const assignments = assignmentsByTeacher[teacher.id] ?? []
            const subjects = getUniqueSubjects(assignments)
            const isLoadingSubjects = loadingAssignments[teacher.id]

            return (
              <li key={teacher.id} className="px-4 py-3">
                <label className="flex cursor-pointer items-start gap-3">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) =>
                      toggleTeacher(teacher.id, checked === true)
                    }
                    className="mt-0.5"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-text-primary">
                      {teacher.full_name}
                    </p>
                    <p className="text-sm text-text-secondary">
                      {teacher.registration_code}
                    </p>

                    {isSelected && (
                      <div className="mt-2 text-sm text-text-secondary">
                        {isLoadingSubjects ? (
                          <span className="inline-flex items-center gap-1">
                            <Loader2 size={14} className="animate-spin" />
                            Carregando disciplinas...
                          </span>
                        ) : subjects.length > 0 ? (
                          <span>
                            Disciplinas:{' '}
                            {subjects.map((subject) => subject.name).join(', ')}
                          </span>
                        ) : (
                          <span className="text-amber-700">
                            Este professor ainda não possui disciplinas em outras
                            turmas. Nenhuma atribuição será criada.
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </label>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
