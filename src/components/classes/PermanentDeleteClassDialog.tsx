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
import { classesApi } from '@/lib/api'
import { Class, formatClassShortLabel, SHIFT_LABELS, Shift } from '@/types/class'

interface PermanentDeleteClassDialogProps {
  open: boolean
  onClose: () => void
  classRecord: Class | null
  onDeleted: () => void
}

export function PermanentDeleteClassDialog({
  open,
  onClose,
  classRecord,
  onDeleted,
}: PermanentDeleteClassDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!classRecord) return

    try {
      setIsDeleting(true)
      setError(null)
      await classesApi.permanentDelete(classRecord.id)
      onDeleted()
      onClose()
    } catch (err: unknown) {
      console.error('Erro ao excluir turma:', err)
      const message = err instanceof Error ? err.message : undefined
      setError(
        message || 'Não foi possível excluir a turma. Tente novamente.',
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

  if (!classRecord) return null

  const className = `${formatClassShortLabel(classRecord)} - ${SHIFT_LABELS[classRecord.shift as Shift] ?? classRecord.shift}`

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-component bg-destructive/10">
              <AlertTriangle size={20} className="text-destructive" />
            </div>
            <span>Excluir turma permanentemente</span>
          </DialogTitle>
          <DialogDescription className="pt-2">
            Você está prestes a excluir permanentemente a turma:
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-component border border-border bg-muted p-4">
          <p className="text-sm font-semibold text-text-primary">{className}</p>
        </div>

        <div className="rounded-component border border-destructive/20 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">
            Esta ação é irreversível. Todos os dados vinculados à turma —
            matrículas, notas, frequência, tarefas e eventos — serão removidos
            do sistema. Os alunos cadastrados não serão excluídos.
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
            {isDeleting ? 'Excluindo...' : 'Excluir permanentemente'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
