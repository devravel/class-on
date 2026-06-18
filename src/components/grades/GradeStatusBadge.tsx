import {
  GRADE_STATUS_LABELS,
  GRADE_STATUS_STYLES,
} from '@/lib/grade-utils'
import { cn } from '@/lib/utils'
import { GradeDisplayStatus } from '@/types/grade'

interface GradeStatusBadgeProps {
  status: GradeDisplayStatus
}

export function GradeStatusBadge({ status }: GradeStatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-1 text-xs font-medium',
        GRADE_STATUS_STYLES[status],
      )}
    >
      {GRADE_STATUS_LABELS[status]}
    </span>
  )
}
