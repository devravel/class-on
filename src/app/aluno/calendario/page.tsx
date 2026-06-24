"use client";

import { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeaderTitle } from "@/contexts/page-header-context";
import { CalendarView } from "@/components/events/CalendarView";
import { EventDialog } from "@/components/events/EventDialog";
import { CalendarEvent } from "@/lib/api/events";
import { Card, CardContent } from "@/components/ui/card";

export default function AlunoCalendarioPage() {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
  );
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsEventDialogOpen(true);
  };

  return (
    <PageContainer>
      {/* Page heading */}
      <PageHeaderTitle title="Agendão" />
      <div className="mb-6">
        <div>
          <p className="text-sm text-text-secondary">
            Eventos da sua turma e eventos gerais da escola
          </p>
        </div>
      </div>

      {/* Calendar */}
      <Card>
        <CardContent className="p-6">
          <CalendarView onEventClick={handleEventClick} />
        </CardContent>
      </Card>

      {/* Event Dialog */}
      <EventDialog
        event={selectedEvent}
        isOpen={isEventDialogOpen}
        onClose={() => {
          setIsEventDialogOpen(false);
          setSelectedEvent(null);
        }}
      />
    </PageContainer>
  );
}
