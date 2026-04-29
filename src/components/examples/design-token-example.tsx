import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export function DesignTokenExample() {
  return (
    <Card className="w-full max-w-md rounded-card border border-border bg-surface p-6 shadow-light">
      <h2 className="text-xl font-bold text-text-primary">Design Tokens ClassOn</h2>
      <p className="mt-2 text-sm text-text-secondary">
        Este bloco demonstra o uso de tokens sem cores hardcoded.
      </p>

      <div className="mt-6">
        <Button className="h-11 rounded-component bg-brand-500 text-white hover:bg-brand-600">
          Botao Primary
        </Button>
      </div>
    </Card>
  )
}
