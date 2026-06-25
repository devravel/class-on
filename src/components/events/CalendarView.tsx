'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { DateClickArg } from '@fullcalendar/interaction'
import type { EventClickArg } from '@fullcalendar/core'
import { CalendarEvent, eventsApi } from '@/lib/api/events'
import { mapEventApiError, toastCalendarRetryInfo } from '@/lib/events/feedback'
import { InlineError } from '@/components/dashboard/InlineError'
import { PageLoader } from '@/components/ui/page-loader'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'

interface CalendarViewProps {
  classId?: string
  onEventClick?: (event: CalendarEvent) => void
  onDateClick?: (date: Date) => void
}

export function CalendarView({ classId, onEventClick, onDateClick }: CalendarViewProps) {
  const calendarRef = useRef<FullCalendar>(null)
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadEvents = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const data = await eventsApi.getCalendar(classId)
      setEvents(data)
    } catch (err) {
      console.error('Erro ao carregar eventos:', err)
      const mapped = mapEventApiError(err)
      setError(`${mapped.title}: ${mapped.description}`)
    } finally {
      setIsLoading(false)
    }
  }, [classId])

  useEffect(() => {
    void loadEvents()
  }, [loadEvents])

  const handleEventClick = (clickInfo: EventClickArg) => {
    const eventData = clickInfo.event
    const startRaw =
      typeof eventData.startStr === 'string' && eventData.startStr
        ? eventData.startStr
        : eventData.start?.toISOString?.() || ''
    const endRaw =
      typeof eventData.endStr === 'string' && eventData.endStr
        ? eventData.endStr
        : eventData.end?.toISOString?.() || ''
    const rawProps = eventData.extendedProps as Partial<CalendarEvent['extendedProps']> | undefined
    const calendarEvent: CalendarEvent = {
      id: String(eventData.id),
      title: String(eventData.title),
      start: startRaw,
      end: endRaw,
      allDay: Boolean(eventData.allDay),
      extendedProps: {
        description: rawProps?.description ?? '',
        creator: rawProps?.creator ?? '',
        creator_id: rawProps?.creator_id ?? '',
        status: rawProps?.status ?? 'ACTIVE',
        scope_type: rawProps?.scope_type ?? 'ALL_SCHOOL',
      },
    }
    
    onEventClick?.(calendarEvent)
  }

  const handleDateClick = (dateInfo: DateClickArg) => {
    onDateClick?.(dateInfo.date)
  }

  if (error) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4 rounded-card border border-border bg-surface px-4">
        <InlineError message={error} className="max-w-md" />
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            toastCalendarRetryInfo()
            void loadEvents()
          }}
        >
          <RefreshCw size={16} className="mr-1" />
          Tentar novamente
        </Button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center rounded-card border border-border bg-neutral-100">
        <PageLoader label="Carregando calendário..." />
      </div>
    )
  }

  return (
    <div className="calendar-container">
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        buttonText={{
          today: 'Hoje',
          month: 'Mês',
          week: 'Semana',
          day: 'Dia'
        }}
        locale="pt-br"
        height="auto"
        events={events}
        eventClick={handleEventClick}
        dateClick={onDateClick ? handleDateClick : undefined}
        dayMaxEvents={3}
        eventDisplay="block"
        eventClassNames="cursor-pointer"
        eventBackgroundColor="var(--color-brand-500)"
        eventBorderColor="var(--color-brand-600)"
        eventTextColor="#ffffff"
        dayHeaderFormat={{
          weekday: 'short'
        }}
        slotMinTime="06:00:00"
        slotMaxTime="22:00:00"
        allDayText="Dia todo"
        noEventsText="Nenhum evento para exibir"
        moreLinkText="mais"
      />
      
      <style jsx global>{`
        .fc {
          font-family: inherit;
        }
        
        .fc-toolbar {
          margin-bottom: 1rem;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        
        .fc-toolbar-title {
          font-size: 1.25rem !important;
          font-weight: 600 !important;
          color: var(--color-neutral-800) !important;
        }
        
        .fc-button {
          background-color: var(--color-neutral-100) !important;
          border-color: var(--color-neutral-300) !important;
          color: var(--color-neutral-700) !important;
          font-size: 0.875rem !important;
          padding: 0.375rem 0.75rem !important;
        }
        
        .fc-button:hover {
          background-color: var(--color-neutral-200) !important;
          border-color: var(--color-neutral-400) !important;
        }
        
        .fc-button:focus {
          box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-brand-500) 50%, transparent) !important;
        }
        
        .fc-button-primary:not(:disabled):active,
        .fc-button-primary:not(:disabled).fc-button-active {
          background-color: var(--color-brand-500) !important;
          border-color: var(--color-brand-600) !important;
          color: #ffffff !important;
        }
        
        .fc-day-today {
          background-color: color-mix(in srgb, var(--color-warning) 15%, white) !important;
        }
        
        .fc-event {
          border-radius: 4px !important;
          font-size: 0.75rem !important;
        }
        
        .fc-daygrid-event {
          margin: 1px 2px !important;
        }
        
        .fc-event-title {
          font-weight: 500 !important;
        }
        
        .fc-more-link {
          color: var(--color-brand-600) !important;
          font-size: 0.75rem !important;
        }
      `}</style>
    </div>
  )
}
