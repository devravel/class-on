import { ProtectedRoute } from '@/components/auth/protected-route'

export default function AlunoLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute requiredRole="ALUNO">{children}</ProtectedRoute>
}
