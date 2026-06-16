'use client'

import { Toaster as SonnerToaster } from 'sonner'

export function Toaster() {
  return (
    <SonnerToaster
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
