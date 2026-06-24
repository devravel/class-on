'use client'

import { GraduationCap, Loader2, UserCheck } from 'lucide-react'

import { GradeStatusBadge } from '@/components/grades/GradeStatusBadge'
import { formatGradeCell, parseGradeValue } from '@/lib/class-utils'
import {
  getLatestGradeForSubject,
  getSubjectOverallAverage,
  getSubjectOverallStatus,
  groupGradesBySubject,
} from '@/lib/grade-utils'
import { getSubjectIcon } from '@/lib/subject-icons'
import { cn } from '@/lib/utils'
import { DisciplineAttendanceEntry } from '@/types/attendance'
import { StudentGradeRecord } from '@/types/grade'

interface StudentPerformanceViewProps {
  studentName: string
  studentRm: string
  studentEmail: string
  generalAttendanceRate: number
  disciplineAttendance: DisciplineAttendanceEntry[]
  grades: StudentGradeRecord[]
  assignmentIds: string[]
  isLoading?: boolean
}

export function StudentPerformanceView({
  studentName,
  studentRm,
  studentEmail,
  generalAttendanceRate,
  disciplineAttendance,
  grades,
  assignmentIds,
  isLoading = false,
}: StudentPerformanceViewProps) {
  const subjects = groupGradesBySubject(grades, assignmentIds)
  const isAttendanceHealthy = generalAttendanceRate >= 75

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const disciplineEntries =
    disciplineAttendance.length > 0
      ? disciplineAttendance
      : subjects.map((subject) => ({
          assignment_id: subject.assignmentId,
          subject_name: subject.subjectName,
          teacher_name: subject.teacherName,
          total_lessons: 0,
          present: 0,
          absent: 0,
          attendance_rate: 0,
        }))

  return (
    <div className="space-y-8">
      <div className="rounded-card border border-border bg-background p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-component bg-primary/10">
            <GraduationCap size={18} className="text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text-primary">{studentName}</h2>
            <p className="text-sm text-text-secondary">
              {studentEmail} · RM: {studentRm}
            </p>
          </div>
        </div>

        <div className="rounded-component border border-border bg-neutral-50 p-4">
          <div className="mb-3 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-component bg-primary/10">
                <UserCheck size={16} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">
                  Frequência Geral
                </p>
                <p className="text-xs text-text-secondary">
                  Média entre todas as disciplinas da turma
                </p>
              </div>
            </div>
            <span
              className={cn(
                'text-xl font-bold',
                isAttendanceHealthy ? 'text-success' : 'text-danger',
              )}
            >
              {generalAttendanceRate.toFixed(1)}%
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-neutral-200">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                isAttendanceHealthy ? 'bg-success' : 'bg-danger',
              )}
              style={{ width: `${Math.min(generalAttendanceRate, 100)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-base font-semibold text-text-primary">Disciplinas</h3>
          <p className="text-sm text-text-secondary">
            Desempenho por disciplina com frequência, notas e situação
          </p>
        </div>

        {disciplineEntries.length === 0 ? (
          <div className="rounded-card border border-border bg-neutral-50 p-12 text-center">
            <p className="text-sm font-medium text-text-primary">
              Nenhuma disciplina atribuída
            </p>
          </div>
        ) : (
          disciplineEntries.map((discipline) => {
            const SubjectIcon = getSubjectIcon(discipline.subject_name)
            const subject = subjects.find(
              (entry) => entry.assignmentId === discipline.assignment_id,
            )
            const latestGrade = subject ? getLatestGradeForSubject(subject) : null
            const overallAverage = subject ? getSubjectOverallAverage(subject) : null
            const overallStatus = latestGrade && subject
              ? getSubjectOverallStatus(subject)
              : null
            const disciplineHealthy = discipline.attendance_rate >= 75
            const teacherName =
              discipline.teacher_name || subject?.teacherName || '—'

            return (
              <div
                key={discipline.assignment_id}
                className="overflow-hidden rounded-card border border-border bg-background shadow-sm"
              >
                <div className="border-b border-border bg-neutral-50 px-4 py-4 sm:px-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h4 className="flex items-center gap-2 text-base font-semibold text-text-primary">
                        <SubjectIcon size={16} className="text-primary" />
                        {discipline.subject_name}
                      </h4>
                      <p className="mt-1 text-sm text-text-secondary">
                        Professor: {teacherName}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs text-text-secondary">Frequência</p>
                        <p
                          className={cn(
                            'text-sm font-semibold',
                            disciplineHealthy ? 'text-success' : 'text-danger',
                          )}
                        >
                          {discipline.attendance_rate.toFixed(1)}%
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-text-secondary">Média</p>
                        <p
                          className={cn(
                            'text-sm font-semibold',
                            overallAverage != null && overallAverage >= 6
                              ? 'text-success'
                              : 'text-danger',
                          )}
                        >
                          {overallAverage != null ? overallAverage.toFixed(1) : '—'}
                        </p>
                      </div>
                      {overallStatus ? (
                        <GradeStatusBadge status={overallStatus} />
                      ) : (
                        <span className="text-xs text-text-secondary">Aguardando</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto px-4 py-4 sm:px-6">
                  {latestGrade ? (
                    <div className="space-y-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                        Últimas notas — {latestGrade.bimesters.number}º Bimestre
                      </p>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                        {(['n1', 'n2', 'n3', 'n4'] as const).map((field) => (
                          <div
                            key={field}
                            className="rounded-component border border-border bg-neutral-50 px-3 py-2 text-center"
                          >
                            <p className="text-xs uppercase text-text-secondary">
                              {field.toUpperCase()}
                            </p>
                            <p className="text-sm font-semibold text-text-primary">
                              {formatGradeCell(latestGrade[field])}
                            </p>
                          </div>
                        ))}
                        <div className="rounded-component border border-border bg-neutral-50 px-3 py-2 text-center">
                          <p className="text-xs uppercase text-text-secondary">Rec.</p>
                          <p className="text-sm font-semibold text-text-primary">
                            {formatGradeCell(latestGrade.recovery_grade)}
                          </p>
                        </div>
                        <div className="rounded-component border border-border bg-neutral-50 px-3 py-2 text-center">
                          <p className="text-xs uppercase text-text-secondary">Média</p>
                          <p
                            className={cn(
                              'text-sm font-semibold',
                              (overallAverage ?? 0) >= 6 ? 'text-success' : 'text-danger',
                            )}
                          >
                            {overallAverage != null ? overallAverage.toFixed(1) : '—'}
                          </p>
                        </div>
                      </div>
                      {latestGrade.recovery_grade != null && (
                        <p className="text-xs text-text-secondary">
                          Média do bimestre:{' '}
                          {parseGradeValue(latestGrade.average).toFixed(1)}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-text-secondary">
                      Nenhuma nota lançada para esta disciplina.
                    </p>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
