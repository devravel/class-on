'use client'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { ClassCreationWizard } from '@/components/classes/ClassCreationWizard'
import { Section } from '@/components/dashboard/Section'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeaderTitle } from '@/contexts/page-header-context'
import { Button, buttonVariants } from '@/components/ui/button'
import { ClassWizardResponse } from '@/types/class'
import { cn } from '@/lib/utils'

export default function NovaTurmaPage() {
  const router = useRouter()
  const [result, setResult] = useState<ClassWizardResponse | null>(null)

  if (result) {
    return (
      <PageContainer>
        <PageHeaderTitle title="Turma criada" />
        <div className="mb-8">
          <p className="text-sm text-text-secondary">
            A turma e todos os vínculos foram criados com sucesso.
          </p>
        </div>

        <Section
          title="Resumo da criação"
          description="Detalhes do que foi gerado nesta operação"
        >
          <div className="overflow-hidden rounded-card bg-surface shadow-light ring-1 ring-border">
            <div className="space-y-4 p-6 text-sm">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-component border border-border p-3">
                  <p className="text-text-secondary">Atribuições</p>
                  <p className="text-lg font-semibold text-text-primary">
                    {result.summary.assignments_created}
                  </p>
                </div>
                <div className="rounded-component border border-border p-3">
                  <p className="text-text-secondary">Alunos criados</p>
                  <p className="text-lg font-semibold text-text-primary">
                    {result.summary.students_created}
                  </p>
                </div>
                <div className="rounded-component border border-border p-3">
                  <p className="text-text-secondary">Professores</p>
                  <p className="text-lg font-semibold text-text-primary">
                    {result.summary.teachers_assigned}
                  </p>
                </div>
              </div>

              {result.students.length > 0 && (
                <div>
                  <p className="mb-2 font-medium text-text-primary">
                    Credenciais dos alunos
                  </p>
                  <ul className="max-h-64 divide-y divide-border overflow-y-auto rounded-component border border-border">
                    {result.students.map((entry) => (
                      <li key={entry.student.id} className="px-3 py-2">
                        <p className="font-medium text-text-primary">
                          {entry.student.full_name}
                        </p>
                        <p className="text-text-secondary">
                          {entry.student.users.email} · Senha:{' '}
                          {entry.provisional_password}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex justify-end gap-3 border-t border-border pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setResult(null)
                  }}
                >
                  Criar outra turma
                </Button>
                <Button onClick={() => router.push('/secretaria/turmas')}>
                  Ir para turmas
                </Button>
              </div>
            </div>
          </div>
        </Section>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <PageHeaderTitle title="Nova Turma" />
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-3">
          <Link
            href="/secretaria/turmas"
            className={cn(buttonVariants({ variant: 'ghost', size: 'icon-sm' }))}
            aria-label="Voltar para turmas"
          >
            <ArrowLeft size={16} />
          </Link>
        </div>
        <p className="text-sm text-text-secondary">
          Crie a turma, atribua professores e matricule alunos em um fluxo
          guiado
        </p>
      </div>

      <Section
        title="Assistente de criação"
        description="Preencha os dados da turma e configure professores e alunos"
      >
        <div className="overflow-hidden rounded-card bg-surface shadow-light ring-1 ring-border">
          <div className="p-6">
            <ClassCreationWizard
              onCancel={() => router.push('/secretaria/turmas')}
              onSuccess={setResult}
            />
          </div>
        </div>
      </Section>
    </PageContainer>
  )
}
