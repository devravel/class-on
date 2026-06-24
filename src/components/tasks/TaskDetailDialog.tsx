'use client'

import {
  Calendar,
  CheckCircle2,
  Clock,
  Loader2,
  Pencil,
  Trash2,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { tasksApi } from '@/lib/api'
import { cn } from '@/lib/utils'
import type { Task, TaskStudentSubmission } from '@/types/task'

function formatDateTimeForInput(value: string): string {
  const date = new Date(value)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

function getSubmissionStatusLabel(status: string): string {
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

function getSubmissionStatusStyle(status: string): string {
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

interface TaskDetailDialogProps {
  taskId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdated: () => void
  onDeleted: () => void
}

export function TaskDetailDialog({
  taskId,
  open,
  onOpenChange,
  onUpdated,
  onDeleted,
}: TaskDetailDialogProps) {
  const [task, setTask] = useState<Task | null>(null)
  const [submissions, setSubmissions] = useState<TaskStudentSubmission[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    deadline: '',
    status: 'OPEN' as 'OPEN' | 'CLOSED',
  })

  const loadTaskDetails = useCallback(async () => {
    if (!taskId) return

    try {
      setIsLoading(true)
      const [taskData, submissionsData] = await Promise.all([
        tasksApi.getById(taskId),
        tasksApi.getSubmissions(taskId),
      ])
      setTask(taskData)
      setSubmissions(submissionsData.submissions)
      setEditForm({
        title: taskData.title,
        description: taskData.description,
        deadline: formatDateTimeForInput(taskData.deadline),
        status: taskData.status === 'CLOSED' ? 'CLOSED' : 'OPEN',
      })
    } catch {
      toast.error('Erro ao carregar detalhes da tarefa.')
      onOpenChange(false)
    } finally {
      setIsLoading(false)
    }
  }, [onOpenChange, taskId])

  useEffect(() => {
    if (open && taskId) {
      setIsEditing(false)
      setShowDeleteConfirm(false)
      void loadTaskDetails()
    } else if (!open) {
      setTask(null)
      setSubmissions([])
      setIsEditing(false)
      setShowDeleteConfirm(false)
    }
  }, [loadTaskDetails, open, taskId])

  const handleSave = async () => {
    if (!taskId || !task) return

    if (editForm.title.length < 5 || editForm.description.length < 10) {
      toast.error('Preencha título (mín. 5) e descrição (mín. 10 caracteres).')
      return
    }
    if (!editForm.deadline) {
      toast.error('Informe a data de entrega.')
      return
    }

    try {
      setIsSaving(true)
      const updated = await tasksApi.update(taskId, {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        deadline: new Date(editForm.deadline).toISOString(),
        status: editForm.status,
      })
      setTask(updated)
      setIsEditing(false)
      toast.success('Tarefa atualizada com sucesso!')
      onUpdated()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar tarefa.'
      toast.error(message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!taskId) return

    try {
      setIsDeleting(true)
      await tasksApi.delete(taskId)
      toast.success('Tarefa excluída com sucesso!')
      onOpenChange(false)
      onDeleted()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao excluir tarefa.'
      toast.error(message)
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const submittedCount = submissions.filter(
    (item) =>
      item.submission.status === 'SUBMITTED' ||
      item.submission.status === 'LATE',
  ).length

  const hasSubmissions = submittedCount > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : task ? (
          <>
            <DialogHeader>
              <DialogTitle>{isEditing ? 'Editar Tarefa' : task.title}</DialogTitle>
              <DialogDescription>
                {isEditing
                  ? 'Altere os dados da tarefa e salve as mudanças.'
                  : 'Detalhes da tarefa e acompanhamento de entregas.'}
              </DialogDescription>
            </DialogHeader>

            {isEditing ? (
              <div className="grid gap-4 py-2">
                <div>
                  <Label htmlFor="edit-task-title">Título</Label>
                  <Input
                    id="edit-task-title"
                    value={editForm.title}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, title: e.target.value }))
                    }
                    required
                    minLength={5}
                    maxLength={255}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-task-description">Descrição</Label>
                  <Textarea
                    id="edit-task-description"
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    required
                    minLength={10}
                    rows={4}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-task-deadline">Data de Entrega</Label>
                  <Input
                    id="edit-task-deadline"
                    type="datetime-local"
                    value={editForm.deadline}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, deadline: e.target.value }))
                    }
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-task-status">Status</Label>
                  <select
                    id="edit-task-status"
                    value={editForm.status}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        status: e.target.value as 'OPEN' | 'CLOSED',
                      }))
                    }
                    className="mt-1 block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-text-primary focus:border-ring focus:outline-none focus:ring-[3px] focus:ring-ring/20"
                  >
                    <option value="OPEN">Aberta</option>
                    <option value="CLOSED">Fechada</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="space-y-4 py-2">
                <div className="flex flex-wrap items-center gap-3 text-sm text-text-secondary">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar size={14} />
                    Entrega: {formatDateTime(task.deadline)}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock size={14} />
                    Criada em: {formatDateTime(task.created_at)}
                  </span>
                  <span
                    className={cn(
                      'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
                      task.status === 'OPEN'
                        ? 'bg-success/10 text-success'
                        : 'bg-neutral-200 text-neutral-600',
                    )}
                  >
                    {task.status === 'OPEN' ? 'Aberta' : 'Fechada'}
                  </span>
                </div>

                <div className="rounded-lg border border-border bg-neutral-50 p-4">
                  <p className="whitespace-pre-wrap text-sm text-text-primary">
                    {task.description}
                  </p>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-text-primary">
                      Entregas dos Alunos
                    </h4>
                    <span className="text-xs text-text-secondary">
                      {submittedCount} de {submissions.length} entregues
                    </span>
                  </div>

                  {submissions.length === 0 ? (
                    <p className="py-4 text-center text-sm text-text-secondary">
                      Nenhum aluno vinculado a esta tarefa.
                    </p>
                  ) : (
                    <ul className="max-h-56 divide-y divide-border overflow-y-auto rounded-lg border border-border">
                      {submissions.map((item) => (
                        <li
                          key={item.student.id}
                          className="flex items-start justify-between gap-3 px-3 py-2.5"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-text-primary">
                              {item.student.full_name}
                            </p>
                            <p className="text-xs text-text-secondary">
                              RM {item.student.rm}
                            </p>
                            {item.submission.observation && (
                              <p className="mt-1 text-xs text-text-secondary">
                                {item.submission.observation}
                              </p>
                            )}
                          </div>
                          <div className="shrink-0 text-right">
                            <span
                              className={cn(
                                'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
                                getSubmissionStatusStyle(item.submission.status),
                              )}
                            >
                              {getSubmissionStatusLabel(item.submission.status)}
                            </span>
                            {item.submission.submitted_at && (
                              <p className="mt-1 text-[10px] text-text-secondary">
                                {formatDateTime(item.submission.submitted_at)}
                              </p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            {showDeleteConfirm && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                <p className="text-sm text-text-primary">
                  Tem certeza que deseja excluir esta tarefa?
                  {hasSubmissions &&
                    ' Esta tarefa possui entregas e não poderá ser excluída.'}
                </p>
                <div className="mt-3 flex gap-2">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    disabled={isDeleting || hasSubmissions}
                    onClick={handleDelete}
                  >
                    {isDeleting ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Trash2 size={14} />
                    )}
                    Confirmar exclusão
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isDeleting}
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}

            <DialogFooter className="gap-2 sm:gap-0">
              {isEditing ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSaving}
                    onClick={() => {
                      setIsEditing(false)
                      if (task) {
                        setEditForm({
                          title: task.title,
                          description: task.description,
                          deadline: formatDateTimeForInput(task.deadline),
                          status: task.status === 'CLOSED' ? 'CLOSED' : 'OPEN',
                        })
                      }
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="button" disabled={isSaving} onClick={handleSave}>
                    {isSaving ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <CheckCircle2 size={16} />
                    )}
                    Salvar alterações
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    className="text-destructive hover:text-destructive"
                    disabled={showDeleteConfirm}
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <Trash2 size={16} />
                    Excluir
                  </Button>
                  <Button type="button" onClick={() => setIsEditing(true)}>
                    <Pencil size={16} />
                    Editar
                  </Button>
                </>
              )}
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
