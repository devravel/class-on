'use client'

import { BookOpen, Pencil, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import { DeleteClassDialog } from '@/components/classes/DeleteClassDialog'
import { ListCard } from '@/components/dashboard/ListCard'
import { Section } from '@/components/dashboard/Section'
import { PageContainer } from '@/components/layout/PageContainer'
import { Button, buttonVariants } from '@/components/ui/button'
import { classesApi } from '@/lib/api'
import { cn } from '@/lib/utils'
import { Class, SERIES_LABELS, SHIFT_LABELS, Shift } from '@/types/class'

export default function TurmasPage() {
  const [classes, setClasses] = useState<Class[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [selectedClass, setSelectedClass] = useState<Class | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const loadClasses = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await classesApi.list()
      setClasses(data)
    } catch (err) {
      console.error('Erro ao carregar turmas:', err)
      setError('Não foi possível carregar as turmas.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadClasses()
  }, [])

  const handleDeleteClick = (classRecord: Class) => {
    setSelectedClass(classRecord)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteClose = () => {
    setIsDeleteDialogOpen(false)
    setSelectedClass(null)
  }

  const filteredClasses = classes.filter((c) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    const seriesLabel = (SERIES_LABELS[c.series] ?? '').toLowerCase()
    const shiftLabel = (SHIFT_LABELS[c.shift as Shift] ?? '').toLowerCase()
    const yearLabel = String(c.academic_years?.year ?? '')
    return (
      seriesLabel.includes(q) ||
      c.letter.toLowerCase().includes(q) ||
      shiftLabel.includes(q) ||
      yearLabel.includes(q)
    )
  })

  return (
    <PageContainer>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Turmas</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Gerencie as turmas da instituição
          </p>
        </div>

        <Link href="/secretaria/turmas/nova" className={cn(buttonVariants())}>
          <Plus size={16} />
          Nova Turma
        </Link>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {!isLoading && !error && (
        <Section
          title="Turmas Cadastradas"
          description="Lista de todas as turmas cadastradas no sistema"
        >
          {/* Search */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Buscar por série, letra, turno ou ano..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full max-w-sm rounded-component border border-border bg-background px-3 py-2 text-sm text-text-primary placeholder-text-secondary focus:border-ring focus:outline-none focus:ring-[3px] focus:ring-ring/20 transition-all"
            />
          </div>

          <ListCard
            items={filteredClasses}
            emptyMessage={
              search ? 'Nenhuma turma encontrada para esta busca.' : 'Nenhuma turma cadastrada.'
            }
            renderItem={(item) => (
              <div className="flex flex-col gap-4 px-4 py-4 transition-colors hover:bg-neutral-100 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-component bg-primary/10">
                    <BookOpen size={18} className="text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-base font-semibold text-text-primary">
                      {SERIES_LABELS[item.series] ?? `${item.series}º Ano`}{' '}
                      {item.letter}
                    </p>
                    <p className="text-sm text-text-secondary">
                      {SHIFT_LABELS[item.shift as Shift] ?? item.shift}
                      {' · '}
                      {item.academic_years?.year ?? '—'}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2 sm:pl-4">
                  <Link
                    href={`/secretaria/turmas/${item.id}/editar`}
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

      <DeleteClassDialog
        open={isDeleteDialogOpen}
        onClose={handleDeleteClose}
        classRecord={selectedClass}
        onDeleted={loadClasses}
      />
    </PageContainer>
  )
}
