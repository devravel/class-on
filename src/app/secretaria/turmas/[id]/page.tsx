'use client'

import { ArrowLeft, Archive, Loader2, Pencil, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import { ClassInfoCard } from '@/components/classes/ClassInfoCard'
import { ClassStudentsList } from '@/components/classes/ClassStudentsList'
import { ClassTeachersList } from '@/components/classes/ClassTeachersList'
import { PermanentDeleteClassDialog } from '@/components/classes/PermanentDeleteClassDialog'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeaderTitle } from '@/contexts/page-header-context'
import { Button, buttonVariants } from '@/components/ui/button'
import { attendanceApi, classesApi } from '@/lib/api'
import { cn } from '@/lib/utils'
import { ClassStudentAttendanceSummary } from '@/types/attendance'
import { Class, ClassDetails } from '@/types/class'

export default function TurmaDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const classId = params.id

  const [classDetails, setClassDetails] = useState<ClassDetails | null>(null)
  const [attendanceSummaries, setAttendanceSummaries] = useState<
    ClassStudentAttendanceSummary[]
  >([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPermanentDeleteDialogOpen, setIsPermanentDeleteDialogOpen] =
    useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const [details, summaries] = await Promise.all([
          classesApi.getDetails(classId),
          attendanceApi.getClassStudentsSummary(classId),
        ])

        setClassDetails(details)
        setAttendanceSummaries(Array.isArray(summaries) ? summaries : [])
      } catch {
        setError('Não foi possível carregar os detalhes da turma.')
      } finally {
        setIsLoading(false)
      }
    }

    if (classId) {
      load()
    }
  }, [classId])

  const attendanceByStudentId = useMemo(
    () => new Map(attendanceSummaries.map((summary) => [summary.student.id, summary])),
    [attendanceSummaries],
  )

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageContainer>
    )
  }

  if (error || !classDetails) {
    return (
      <PageContainer>
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
          {error ?? 'Turma não encontrada.'}
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Link
            href="/secretaria/turmas"
            className={cn(
              buttonVariants({ variant: 'outline', size: 'icon' }),
              'mt-0.5 shrink-0',
            )}
            aria-label="Voltar para turmas"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <PageHeaderTitle title="Detalhes da Turma" />
            <p className="text-sm text-text-secondary">
              Informações acadêmicas, professores e alunos
            </p>
          </div>
        </div>

        {classDetails.is_active !== false ? (
          <Link
            href={`/secretaria/turmas/${classId}/editar`}
            className={cn(buttonVariants({ variant: 'outline' }))}
          >
            <Pencil size={16} />
            Editar Turma
          </Link>
        ) : (
          <Button
            type="button"
            variant="destructive"
            onClick={() => setIsPermanentDeleteDialogOpen(true)}
          >
            <Trash2 size={16} />
            Excluir permanentemente
          </Button>
        )}
      </div>

      {classDetails.is_active === false && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-border bg-muted/40 p-4 text-sm text-text-secondary">
          <Archive size={18} className="mt-0.5 shrink-0" />
          <p>
            Esta turma está <strong className="text-text-primary">desativada</strong>.
            Os dados históricos permanecem disponíveis para consulta. Para remover
            a turma e todos os dados vinculados do sistema, use a exclusão
            permanente.
          </p>
        </div>
      )}

      <div className="space-y-8">
        <ClassInfoCard classRecord={classDetails} />
        <ClassTeachersList assignments={classDetails.assignments} />
        <ClassStudentsList
          classId={classId}
          enrollments={classDetails.enrollments}
          attendanceByStudentId={attendanceByStudentId}
        />
      </div>

      <PermanentDeleteClassDialog
        open={isPermanentDeleteDialogOpen}
        onClose={() => setIsPermanentDeleteDialogOpen(false)}
        classRecord={classDetails as Class}
        onDeleted={() => router.push('/secretaria/turmas')}
      />
    </PageContainer>
  )
}
