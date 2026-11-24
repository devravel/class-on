import { AppPageHeader } from '@/components/layout/AppPageHeader'
import { cn } from '@/lib/utils'

interface PageContainerProps {
  children: React.ReactNode
  className?: string
}

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div
      className={cn(
        // pt-20 no mobile abre espaço pro gatilho flutuante do menu
        'mx-auto max-w-7xl px-5 pb-10 pt-20 lg:px-8 lg:pb-12 lg:pt-8',
        className,
      )}
    >
      <AppPageHeader />
      {children}
    </div>
  )
}
