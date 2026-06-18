import { BookOpen } from 'lucide-react'

import {
  Class,
  EDUCATION_LEVEL_LABELS,
  formatClassShortLabel,
  formatSeriesLabel,
  SHIFT_LABELS,
  Shift,
} from '@/types/class'

interface ClassInfoCardProps {
  classRecord: Class
}

export function ClassInfoCard({ classRecord }: ClassInfoCardProps) {
  return (
    <div className="rounded-card border border-border bg-background p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-component bg-primary/10">
          <BookOpen size={18} className="text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-text-primary">
            {formatClassShortLabel(classRecord)}
          </h2>
          <p className="text-sm text-text-secondary">Detalhes da turma</p>
        </div>
      </div>

      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-text-secondary">
            Ano Letivo
          </dt>
          <dd className="mt-1 text-sm font-medium text-text-primary">
            {classRecord.academic_years?.year ?? '—'}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-text-secondary">
            Série
          </dt>
          <dd className="mt-1 text-sm font-medium text-text-primary">
            {formatSeriesLabel(classRecord.series, classRecord.education_level)}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-text-secondary">
            Letra
          </dt>
          <dd className="mt-1 text-sm font-medium text-text-primary">
            {classRecord.letter}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-text-secondary">
            Turno
          </dt>
          <dd className="mt-1 text-sm font-medium text-text-primary">
            {SHIFT_LABELS[classRecord.shift as Shift] ?? classRecord.shift}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-text-secondary">
            Nível de Ensino
          </dt>
          <dd className="mt-1 text-sm font-medium text-text-primary">
            {EDUCATION_LEVEL_LABELS[classRecord.education_level]}
          </dd>
        </div>
      </dl>
    </div>
  )
}
