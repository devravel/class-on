'use client'

import { useState } from 'react'
import { Calendar, Clock, Loader2, Tag, Trash2, User } from 'lucide-react'
import { CalendarEvent, eventsApi } from '@/lib/api/events'
import { useAuth } from '@/contexts/auth-context'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  formatEventRangeLabel,
  toastEventCreateError,
  toastEventRemoved,
} from '@/lib/events/feedback'

interface EventDialogProps {
  event: CalendarEvent | null
  isOpen: boolean
  onClose: () => void
  onDeleted?: () => void
}

export function EventDialog({ event, isOpen, onClose, onDeleted }: EventDialogProps) {
  const { user } = useAuth()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  if (!event) return null

  const { dateLine, isMultiDay } = formatEventRangeLabel(event.start, event.end, event.allDay)

  const canDelete =
    event.extendedProps.status === 'ACTIVE' &&
    user != null &&
    (user.role === 'SECRETARIA' || user.id === event.extendedProps.creator_id)

  const formatTimeRange = () => {
    const s = new Date(event.start)
    const e = new Date(event.end)
    return `${s.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    })} – ${e.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    })}`
  }

  const getScopeLabel = (scope: string) => {
    const labels: Record<string, string> = {
      ALL_SCHOOL: 'Toda Escola',
      TEACHERS: 'Professores',
      STUDENTS: 'Alunos',
      SPECIFIC_CLASSES: 'Turmas Específicas',
    }
    return labels[scope] || scope
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-success/10 text-success'
      case 'CANCELLED':
        return 'bg-danger/10 text-danger'
      default:
        return 'bg-neutral-100 text-neutral-700'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Ativo'
      case 'CANCELLED':
        return 'Cancelado'
      default:
        return status
    }
  }

  const handleClose = () => {
    if (isDeleting) return
    setShowDeleteConfirm(false)
    onClose()
  }

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await eventsApi.delete(event.id)
      toastEventRemoved()
      setShowDeleteConfirm(false)
      onDeleted?.()
      onClose()
    } catch (err) {
      toastEventCreateError(err)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose()
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-start justify-between">
            <span className="pr-4">{event.title}</span>
            <Badge className={getStatusColor(event.extendedProps.status)}>
              {getStatusLabel(event.extendedProps.status)}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-text-secondary leading-relaxed">
              {event.extendedProps.description}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar size={16} className="text-text-secondary shrink-0" />
              <span className="text-text-primary">
                {dateLine}
                {event.allDay && isMultiDay
                  ? ' (dias inteiros)'
                  : event.allDay
                    ? ' (dia inteiro)'
                    : ''}
              </span>
            </div>

            {!event.allDay && (
              <div className="flex items-center gap-2 text-sm">
                <Clock size={16} className="text-text-secondary shrink-0" />
                <span className="text-text-primary">{formatTimeRange()}</span>
              </div>
            )}

            {event.allDay && (
              <div className="flex items-center gap-2 text-sm">
                <Clock size={16} className="text-text-secondary shrink-0" />
                <span className="text-text-primary">Sem horário — dia(s) inteiro(s)</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm">
            <User size={16} className="text-text-secondary shrink-0" />
            <span className="text-text-primary">
              Criado por: {event.extendedProps.creator}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Tag size={16} className="text-text-secondary shrink-0" />
            <span className="text-text-primary">
              {getScopeLabel(event.extendedProps.scope_type)}
            </span>
          </div>

          {showDeleteConfirm && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
              <p className="text-sm text-text-primary">
                Tem certeza que deseja excluir este evento? Ele será removido do calendário
                para todos os envolvidos.
              </p>
              <div className="mt-3 flex gap-2">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={isDeleting}
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
        </div>

        {canDelete && (
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="text-destructive hover:text-destructive"
              disabled={showDeleteConfirm || isDeleting}
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 size={16} />
              Excluir evento
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
