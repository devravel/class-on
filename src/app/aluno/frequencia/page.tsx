'use client'

import { Loader2, RefreshCw, UserCheck } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeaderTitle } from '@/contexts/page-header-context'
import { Button } from '@/components/ui/button'
import { attendanceApi, authApi } from '@/lib/api'
import { getSubjectIcon } from '@/lib/subject-icons'
import { cn } from '@/lib/utils'
import { DisciplineAttendanceEntry, StudentAttendanceSummary } from '@/types/attendance'

const MIN_ATTENDANCE_RATE = 75

function AttendanceProgressBar({
  rate,
  className,
}: {
  rate: number
  className?: string
}) {
  const isHealthy = rate >= MIN_ATTENDANCE_RATE

  return (
    <div className={cn('h-3 overflow-hidden rounded-full bg-neutral-200', className)}>
      <div
        className={cn(
          'h-full rounded-full transition-all duration-500',
          isHealthy ? 'bg-success' : 'bg-danger',
        )}
        style={{ width: `${Math.min(rate, 100)}%` }}
      />
    </div>
  )
}

function DisciplineAttendanceCard({ discipline }: { discipline: DisciplineAttendanceEntry }) {
  const isHealthy = discipline.attendance_rate >= MIN_ATTENDANCE_RATE
  const SubjectIcon = getSubjectIcon(discipline.subject_name)

  return (
    <div className="overflow-hidden rounded-card border border-border bg-background shadow-sm">
      <div className="border-b border-border bg-neutral-50 px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="flex items-center gap-2 text-base font-semibold text-text-primary">
              <SubjectIcon size={16} className="text-primary" />
              {discipline.subject_name}
            </h3>
            <p className="mt-1 text-sm text-text-secondary">
              Professor: {discipline.teacher_name || '—'}
            </p>
          </div>
          <span
            className={cn(
              'text-2xl font-bold',
              isHealthy ? 'text-success' : 'text-danger',
            )}
          >
            {discipline.attendance_rate.toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="space-y-4 px-4 py-4 sm:px-6">
        <AttendanceProgressBar rate={discipline.attendance_rate} className="h-2" />
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-component border border-border bg-neutral-50 px-3 py-2">
            <p className="text-xs uppercase text-text-secondary">Presenças</p>
            <p className="text-sm font-semibold text-success">{discipline.present}</p>
          </div>
          <div className="rounded-component border border-border bg-neutral-50 px-3 py-2">
            <p className="text-xs uppercase text-text-secondary">Faltas</p>
            <p className="text-sm font-semibold text-danger">{discipline.absent}</p>
          </div>
          <div className="rounded-component border border-border bg-neutral-50 px-3 py-2">
            <p className="text-xs uppercase text-text-secondary">Aulas</p>
            <p className="text-sm font-semibold text-text-primary">
              {discipline.total_lessons}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AlunoFrequenciaPage() {
  const [attendance, setAttendance] = useState<StudentAttendanceSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadAttendance = useCallback(async (options?: { silent?: boolean }) => {
    try {
      if (options?.silent) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }
      setError(null)

      const me = await authApi.getMe()
      if (!me.student) {
        setError('Perfil de aluno não encontrado.')
        return
      }

      const attendanceData = await attendanceApi.getStudentSummary(me.student.id)
      setAttendance(attendanceData)
    } catch {
      setError('Não foi possível carregar sua frequência. Tente novamente.')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    void loadAttendance()
  }, [loadAttendance])

  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        void loadAttendance({ silent: true })
      }
    }

    function handleWindowFocus() {
      void loadAttendance({ silent: true })
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleWindowFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleWindowFocus)
    }
  }, [loadAttendance])

  const generalRate =
    attendance?.general_attendance_rate ?? attendance?.attendance_rate ?? 0
  const isGeneralHealthy = generalRate >= MIN_ATTENDANCE_RATE
  const disciplines = attendance?.discipline_attendance ?? []

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <PageHeaderTitle title="Minha Frequência" />
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-text-secondary">
            Acompanhe sua frequência geral e por disciplina
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isRefreshing}
          onClick={() => void loadAttendance({ silent: true })}
          className="shrink-0"
        >
          {isRefreshing ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <RefreshCw size={14} />
          )}
          Atualizar
        </Button>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Frequência geral */}
      <div className="mb-8 rounded-card border border-border bg-background p-6 shadow-sm">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-component bg-primary/10">
              <UserCheck size={18} className="text-primary" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-text-primary">
                Frequência Geral
              </h2>
              <p className="text-xs text-text-secondary">
                {attendance
                  ? `${attendance.present} presenças · ${attendance.absent} faltas · ${attendance.total_lessons} aulas registradas`
                  : 'Nenhuma aula registrada ainda'}
              </p>
            </div>
          </div>
          <span
            className={cn(
              'text-2xl font-bold',
              isGeneralHealthy ? 'text-success' : 'text-danger',
            )}
          >
            {generalRate.toFixed(1)}%
          </span>
        </div>
        <AttendanceProgressBar rate={generalRate} />
        <p className="mt-2 text-xs text-text-secondary">
          Mínimo exigido para aprovação: {MIN_ATTENDANCE_RATE}%
        </p>
      </div>

      {/* Frequência por disciplina */}
      {disciplines.length === 0 && !error ? (
        <div className="rounded-card border border-border bg-neutral-50 p-12 text-center">
          <UserCheck className="mx-auto mb-3 h-10 w-10 text-text-secondary/50" />
          <p className="text-sm font-medium text-text-primary">
            Nenhuma aula registrada
          </p>
          <p className="mt-1 text-xs text-text-secondary">
            Sua frequência por disciplina aparecerá aqui assim que os professores
            registrarem chamadas.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <h2 className="text-base font-semibold text-text-primary">
              Por Disciplina
            </h2>
            <p className="text-sm text-text-secondary">
              Detalhamento da frequência em cada matéria
            </p>
          </div>
          {disciplines.map((discipline) => (
            <DisciplineAttendanceCard
              key={discipline.assignment_id}
              discipline={discipline}
            />
          ))}
        </div>
      )}
    </PageContainer>
  )
}
