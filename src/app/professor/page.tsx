'use client'

import {
  BookOpen,
  CheckSquare,
  ChevronRight,
  ClipboardList,
  ListTodo,
  Loader2,
  Plus,
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import { InlineError } from '@/components/dashboard/InlineError'
import { ListCard } from '@/components/dashboard/ListCard'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { Section } from '@/components/dashboard/Section'
import { PageContainer } from '@/components/layout/PageContainer'
import { UpcomingEventsCard } from '@/components/events/UpcomingEventsCard'
import { assignmentsApi, authApi } from '@/lib/api'
import { tasksApi } from '@/lib/api/tasks'
import { getClassLabel } from '@/lib/class-utils'
import { Assignment } from '@/types/assignment'
import { Task } from '@/types/task'

const quickActions = [
  { label: 'Lançar Nota', icon: ClipboardList, href: '/professor/turmas', variant: 'default' as const },
  { label: 'Chamada', icon: CheckSquare, href: '/professor/turmas', variant: 'outline' as const },
  { label: 'Nova Tarefa', icon: Plus, href: '/professor/turmas', variant: 'outline' as const },
  { label: 'Ver Turmas', icon: BookOpen, href: '/professor/turmas', variant: 'outline' as const },
]

export default function ProfessorPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [assignmentsError, setAssignmentsError] = useState<string | null>(null)
  const [tasksError, setTasksError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      setAssignmentsError(null)
      setTasksError(null)

      try {
        const me = await authApi.getMe()
        if (!me.teacher) {
          setAssignmentsError('Perfil de professor não encontrado.')
          return
        }

        try {
          const assignmentsData = await assignmentsApi.getByTeacher(me.teacher.id)
          setAssignments(assignmentsData)
        } catch {
          setAssignmentsError('Não foi possível carregar suas turmas.')
        }

        try {
          const tasksData = await tasksApi.list()
          setTasks(Array.isArray(tasksData) ? tasksData.slice(0, 5) : [])
        } catch {
          setTasksError('Não foi possível carregar suas tarefas.')
        }
      } catch {
        setAssignmentsError('Não foi possível carregar seus dados.')
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [])

  return (
    <PageContainer>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Meu Painel</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Bem-vindo de volta. Aqui está sua visão do dia.
        </p>
      </div>

      <Section title="Ações Rápidas" className="mb-8">
        <QuickActions actions={quickActions} />
      </Section>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {assignmentsError && !isLoading && (
        <InlineError message={assignmentsError} className="mb-6" />
      )}

      {!isLoading && !assignmentsError && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div>
            <Section
              title="Minhas Turmas"
              description={`${assignments.length} turma(s) atribuída(s)`}
              action={
                <Link
                  href="/professor/turmas"
                  className="flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  Ver todas <ChevronRight size={14} />
                </Link>
              }
            >
              <ListCard
                items={assignments}
                emptyMessage="Nenhuma turma atribuída. Entre em contato com a secretaria."
                renderItem={(item) => (
                  <Link
                    href={`/professor/turmas/${item.id}`}
                    className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-neutral-100"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-component bg-primary/10">
                        <BookOpen size={14} className="text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-text-primary">
                          {getClassLabel(item.classes)}
                        </p>
                        <p className="truncate text-xs text-text-secondary">
                          {item.subjects.name}
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="shrink-0 text-text-secondary" />
                  </Link>
                )}
              />
            </Section>
          </div>

          <div>
            <UpcomingEventsCard role="PROFESSOR" limit={4} />
          </div>

          <div>
            <Section
              title="Tarefas Criadas"
              description={`${tasks.length} tarefa(s) recente(s)`}
              action={
                <Link
                  href="/professor/turmas"
                  className="flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  Gerenciar <ChevronRight size={14} />
                </Link>
              }
            >
              {tasksError ? (
                <InlineError message={tasksError} />
              ) : (
                <ListCard
                  items={tasks}
                  emptyMessage="Nenhuma tarefa criada ainda."
                  renderItem={(item) => (
                    <div className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-neutral-100">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-component bg-primary/10">
                          <ListTodo size={14} className="text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-text-primary">{item.title}</p>
                          <p className="text-xs text-text-secondary">
                            Prazo: {new Date(item.deadline).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                />
              )}
            </Section>
          </div>
        </div>
      )}
    </PageContainer>
  )
}
