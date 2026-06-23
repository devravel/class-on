'use client'

import { useEffect } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error('Erro na aplicação:', error)
  }, [error])

  return (
    <html lang="pt-BR">
      <body className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="w-full max-w-md rounded-card border border-destructive/20 bg-surface p-6 text-center shadow-light">
          <AlertCircle className="mx-auto mb-3 h-10 w-10 text-destructive" />
          <h1 className="text-lg font-semibold text-text-primary">
            Algo deu errado
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Não foi possível carregar esta página. Tente novamente.
          </p>
          <Button className="mt-6" onClick={reset}>
            <RefreshCw size={16} className="mr-1" />
            Tentar novamente
          </Button>
        </div>
      </body>
    </html>
  )
}
