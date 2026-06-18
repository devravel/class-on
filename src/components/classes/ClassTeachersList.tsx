import { UserRound } from 'lucide-react'

import { ListCard } from '@/components/dashboard/ListCard'
import { Section } from '@/components/dashboard/Section'
import { ClassDetailsAssignment } from '@/types/class'

interface ClassTeachersListProps {
  assignments: ClassDetailsAssignment[]
}

export function ClassTeachersList({ assignments }: ClassTeachersListProps) {
  return (
    <Section
      title="Professores"
      description="Professores atribuídos a esta turma"
    >
      <ListCard
        items={assignments}
        emptyMessage="Nenhum professor atribuído a esta turma."
        renderItem={(assignment) => (
          <div className="flex items-center gap-4 px-4 py-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-component bg-primary/10">
              <UserRound size={18} className="text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-base font-semibold text-text-primary">
                {assignment.teachers.full_name}
              </p>
              <p className="text-sm text-text-secondary">
                {assignment.subjects.name}
              </p>
            </div>
          </div>
        )}
      />
    </Section>
  )
}
