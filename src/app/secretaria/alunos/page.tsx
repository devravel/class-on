'use client'

import { GraduationCap, Pencil, Plus, PowerOff, UserCheck } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import { ToggleStudentDialog } from '@/components/students/ToggleStudentDialog'
import { EnrollmentDialog } from '@/components/students/EnrollmentDialog'
import { ListCard } from '@/components/dashboard/ListCard'
import { Section } from '@/components/dashboard/Section'
import { PageContainer } from '@/components/layout/PageContainer'
import { Button, buttonVariants } from '@/components/ui/button'
import { studentsApi } from '@/lib/api'
import { cn } from '@/lib/utils'
import { Student } from '@/types/student'

export default function AlunosPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [isToggleDialogOpen, setIsToggleDialogOpen] = useState(false)
  const [isEnrollmentDialogOpen, setIsEnrollmentDialogOpen] = useState(false)

  const loadStudents = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await studentsApi.list()
      setStudents(data)
    } catch (err) {
      console.error('Erro ao carregar alunos:', err)
      setError('Não foi possível carregar os alunos.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadStudents()
  }, [])

  const handleToggleClick = (student: Student) => {
    setSelectedStudent(student)
    setIsToggleDialogOpen(true)
  }

  const handleToggleClose = () => {
    setIsToggleDialogOpen(false)
    setSelectedStudent(null)
  }

  const handleEnrollClick = (student: Student) => {
    setSelectedStudent(student)
    setIsEnrollmentDialogOpen(true)
  }

  const handleEnrollmentClose = () => {
    setIsEnrollmentDialogOpen(false)
    setSelectedStudent(null)
  }

  const filteredStudents = students.filter((s) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      s.full_name.toLowerCase().includes(q) ||
      s.users.email.toLowerCase().includes(q) ||
      s.rm.toLowerCase().includes(q)
    )
  })

  return (
    <PageContainer>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Alunos</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Gerencie os alunos da instituição
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/secretaria/alunos/lote"
            className={cn(buttonVariants({ variant: 'outline' }))}
          >
            <Plus size={16} />
            Cadastro em Lote
          </Link>
          <Link href="/secretaria/alunos/novo" className={cn(buttonVariants())}>
            <Plus size={16} />
            Novo Aluno
          </Link>
        </div>
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
          title="Alunos Cadastrados"
          description="Lista de todos os alunos cadastrados no sistema"
        >
          <div className="mb-4">
            <input
              type="text"
              placeholder="Buscar por nome, e-mail ou RM..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full max-w-sm rounded-component border border-border bg-background px-3 py-2 text-sm text-text-primary placeholder-text-secondary focus:border-ring focus:outline-none focus:ring-[3px] focus:ring-ring/20 transition-all"
            />
          </div>

          <ListCard
            items={filteredStudents}
            emptyMessage={
              search
                ? 'Nenhum aluno encontrado para esta busca.'
                : 'Nenhum aluno cadastrado.'
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
                      RM: {item.rm}
                    </p>
                    {item.enrollments && item.enrollments.length > 0 && (
                      <p className="truncate text-xs text-text-secondary">
                        {item.enrollments.length} turma(s) matriculada(s)
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2 sm:pl-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleEnrollClick(item)}
                  >
                    <UserCheck size={14} />
                    Matricular
                  </Button>
                  <Link
                    href={`/secretaria/alunos/${item.id}/editar`}
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

      <ToggleStudentDialog
        open={isToggleDialogOpen}
        onClose={handleToggleClose}
        student={selectedStudent}
        onToggled={loadStudents}
      />

      <EnrollmentDialog
        open={isEnrollmentDialogOpen}
        onClose={handleEnrollmentClose}
        student={selectedStudent}
        onEnrolled={loadStudents}
      />
    </PageContainer>
  )
}
