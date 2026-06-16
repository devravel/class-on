'use client'

import { useState } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { CalendarView } from '@/components/events/CalendarView'
import { EventDialog } from '@/components/events/EventDialog'
import { CalendarEvent } from '@/lib/api/events'
import { Card, CardContent } from '@/components/ui/card'

export default function AlunoCalendarioPage() {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false)

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event)
    setIsEventDialogOpen(true)
  }

  return (
    <PageContainer>
      {/* Page heading */}
      <div className="mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Meu Calendário</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Eventos da sua turma e eventos gerais da escola
          </p>
        </div>
      </div>

      {/* Info Card */}
      <Card className="mb-6 bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="text-sm">
            <p className="text-text-primary font-medium mb-1">
              📅 Você visualiza:
            </p>
            <ul className="text-text-secondary space-y-1">
              <li>• Eventos para toda a escola</li>
              <li>• Eventos para alunos</li>
              <li>• Eventos específicos da sua turma</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Calendar */}
      <Card>
        <CardContent className="p-6">
          <CalendarView
            onEventClick={handleEventClick}
          />
        </CardContent>
      </Card>

      {/* Event Dialog */}
      <EventDialog
        event={selectedEvent}
        isOpen={isEventDialogOpen}
        onClose={() => {
          setIsEventDialogOpen(false)
          setSelectedEvent(null)
        }}
      />
    </PageContainer>
  )
}