'use client'

import { useEffect, useRef, useState } from 'react'
import { PowerOff, XCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Teacher } from '@/types/teacher'
import { teachersApi } from '@/lib/api'

interface ToggleTeacherDialogProps {
  open: boolean
  onClose: () => void
  teacher: Teacher | null
  onToggled: () => void
}

const focusableSelector =
  'button:not([disabled]), [href]:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

function getFocusableElements(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>(focusableSelector),
  ).filter((el) => el.offsetParent !== null || el === document.activeElement)
}

export function ToggleTeacherDialog({
  open,
  onClose,
  teacher,
  onToggled,
}: ToggleTeacherDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isActive = teacher?.users.is_active ?? false
  const actionLabel = isActive ? 'Inativar' : 'Ativar'

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

  if (!open || !teacher) return null

  const handleToggle = async () => {
    try {
      setIsLoading(true)
      setError(null)
      await teachersApi.update(teacher.id, { is_active: !isActive })
      onToggled()
      onClose()
    } catch (err) {
      console.error('Erro ao alterar status do professor:', err)
      setError(
        isActive
          ? 'Não foi possível inativar o professor. Tente novamente.'
          : 'Não foi possível ativar o professor. Tente novamente.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-hidden bg-neutral-950/70 p-4 backdrop-blur-sm sm:items-center sm:p-6 md:p-8"
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="toggle-teacher-title"
        className={cn(
          'flex w-full max-w-md flex-col overflow-hidden rounded-modal bg-surface shadow-medium ring-1 ring-border',
          'animate-in fade-in zoom-in-95 duration-200',
        )}
      >
        <header className="border-b border-border bg-muted/50 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex gap-4">
              <div
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-component',
                  isActive ? 'bg-destructive/10' : 'bg-primary/10',
                )}
              >
                <PowerOff
                  size={18}
                  className={isActive ? 'text-destructive' : 'text-primary'}
                  aria-hidden
                />
              </div>
              <div>
                <p
                  className={cn(
                    'mb-0.5 text-xs font-semibold uppercase tracking-wide',
                    isActive ? 'text-destructive' : 'text-primary',
                  )}
                >
                  Confirmação
                </p>
                <h2
                  id="toggle-teacher-title"
                  className="text-lg font-bold text-text-primary"
                >
                  {actionLabel} Professor
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
          <p className="text-sm leading-relaxed text-text-secondary">
            {isActive ? (
              <>
                Deseja inativar o professor{' '}
                <strong className="text-text-primary">{teacher.full_name}</strong>?{' '}
                O acesso ao sistema será bloqueado.
              </>
            ) : (
              <>
                Deseja reativar o professor{' '}
                <strong className="text-text-primary">{teacher.full_name}</strong>?{' '}
                O acesso ao sistema será restaurado.
              </>
            )}
          </p>

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
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant={isActive ? 'destructive' : 'default'}
              disabled={isLoading}
              onClick={handleToggle}
            >
              {isLoading ? 'Aguarde...' : `${actionLabel} Professor`}
            </Button>
          </div>
        </footer>
      </div>
    </div>
  )
}
