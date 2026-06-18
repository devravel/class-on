'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import {
  AssignmentForm,
  AssignmentFormValues,
} from '@/components/assignments/AssignmentForm'
import { Section } from '@/components/dashboard/Section'
import { PageContainer } from '@/components/layout/PageContainer'
import { assignmentsApi } from '@/lib/api'

export default function NovaAtribuicaoPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    router.replace('/secretaria/professores')
  }, [router])

  const handleSubmit = async (values: AssignmentFormValues) => {
    try {
      setIsSubmitting(true)
      setError(null)
      await assignmentsApi.create(values)
      router.push('/secretaria/atribuicoes')
    } catch (err: unknown) {
      console.error('Erro ao criar atribuição:', err)
      const message = err instanceof Error ? err.message : undefined
      setError(message || 'Não foi possível criar a atribuição. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push('/secretaria/atribuicoes')
  }

  return (
    <PageContainer>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Nova Atribuição</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Atribua um professor a uma disciplina em uma turma
        </p>
      </div>

      <Section
        title="Informações da Atribuição"
        description="Preencha os dados para criar uma nova atribuição"
      >
        <AssignmentForm
          isSubmitting={isSubmitting}
          error={error}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitLabel="Criar Atribuição"
        />
      </Section>
    </PageContainer>
  )
}
