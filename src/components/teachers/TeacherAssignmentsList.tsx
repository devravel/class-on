import { BookUser, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'

import { ListCard } from '@/components/dashboard/ListCard'
import { Section } from '@/components/dashboard/Section'
import { Button, buttonVariants } from '@/components/ui/button'
import { getClassLabel } from '@/lib/class-utils'
import { cn } from '@/lib/utils'
import { Assignment } from '@/types/assignment'

interface TeacherAssignmentsListProps {
  teacherId: string
  assignments: Assignment[]
  onDeleteClick: (assignment: Assignment) => void
}

export function TeacherAssignmentsList({
  teacherId,
  assignments,
  onDeleteClick,
}: TeacherAssignmentsListProps) {
  return (
    <Section
      title="Atribuições"
      description="Disciplinas e turmas vinculadas a este professor"
      action={
        <Link
          href={`/secretaria/professores/${teacherId}/turmas/nova`}
          className={cn(buttonVariants({ size: 'sm' }))}
        >
          <Plus size={14} />
          Nova Atribuição
        </Link>
      }
    >
      <ListCard
        items={assignments}
        emptyMessage="Nenhuma atribuição cadastrada para este professor."
        renderItem={(item) => (
          <div className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-component bg-primary/10">
                <BookUser size={18} className="text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-base font-semibold text-text-primary">
                  {item.subjects.name}
                </p>
                <p className="text-sm text-text-secondary">
                  {getClassLabel(item.classes)}
                </p>
                <p className="text-xs text-text-secondary">
                  Ano letivo: {item.classes.academic_years.year}
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => onDeleteClick(item)}
            >
              <Trash2 size={14} />
              Excluir
            </Button>
          </div>
        )}
      />
    </Section>
  )
}
