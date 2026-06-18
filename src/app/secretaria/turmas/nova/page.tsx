'use client'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { ClassForm, ClassFormValues } from '@/components/classes/ClassForm'
import { Section } from '@/components/dashboard/Section'
import { PageContainer } from '@/components/layout/PageContainer'
import { buttonVariants } from '@/components/ui/button'
import { classesApi } from '@/lib/api'
import { cn } from '@/lib/utils'

export default function NovaTurmaPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (values: ClassFormValues) => {
    try {
      setIsSubmitting(true)
      setError(null)

      await classesApi.create({
        year_id: Number(values.year_id),
        education_level: values.education_level,
        series: Number(values.series),
        letter: values.letter,
        shift: values.shift,
      })

      router.push('/secretaria/turmas')
    } catch (err: unknown) {
      console.error('Erro ao criar turma:', err)
      const message = err instanceof Error ? err.message : undefined
      setError(message || 'Não foi possível criar a turma. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

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
          <h1 className="text-2xl font-bold text-text-primary">Nova Turma</h1>
        </div>
        <p className="text-sm text-text-secondary">
          Cadastre uma nova turma para a instituição
        </p>
      </div>

      <Section
        title="Informações da Turma"
        description="Defina a série, letra, turno e ano letivo da turma"
      >
        <div className="overflow-hidden rounded-card bg-surface shadow-light ring-1 ring-border">
          <div className="p-6">
            <ClassForm
              isSubmitting={isSubmitting}
              error={error}
              onSubmit={handleSubmit}
              onCancel={() => router.push('/secretaria/turmas')}
              submitLabel="Criar Turma"
            />
          </div>
        </div>
      </Section>
    </PageContainer>
  )
}
