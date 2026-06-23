import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'
import { Providers } from './providers'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'ClassOn',
  description: 'Sistema de Gestão Escolar',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={cn('font-sans', inter.variable)}>
      <body className={cn('font-sans', inter.className)}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
