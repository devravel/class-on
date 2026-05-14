'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen } from 'lucide-react'

import { cn } from '@/lib/utils'
import { type NavItem } from '@/lib/nav-config'
import { useSidebar } from '@/contexts/sidebar-context'

interface SidebarProps {
  navItems: NavItem[]
}

export function Sidebar({ navItems }: SidebarProps) {
  const pathname = usePathname()
  const { isCollapsed, isMobileOpen, closeMobile } = useSidebar()

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={closeMobile}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex flex-col border-r border-border bg-surface',
          'transition-all duration-300 ease-in-out',
          'lg:static lg:z-auto lg:translate-x-0',
          isMobileOpen ? 'translate-x-0 shadow-medium' : '-translate-x-full lg:translate-x-0',
          isCollapsed ? 'w-[72px]' : 'w-60',
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            'flex h-16 shrink-0 items-center border-b border-border',
            isCollapsed ? 'justify-center' : 'gap-2.5 px-4',
          )}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-component bg-primary text-white">
            <BookOpen size={16} strokeWidth={2.5} />
          </div>
          {!isCollapsed && (
            <span className="text-sm font-semibold text-text-primary">ClassOn</span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                title={isCollapsed ? item.label : undefined}
                className={cn(
                  'group flex items-center gap-3 rounded-component text-sm font-medium transition-colors',
                  isCollapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2',
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-text-secondary hover:bg-neutral-200 hover:text-text-primary',
                )}
              >
                <Icon
                  size={20}
                  className={cn(
                    'shrink-0',
                    isActive ? 'text-white' : 'text-neutral-500 group-hover:text-text-primary',
                  )}
                />
                {!isCollapsed && (
                  <span className="truncate">{item.label}</span>
                )}
              </Link>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
