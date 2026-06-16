'use client'

import { ArrowLeft, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import {
  SubjectForm,
  SubjectFormValues,
} from '@/components/subjects/SubjectForm'
import { Section } from '@/components/dashboard/Section'
import { PageContainer } from '@/components/layout/PageContainer'
import { buttonVariants } from '@/components/ui/button'
import { subjectsApi } from '@/lib/api'
import { cn } from '@/lib/utils'
import { Subject } from '@/types/subject'

export default function EditarDisciplinaPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [subject, setSubject] = useState<Subject | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadSubject = async () => {
      try {
        setIsLoading(true)
        const data = await subjectsApi.getById(id)
        setSubject(data)
      } catch (err) {
        console.error('Erro ao carregar disciplina:', err)
        setError('Não foi possível carregar a disciplina.')
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      loadSubject()
    }
  }, [id])

  const handleSubmit = async (values: SubjectFormValues) => {
    try {
      setIsSubmitting(true)
      setError(null)
      await subjectsApi.update(id, values)
      router.push('/secretaria/disciplinas')
    } catch (err: unknown) {
      console.error('Erro ao atualizar disciplina:', err)
      const message = err instanceof Error ? err.message : undefined
      setError(
        message || 'Não foi possível atualizar a disciplina. Tente novamente.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </PageContainer>
    )
  }

  if (!subject) {
    return (
      <PageContainer>
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
          Disciplina não encontrada
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-3">
          <Link
            href="/secretaria/disciplinas"
            className={cn(buttonVariants({ variant: 'ghost', size: 'icon-sm' }))}
            aria-label="Voltar para disciplinas"
          >
            <ArrowLeft size={16} />
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-component bg-primary/10">
              <BookOpen size={20} className="text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary">
              Editar Disciplina
            </h1>
          </div>
        </div>
        <p className="text-sm text-text-secondary">
          Atualize as informações da disciplina
        </p>
      </div>

      <Section
        title="Informações da Disciplina"
        description="Edite os dados da disciplina"
      >
        <div className="overflow-hidden rounded-card bg-surface shadow-light ring-1 ring-border">
          <div className="p-6">
            <SubjectForm
              defaultValues={{
                name: subject.name,
                description: subject.description,
              }}
              isSubmitting={isSubmitting}
              error={error}
              onSubmit={handleSubmit}
              onCancel={() => router.push('/secretaria/disciplinas')}
              submitLabel="Salvar Alterações"
            />
          </div>
        </div>
      </Section>
    </PageContainer>
  )
}
