'use client'

import { ArrowLeft, Check, Copy, GraduationCap, UserPlus } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { TeacherForm, TeacherFormValues } from '@/components/teachers/TeacherForm'
import { Section } from '@/components/dashboard/Section'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeaderTitle } from '@/contexts/page-header-context'
import { Button, buttonVariants } from '@/components/ui/button'
import { teachersApi } from '@/lib/api'
import { cn } from '@/lib/utils'
import { CreateTeacherResponse } from '@/types/teacher'

export default function NovoProfessorPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<CreateTeacherResponse | null>(null)
  const [copied, setCopied] = useState(false)

  const handleSubmit = async (values: TeacherFormValues) => {
    try {
      setIsSubmitting(true)
      setError(null)
      const data = await teachersApi.create(values)
      setResult(data)
    } catch (err: unknown) {
      console.error('Erro ao criar professor:', err)
      const message = err instanceof Error ? err.message : undefined
      setError(message || 'Não foi possível criar o professor. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCopy = async () => {
    if (!result) return
    await navigator.clipboard.writeText(result.provisional_password)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCadastrarNovo = () => {
    setResult(null)
    setError(null)
    setCopied(false)
  }

  if (result) {
    return (
      <PageContainer>
        <PageHeaderTitle title="Professor cadastrado!" />
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-component bg-emerald-100">
              <GraduationCap size={20} className="text-emerald-700" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">
                O acesso foi gerado com sucesso
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Section
            title="Dados do professor"
            description="Informações cadastradas"
          >
            <div className="overflow-hidden rounded-card bg-surface shadow-light ring-1 ring-border">
              <dl className="divide-y divide-border">
                {[
                  { label: 'Nome', value: result.teacher.full_name },
                  { label: 'E-mail', value: result.teacher.users.email },
                  {
                    label: 'Código de registro',
                    value: result.teacher.registration_code,
                  },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center gap-4 px-6 py-4">
                    <dt className="w-40 shrink-0 text-sm font-medium text-text-secondary">
                      {label}
                    </dt>
                    <dd className="text-sm text-text-primary">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </Section>

          <Section
            title="Senha provisória"
            description="Entregue esta senha ao professor — ela não será exibida novamente"
          >
            <div className="overflow-hidden rounded-card bg-surface shadow-light ring-1 ring-border">
              <div className="p-6">
                <div className="mb-4 flex items-center gap-3 rounded-component border border-amber-200 bg-amber-50 px-4 py-3">
                  <span className="text-sm font-medium text-amber-800">
                    ⚠️ Guarde esta senha agora. Após fechar esta tela, não será
                    possível recuperá-la.
                  </span>
                </div>

                <div className="flex items-center gap-3 rounded-component border border-border bg-muted px-4 py-3">
                  <code className="flex-1 text-base font-mono font-semibold tracking-wider text-text-primary">
                    {result.provisional_password}
                  </code>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    className="shrink-0"
                  >
                    {copied ? (
                      <>
                        <Check size={14} className="text-emerald-600" />
                        Copiado
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        Copiar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </Section>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCadastrarNovo}
            >
              <UserPlus size={16} />
              Cadastrar outro professor
            </Button>
            <Button
              type="button"
              onClick={() => router.push('/secretaria/professores')}
            >
              Ir para lista de professores
            </Button>
          </div>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <PageHeaderTitle title="Novo Professor" />
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-3">
          <Link
            href="/secretaria/professores"
            className={cn(buttonVariants({ variant: 'ghost', size: 'icon-sm' }))}
            aria-label="Voltar para professores"
          >
            <ArrowLeft size={16} />
          </Link>
        </div>
        <p className="text-sm text-text-secondary">
          Cadastre um novo professor. A senha de acesso será gerada automaticamente.
        </p>
      </div>

      <Section
        title="Informações do Professor"
        description="Preencha os dados de identificação do professor"
      >
        <div className="overflow-hidden rounded-card bg-surface shadow-light ring-1 ring-border">
          <div className="p-6">
            <TeacherForm
              isSubmitting={isSubmitting}
              error={error}
              onSubmit={handleSubmit}
              onCancel={() => router.push('/secretaria/professores')}
              submitLabel="Cadastrar Professor"
            />
          </div>
        </div>
      </Section>
    </PageContainer>
  )
}
