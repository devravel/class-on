'use client'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import {
  AssignmentForm,
  AssignmentFormValues,
} from '@/components/assignments/AssignmentForm'
import { Section } from '@/components/dashboard/Section'
import { PageContainer } from '@/components/layout/PageContainer'
import { buttonVariants } from '@/components/ui/button'
import { assignmentsApi, teachersApi } from '@/lib/api'
import { cn } from '@/lib/utils'
import { Teacher } from '@/types/teacher'

export default function NovaAtribuicaoProfessorPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const teacherId = params.id

  const [teacher, setTeacher] = useState<Teacher | null>(null)
  const [isLoadingTeacher, setIsLoadingTeacher] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    teachersApi
      .getById(teacherId)
      .then(setTeacher)
      .catch(() => setError('Professor não encontrado.'))
      .finally(() => setIsLoadingTeacher(false))
  }, [teacherId])

  const handleSubmit = async (values: AssignmentFormValues) => {
    try {
      setIsSubmitting(true)
      setError(null)
      await assignmentsApi.create({
        ...values,
        teacher_id: teacherId,
      })
      router.push(`/secretaria/professores/${teacherId}/turmas`)
    } catch (err: unknown) {
      console.error('Erro ao criar atribuição:', err)
      const message = err instanceof Error ? err.message : undefined
      setError(message || 'Não foi possível criar a atribuição. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push(`/secretaria/professores/${teacherId}/turmas`)
  }

  return (
    <PageContainer>
      <div className="mb-8 flex items-start gap-3">
        <Link
          href={`/secretaria/professores/${teacherId}/turmas`}
          className={cn(
            buttonVariants({ variant: 'outline', size: 'icon' }),
            'mt-0.5 shrink-0',
          )}
          aria-label="Voltar para turmas do professor"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Nova Atribuição</h1>
          <p className="mt-1 text-sm text-text-secondary">
            {teacher
              ? `Atribuir disciplina e turma para ${teacher.full_name}`
              : 'Atribua uma disciplina em uma turma'}
          </p>
        </div>
      </div>

      <Section
        title="Informações da Atribuição"
        description="Preencha os dados para criar uma nova atribuição"
      >
        {!isLoadingTeacher && teacher ? (
          <AssignmentForm
            lockedTeacherId={teacherId}
            lockedTeacherName={teacher.full_name}
            defaultValues={{
              teacher_id: teacherId,
              class_id: '',
              subject_id: '',
            }}
            isSubmitting={isSubmitting}
            error={error}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitLabel="Criar Atribuição"
          />
        ) : (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        )}
      </Section>
    </PageContainer>
  )
}
