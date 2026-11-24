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
              'group flex flex-col items-center justify-center gap-3 rounded-card p-5 text-center transition-[box-shadow,transform,background-color] duration-200 hover:-translate-y-0.5',
              action.variant === 'default'
                ? 'bg-primary text-white shadow-brand hover:bg-primary-hover hover:shadow-card-hover'
                : 'bg-surface text-text-secondary shadow-card hover:text-primary hover:shadow-card-hover',
            )}
          >
            <Icon size={22} className="shrink-0" />
            <span className="text-xs font-semibold leading-tight">{action.label}</span>
          </Link>
        )
      })}
    </div>
  )
}
