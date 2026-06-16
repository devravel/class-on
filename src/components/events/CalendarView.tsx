'use client'

import { useEffect, useRef, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { CalendarEvent, eventsApi } from '@/lib/api/events'
import { ApiError } from '@/lib/api-client'

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

  const loadEvents = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const data = await eventsApi.getCalendar(classId)
      setEvents(data)
    } catch (err) {
      console.error('Erro ao carregar eventos:', err)
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Erro ao carregar eventos')
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadEvents()
  }, [classId])

  const handleEventClick = (clickInfo: any) => {
    const eventData = clickInfo.event
    const calendarEvent: CalendarEvent = {
      id: eventData.id,
      title: eventData.title,
      start: eventData.start?.toISOString() || '',
      end: eventData.end?.toISOString() || '',
      allDay: eventData.allDay,
      extendedProps: eventData.extendedProps,
    }
    
    onEventClick?.(calendarEvent)
  }

  const handleDateClick = (dateInfo: any) => {
    onDateClick?.(dateInfo.date)
  }

  if (error) {
    return (
      <div className="flex h-96 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50">
        <div className="text-center">
          <p className="text-sm text-text-secondary mb-2">Erro ao carregar calendário</p>
          <p className="text-xs text-danger">{error}</p>
          <button
            onClick={loadEvents}
            className="mt-3 text-xs text-primary hover:underline"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-2" />
          <p className="text-sm text-text-secondary">Carregando calendário...</p>
        </div>
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
        eventBackgroundColor="#3b82f6"
        eventBorderColor="#3b82f6"
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
        }
        
        .fc-toolbar-title {
          font-size: 1.25rem !important;
          font-weight: 600 !important;
          color: #1f2937 !important;
        }
        
        .fc-button {
          background-color: #f3f4f6 !important;
          border-color: #d1d5db !important;
          color: #374151 !important;
          font-size: 0.875rem !important;
          padding: 0.375rem 0.75rem !important;
        }
        
        .fc-button:hover {
          background-color: #e5e7eb !important;
          border-color: #9ca3af !important;
        }
        
        .fc-button:focus {
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5) !important;
        }
        
        .fc-button-primary:not(:disabled):active,
        .fc-button-primary:not(:disabled).fc-button-active {
          background-color: #3b82f6 !important;
          border-color: #3b82f6 !important;
          color: #ffffff !important;
        }
        
        .fc-day-today {
          background-color: #fef3c7 !important;
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
          color: #3b82f6 !important;
          font-size: 0.75rem !important;
        }
      `}</style>
    </div>
  )
}