'use client'

import { Toaster as SonnerToaster } from 'sonner'

import { useTheme } from '@/contexts/theme-context'

export function Toaster() {
  const { resolvedTheme } = useTheme()

  return (
    <SonnerToaster
      theme={resolvedTheme}
      position="top-center"
      closeButton
      richColors
      duration={5200}
      toastOptions={{
        classNames: {
          toast: 'font-sans',
        },
      }}
    />
  )
}
