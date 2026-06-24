'use client'

import { Calendar, ListTodo, Loader2, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader'
import { InlineError } from '@/components/dashboard/InlineError'
import { TaskDetailDialog } from '@/components/tasks/TaskDetailDialog'
import { PageContainer } from '@/components/layout/PageContainer'
import { Input } from '@/components/ui/input'
import { tasksApi } from '@/lib/api/tasks'
import { getClassLabelLoose } from '@/lib/class-utils'
import { cn } from '@/lib/utils'
import { Task } from '@/types/task'

export default function ProfessorTarefasPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [search, setSearch] = useState('')
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await tasksApi.list()
        const sorted = (Array.isArray(data) ? data : []).sort(
          (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime(),
        )
        setTasks(sorted)
      } catch {
        setError('Não foi possível carregar suas tarefas.')
      } finally {
        setIsLoading(false)
      }
    }

    void load()
  }, [])

  const filteredTasks = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return tasks

    return tasks.filter((task) => {
      const classLabel = task.assignments?.classes
        ? getClassLabelLoose(task.assignments.classes).toLowerCase()
        : ''
      const subjectName = task.assignments?.subjects.name.toLowerCase() ?? ''
      const deadline = new Date(task.deadline).toLocaleDateString('pt-BR')

      return (
        task.title.toLowerCase().includes(q) ||
        classLabel.includes(q) ||
        subjectName.includes(q) ||
        deadline.includes(q)
      )
    })
  }, [tasks, search])

  return (
    <PageContainer>
      <DashboardPageHeader title="Tarefas" />

      <div className="mb-6">
        <div className="relative max-w-lg">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
          />
          <Input
            type="search"
            placeholder="Filtrar por título, turma, disciplina ou prazo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-full pl-9"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <InlineError message={error} />
      ) : filteredTasks.length === 0 ? (
        <div className="rounded-card bg-surface py-16 text-center shadow-light ring-1 ring-border">
          <ListTodo size={32} className="mx-auto mb-3 text-text-secondary" />
          <p className="text-sm text-text-secondary">Nenhuma tarefa encontrada.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredTasks.map((task) => {
            const isOverdue = new Date(task.deadline) < new Date() && task.status === 'OPEN'
            const classLabel = task.assignments?.classes
              ? getClassLabelLoose(task.assignments.classes)
              : null

            return (
              <button
                key={task.id}
                type="button"
                onClick={() => setSelectedTaskId(task.id)}
                className={cn(
                  'flex flex-col gap-3 rounded-card bg-surface p-5 text-left shadow-light ring-1 ring-border transition-colors hover:bg-neutral-50',
                  isOverdue && 'ring-danger/30',
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-component bg-primary/10">
                    <ListTodo size={18} className="text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-semibold text-text-primary">
                      {task.title}
                    </p>
                    {classLabel && (
                      <p className="mt-1 truncate text-xs text-text-secondary">{classLabel}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-text-secondary">
                  <Calendar size={12} />
                  <span>Prazo: {new Date(task.deadline).toLocaleDateString('pt-BR')}</span>
                </div>

                {task.assignments?.subjects.name && (
                  <span className="w-fit rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                    {task.assignments.subjects.name}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}

      <TaskDetailDialog
        taskId={selectedTaskId}
        open={selectedTaskId != null}
        onOpenChange={(open) => {
          if (!open) setSelectedTaskId(null)
        }}
        onUpdated={async () => {
          try {
            const data = await tasksApi.list()
            const sorted = (Array.isArray(data) ? data : []).sort(
              (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime(),
            )
            setTasks(sorted)
          } catch {
            // ignore refresh errors
          }
        }}
        onDeleted={async () => {
          setSelectedTaskId(null)
          try {
            const data = await tasksApi.list()
            const sorted = (Array.isArray(data) ? data : []).sort(
              (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime(),
            )
            setTasks(sorted)
          } catch {
            // ignore refresh errors
          }
        }}
      />
    </PageContainer>
  )
}
