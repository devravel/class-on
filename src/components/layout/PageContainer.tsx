import { cn } from '@/lib/utils'

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
