'use client'

import { Monitor, Moon, Sun } from 'lucide-react'

import { useTheme, type Theme } from '@/contexts/theme-context'
import { cn } from '@/lib/utils'

const OPTIONS: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Tema claro', icon: Sun },
  { value: 'dark', label: 'Tema escuro', icon: Moon },
  { value: 'system', label: 'Seguir o sistema', icon: Monitor },
]

interface ThemeToggleProps {
  className?: string
  /** `rail` inverte as cores pro trilho escuro. */
  tone?: 'surface' | 'rail'
}

/**
 * Três estados explícitos em vez de um botão que alterna: "seguir o sistema"
 * não dá pra representar num toggle de dois.
 *
 * É um radiogroup, não um grupo de botões — leitor de tela anuncia "3 opções,
 * 1 selecionada" e as setas navegam entre elas.
 */
export function ThemeToggle({ className, tone = 'surface' }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()

  return (
    <div
      role="radiogroup"
      aria-label="Tema da interface"
      className={cn(
        'inline-flex items-center gap-0.5 rounded-full p-1',
        tone === 'rail' ? 'bg-white/10' : 'bg-surface-sunken',
        className,
      )}
    >
      {OPTIONS.map((option) => {
        const Icon = option.icon
        const isActive = theme === option.value

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={option.label}
            title={option.label}
            onClick={() => setTheme(option.value)}
            className={cn(
              'inline-flex size-7 items-center justify-center rounded-full transition-colors',
              isActive
                ? tone === 'rail'
                  ? 'bg-white/20 text-white'
                  : 'bg-surface text-primary shadow-sm'
                : tone === 'rail'
                  ? 'text-white/60 hover:text-white'
                  : 'text-text-tertiary hover:text-text-primary',
            )}
          >
            <Icon size={15} aria-hidden="true" />
          </button>
        )
      })}
    </div>
  )
}
