'use client'

import { BookOpen, Pencil, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import { DeleteSubjectDialog } from '@/components/subjects/DeleteSubjectDialog'
import { ListCard } from '@/components/dashboard/ListCard'
import { Section } from '@/components/dashboard/Section'
import { PageContainer } from '@/components/layout/PageContainer'
import { Button, buttonVariants } from '@/components/ui/button'
import { subjectsApi } from '@/lib/api'
import { cn } from '@/lib/utils'
import { Subject } from '@/types/subject'

export default function DisciplinasPage() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const loadSubjects = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await subjectsApi.list()
      setSubjects(data)
    } catch (err) {
      console.error('Erro ao carregar disciplinas:', err)
      setError('Não foi possível carregar as disciplinas.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadSubjects()
  }, [])

  const handleDeleteClick = (subject: Subject) => {
    setSelectedSubject(subject)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteClose = () => {
    setIsDeleteDialogOpen(false)
    setSelectedSubject(null)
  }

  const filteredSubjects = subjects.filter((s) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      s.name.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q)
    )
  })

  return (
    <PageContainer>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Disciplinas</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Gerencie as disciplinas da instituição
          </p>
        </div>

        <Link
          href="/secretaria/disciplinas/nova"
          className={cn(buttonVariants())}
        >
          <Plus size={16} />
          Nova Disciplina
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
          title="Disciplinas Cadastradas"
          description="Lista de todas as disciplinas cadastradas no sistema"
        >
          <div className="mb-4">
            <input
              type="text"
              placeholder="Buscar por nome ou descrição..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full max-w-sm rounded-component border border-border bg-background px-3 py-2 text-sm text-text-primary placeholder-text-secondary focus:border-ring focus:outline-none focus:ring-[3px] focus:ring-ring/20 transition-all"
            />
          </div>

          <ListCard
            items={filteredSubjects}
            emptyMessage={
              search
                ? 'Nenhuma disciplina encontrada para esta busca.'
                : 'Nenhuma disciplina cadastrada.'
            }
            renderItem={(item) => (
              <div className="flex flex-col gap-4 px-4 py-4 transition-colors hover:bg-neutral-100 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-component bg-primary/10">
                    <BookOpen size={18} className="text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-base font-semibold text-text-primary">
                      {item.name}
                    </p>
                    <p className="text-sm text-text-secondary line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2 sm:pl-4">
                  <Link
                    href={`/secretaria/disciplinas/${item.id}/editar`}
                    className={cn(
                      buttonVariants({ variant: 'outline', size: 'sm' }),
                    )}
                  >
                    <Pencil size={14} />
                    Editar
                  </Link>
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

      <DeleteSubjectDialog
        open={isDeleteDialogOpen}
        onClose={handleDeleteClose}
        subject={selectedSubject}
        onDeleted={loadSubjects}
      />
    </PageContainer>
  )
}
