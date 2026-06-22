import { cn } from '@/lib/utils'

/** Top offset shared with sidebar logo — keeps logo aligned with page titles. */
export const pageHeaderTopOffset = 'pt-6 lg:pt-8'

interface PageContainerProps {
  children: React.ReactNode
  className?: string
}

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div className={cn('mx-auto max-w-7xl p-6 lg:p-8', className)}>
      {children}
    </div>
  )
}
