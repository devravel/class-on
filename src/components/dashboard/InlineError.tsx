import { AlertCircle } from 'lucide-react'

import { cn } from '@/lib/utils'

interface InlineErrorProps {
  message: string
  className?: string
}

export function InlineError({ message, className }: InlineErrorProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive',
        className,
      )}
    >
      <AlertCircle size={16} className="shrink-0" />
      <span>{message}</span>
    </div>
  )
}
