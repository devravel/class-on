'use client'

import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  ListTodo,
  Loader2,
  Send,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

import { PageContainer } from '@/components/layout/PageContainer'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { tasksApi } from '@/lib/api'
import { cn } from '@/lib/utils'
import { StudentTask } from '@/types/task'

type TaskFilter = 'all' | 'pending' | 'submitted'

const FILTER_OPTIONS: { id: TaskFilter; label: string }[] = [
  { id: 'all', label: 'Todas' },
  { id: 'pending', label: 'Pendentes' },
  { id: 'submitted', label: 'Entregues' },
]

function getSubmissionStatus(task: StudentTask): string {
  const submission = task.task_submissions[0]
  if (!submission) return 'PENDING'
  return submission.status
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'SUBMITTED':
      return 'Entregue'
    case 'LATE':
      return 'Entregue com atraso'
    case 'PENDING':
    default:
      return 'Pendente'
  }
}

function getStatusStyle(status: string): string {
  switch (status) {
    case 'SUBMITTED':
      return 'bg-success/10 text-success'
    case 'LATE':
      return 'bg-warning/10 text-warning'
    case 'PENDING':
    default:
      return 'bg-neutral-200 text-neutral-700'
  }
}

function isTaskOverdue(task: StudentTask): boolean {
  const submission = task.task_submissions[0]
  if (submission) return false
  return new Date(task.deadline) < new Date()
}

function formatDeadline(deadline: string): string {
  return new Date(deadline).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function AlunoTarefasPage() {
  const [tasks, setTasks] = useState<StudentTask[]>([])
  const [filter, setFilter] = useState<TaskFilter>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedTask, setSelectedTask] = useState<StudentTask | null>(null)
  const [responseText, setResponseText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadTasks = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await tasksApi.listMyTasks()
      setTasks(Array.isArray(data) ? data : [])
    } catch {
      setError('Não foi possível carregar suas tarefas. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  const filteredTasks = tasks.filter((task) => {
    const status = getSubmissionStatus(task)
    if (filter === 'pending') return status === 'PENDING'
    if (filter === 'submitted') return status === 'SUBMITTED' || status === 'LATE'
    return true
  })

  const openSubmitModal = (task: StudentTask) => {
    setSelectedTask(task)
    setResponseText(task.task_submissions[0]?.observation ?? '')
  }

  const closeModal = () => {
    if (isSubmitting) return
    setSelectedTask(null)
    setResponseText('')
  }

  const handleSubmit = async () => {
    if (!selectedTask) return

    const trimmed = responseText.trim()
    if (!trimmed) {
      toast.error('Escreva sua resposta antes de enviar.')
      return
    }

    try {
      setIsSubmitting(true)
      await tasksApi.submit(selectedTask.id, { observation: trimmed })
      toast.success('Tarefa enviada com sucesso!')
      closeModal()
      await loadTasks()
    } catch {
      toast.error('Não foi possível enviar a tarefa. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const pendingCount = tasks.filter((t) => getSubmissionStatus(t) === 'PENDING').length
  const overdueCount = tasks.filter(isTaskOverdue).length

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Minhas Tarefas</h1>
        <p className="mt-1 text-sm text-text-secondary">
          {pendingCount > 0
            ? `${pendingCount} tarefa${pendingCount !== 1 ? 's' : ''} aguardando entrega`
            : 'Todas as tarefas foram entregues'}
          {overdueCount > 0 && (
            <span className="ml-1 text-danger">
              · {overdueCount} atrasada{overdueCount !== 1 ? 's' : ''}
            </span>
          )}
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Filtros */}
      <div className="mb-6 flex flex-wrap gap-2">
        {FILTER_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setFilter(option.id)}
            className={cn(
              'rounded-full px-4 py-1.5 text-xs font-medium transition-colors',
              filter === option.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-neutral-100 text-text-secondary hover:bg-neutral-200',
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Lista de tarefas */}
      {filteredTasks.length === 0 ? (
        <div className="rounded-card border border-border bg-neutral-50 p-12 text-center">
          <ListTodo className="mx-auto mb-3 h-10 w-10 text-text-secondary/50" />
          <p className="text-sm font-medium text-text-primary">
            {filter === 'all' ? 'Nenhuma tarefa atribuída' : 'Nenhuma tarefa neste filtro'}
          </p>
          <p className="mt-1 text-xs text-text-secondary">
            Atividades dos seus professores aparecerão aqui.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const submissionStatus = getSubmissionStatus(task)
            const overdue = isTaskOverdue(task)
            const submission = task.task_submissions[0]

            return (
              <button
                key={task.id}
                type="button"
                onClick={() => openSubmitModal(task)}
                className="w-full rounded-card border border-border bg-background p-4 text-left shadow-sm transition-all hover:border-primary/30 hover:shadow-md sm:p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-text-primary">{task.title}</h3>
                      {overdue && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-danger/10 px-2 py-0.5 text-xs font-medium text-danger">
                          <AlertCircle size={12} />
                          Atrasada
                        </span>
                      )}
                    </div>
                    <p className="mb-2 line-clamp-2 text-xs text-text-secondary">
                      {task.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-text-secondary">
                      <span className="font-medium text-primary">
                        {task.assignments.subjects.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        Prazo: {formatDeadline(task.deadline)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        Prof. {task.assignments.teachers.full_name}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-1 text-xs font-medium',
                        getStatusStyle(submissionStatus),
                      )}
                    >
                      {getStatusLabel(submissionStatus)}
                    </span>
                    {submission && (
                      <span className="flex items-center gap-1 text-xs text-text-secondary">
                        <CheckCircle2 size={12} className="text-success" />
                        {new Date(submission.submitted_at).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Modal de entrega */}
      <Dialog open={selectedTask !== null} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="max-w-lg">
          {selectedTask && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedTask.title}</DialogTitle>
                <DialogDescription>
                  {selectedTask.assignments.subjects.name} · Prazo:{' '}
                  {formatDeadline(selectedTask.deadline)}
                </DialogDescription>
              </DialogHeader>

              <div className="rounded-lg bg-neutral-50 p-3 text-sm text-text-secondary">
                {selectedTask.description}
              </div>

              <div className="space-y-2">
                <Label htmlFor="task-response">Sua resposta</Label>
                <Textarea
                  id="task-response"
                  placeholder="Digite aqui sua resposta ou observações sobre a tarefa..."
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  rows={6}
                  maxLength={5000}
                  disabled={selectedTask.status !== 'OPEN'}
                />
                <p className="text-right text-xs text-text-secondary">
                  {responseText.length}/5000
                </p>
              </div>

              {selectedTask.task_submissions[0] && (
                <div className="rounded-lg border border-success/20 bg-success/5 p-3 text-xs text-text-secondary">
                  <span className="font-medium text-success">Última entrega: </span>
                  {new Date(selectedTask.task_submissions[0].submitted_at).toLocaleString('pt-BR')}
                  {selectedTask.task_submissions[0].observation && (
                    <p className="mt-1 italic">
                      &ldquo;{selectedTask.task_submissions[0].observation}&rdquo;
                    </p>
                  )}
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={closeModal} disabled={isSubmitting}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || selectedTask.status !== 'OPEN'}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Send size={14} className="mr-2" />
                      {selectedTask.task_submissions[0] ? 'Atualizar entrega' : 'Enviar tarefa'}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}
