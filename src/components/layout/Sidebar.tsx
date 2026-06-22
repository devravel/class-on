'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LogOut, Menu, Search } from 'lucide-react'

import { useAuth } from '@/contexts/auth-context'
import { useSidebar } from '@/contexts/sidebar-context'
import { pageHeaderTopOffset } from '@/components/layout/PageContainer'
import { type NavItem } from '@/lib/nav-config'
import { cn } from '@/lib/utils'

const ROLE_LABEL: Record<string, string> = {
  SECRETARIA: 'Secretaria',
  PROFESSOR: 'Professor',
  ALUNO: 'Aluno',
}

interface SidebarProps {
  navItems: NavItem[]
}

export function Sidebar({ navItems }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, signOut } = useAuth()
  const { isCollapsed, isMobileOpen, closeMobile, toggleMobile } = useSidebar()
  const [isHovered, setIsHovered] = useState(false)
  const [commandShortcut, setCommandShortcut] = useState('Ctrl+K')
  const showExpanded = !isCollapsed || isHovered

  const initials = user?.email?.[0]?.toUpperCase() ?? 'U'
  const roleLabel = user?.role ? (ROLE_LABEL[user.role] ?? '') : ''

  useEffect(() => {
    const isMac =
      typeof navigator !== 'undefined' &&
      (/Mac|iPhone|iPad|iPod/.test(navigator.platform) ||
        navigator.userAgent.includes('Mac'))
    setCommandShortcut(isMac ? '⌘K' : 'Ctrl+K')
  }, [])

  function handleSignOut() {
    signOut()
    router.replace('/login')
  }

  function openCommandPalette() {
    window.dispatchEvent(new Event('classon:open-command-palette'))
  }

  const navButtonClass = (active = false) =>
    cn(
      'group flex items-center rounded-component text-sm font-medium transition-colors',
      showExpanded ? 'w-full gap-3 px-3 py-2' : 'w-10 justify-center px-2 py-2.5',
      active
        ? 'bg-primary text-white'
        : 'text-text-secondary hover:bg-neutral-200 hover:text-text-primary',
    )

  return (
    <>
      {/* Mobile menu trigger — visible when sidebar is closed */}
      {!isMobileOpen && (
        <button
          type="button"
          onClick={toggleMobile}
          className="fixed left-3 top-3 z-50 flex items-center justify-center rounded-component border border-border bg-surface p-2 text-text-secondary shadow-light transition-colors hover:bg-neutral-200 hover:text-text-primary lg:hidden"
          aria-label="Abrir menu"
        >
          <Menu size={20} />
        </button>
      )}

      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={closeMobile}
          aria-hidden
        />
      )}

      <aside
        onMouseEnter={() => isCollapsed && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex h-screen flex-col justify-between border-r border-border bg-surface',
          'transition-all duration-300 ease-in-out',
          'lg:static lg:z-auto lg:translate-x-0',
          isMobileOpen ? 'translate-x-0 shadow-medium' : '-translate-x-full lg:translate-x-0',
          showExpanded ? 'w-60' : 'w-[72px]',
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            'w-full shrink-0 border-b border-border px-3 pb-5',
            pageHeaderTopOffset,
          )}
        >
          <div className="flex items-center justify-center">
            {showExpanded ? (
              <img
                src="/LOGO.svg"
                alt="ClassOn"
                className="max-h-[49px] w-[83.6%] max-w-[190px] object-contain object-center"
              />
            ) : (
              <img
                src="/assets/logo/no_name_logo.svg"
                alt="ClassOn"
                className="h-[42px] w-[42px] object-contain object-center"
              />
            )}
          </div>
        </div>

        {/* Buscar — below the line */}
        <div
          className={cn(
            'w-full shrink-0 py-3',
            showExpanded ? 'px-3' : 'flex justify-center px-2',
          )}
        >
          <div className={showExpanded ? 'mx-auto w-[88%] max-w-[200px]' : undefined}>
            <button
            type="button"
            onClick={openCommandPalette}
            title={showExpanded ? undefined : 'Buscar'}
            aria-label="Abrir paleta de comandos"
            className={navButtonClass()}
          >
            <Search
              size={20}
              className="shrink-0 text-neutral-500 group-hover:text-text-primary"
            />
            {showExpanded && (
              <>
                <span className="flex-1 truncate text-left">Buscar</span>
                <kbd className="shrink-0 rounded border border-border bg-surface px-1 py-0.5 font-mono text-[10px] text-text-secondary">
                  {commandShortcut}
                </kbd>
              </>
            )}
          </button>
          </div>
        </div>

        {/* Navigation — centered in middle */}
        <div className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto">
          <nav
            className={cn(
              'flex flex-col gap-0.5',
              showExpanded ? 'w-[88%] max-w-[200px]' : 'w-full items-center px-2',
            )}
          >
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={showExpanded ? undefined : item.label}
                  className={navButtonClass(isActive)}
                >
                  <Icon
                    size={20}
                    className={cn(
                      'shrink-0',
                      isActive ? 'text-white' : 'text-neutral-500 group-hover:text-text-primary',
                    )}
                  />
                  {showExpanded && (
                    <span className="truncate">{item.label}</span>
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Sair + User profile — fixed at bottom */}
        <div className="shrink-0">
          <div
            className={cn(
              'border-t border-border',
              showExpanded ? 'px-4 py-2' : 'flex justify-center px-2 py-2',
            )}
          >
            <button
              type="button"
              onClick={handleSignOut}
              title="Sair"
              aria-label="Sair"
              className={navButtonClass()}
            >
              <LogOut
                size={20}
                className="shrink-0 text-neutral-500 group-hover:text-text-primary"
              />
              {showExpanded && <span className="truncate">Sair</span>}
            </button>
          </div>

          {user && (
            <div
              className={cn(
                'border-t border-border',
                showExpanded ? 'px-4 py-3' : 'flex justify-center px-2 py-3',
              )}
            >
              <div
                className={cn(
                  'flex items-center',
                  showExpanded ? 'gap-3' : 'justify-center',
                )}
              >
                <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
                  {initials}
                </div>
                {showExpanded && (
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium leading-none text-text-primary">
                      {user.email}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-text-secondary">
                      {roleLabel}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
