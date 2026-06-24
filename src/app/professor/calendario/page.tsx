"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeaderTitle } from "@/contexts/page-header-context";
import { Button } from "@/components/ui/button";
import { CalendarView } from "@/components/events/CalendarView";
import { EventForm } from "@/components/events/EventForm";
import { EventDialog } from "@/components/events/EventDialog";
import { CalendarEvent } from "@/lib/api/events";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";

export default function ProfessorCalendarioPage() {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
  );
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [initialFormDate, setInitialFormDate] = useState<Date>();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsEventDialogOpen(true);
  };

  const handleDateClick = (date: Date) => {
    setInitialFormDate(date);
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setRefreshKey((prev) => prev + 1); // Force calendar reload
  };

  return (
    <PageContainer>
      {/* Page heading */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <PageHeaderTitle title="Agendão" />
            <p className="text-sm text-text-secondary">
              Eventos das suas turmas e eventos gerais da escola
            </p>
          </div>
          <Button
            onClick={() => {
              setInitialFormDate(undefined);
              setIsFormOpen(true);
            }}
          >
            <Plus size={16} />
            Novo Evento
          </Button>
        </div>
      </div>

      {/* Calendar */}
      <Card>
        <CardContent className="p-6">
          <CalendarView
            key={refreshKey}
            onEventClick={handleEventClick}
            onDateClick={handleDateClick}
          />
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

      {/* Event Form Dialog */}
      <Dialog
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setInitialFormDate(undefined);
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <EventForm
            key={initialFormDate ? initialFormDate.getTime() : "novo"}
            initialDate={initialFormDate}
            onSuccess={handleFormSuccess}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
