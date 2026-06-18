'use client'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'

import { ClassForm, ClassFormValues } from '@/components/classes/ClassForm'
import { Section } from '@/components/dashboard/Section'
import { PageContainer } from '@/components/layout/PageContainer'
import { buttonVariants } from '@/components/ui/button'
import { classesApi } from '@/lib/api'
import { cn } from '@/lib/utils'
import { Class } from '@/types/class'

export default function EditarTurmaPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const id = params.id

  const [classRecord, setClassRecord] = useState<Class | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    classesApi
      .getById(id)
      .then(setClassRecord)
      .catch((err) => {
        console.error('Erro ao carregar turma:', err)
        setLoadError('Não foi possível carregar os dados da turma.')
      })
      .finally(() => setIsLoading(false))
  }, [id])

  const handleSubmit = async (values: ClassFormValues) => {
    try {
      setIsSubmitting(true)
      setSubmitError(null)

      await classesApi.update(id, {
        year_id: Number(values.year_id),
        education_level: values.education_level,
        series: Number(values.series),
        letter: values.letter,
        shift: values.shift,
      })

      router.push('/secretaria/turmas')
    } catch (err: unknown) {
      console.error('Erro ao atualizar turma:', err)
      const message = err instanceof Error ? err.message : undefined
      setSubmitError(message || 'Não foi possível atualizar a turma. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const defaultValues: ClassFormValues | undefined = classRecord
    ? {
        year_id: classRecord.year_id,
        education_level: classRecord.education_level,
        series: String(classRecord.series),
        letter: classRecord.letter,
        shift: classRecord.shift,
      }
    : undefined

  return (
    <PageContainer>
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-3">
          <Link
            href="/secretaria/turmas"
            className={cn(buttonVariants({ variant: 'ghost', size: 'icon-sm' }))}
            aria-label="Voltar para turmas"
          >
            <ArrowLeft size={16} />
          </Link>
          <h1 className="text-2xl font-bold text-text-primary">Editar Turma</h1>
        </div>
        <p className="text-sm text-text-secondary">
          Atualize as informações da turma
        </p>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )}

      {loadError && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
          {loadError}
        </div>
      )}

      {!isLoading && !loadError && classRecord && (
        <Section
          title="Informações da Turma"
          description="Atualize a série, letra, turno e ano letivo da turma"
        >
          <div className="overflow-hidden rounded-card bg-surface shadow-light ring-1 ring-border">
            <div className="p-6">
              <ClassForm
                defaultValues={defaultValues}
                isSubmitting={isSubmitting}
                error={submitError}
                onSubmit={handleSubmit}
                onCancel={() => router.push('/secretaria/turmas')}
                submitLabel="Salvar Alterações"
              />
            </div>
          </div>
        </Section>
      )}
    </PageContainer>
  )
}
