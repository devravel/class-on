'use client'

import { AlertTriangle, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { assignmentsApi } from '@/lib/api'
import { getClassLabel } from '@/lib/class-utils'
import { Assignment } from '@/types/assignment'

interface DeleteAssignmentDialogProps {
  open: boolean
  onClose: () => void
  assignment: Assignment | null
  onDeleted: () => void
}

export function DeleteAssignmentDialog({
  open,
  onClose,
  assignment,
  onDeleted,
}: DeleteAssignmentDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!assignment) return

    try {
      setIsDeleting(true)
      setError(null)
      await assignmentsApi.delete(assignment.id)
      onDeleted()
      onClose()
    } catch (err: unknown) {
      console.error('Erro ao excluir atribuição:', err)
      const message = err instanceof Error ? err.message : undefined
      setError(
        message || 'Não foi possível excluir a atribuição. Tente novamente.',
      )
    } finally {
      setIsDeleting(false)
    }
  }

  const handleClose = () => {
    if (!isDeleting) {
      setError(null)
      onClose()
    }
  }

  if (!assignment) return null

  const classLabel = getClassLabel(assignment.classes)

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-component bg-destructive/10">
              <AlertTriangle size={20} className="text-destructive" />
            </div>
            <span>Confirmar exclusão</span>
          </DialogTitle>
          <DialogDescription className="pt-2">
            Você está prestes a excluir a atribuição:
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-component border border-border bg-muted p-4 space-y-2">
          <div>
            <p className="text-xs text-text-secondary">Professor:</p>
            <p className="text-sm font-semibold text-text-primary">
              {assignment.teachers.full_name}
            </p>
          </div>
          <div>
            <p className="text-xs text-text-secondary">Disciplina:</p>
            <p className="text-sm font-semibold text-text-primary">
              {assignment.subjects.name}
            </p>
          </div>
          <div>
            <p className="text-xs text-text-secondary">Turma:</p>
            <p className="text-sm font-semibold text-text-primary">
              {classLabel}
            </p>
          </div>
        </div>

        <div className="rounded-component border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm text-amber-800">
            ⚠️ Esta ação não poderá ser desfeita. Se esta atribuição possuir
            notas, aulas ou tarefas vinculadas, a exclusão será impedida.
          </p>
        </div>

        {error && (
          <div className="rounded-component border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 size={16} />
            {isDeleting ? 'Excluindo...' : 'Confirmar exclusão'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
