import { ProtectedRoute } from '@/components/auth/protected-route'

export default function SecretariaLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute requiredRole="SECRETARIA">{children}</ProtectedRoute>
}
