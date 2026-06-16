'use client'

import {
  AlertCircle,
  BarChart2,
  ChevronRight,
  Clock,
  ListTodo,
  Megaphone,
} from 'lucide-react'

import { ListCard } from '@/components/dashboard/ListCard'
import { Section } from '@/components/dashboard/Section'
import { PageContainer } from '@/components/layout/PageContainer'
import { UpcomingEventsCard } from '@/components/events/UpcomingEventsCard'

const recentGrades = [
  { id: 1, subject: 'Matemática', grade: 8.5, bimester: '2º Bimestre', status: 'approved' },
  { id: 2, subject: 'Português', grade: 9.0, bimester: '2º Bimestre', status: 'approved' },
  { id: 3, subject: 'Ciências', grade: 7.0, bimester: '2º Bimestre', status: 'approved' },
  { id: 4, subject: 'História', grade: 6.5, bimester: '2º Bimestre', status: 'watch' },
  { id: 5, subject: 'Ed. Física', grade: 9.5, bimester: '2º Bimestre', status: 'approved' },
]

const attendance = [
  { id: 1, subject: 'Matemática', percentage: 92, present: 46, total: 50 },
  { id: 2, subject: 'Português', percentage: 88, present: 44, total: 50 },
  { id: 3, subject: 'Ciências', percentage: 96, present: 48, total: 50 },
  { id: 4, subject: 'História', percentage: 80, present: 40, total: 50 },
]

const pendingTasks = [
  { id: 1, title: 'Lista de exercícios — Cap. 5', subject: 'Matemática', dueDate: '10/01', status: 'pending' },
  { id: 2, title: 'Redação — Tema: Meio Ambiente', subject: 'Português', dueDate: '12/01', status: 'pending' },
  { id: 3, title: 'Relatório de experimento', subject: 'Ciências', dueDate: '05/01', status: 'late' },
]

const announcements = [
  { id: 1, title: 'Prova de Matemática — semana que vem', date: '03/01', author: 'Prof. João Silva' },
  { id: 2, title: 'Entrega de autorização para visita', date: '02/01', author: 'Secretaria' },
  { id: 3, title: 'Ano letivo 2025 — ciclo institucional ativo', date: '01/01', author: 'Secretaria' },
]

const gradeColor: Record<string, string> = {
  approved: 'text-success',
  watch: 'text-warning',
  failed: 'text-danger',
}

const taskBadge: Record<string, string> = {
  pending: 'bg-warning/10 text-warning',
  late: 'bg-danger/10 text-danger',
  done: 'bg-success/10 text-success',
}

const taskLabel: Record<string, string> = {
  pending: 'Pendente',
  late: 'Atrasada',
  done: 'Entregue',
}

export default function AlunoPage() {
  const lateCount = pendingTasks.filter((t) => t.status === 'late').length

  return (
    <PageContainer>
      {/* Page heading */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Meu Painel</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Acompanhe seu desempenho acadêmico
        </p>
      </div>

      {/* Top row: Notas + Frequência */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Notas recentes */}
        <Section
          title="Notas Recentes"
          action={
            <a
              href="/aluno/notas"
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              Ver todas <ChevronRight size={14} />
            </a>
          }
        >
          <ListCard
            items={recentGrades}
            renderItem={(item) => (
              <div className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-neutral-100">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-component bg-primary/10">
                    <BarChart2 size={14} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">{item.subject}</p>
                    <p className="text-xs text-text-secondary">{item.bimester}</p>
                  </div>
                </div>
                <span className={`text-lg font-bold ${gradeColor[item.status] ?? 'text-text-primary'}`}>
                  {item.grade.toFixed(1)}
                </span>
              </div>
            )}
          />
        </Section>

        {/* Frequência */}
        <Section
          title="Frequência"
          action={
            <a
              href="/aluno/frequencia"
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              Ver detalhes <ChevronRight size={14} />
            </a>
          }
        >
          <ListCard
            items={attendance}
            renderItem={(item) => (
              <div className="px-4 py-3 transition-colors hover:bg-neutral-100">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-text-primary">{item.subject}</span>
                  <span
                    className={`text-sm font-semibold ${item.percentage >= 75 ? 'text-success' : 'text-danger'}`}
                  >
                    {item.percentage}%
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-neutral-200">
                  <div
                    className={`h-full rounded-full transition-all ${item.percentage >= 75 ? 'bg-success' : 'bg-danger'}`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-text-secondary">
                  {item.present}/{item.total} aulas
                </p>
              </div>
            )}
          />
        </Section>
      </div>

      {/* Bottom row: Próximos Eventos + Tarefas + Comunicados */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Próximos Eventos — 1/3 */}
        <div>
          <UpcomingEventsCard role="ALUNO" limit={4} />
        </div>

        {/* Tarefas pendentes — 1/3 */}
        <div>
          <Section
            title="Tarefas Pendentes"
            description={
              lateCount > 0
                ? `${lateCount} tarefa${lateCount > 1 ? 's' : ''} atrasada${lateCount > 1 ? 's' : ''}`
                : `${pendingTasks.length} tarefa${pendingTasks.length !== 1 ? 's' : ''} aguardando`
            }
            action={
              <a
                href="/aluno/tarefas"
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                Ver todas <ChevronRight size={14} />
              </a>
            }
          >
            <ListCard
              items={pendingTasks.slice(0, 3)} // Reduzir para caber no layout
              emptyMessage="Nenhuma tarefa pendente."
              renderItem={(item) => (
                <div className="flex items-start justify-between gap-4 px-4 py-3 transition-colors hover:bg-neutral-100">
                  <div className="flex min-w-0 items-start gap-3">
                    {item.status === 'late' ? (
                      <AlertCircle size={14} className="mt-0.5 shrink-0 text-danger" />
                    ) : (
                      <ListTodo size={14} className="mt-0.5 shrink-0 text-text-secondary" />
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-text-primary">{item.title}</p>
                      <p className="text-xs text-text-secondary">{item.subject}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${taskBadge[item.status] ?? ''}`}
                    >
                      {taskLabel[item.status]}
                    </span>
                  </div>
                </div>
              )}
            />
          </Section>
        </div>

        {/* Comunicados — 1/3 */}
        <div>
          <Section
            title="Comunicados"
            action={
              <a
                href="/aluno/comunicados"
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                Ver todos <ChevronRight size={14} />
              </a>
            }
          >
            <ListCard
              items={announcements.slice(0, 3)} // Reduzir para caber no layout
              renderItem={(item) => (
                <div className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-neutral-100">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-component bg-primary/10">
                    <Megaphone size={14} className="text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-snug text-text-primary">
                      {item.title}
                    </p>
                    <span className="flex items-center gap-1 text-xs text-text-secondary">
                      <Clock size={10} />
                      {item.date} · {item.author}
                    </span>
                  </div>
                </div>
              )}
            />
          </Section>
        </div>
      </div>
    </PageContainer>
  )
}
