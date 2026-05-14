import { ProtectedRoute } from '@/components/auth/protected-route'
import { LayoutBase } from '@/components/layout/LayoutBase'

export default function ProfessorLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRole="PROFESSOR">
      <LayoutBase role="PROFESSOR">{children}</LayoutBase>
    </ProtectedRoute>
  )
}
