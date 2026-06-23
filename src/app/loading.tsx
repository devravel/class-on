import { PageLoader } from '@/components/ui/page-loader'

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <PageLoader label="Carregando..." />
    </div>
  )
}
