'use client'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'

import { TeacherForm, TeacherFormValues } from '@/components/teachers/TeacherForm'
import { TeacherPasswordSection } from '@/components/teachers/TeacherPasswordSection'
import { Section } from '@/components/dashboard/Section'
import { PageContainer } from '@/components/layout/PageContainer'
import { buttonVariants } from '@/components/ui/button'
import { teachersApi } from '@/lib/api'
import { cn } from '@/lib/utils'
import { Teacher } from '@/types/teacher'

export default function EditarProfessorPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const id = params.id

  const [teacher, setTeacher] = useState<Teacher | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    teachersApi
      .getById(id)
      .then(setTeacher)
      .catch((err) => {
        console.error('Erro ao carregar professor:', err)
        setLoadError('Não foi possível carregar os dados do professor.')
      })
      .finally(() => setIsLoading(false))
  }, [id])

  const handleSubmit = async (values: TeacherFormValues) => {
    try {
      setIsSubmitting(true)
      setSubmitError(null)

      await teachersApi.update(id, {
        full_name: values.full_name,
        email: values.email,
        registration_code: values.registration_code,
      })

      router.push('/secretaria/professores')
    } catch (err: unknown) {
      console.error('Erro ao atualizar professor:', err)
      const message = err instanceof Error ? err.message : undefined
      setSubmitError(
        message || 'Não foi possível atualizar o professor. Tente novamente.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const defaultValues: TeacherFormValues | undefined = teacher
    ? {
        full_name: teacher.full_name,
        email: teacher.users.email,
        registration_code: teacher.registration_code,
      }
    : undefined

  return (
    <PageContainer>
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-3">
          <Link
            href="/secretaria/professores"
            className={cn(buttonVariants({ variant: 'ghost', size: 'icon-sm' }))}
            aria-label="Voltar para professores"
          >
            <ArrowLeft size={16} />
          </Link>
          <h1 className="text-2xl font-bold text-text-primary">Editar Professor</h1>
        </div>
        <p className="text-sm text-text-secondary">
          Atualize as informações do professor
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

      {!isLoading && !loadError && teacher && (
        <>
          <Section
            title="Informações do Professor"
            description="Atualize os dados de identificação do professor"
          >
            <div className="overflow-hidden rounded-card bg-surface shadow-light ring-1 ring-border">
              <div className="p-6">
                <TeacherForm
                  defaultValues={defaultValues}
                  isSubmitting={isSubmitting}
                  error={submitError}
                  onSubmit={handleSubmit}
                  onCancel={() => router.push('/secretaria/professores')}
                  submitLabel="Salvar Alterações"
                />
              </div>
            </div>
          </Section>

          <Section
            title="Senha de Acesso"
            description="Gerencie a senha de login do professor"
            className="mt-8"
          >
            <div className="overflow-hidden rounded-card bg-surface shadow-light ring-1 ring-border">
              <div className="p-6">
                <TeacherPasswordSection teacherId={id} />
              </div>
            </div>
          </Section>
        </>
      )}
    </PageContainer>
  )
}
