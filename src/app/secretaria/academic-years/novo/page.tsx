'use client'

import { ArrowLeft, CheckCircle, Save, XCircle } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { Section } from '@/components/dashboard/Section'
import { PageContainer } from '@/components/layout/PageContainer'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { CreateAcademicYearRequest } from '@/types/academic-year'
import { academicYearsApi } from '@/lib/api'

export default function NovoAnoLetivoPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<CreateAcademicYearRequest & { yearInput: string }>({
    yearInput: '',
    year: 0,
    status: 'ACTIVE'
  })

  const handleYearChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      yearInput: value,
      year: value ? parseInt(value, 10) : 0
    }))
  }

  const handleStatusChange = (status: 'ACTIVE' | 'CLOSED') => {
    setFormData(prev => ({
      ...prev,
      status
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.year || formData.year < 2000) {
      setError('Por favor, informe um ano válido (a partir de 2000)')
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)
      
      await academicYearsApi.create({
        year: formData.year,
        status: formData.status
      })
      
      router.push('/secretaria/academic-years')
    } catch (err: unknown) {
      console.error('Erro ao criar ano letivo:', err)
      const message = err instanceof Error ? err.message : undefined
      setError(message || 'Não foi possível criar o ano letivo. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <PageContainer>
      {/* Page heading */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Link
            href="/secretaria/academic-years"
            className={cn(buttonVariants({ variant: 'ghost', size: 'icon-sm' }))}
            aria-label="Voltar para anos letivos"
          >
            <ArrowLeft size={16} />
          </Link>
          <h1 className="text-2xl font-bold text-text-primary">Novo Ano Letivo</h1>
        </div>
        <p className="text-sm text-text-secondary">
          Cadastre um novo ano letivo para a instituição
        </p>
      </div>

      {/* Formulário */}
      <Section 
        title="Informações do Ano Letivo"
        description="Defina o ano e status do ciclo acadêmico institucional"
      >
        <div className="overflow-hidden rounded-card bg-surface shadow-light ring-1 ring-border">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Error message */}
            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-component text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Ano */}
            <div>
              <label 
                htmlFor="year" 
                className="block text-sm font-medium text-text-primary mb-2"
              >
                Ano Letivo *
              </label>
              <input
                type="number"
                id="year"
                required
                min="2000"
                max="2099"
                placeholder="Ex: 2026"
                value={formData.yearInput}
                onChange={(e) => handleYearChange(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-component bg-background text-text-primary placeholder-text-secondary focus:border-ring focus:ring-3 focus:ring-ring/20 focus:outline-none transition-all"
              />
              <p className="mt-1 text-xs text-text-secondary">
                Representa o contexto acadêmico institucional (controle manual)
              </p>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-3">
                Status Inicial
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="ACTIVE"
                    checked={formData.status === 'ACTIVE'}
                    onChange={() => handleStatusChange('ACTIVE')}
                    className="text-primary focus:ring-primary focus:ring-2"
                  />
                  <CheckCircle size={16} className="text-green-600" />
                  <span className="text-sm text-text-primary">Ativo</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="CLOSED"
                    checked={formData.status === 'CLOSED'}
                    onChange={() => handleStatusChange('CLOSED')}
                    className="text-primary focus:ring-primary focus:ring-2"
                  />
                  <XCircle size={16} className="text-gray-600" />
                  <span className="text-sm text-text-primary">Fechado</span>
                </label>
              </div>
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-component">
                <p className="text-xs text-blue-700">
                  <strong>Importante:</strong> Apenas um ano letivo pode estar ATIVO por vez. 
                  Se você criar um ano como ATIVO, o sistema fechará automaticamente outros anos ativos.
                </p>
              </div>
            </div>

            {/* Informação sobre o sistema */}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-component">
              <h4 className="text-sm font-medium text-amber-800 mb-2">
                Sobre o Sistema de Anos Letivos
              </h4>
              <ul className="text-xs text-amber-700 space-y-1">
                <li>• O ciclo é definido somente por ano e status (sem janelas de datas)</li>
                <li>• O controle é totalmente manual via status</li>
                <li>• Representa apenas separação histórica e contexto institucional</li>
                <li>• Não há datas de início ou fim programáticas</li>
              </ul>
            </div>

            {/* Botões */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <Link
                href="/secretaria/academic-years"
                className={cn(buttonVariants({ variant: 'outline' }), isSubmitting && 'pointer-events-none opacity-50')}
              >
                Cancelar
              </Link>
              <Button type="submit" disabled={isSubmitting}>
                <Save size={16} />
                {isSubmitting ? 'Criando...' : 'Criar Ano Letivo'}
              </Button>
            </div>
          </form>
        </div>
      </Section>
    </PageContainer>
  )
}