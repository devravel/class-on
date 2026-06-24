'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Calendar, Clock, ChevronRight } from 'lucide-react'
import { Section } from '@/components/dashboard/Section'
import { InlineError } from '@/components/dashboard/InlineError'
import {
  DASHBOARD_LIST_AREA_HEIGHT,
  ListCard,
} from '@/components/dashboard/ListCard'
import { PageLoader } from '@/components/ui/page-loader'
import { eventsApi } from '@/lib/api/events'
import { mapEventApiError, parseLocalDateFromApi } from '@/lib/events/feedback'
import { cn } from '@/lib/utils'

interface UpcomingEventsCardProps {
  role: 'SECRETARIA' | 'PROFESSOR' | 'ALUNO'
  limit?: number
  showViewAll?: boolean
}

interface UpcomingEvent {
  id: string
  title: string
  start_date: string
  all_day: boolean
  scope_type: string
  daysUntil: number
}

export function UpcomingEventsCard({ 
  role, 
  limit = 4, 
  showViewAll = true 
}: UpcomingEventsCardProps) {
  const [events, setEvents] = useState<UpcomingEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadUpcomingEvents = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const calendarEvents = await eventsApi.getCalendar()
        
        // Filtrar apenas eventos futuros e próximos 30 dias
        const todayStart = new Date()
        todayStart.setHours(0, 0, 0, 0)
        const thirtyDaysFromNow = new Date(todayStart.getTime() + 30 * 24 * 60 * 60 * 1000)

        const upcomingEvents = calendarEvents
          .filter((event) => {
            const eventDate = parseLocalDateFromApi(event.start)
            return eventDate >= todayStart && eventDate <= thirtyDaysFromNow
          })
          .map((event) => {
            const eventDate = parseLocalDateFromApi(event.start)
            const startOfEventDay = new Date(eventDate)
            startOfEventDay.setHours(0, 0, 0, 0)
            const diffMs = startOfEventDay.getTime() - todayStart.getTime()
            const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

            return {
              id: event.id,
              title: event.title,
              start_date: event.start,
              all_day: event.allDay,
              scope_type: event.extendedProps.scope_type,
              daysUntil: diffDays,
            }
          })
          .sort((a, b) => a.daysUntil - b.daysUntil)

        setEvents(upcomingEvents)
      } catch (err) {
        console.error('Erro ao carregar próximos eventos:', err)
        const mapped = mapEventApiError(err)
        setError(`${mapped.title}: ${mapped.description}`)
      } finally {
        setIsLoading(false)
      }
    }

    loadUpcomingEvents()
  }, [limit])

  const formatEventDate = (dateStr: string, allDay: boolean) => {
    const date = allDay ? parseLocalDateFromApi(dateStr) : new Date(dateStr)

    if (allDay) {
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
      })
    }

    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getDaysUntilText = (daysUntil: number) => {
    if (daysUntil === 0) return 'Hoje'
    if (daysUntil === 1) return 'Amanhã'
    return `Em ${daysUntil} dias`
  }

  const getScopeLabel = (scope: string) => {
    const labels: Record<string, string> = {
      'ALL_SCHOOL': 'Geral',
      'TEACHERS': 'Professores',
      'STUDENTS': 'Alunos',
      'SPECIFIC_CLASSES': 'Turmas',
    }
    return labels[scope] || scope
  }

  const getCalendarLink = () => {
    switch (role) {
      case 'SECRETARIA':
        return '/secretaria/calendario'
      case 'PROFESSOR':
        return '/professor/calendario'
      case 'ALUNO':
        return '/aluno/calendario'
      default:
        return '#'
    }
  }

  if (error) {
    return (
      <Section title="Próximos Eventos">
        <InlineError message={error} />
      </Section>
    )
  }

  if (isLoading) {
    return (
      <Section title="Próximos Eventos">
        <div
          className="flex items-center justify-center rounded-lg border border-border bg-neutral-100"
          style={{ height: DASHBOARD_LIST_AREA_HEIGHT }}
        >
          <PageLoader label="Carregando eventos..." size="sm" inline />
        </div>
      </Section>
    )
  }

  if (events.length === 0) {
    return (
      <Section 
        title="Próximos Eventos"
        action={showViewAll ? (
          <Link
            href={getCalendarLink()}
            className="link-action flex items-center gap-1 text-xs"
          >
            Ver calendário <ChevronRight size={14} />
          </Link>
        ) : undefined}
      >
        <div
          className="flex items-center justify-center rounded-card bg-surface shadow-light ring-1 ring-border"
          style={{ height: DASHBOARD_LIST_AREA_HEIGHT }}
        >
          <div className="text-center">
            <Calendar size={24} className="text-neutral-400 mx-auto mb-2" />
            <p className="text-sm text-text-secondary">
              {role === 'SECRETARIA' ? 'Nenhum evento cadastrado' : 'Nenhum evento agendado'}
            </p>
          </div>
        </div>
      </Section>
    )
  }

  return (
    <Section 
      title="Próximos Eventos"
      action={showViewAll ? (
        <Link
          href={getCalendarLink()}
          className="link-action flex items-center gap-1 text-xs"
        >
          Ver todos <ChevronRight size={14} />
        </Link>
      ) : undefined}
    >
      <ListCard
        items={events}
        limit={limit}
        fixedRowArea
        renderItem={(event) => (
          <div className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-neutral-100">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-component bg-primary/10">
                <Calendar size={14} className="text-primary" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-text-primary">
                  {event.title}
                </p>
                <p className="flex items-center gap-1 truncate text-xs text-text-secondary">
                  <Clock size={10} />
                  {formatEventDate(event.start_date, event.all_day)} ·{' '}
                  {getScopeLabel(event.scope_type)}
                </p>
              </div>
            </div>
            <span
              className={cn(
                'ml-2 shrink-0 rounded-full px-2 py-1 text-xs font-medium',
                event.daysUntil === 0
                  ? 'bg-warning/10 text-warning'
                  : event.daysUntil <= 3
                    ? 'bg-primary/10 text-primary'
                    : 'bg-neutral-200 text-neutral-700',
              )}
            >
              {getDaysUntilText(event.daysUntil)}
            </span>
          </div>
        )}
      />
    </Section>
  )
}