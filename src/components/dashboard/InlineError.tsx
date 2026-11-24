import { AlertCircle } from 'lucide-react'

import { cn } from '@/lib/utils'

interface InlineErrorProps {
  message: string
  className?: string
}

export function InlineError({ message, className }: InlineErrorProps) {
  return (
    // role="alert" anuncia na hora que a mensagem aparece — erro de
    // carregamento não pode passar em silêncio pra quem usa leitor de tela.
    <div
      role="alert"
      className={cn(
        'flex items-center gap-2.5 rounded-component bg-danger-soft px-4 py-3 text-sm font-medium text-danger',
        className,
      )}
    >
      <AlertCircle size={16} aria-hidden="true" className="shrink-0" />
      <span>{message}</span>
    </div>
  )
}
