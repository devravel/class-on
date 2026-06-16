'use client'

import { Check } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { studentsApi, classesApi } from '@/lib/api'
import { Student } from '@/types/student'
import { Class as ClassType } from '@/types/class'

interface EnrollmentDialogProps {
  open: boolean
  onClose: () => void
  student: Student | null
  onEnrolled: () => void
}

export function EnrollmentDialog({
  open,
  onClose,
  student,
  onEnrolled,
}: EnrollmentDialogProps) {
  const [classes, setClasses] = useState<ClassType[]>([])
  const [selectedClassId, setSelectedClassId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      loadClasses()
      setSelectedClassId('')
      setError(null)
    }
  }, [open])

  const loadClasses = async () => {
    try {
      setIsLoading(true)
      const data = await classesApi.list()
      setClasses(data)
    } catch (err) {
      console.error('Erro ao carregar turmas:', err)
      setError('Não foi possível carregar as turmas.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEnroll = async () => {
    if (!student || !selectedClassId) return

    try {
      setIsSubmitting(true)
      setError(null)

      await studentsApi.enroll(student.id, {
        class_id: parseInt(selectedClassId),
      })

      onEnrolled()
      onClose()
    } catch (err) {
      console.error('Erro ao matricular aluno:', err)
      const message = err instanceof Error ? err.message : undefined
      setError(message || 'Não foi possível matricular o aluno. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!student) return null

  const enrolledClassIds = student.enrollments?.map((e) => e.class_id) || []
  const availableClasses = classes.filter(
    (c) => !enrolledClassIds.includes(c.id),
  )

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Matricular aluno</DialogTitle>
          <DialogDescription>
            Matricular <strong>{student.full_name}</strong> em uma turma
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded-component border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">
              Selecione a turma *
            </label>
            <Select
              value={selectedClassId}
              onValueChange={setSelectedClassId}
              disabled={isLoading || isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Escolha uma turma..." />
              </SelectTrigger>
              <SelectContent>
                {availableClasses.length === 0 && (
                  <div className="px-2 py-3 text-sm text-text-secondary">
                    {isLoading
                      ? 'Carregando turmas...'
                      : 'Nenhuma turma disponível'}
                  </div>
                )}
                {availableClasses.map((classItem) => (
                  <SelectItem key={classItem.id} value={classItem.id}>
                    {classItem.academic_years.year} - {classItem.series}º{' '}
                    {classItem.letter} ({classItem.shift})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {student.enrollments && student.enrollments.length > 0 && (
            <div className="rounded-component border border-border bg-muted/30 p-3">
              <p className="mb-2 text-sm font-medium text-text-primary">
                Turmas atuais:
              </p>
              <ul className="space-y-1">
                {student.enrollments.map((enrollment) => (
                  <li key={enrollment.id} className="text-sm text-text-secondary">
                    • {enrollment.classes.academic_years.year} -{' '}
                    {enrollment.classes.series}º {enrollment.classes.letter} (
                    {enrollment.classes.shift})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

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
            onClick={handleEnroll}
            disabled={!selectedClassId || isSubmitting || isLoading}
          >
            <Check size={16} />
            {isSubmitting ? 'Matriculando...' : 'Matricular'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
