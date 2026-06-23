import { Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'

interface PageLoaderProps {
  label?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
  inline?: boolean
}

const sizeClasses = {
  sm: 'h-5 w-5',
  md: 'h-8 w-8',
  lg: 'h-10 w-10',
} as const

export function PageLoader({
  label,
  className,
  size = 'md',
  inline = false,
}: PageLoaderProps) {
  return (
    <div
      className={cn(
        inline ? 'flex items-center justify-center' : 'flex items-center justify-center py-12',
        className,
      )}
    >
      <div className="text-center">
        <Loader2
          className={cn('mx-auto animate-spin text-primary', sizeClasses[size])}
          aria-hidden
        />
        {label ? (
          <p className="mt-2 text-sm text-text-secondary">{label}</p>
        ) : null}
      </div>
    </div>
  )
}
