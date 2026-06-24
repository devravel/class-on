import { AppPageHeader } from '@/components/layout/AppPageHeader'
import { cn } from '@/lib/utils'

/** Top offset shared with sidebar logo — keeps logo aligned with page titles. */
export const pageHeaderTopOffset = 'pt-6 lg:pt-8'

interface PageContainerProps {
  children: React.ReactNode
  className?: string
}

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto max-w-7xl p-6 pt-14 pl-14 lg:p-8 lg:pt-8 lg:pl-8',
        className,
      )}
    >
      <AppPageHeader />
      {children}
    </div>
  )
}
