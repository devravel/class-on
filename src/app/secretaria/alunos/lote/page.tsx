'use client'

import { ArrowLeft, Check, Copy, Download } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

import {
  BulkStudentForm,
  BulkStudentFormValues,
} from '@/components/students/BulkStudentForm'
import { Section } from '@/components/dashboard/Section'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeaderTitle } from '@/contexts/page-header-context'
import { Button, buttonVariants } from '@/components/ui/button'
import { studentsApi } from '@/lib/api'
import { cn } from '@/lib/utils'
import { CreateBulkStudentsResponse } from '@/types/student'

export default function CadastroLoteAlunosPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<CreateBulkStudentsResponse | null>(null)

  const handleSubmit = async (values: BulkStudentFormValues) => {
    try {
      setIsSubmitting(true)
      setError(null)
      const data = await studentsApi.createBulk(values)
      setResult(data)
    } catch (err: unknown) {
      console.error('Erro ao criar alunos em lote:', err)
      const message = err instanceof Error ? err.message : undefined
      setError(message || 'Não foi possível criar os alunos. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDownloadPasswords = () => {
    if (!result) return

    const content = result.created
      .map(
        (item) =>
          `${item.student.full_name},${item.student.users.email},${item.student.rm},${item.provisional_password}`,
      )
      .join('\n')

    const header = 'Nome Completo,E-mail,RM,Senha Provisória\n'
    const blob = new Blob([header + content], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `alunos-senhas-${new Date().getTime()}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const handleCadastrarNovo = () => {
    setResult(null)
    setError(null)
  }

  if (result) {
    return (
      <PageContainer>
        <PageHeaderTitle title="Alunos cadastrados com sucesso!" />
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-component bg-emerald-100">
              <Check size={20} className="text-emerald-700" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">
                {result.created.length} aluno(s) cadastrado(s)
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Section
            title="Senhas provisórias"
            description="Guarde essas senhas — elas não serão exibidas novamente"
          >
            <div className="overflow-hidden rounded-card bg-surface shadow-light ring-1 ring-border">
              <div className="p-6">
                <div className="mb-4 flex items-center gap-3 rounded-component border border-amber-200 bg-amber-50 px-4 py-3">
                  <span className="text-sm font-medium text-amber-800">
                    ⚠️ Faça o download das senhas agora. Após fechar esta tela,
                    não será possível recuperá-las.
                  </span>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDownloadPasswords}
                  className="mb-4"
                >
                  <Download size={16} />
                  Baixar senhas (CSV)
                </Button>

                <div className="max-h-96 overflow-y-auto rounded-component border border-border">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-muted">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-text-primary">
                          Nome
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-text-primary">
                          RM
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-text-primary">
                          Senha
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {result.created.map((item) => (
                        <tr key={item.student.id} className="hover:bg-muted/30">
                          <td className="px-4 py-3 text-text-primary">
                            {item.student.full_name}
                          </td>
                          <td className="px-4 py-3 text-text-secondary">
                            {item.student.rm}
                          </td>
                          <td className="px-4 py-3">
                            <code className="font-mono text-text-primary">
                              {item.provisional_password}
                            </code>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </Section>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={handleCadastrarNovo}>
              Cadastrar mais alunos
            </Button>
            <Button
              type="button"
              onClick={() => router.push('/secretaria/alunos')}
            >
              Ir para lista de alunos
            </Button>
          </div>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <PageHeaderTitle title="Cadastro em Lote" />
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-3">
          <Link
            href="/secretaria/alunos"
            className={cn(buttonVariants({ variant: 'ghost', size: 'icon-sm' }))}
            aria-label="Voltar para alunos"
          >
            <ArrowLeft size={16} />
          </Link>
        </div>
        <p className="text-sm text-text-secondary">
          Cadastre vários alunos de uma só vez. As senhas serão geradas
          automaticamente.
        </p>
      </div>

      <Section
        title="Adicionar Alunos"
        description="Preencha os dados de cada aluno"
      >
        <div className="overflow-hidden rounded-card bg-surface shadow-light ring-1 ring-border">
          <div className="p-6">
            <BulkStudentForm
              isSubmitting={isSubmitting}
              error={error}
              onSubmit={handleSubmit}
              onCancel={() => router.push('/secretaria/alunos')}
            />
          </div>
        </div>
      </Section>
    </PageContainer>
  )
}
