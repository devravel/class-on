'use client'

import { useState } from 'react'
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
  const [isHovered, setIsHovered] = useState(false)
  const showExpanded = !isCollapsed || isHovered

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
        onMouseEnter={() => isCollapsed && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex flex-col border-r border-border bg-surface',
          'transition-all duration-300 ease-in-out',
          'lg:static lg:z-auto lg:translate-x-0',
          isMobileOpen ? 'translate-x-0 shadow-medium' : '-translate-x-full lg:translate-x-0',
          showExpanded ? 'w-60' : 'w-[72px]',
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            'flex h-16 shrink-0 items-center border-b border-border',
            showExpanded ? 'gap-2.5 px-4' : 'justify-center',
          )}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-component bg-primary text-white">
            <BookOpen size={16} strokeWidth={2.5} />
          </div>
          {showExpanded && (
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
                title={showExpanded ? undefined : item.label}
                className={cn(
                  'group flex items-center gap-3 rounded-component text-sm font-medium transition-colors',
                  showExpanded ? 'px-3 py-2' : 'justify-center px-2 py-2.5',
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
                {showExpanded && (
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
