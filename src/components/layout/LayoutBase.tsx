'use client'

import { type UserRole } from '@/contexts/auth-context'
import { SidebarProvider } from '@/contexts/sidebar-context'
import { alunoNav, professorNav, secretariaNav } from '@/lib/nav-config'
import { CommandPalette } from './CommandPalette'
import { Header } from './Header'
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
      <CommandPalette />
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar navItems={navItems} />

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
