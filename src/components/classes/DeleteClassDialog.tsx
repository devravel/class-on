'use client'

import { useEffect, useRef, useState } from 'react'
import { AlertTriangle, Archive, XCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Class, formatClassShortLabel, SHIFT_LABELS, Shift } from '@/types/class'
import { classesApi } from '@/lib/api'

interface DeleteClassDialogProps {
  open: boolean
  onClose: () => void
  classRecord: Class | null
  onDeleted: () => void
}

const focusableSelector =
  'button:not([disabled]), [href]:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

function getFocusableElements(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>(focusableSelector),
  ).filter((el) => el.offsetParent !== null || el === document.activeElement)
}

export function DeleteClassDialog({
  open,
  onClose,
  classRecord,
  onDeleted,
}: DeleteClassDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const dialog = dialogRef.current
    const frame = requestAnimationFrame(() => {
      if (!dialog) return
      const focusables = getFocusableElements(dialog)
      focusables[0]?.focus({ preventScroll: true })
    })

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }

      if (event.key !== 'Tab' || !dialog) return

      const focusables = getFocusableElements(dialog)
      if (focusables.length === 0) return

      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      const active = document.activeElement as HTMLElement | null

      if (!dialog.contains(active)) {
        event.preventDefault()
        first.focus()
        return
      }

      if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      } else if (event.shiftKey && active === first) {
        event.preventDefault()
        last.focus()
      }
    }

    window.addEventListener('keydown', onKeyDown)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [open, onClose])

  if (!open || !classRecord) return null

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      setError(null)
      await classesApi.delete(classRecord.id)
      onDeleted()
      onClose()
    } catch (err) {
      console.error('Erro ao desativar turma:', err)
      setError('Não foi possível desativar a turma. Tente novamente.')
    } finally {
      setIsDeleting(false)
    }
  }

  const className = `${formatClassShortLabel(classRecord)} - ${SHIFT_LABELS[classRecord.shift as Shift] ?? classRecord.shift}`

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-hidden bg-neutral-950/70 p-4 backdrop-blur-sm sm:items-center sm:p-6 md:p-8"
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-class-title"
        className={cn(
          'flex w-full max-w-md flex-col overflow-hidden rounded-modal bg-surface shadow-medium ring-1 ring-border',
          'animate-in fade-in zoom-in-95 duration-200',
        )}
      >
        <header className="border-b border-border bg-muted/50 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-component bg-amber-500/10">
                <Archive size={18} className="text-amber-600" aria-hidden />
              </div>
              <div>
                <p className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-amber-600">
                  Arquivar turma
                </p>
                <h2
                  id="delete-class-title"
                  className="text-lg font-bold text-text-primary"
                >
                  Desativar Turma
                </h2>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={onClose}
              aria-label="Fechar"
            >
              <XCircle size={18} aria-hidden />
            </Button>
          </div>
        </header>

        <div className="px-6 py-6">
          <div className="rounded-card bg-amber-500/10 p-4 ring-1 ring-amber-500/20">
            <div className="flex gap-3">
              <AlertTriangle
                size={18}
                className="mt-0.5 shrink-0 text-amber-600"
                aria-hidden
              />
              <p className="text-sm leading-relaxed text-text-secondary">
                Tem certeza que deseja desativar a turma{' '}
                <strong className="text-text-primary">{className}</strong>?{' '}
                Os dados históricos (alunos, notas e frequência) serão
                preservados, mas a turma deixará de aparecer nas listagens
                ativas.
              </p>
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-card bg-destructive/10 p-3 text-sm text-destructive ring-1 ring-destructive/20">
              {error}
            </div>
          )}
        </div>

        <footer className="border-t border-border bg-muted/40 px-6 py-4">
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isDeleting}
              onClick={handleDelete}
            >
              {isDeleting ? 'Desativando...' : 'Desativar Turma'}
            </Button>
          </div>
        </footer>
      </div>
    </div>
  )
}
