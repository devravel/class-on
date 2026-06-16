'use client'

import { PowerOff } from 'lucide-react'
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
import { studentsApi } from '@/lib/api'
import { Student } from '@/types/student'

interface ToggleStudentDialogProps {
  open: boolean
  onClose: () => void
  student: Student | null
  onToggled: () => void
}

export function ToggleStudentDialog({
  open,
  onClose,
  student,
  onToggled,
}: ToggleStudentDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleToggle = async () => {
    if (!student) return

    try {
      setIsSubmitting(true)
      setError(null)

      const newActiveStatus = !student.users.is_active
      const newStudentStatus = newActiveStatus ? 'ACTIVE' : 'INACTIVE'

      await studentsApi.update(student.id, {
        is_active: newActiveStatus,
        status: newStudentStatus,
      })

      onToggled()
      onClose()
    } catch (err) {
      console.error('Erro ao alternar status do aluno:', err)
      const message = err instanceof Error ? err.message : undefined
      setError(
        message || 'Não foi possível alterar o status do aluno. Tente novamente.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!student) return null

  const isActive = student.users.is_active
  const action = isActive ? 'inativar' : 'ativar'

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isActive ? 'Inativar' : 'Ativar'} aluno</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja {action} o aluno{' '}
            <strong>{student.full_name}</strong>?
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded-component border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant={isActive ? 'destructive' : 'default'}
            onClick={handleToggle}
            disabled={isSubmitting}
          >
            <PowerOff size={16} />
            {isSubmitting ? 'Processando...' : isActive ? 'Inativar' : 'Ativar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
