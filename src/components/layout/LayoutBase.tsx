'use client'

import { type UserRole } from '@/contexts/auth-context'
import { PageHeaderProvider } from '@/contexts/page-header-context'
import { SidebarProvider } from '@/contexts/sidebar-context'
import { alunoNav, professorNav, secretariaNav } from '@/lib/nav-config'
import { CommandPalette } from './CommandPalette'
import { Sidebar } from './Sidebar'

const NAV_BY_ROLE = {
  SECRETARIA: secretariaNav,
  PROFESSOR: professorNav,
  ALUNO: alunoNav,
}

interface LayoutBaseProps {
  children: React.ReactNode
  role: UserRole
}

export function LayoutBase({ children, role }: LayoutBaseProps) {
  const navItems = NAV_BY_ROLE[role]

  return (
    <SidebarProvider>
      <PageHeaderProvider>
        <CommandPalette />
        {/* Primeiro tab da página: pula o rail inteiro e cai no conteúdo. */}
        <a href="#conteudo" className="skip-link">
          Pular para o conteúdo
        </a>

        {/* Fundo claro, rail escuro flutuando por cima — o conteúdo é a
            superfície principal, não um painel encaixado no gradiente. */}
        <div className="app-shell flex h-screen overflow-hidden">
          <Sidebar navItems={navItems} />

          <main
            id="conteudo"
            tabIndex={-1}
            className="min-h-0 min-w-0 flex-1 overflow-y-auto focus:outline-none"
          >
            {children}
          </main>
        </div>
      </PageHeaderProvider>
    </SidebarProvider>
  )
}
