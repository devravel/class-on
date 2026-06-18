'use client'

import { BookUser, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import { DeleteAssignmentDialog } from '@/components/assignments/DeleteAssignmentDialog'
import { ListCard } from '@/components/dashboard/ListCard'
import { Section } from '@/components/dashboard/Section'
import { PageContainer } from '@/components/layout/PageContainer'
import { Button, buttonVariants } from '@/components/ui/button'
import { assignmentsApi } from '@/lib/api'
import { cn } from '@/lib/utils'
import { getClassLabel } from '@/lib/class-utils'
import { Assignment } from '@/types/assignment'

export default function AtribuicoesPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const loadAssignments = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await assignmentsApi.list()
      setAssignments(data)
    } catch (err) {
      console.error('Erro ao carregar atribuições:', err)
      setError('Não foi possível carregar as atribuições.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadAssignments()
  }, [])

  const handleDeleteClick = (assignment: Assignment) => {
    setSelectedAssignment(assignment)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteClose = () => {
    setIsDeleteDialogOpen(false)
    setSelectedAssignment(null)
  }

  const filteredAssignments = assignments.filter((a) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      a.teachers.full_name.toLowerCase().includes(q) ||
      a.subjects.name.toLowerCase().includes(q) ||
      getClassLabel(a.classes).toLowerCase().includes(q)
    )
  })

  return (
    <PageContainer>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Atribuições de Professores
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Gerencie as atribuições de professores às disciplinas e turmas
          </p>
        </div>

        <Link
          href="/secretaria/atribuicoes/nova"
          className={cn(buttonVariants())}
        >
          <Plus size={16} />
          Nova Atribuição
        </Link>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {!isLoading && !error && (
        <Section
          title="Atribuições Cadastradas"
          description="Lista de todas as atribuições de professores cadastradas no sistema"
        >
          <div className="mb-4">
            <input
              type="text"
              placeholder="Buscar por professor, disciplina ou turma..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full max-w-md rounded-component border border-border bg-background px-3 py-2 text-sm text-text-primary placeholder-text-secondary focus:border-ring focus:outline-none focus:ring-[3px] focus:ring-ring/20 transition-all"
            />
          </div>

          <ListCard
            items={filteredAssignments}
            emptyMessage={
              search
                ? 'Nenhuma atribuição encontrada para esta busca.'
                : 'Nenhuma atribuição cadastrada.'
            }
            renderItem={(item) => (
              <div className="flex flex-col gap-4 px-4 py-4 transition-colors hover:bg-neutral-100 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-component bg-primary/10">
                    <BookUser size={18} className="text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-base font-semibold text-text-primary">
                      {item.teachers.full_name}
                    </p>
                    <p className="text-sm text-text-secondary">
                      {item.subjects.name} • {getClassLabel(item.classes)}
                    </p>
                    <p className="text-xs text-text-secondary mt-1">
                      Ano Letivo: {item.classes.academic_years.year}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2 sm:pl-4">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteClick(item)}
                  >
                    <Trash2 size={14} />
                    Excluir
                  </Button>
                </div>
              </div>
            )}
          />
        </Section>
      )}

      <DeleteAssignmentDialog
        open={isDeleteDialogOpen}
        onClose={handleDeleteClose}
        assignment={selectedAssignment}
        onDeleted={loadAssignments}
      />
    </PageContainer>
  )
}
