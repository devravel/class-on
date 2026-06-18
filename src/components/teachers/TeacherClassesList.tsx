import { BookOpen } from 'lucide-react'

import { ListCard } from '@/components/dashboard/ListCard'
import { Section } from '@/components/dashboard/Section'
import { TeacherClassEntry } from '@/lib/assignment-utils'
import {
  EDUCATION_LEVEL_LABELS,
  formatSeriesLabel,
  SHIFT_LABELS,
  Shift,
} from '@/types/class'

interface TeacherClassesListProps {
  classes: TeacherClassEntry[]
}

export function TeacherClassesList({ classes }: TeacherClassesListProps) {
  return (
    <Section
      title="Turmas Atribuídas"
      description="Turmas em que este professor leciona"
    >
      <ListCard
        items={classes.map((entry) => ({ ...entry, id: entry.classId }))}
        emptyMessage="Nenhuma turma atribuída a este professor."
        renderItem={(entry) => (
          <div className="flex items-start gap-4 px-4 py-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-component bg-primary/10">
              <BookOpen size={18} className="text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="mb-3 text-sm text-text-secondary">
                Ano letivo: {entry.classInfo.academic_years.year}
              </p>
              <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                    Série
                  </dt>
                  <dd className="mt-0.5 text-sm font-medium text-text-primary">
                    {formatSeriesLabel(
                      entry.classInfo.series,
                      entry.classInfo.education_level,
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                    Letra
                  </dt>
                  <dd className="mt-0.5 text-sm font-medium text-text-primary">
                    {entry.classInfo.letter}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                    Turno
                  </dt>
                  <dd className="mt-0.5 text-sm font-medium text-text-primary">
                    {SHIFT_LABELS[entry.classInfo.shift as Shift] ?? entry.classInfo.shift}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                    Nível de Ensino
                  </dt>
                  <dd className="mt-0.5 text-sm font-medium text-text-primary">
                    {EDUCATION_LEVEL_LABELS[entry.classInfo.education_level]}
                  </dd>
                </div>
              </dl>
              {entry.subjects.length > 0 && (
                <p className="mt-3 text-xs text-text-secondary">
                  Disciplinas nesta turma:{' '}
                  {entry.subjects.sort((a, b) => a.localeCompare(b, 'pt-BR')).join(', ')}
                </p>
              )}
            </div>
          </div>
        )}
      />
    </Section>
  )
}
