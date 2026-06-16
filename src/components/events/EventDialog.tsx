'use client'

import { CalendarEvent } from '@/lib/api/events'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, User, Tag } from 'lucide-react'

interface EventDialogProps {
  event: CalendarEvent | null
  isOpen: boolean
  onClose: () => void
}

export function EventDialog({ event, isOpen, onClose }: EventDialogProps) {
  if (!event) return null

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getScopeLabel = (scope: string) => {
    const labels: Record<string, string> = {
      'ALL_SCHOOL': 'Toda Escola',
      'TEACHERS': 'Professores',
      'STUDENTS': 'Alunos',
      'SPECIFIC_CLASSES': 'Turmas Específicas',
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
          {/* Descrição */}
          <div>
            <p className="text-sm text-text-secondary leading-relaxed">
              {event.extendedProps.description}
            </p>
          </div>

          {/* Data e Hora */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar size={16} className="text-text-secondary" />
              <span className="text-text-primary">
                {formatDate(event.start)}
                {event.start !== event.end && ` - ${formatDate(event.end)}`}
              </span>
            </div>
            
            {!event.allDay && (
              <div className="flex items-center gap-2 text-sm">
                <Clock size={16} className="text-text-secondary" />
                <span className="text-text-primary">
                  {formatTime(event.start)} - {formatTime(event.end)}
                </span>
              </div>
            )}

            {event.allDay && (
              <div className="flex items-center gap-2 text-sm">
                <Clock size={16} className="text-text-secondary" />
                <span className="text-text-primary">Dia inteiro</span>
              </div>
            )}
          </div>

          {/* Criador */}
          <div className="flex items-center gap-2 text-sm">
            <User size={16} className="text-text-secondary" />
            <span className="text-text-primary">
              Criado por: {event.extendedProps.creator}
            </span>
          </div>

          {/* Escopo */}
          <div className="flex items-center gap-2 text-sm">
            <Tag size={16} className="text-text-secondary" />
            <span className="text-text-primary">
              {getScopeLabel(event.extendedProps.scope_type)}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}