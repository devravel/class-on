import { cn } from '@/lib/utils'

interface SectionProps {
  title: string
  description?: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function Section({
  title,
  description,
  action,
  children,
  className,
}: SectionProps) {
  return (
    <section className={cn('flex flex-col gap-4', className)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-text-primary">{title}</h2>
          {description && (
            <p className="mt-0.5 text-sm text-text-secondary">{description}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {children}
    </section>
  )
}
