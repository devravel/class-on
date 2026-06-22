import Link from 'next/link'
import { type LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

export interface QuickAction {
  id: string
  label: string
  icon: LucideIcon
  href: string
  variant?: 'default' | 'outline'
}

interface QuickActionsProps {
  actions: QuickAction[]
}

export function QuickActions({ actions }: QuickActionsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {actions.map((action) => {
        const Icon = action.icon
        return (
          <Link
            key={action.id}
            href={action.href}
            className={cn(
              'flex flex-col items-center justify-center gap-2.5 rounded-card p-5 text-center transition-colors',
              action.variant === 'default'
                ? 'bg-primary text-white hover:bg-primary/90'
                : 'bg-surface text-text-secondary ring-1 ring-border hover:bg-neutral-200 hover:text-text-primary',
            )}
          >
            <Icon size={22} className="shrink-0" />
            <span className="text-xs font-medium leading-tight">{action.label}</span>
          </Link>
        )
      })}
    </div>
  )
}
