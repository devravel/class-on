import { ProtectedRoute } from '@/components/auth/protected-route'
import { LayoutBase } from '@/components/layout/LayoutBase'

export default function SecretariaLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRole="SECRETARIA">
      <LayoutBase role="SECRETARIA">{children}</LayoutBase>
    </ProtectedRoute>
  )
}
