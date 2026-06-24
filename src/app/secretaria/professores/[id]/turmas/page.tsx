'use client'

import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import { DeleteAssignmentDialog } from '@/components/assignments/DeleteAssignmentDialog'
import { PageContainer } from '@/components/layout/PageContainer'
import { usePageHeaderTitle } from '@/contexts/page-header-context'
import { TeacherAssignmentsList } from '@/components/teachers/TeacherAssignmentsList'
import { TeacherClassesList } from '@/components/teachers/TeacherClassesList'
import { buttonVariants } from '@/components/ui/button'
import { assignmentsApi, teachersApi } from '@/lib/api'
import {
  getPrimarySubjectName,
  getUniqueClassesFromAssignments,
} from '@/lib/assignment-utils'
import { cn } from '@/lib/utils'
import { Assignment } from '@/types/assignment'
import { Teacher } from '@/types/teacher'

export default function ProfessorTurmasPage() {
  const params = useParams<{ id: string }>()
  const teacherId = params.id

  const [teacher, setTeacher] = useState<Teacher | null>(null)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const loadData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const [teacherData, assignmentsData] = await Promise.all([
        teachersApi.getById(teacherId),
        assignmentsApi.getByTeacher(teacherId),
      ])

      setTeacher(teacherData)
      setAssignments(Array.isArray(assignmentsData) ? assignmentsData : [])
    } catch {
      setError('Não foi possível carregar as turmas do professor.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (teacherId) {
      loadData()
    }
  }, [teacherId])

  const uniqueClasses = useMemo(
    () => getUniqueClassesFromAssignments(assignments),
    [assignments],
  )

  usePageHeaderTitle(teacher?.full_name ?? '')

  const handleDeleteClick = (assignment: Assignment) => {
    setSelectedAssignment(assignment)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteClose = () => {
    setIsDeleteDialogOpen(false)
    setSelectedAssignment(null)
  }

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageContainer>
    )
  }

  if (error || !teacher) {
    return (
      <PageContainer>
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
          {error ?? 'Professor não encontrado.'}
        </div>
      </PageContainer>
    )
  }

  const primarySubject = getPrimarySubjectName(assignments)

  return (
    <PageContainer>
      <div className="mb-8 flex items-start gap-3">
        <Link
          href="/secretaria/professores"
          className={cn(
            buttonVariants({ variant: 'outline', size: 'icon' }),
            'mt-0.5 shrink-0',
          )}
          aria-label="Voltar para professores"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <p className="text-sm font-medium text-primary">{primarySubject}</p>
          <p className="text-sm text-text-secondary">
            Turmas e atribuições do professor
          </p>
        </div>
      </div>

      <div className="space-y-8">
        <TeacherClassesList classes={uniqueClasses} />
        <TeacherAssignmentsList
          teacherId={teacherId}
          assignments={assignments}
          onDeleteClick={handleDeleteClick}
        />
      </div>

      <DeleteAssignmentDialog
        open={isDeleteDialogOpen}
        onClose={handleDeleteClose}
        assignment={selectedAssignment}
        onDeleted={loadData}
      />
    </PageContainer>
  )
}
