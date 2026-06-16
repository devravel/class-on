'use client'

import {
  BookOpen,
  ListOrdered,
  CheckSquare,
  ChevronRight,
  ClipboardList,
  Clock,
  ListTodo,
  Plus,
  Users,
} from 'lucide-react'

import { ListCard } from '@/components/dashboard/ListCard'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { Section } from '@/components/dashboard/Section'
import { PageContainer } from '@/components/layout/PageContainer'
import { UpcomingEventsCard } from '@/components/events/UpcomingEventsCard'

const assignedClasses = [
  { id: 1, name: '9º Ano A', subject: 'Matemática', students: 32, shift: 'Matutino', nextLesson: 'Hoje, 08:00' },
  { id: 2, name: '8º Ano B', subject: 'Matemática', students: 28, shift: 'Vespertino', nextLesson: 'Hoje, 14:00' },
  { id: 3, name: '7º Ano C', subject: 'Matemática', students: 30, shift: 'Matutino', nextLesson: 'Amanhã, 08:00' },
]

const todaySchedule = [
  { id: 1, time: '08:00', class: '9º Ano A', room: 'Sala 12', status: 'ongoing' },
  { id: 2, time: '09:00', class: '8º Ano B', room: 'Sala 08', status: 'pending' },
  { id: 3, time: '14:00', class: '7º Ano C', room: 'Sala 15', status: 'pending' },
]

const quickActions = [
  { label: 'Lançar Nota', icon: ClipboardList, href: '/professor/notas', variant: 'default' as const },
  { label: 'Chamada', icon: CheckSquare, href: '/professor/chamada', variant: 'outline' as const },
  { label: 'Nova Tarefa', icon: Plus, href: '/professor/tarefas/nova', variant: 'outline' as const },
  { label: 'Ver Turmas', icon: BookOpen, href: '/professor/turmas', variant: 'outline' as const },
]

const statusBadge: Record<string, string> = {
  ongoing: 'bg-success/10 text-success',
  pending: 'bg-neutral-200 text-neutral-600',
  done: 'bg-brand-100 text-brand-700',
}

const statusLabel: Record<string, string> = {
  ongoing: 'Em andamento',
  pending: 'Pendente',
  done: 'Concluído',
}

export default function ProfessorPage() {
  return (
    <PageContainer>
      {/* Page heading */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Meu Painel</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Bem-vindo de volta. Aqui está sua visão do dia.
        </p>
      </div>

      {/* Quick Actions */}
      <Section title="Ações Rápidas" className="mb-8">
        <QuickActions actions={quickActions} />
      </Section>

      {/* Turmas + Próximos Eventos + Agenda */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Turmas atribuídas — 1/3 */}
        <div>
          <Section
            title="Minhas Turmas"
            description={`${assignedClasses.length} turmas atribuídas`}
            action={
              <a
                href="/professor/turmas"
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                Ver todas <ChevronRight size={14} />
              </a>
            }
          >
            <ListCard
              items={assignedClasses}
              renderItem={(item) => (
                <div className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-neutral-100">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-component bg-primary/10">
                      <BookOpen size={14} className="text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-text-primary">{item.name}</p>
                      <p className="truncate text-xs text-text-secondary">
                        {item.subject}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 pl-4 text-right">
                    <span className="text-xs text-text-secondary">
                      {item.students} alunos
                    </span>
                  </div>
                </div>
              )}
            />
          </Section>
        </div>

        {/* Próximos Eventos — 1/3 */}
        <div>
          <UpcomingEventsCard role="PROFESSOR" limit={4} />
        </div>

        {/* Agenda do dia — 1/3 */}
        <div>
          <Section
            title="Agenda de Hoje"
            action={
              <a
                href="/professor/agenda"
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <ListOrdered size={14} />
                <span>Horários</span>
              </a>
            }
          >
            <ListCard
              items={todaySchedule}
              renderItem={(item) => (
                <div className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-neutral-100">
                  <span className="w-10 shrink-0 text-sm font-semibold text-text-primary">
                    {item.time}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-text-primary">{item.class}</p>
                    <p className="text-xs text-text-secondary">{item.room}</p>
                  </div>
                </div>
              )}
            />
          </Section>
        </div>
      </div>

      {/* Tarefas pendentes de revisão */}
      <div className="mt-6">
        <Section
          title="Tarefas para Revisar"
          description="Entregas aguardando sua avaliação"
          action={
            <a
              href="/professor/tarefas"
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              Ver todas <ChevronRight size={14} />
            </a>
          }
        >
          <ListCard
            items={[
              { id: 1, title: 'Lista de exercícios — Cap. 5', class: '9º Ano A', submissions: 28, total: 32 },
              { id: 2, title: 'Trabalho em grupo — Frações', class: '8º Ano B', submissions: 25, total: 28 },
              { id: 3, title: 'Atividade de revisão', class: '7º Ano C', submissions: 30, total: 30 },
            ]}
            renderItem={(item) => (
              <div className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-neutral-100">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-component bg-primary/10">
                    <ListTodo size={14} className="text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-text-primary">{item.title}</p>
                    <p className="text-xs text-text-secondary">{item.class}</p>
                  </div>
                </div>
                <div className="shrink-0 pl-4 text-right">
                  <span className="text-sm font-semibold text-text-primary">
                    {item.submissions}
                    <span className="font-normal text-text-secondary">/{item.total}</span>
                  </span>
                  <p className="text-xs text-text-secondary">entregas</p>
                </div>
              </div>
            )}
          />
        </Section>
      </div>
    </PageContainer>
  )
}
