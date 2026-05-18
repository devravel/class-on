import { type ReactNode } from 'react'
import { type LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

interface KpiCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  trend?: string
  trendType?: 'positive' | 'negative' | 'neutral'
  action?: ReactNode
  className?: string
  valueClassName?: string
}

export function KpiCard({
  label,
  value,
  icon: Icon,
  trend,
  trendType = 'neutral',
  action,
  className,
  valueClassName,
}: KpiCardProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 rounded-card bg-surface p-5 shadow-light ring-1 ring-border',
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-text-secondary">{label}</span>
          <span className={cn('text-3xl font-bold text-text-primary', valueClassName)}>{value}</span>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-component bg-primary/10">
          <Icon size={20} className="text-primary" />
        </div>
      </div>

      {trend && (
        <span
          className={cn(
            'text-xs font-medium',
            trendType === 'positive' && 'text-success',
            trendType === 'negative' && 'text-danger',
            trendType === 'neutral' && 'text-text-secondary',
          )}
        >
          {trend}
        </span>
      )}

      {action && <div>{action}</div>}
    </div>
  )
}
