'use client'

import { BookOpen, ChevronRight, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import { ListCard } from '@/components/dashboard/ListCard'
import { Section } from '@/components/dashboard/Section'
import { PageContainer } from '@/components/layout/PageContainer'
import { assignmentsApi, authApi } from '@/lib/api'
import { getClassLabel } from '@/lib/class-utils'
import { Assignment } from '@/types/assignment'

export default function ProfessorTurmasPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const me = await authApi.getMe()
        if (!me.teacher) {
          setError('Perfil de professor não encontrado.')
          return
        }
        const data = await assignmentsApi.getByTeacher(me.teacher.id)
        setAssignments(data)
      } catch {
        setError('Não foi possível carregar suas turmas.')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  return (
    <PageContainer>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Minhas Turmas</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Selecione uma turma para gerenciar aulas, chamadas, notas e tarefas.
        </p>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {!isLoading && !error && (
        <Section
          title="Turmas Atribuídas"
          description={`${assignments.length} turma(s) vinculada(s) a você`}
        >
          <ListCard
            items={assignments}
            emptyMessage="Nenhuma turma atribuída. Entre em contato com a secretaria."
            renderItem={(item) => (
              <Link
                href={`/professor/turmas/${item.id}`}
                className="flex items-center justify-between px-4 py-4 transition-colors hover:bg-neutral-100"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-component bg-primary/10">
                    <BookOpen size={18} className="text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-base font-semibold text-text-primary">
                      {getClassLabel(item.classes)}
                    </p>
                    <p className="text-sm text-text-secondary">
                      {item.subjects.name} · Ano {item.classes.academic_years.year}
                    </p>
                  </div>
                </div>
                <ChevronRight size={18} className="shrink-0 text-text-secondary" />
              </Link>
            )}
          />
        </Section>
      )}
    </PageContainer>
  )
}
