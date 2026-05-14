import { ProtectedRoute } from '@/components/auth/protected-route'
import { LayoutBase } from '@/components/layout/LayoutBase'

export default function AlunoLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRole="ALUNO">
      <LayoutBase role="ALUNO">{children}</LayoutBase>
    </ProtectedRoute>
  )
}
