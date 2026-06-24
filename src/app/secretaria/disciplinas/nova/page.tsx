'use client'

import { ArrowLeft, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

import {
  SubjectForm,
  SubjectFormValues,
} from '@/components/subjects/SubjectForm'
import { Section } from '@/components/dashboard/Section'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeaderTitle } from '@/contexts/page-header-context'
import { buttonVariants } from '@/components/ui/button'
import { subjectsApi } from '@/lib/api'
import { cn } from '@/lib/utils'

export default function NovaDisciplinaPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (values: SubjectFormValues) => {
    try {
      setIsSubmitting(true)
      setError(null)
      await subjectsApi.create(values)
      router.push('/secretaria/disciplinas')
    } catch (err: unknown) {
      console.error('Erro ao criar disciplina:', err)
      const message = err instanceof Error ? err.message : undefined
      setError(
        message || 'Não foi possível criar a disciplina. Tente novamente.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <PageContainer>
      <PageHeaderTitle title="Nova Disciplina" />
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
          </div>
        </div>
        <p className="text-sm text-text-secondary">
          Cadastre uma nova disciplina no sistema
        </p>
      </div>

      <Section
        title="Informações da Disciplina"
        description="Preencha os dados da disciplina"
      >
        <div className="overflow-hidden rounded-card bg-surface shadow-light ring-1 ring-border">
          <div className="p-6">
            <SubjectForm
              isSubmitting={isSubmitting}
              error={error}
              onSubmit={handleSubmit}
              onCancel={() => router.push('/secretaria/disciplinas')}
              submitLabel="Cadastrar Disciplina"
            />
          </div>
        </div>
      </Section>
    </PageContainer>
  )
}
