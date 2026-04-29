import { ProtectedRoute } from '@/components/auth/protected-route'

export default function ProfessorLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute requiredRole="PROFESSOR">{children}</ProtectedRoute>
}
