'use client'

import { CalendarEvent } from '@/lib/api/events'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, User, Tag } from 'lucide-react'
import { formatEventRangeLabel } from '@/lib/events/feedback'

interface EventDialogProps {
  event: CalendarEvent | null
  isOpen: boolean
  onClose: () => void
}

export function EventDialog({ event, isOpen, onClose }: EventDialogProps) {
  if (!event) return null

  const { dateLine, isMultiDay } = formatEventRangeLabel(event.start, event.end, event.allDay)

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
                {event.allDay && isMultiDay ? ' (dias inteiros)' : event.allDay ? ' (dia inteiro)' : ''}
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
        </div>
      </DialogContent>
    </Dialog>
  )
}
