import { type ReactNode } from 'react'
import { type LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

/** Chips pastel do card de KPI — a variação de cor é o que dá ritmo à grade. */
const TINTS = {
  sky: 'bg-tint-sky text-tint-sky-fg',
  mint: 'bg-tint-mint text-tint-mint-fg',
  amber: 'bg-tint-amber text-tint-amber-fg',
  rose: 'bg-tint-rose text-tint-rose-fg',
  violet: 'bg-tint-violet text-tint-violet-fg',
  slate: 'bg-tint-slate text-tint-slate-fg',
} as const

export type KpiTint = keyof typeof TINTS

const TINT_NAMES = Object.keys(TINTS) as KpiTint[]

/**
 * Sem `tint` explícito, deriva do label: cada card da grade cai numa cor
 * diferente e continua na mesma a cada render.
 */
function tintFromLabel(label: string): KpiTint {
  let hash = 0
  for (let i = 0; i < label.length; i += 1) {
    hash = (hash * 31 + label.charCodeAt(i)) % 997
  }
  return TINT_NAMES[hash % TINT_NAMES.length]
}

interface KpiCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  trend?: string
  trendType?: 'positive' | 'negative' | 'neutral'
  action?: ReactNode
  className?: string
  valueClassName?: string
  /** Fixa a cor do chip quando ela tem significado (risco, alerta…). */
  tint?: KpiTint
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
  tint,
}: KpiCardProps) {
  const chipClass = TINTS[tint ?? tintFromLabel(label)]

  return (
    <div
      className={cn(
        'surface-card-interactive flex flex-col justify-between gap-5 p-5',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-sm font-medium leading-snug text-text-secondary">
          {label}
        </span>
        <div
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-component',
            chipClass,
          )}
        >
          <Icon size={19} />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <span
          className={cn(
            'tabular text-3xl font-bold leading-none tracking-[-0.02em] text-text-primary',
            valueClassName,
          )}
        >
          {value}
        </span>

        {trend && (
          <span
            className={cn(
              'text-xs font-medium',
              trendType === 'positive' && 'text-success',
              trendType === 'negative' && 'text-danger',
              trendType === 'neutral' && 'text-text-tertiary',
            )}
          >
            {trend}
          </span>
        )}
      </div>

      {action && <div>{action}</div>}
    </div>
  )
}
