'use client'

import { type UserRole } from '@/contexts/auth-context'
import { PageHeaderProvider } from '@/contexts/page-header-context'
import { SidebarProvider } from '@/contexts/sidebar-context'
import { alunoNav, professorNav, secretariaNav } from '@/lib/nav-config'
import { cn } from '@/lib/utils'
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
        <div className="app-shell-gradient flex h-screen overflow-hidden">
          <Sidebar navItems={navItems} />

          <div className="flex min-w-0 flex-1 flex-col overflow-hidden pt-3 pb-3 pl-3 lg:pt-4 lg:pb-4 lg:pl-4">
            <main
              className={cn(
                'content-panel flex min-h-0 flex-1 flex-col overflow-hidden',
                'rounded-l-[32px] shadow-medium ring-1 ring-white/10',
              )}
            >
              <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
            </main>
          </div>
        </div>
      </PageHeaderProvider>
    </SidebarProvider>
  )
}
