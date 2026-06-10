'use client'

import { GraduationCap, Pencil, Plus, PowerOff } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import { ToggleTeacherDialog } from '@/components/teachers/ToggleTeacherDialog'
import { ListCard } from '@/components/dashboard/ListCard'
import { Section } from '@/components/dashboard/Section'
import { PageContainer } from '@/components/layout/PageContainer'
import { Button, buttonVariants } from '@/components/ui/button'
import { teachersApi } from '@/lib/api'
import { cn } from '@/lib/utils'
import { Teacher } from '@/types/teacher'

export default function ProfessoresPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null)
  const [isToggleDialogOpen, setIsToggleDialogOpen] = useState(false)

  const loadTeachers = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await teachersApi.list()
      setTeachers(data)
    } catch (err) {
      console.error('Erro ao carregar professores:', err)
      setError('Não foi possível carregar os professores.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadTeachers()
  }, [])

  const handleToggleClick = (teacher: Teacher) => {
    setSelectedTeacher(teacher)
    setIsToggleDialogOpen(true)
  }

  const handleToggleClose = () => {
    setIsToggleDialogOpen(false)
    setSelectedTeacher(null)
  }

  const filteredTeachers = teachers.filter((t) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      t.full_name.toLowerCase().includes(q) ||
      t.users.email.toLowerCase().includes(q) ||
      t.registration_code.toLowerCase().includes(q)
    )
  })

  return (
    <PageContainer>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Professores</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Gerencie os professores da instituição
          </p>
        </div>

        <Link href="/secretaria/professores/novo" className={cn(buttonVariants())}>
          <Plus size={16} />
          Novo Professor
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
          title="Professores Cadastrados"
          description="Lista de todos os professores cadastrados no sistema"
        >
          <div className="mb-4">
            <input
              type="text"
              placeholder="Buscar por nome, e-mail ou código..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full max-w-sm rounded-component border border-border bg-background px-3 py-2 text-sm text-text-primary placeholder-text-secondary focus:border-ring focus:outline-none focus:ring-[3px] focus:ring-ring/20 transition-all"
            />
          </div>

          <ListCard
            items={filteredTeachers}
            emptyMessage={
              search
                ? 'Nenhum professor encontrado para esta busca.'
                : 'Nenhum professor cadastrado.'
            }
            renderItem={(item) => (
              <div className="flex flex-col gap-4 px-4 py-4 transition-colors hover:bg-neutral-100 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-component bg-primary/10">
                    <GraduationCap size={18} className="text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-base font-semibold text-text-primary">
                        {item.full_name}
                      </p>
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                          item.users.is_active
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-neutral-100 text-neutral-500',
                        )}
                      >
                        {item.users.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    <p className="truncate text-sm text-text-secondary">
                      {item.users.email}
                      {' · '}
                      {item.registration_code}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2 sm:pl-4">
                  <Link
                    href={`/secretaria/professores/${item.id}/editar`}
                    className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
                  >
                    <Pencil size={14} />
                    Editar
                  </Link>
                  <Button
                    type="button"
                    variant={item.users.is_active ? 'destructive' : 'default'}
                    size="sm"
                    onClick={() => handleToggleClick(item)}
                  >
                    <PowerOff size={14} />
                    {item.users.is_active ? 'Inativar' : 'Ativar'}
                  </Button>
                </div>
              </div>
            )}
          />
        </Section>
      )}

      <ToggleTeacherDialog
        open={isToggleDialogOpen}
        onClose={handleToggleClose}
        teacher={selectedTeacher}
        onToggled={loadTeachers}
      />
    </PageContainer>
  )
}
