'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, UserRole } from '@/contexts/auth-context'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole: UserRole
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated) {
      router.replace('/login')
      return
    }

    if (user?.role !== requiredRole) {
      router.replace('/login')
    }
  }, [isAuthenticated, isLoading, requiredRole, router, user])

  // Aguarda hidratação do contexto sem flash de conteúdo
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
      </div>
    )
  }

  // Bloqueia render enquanto o redirect ainda não navegou
  if (!isAuthenticated || user?.role !== requiredRole) {
    return null
  }

  return <>{children}</>
}
