import type { Metadata } from 'next'

import { LandingPage } from '@/components/marketing/LandingPage'

export const metadata: Metadata = {
  title: 'ClassOn — Sistema de Gestão Escolar Full-Stack',
  description:
    'Plataforma completa de gestão escolar que conecta secretaria, professores e alunos — matrículas, boletim, frequência e um copiloto de Inteligência Artificial nativo.',
}

export default function Home() {
  return <LandingPage />
}
