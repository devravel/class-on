'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, UserRole } from '@/contexts/auth-context'
import { getRoleHome } from '@/lib/auth-routes'
import { PageLoader } from '@/components/ui/page-loader'

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
      router.replace(getRoleHome(user?.role))
    }
  }, [isAuthenticated, isLoading, requiredRole, router, user])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <PageLoader />
      </div>
    )
  }

  if (!isAuthenticated || user?.role !== requiredRole) {
    return null
  }

  return <>{children}</>
}
