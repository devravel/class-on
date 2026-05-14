'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { usePathname } from 'next/navigation'

const BASE_ROUTES = ['/secretaria', '/professor', '/aluno']

interface SidebarContextValue {
  isCollapsed: boolean
  isMobileOpen: boolean
  toggleCollapsed: () => void
  toggleMobile: () => void
  closeMobile: () => void
}

const SidebarContext = createContext<SidebarContextValue | undefined>(undefined)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const [isCollapsed, setIsCollapsed] = useState(
    () => !BASE_ROUTES.includes(pathname),
  )
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  useEffect(() => {
    setIsCollapsed(!BASE_ROUTES.includes(pathname))
    setIsMobileOpen(false)
  }, [pathname])

  const toggleCollapsed = useCallback(() => setIsCollapsed((v) => !v), [])
  const toggleMobile = useCallback(() => setIsMobileOpen((v) => !v), [])
  const closeMobile = useCallback(() => setIsMobileOpen(false), [])

  const value = useMemo(
    () => ({ isCollapsed, isMobileOpen, toggleCollapsed, toggleMobile, closeMobile }),
    [isCollapsed, isMobileOpen, toggleCollapsed, toggleMobile, closeMobile],
  )

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) throw new Error('useSidebar deve ser usado dentro de SidebarProvider')
  return context
}
