import { type LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

interface AppShellMockupProps {
  navIcons: LucideIcon[]
  activeIndex?: number
  url: string
  children: React.ReactNode
}

/**
 * Réplica em miniatura do shell real do produto (LayoutBase + Sidebar):
 * fundo claro com o rail escuro flutuando por cima — a mesma composição
 * usada nas áreas autenticadas. Se o shell mudar, esse mockup muda junto,
 * senão a landing anuncia uma interface que não existe mais.
 */
export function AppShellMockup({
  navIcons,
  activeIndex = 0,
  url,
  children,
}: AppShellMockupProps) {
  return (
    <div className="overflow-hidden rounded-rail bg-ink-800 p-2.5 shadow-2xl ring-1 ring-white/10 sm:p-3">
      {/* Barra de navegador */}
      <div className="mb-2.5 flex items-center gap-3 px-2">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        </div>
        <div className="flex-1 truncate rounded-md bg-white/5 px-3 py-1 text-center text-[11px] text-white/40">
          {url}
        </div>
        <div className="hidden h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/5 sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
        </div>
      </div>

      {/* Viewport claro — é o fundo da aplicação, não uma moldura */}
      <div className="flex h-[440px] gap-2.5 overflow-hidden rounded-modal bg-background p-2.5 sm:h-[480px]">
        {/* Mini rail escuro, flutuando igual ao do produto */}
        <div className="rail-dark hidden w-14 shrink-0 flex-col items-center gap-1.5 rounded-xl py-3 sm:flex">
          {navIcons.map((Icon, index) => (
            <div
              key={index}
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-md transition-colors duration-300',
                index === activeIndex
                  ? 'bg-brand-500 text-white shadow-brand'
                  : 'text-white/40',
              )}
            >
              <Icon size={16} />
            </div>
          ))}
        </div>

        <div className="min-w-0 flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}
