import type { Metadata } from 'next'
import { Bricolage_Grotesque, IBM_Plex_Sans } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'
import { THEME_INIT_SCRIPT } from '@/contexts/theme-context'
import { Providers } from './providers'

/**
 * Interface e dados. Humanista técnica: some na tabela de nota e frequência,
 * que é onde a fonte não pode chamar atenção. `latin-ext` entra pelos acentos.
 */
const plexSans = IBM_Plex_Sans({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
})

/** Títulos e saudação. Número de KPI fica na Plex — dado não leva display. */
const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
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
    // suppressHydrationWarning: o script abaixo muda a classe do <html> antes
    // da hidratação, então servidor e cliente divergem de propósito.
    <html
      lang="pt-BR"
      className={cn('font-sans', plexSans.variable, bricolage.variable)}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className={cn('font-sans', plexSans.className)}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
