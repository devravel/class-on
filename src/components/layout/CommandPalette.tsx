'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react'
import { useRouter } from 'next/navigation'
import { getClassShortLabel } from '@/lib/class-utils'
import {
  Building2,
  ClipboardList,
  GraduationCap,
  Megaphone,
  Search,
  UserRound,
  type LucideIcon,
} from 'lucide-react'

import { useAuth } from '@/contexts/auth-context'
import { studentsApi } from '@/lib/api/students'
import { cn } from '@/lib/utils'
import type { Student } from '@/types/student'

type PaletteItem = {
  id: string
  label: string
  description?: string
  href: string
  icon: LucideIcon
  keywords?: string[]
}

const NAV_ACTIONS: PaletteItem[] = [
  {
    id: 'nav-secretaria',
    label: 'Ir para Secretaria',
    description: 'Painel administrativo',
    href: '/secretaria',
    icon: Building2,
    keywords: ['secretaria', 'admin', 'dashboard'],
  },
  {
    id: 'nav-professor-notas',
    label: 'Lançar Notas (Professor)',
    description: 'Gestão de turmas e avaliações',
    href: '/professor/turmas',
    icon: ClipboardList,
    keywords: ['professor', 'notas', 'turmas', 'lançar'],
  },
  {
    id: 'nav-aluno-boletim',
    label: 'Ver Meu Boletim (Alunos)',
    description: 'Notas e frequência escolar',
    href: '/aluno/notas',
    icon: GraduationCap,
    keywords: ['aluno', 'boletim', 'notas', 'frequência'],
  },
  {
    id: 'nav-comunicados',
    label: 'Enviar Comunicado',
    description: 'Comunicados institucionais',
    href: '/secretaria/comunicados',
    icon: Megaphone,
    keywords: ['comunicado', 'avisos', 'mensagem'],
  },
]

/** Alunos previstos no seed de demonstração (PROMPT 04) para busca offline na paleta. */
const SEED_DEMO_STUDENTS: Array<{
  full_name: string
  rm: string
  email: string
  className: string
}> = [
  {
    full_name: 'Ana Beatriz Souza',
    rm: '26101',
    email: 'aluno1@classon.com',
    className: '9º Ano A',
  },
  {
    full_name: 'Bruno Henrique Lima',
    rm: '26102',
    email: 'aluno2@classon.com',
    className: '9º Ano A',
  },
  {
    full_name: 'Carlos Eduardo Mendes',
    rm: '26103',
    email: 'aluno3@classon.com',
    className: '9º Ano A',
  },
  {
    full_name: 'Diana Oliveira Costa',
    rm: '26104',
    email: 'aluno4@classon.com',
    className: '9º Ano A',
  },
  {
    full_name: 'Eduardo Santos Pereira',
    rm: '26105',
    email: 'aluno5@classon.com',
    className: '9º Ano A',
  },
]

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function matchesQuery(item: PaletteItem, query: string): boolean {
  if (!query) return true

  const haystack = [
    item.label,
    item.description ?? '',
    ...(item.keywords ?? []),
  ]
    .join(' ')
    .toLowerCase()

  return normalizeText(haystack).includes(normalizeText(query))
}

function studentToPaletteItem(student: Student): PaletteItem {
  const classLabel = student.enrollments?.[0]?.classes
    ? getClassShortLabel(student.enrollments[0].classes)
    : undefined

  return {
    id: `student-${student.id}`,
    label: student.full_name,
    description: [student.rm, classLabel].filter(Boolean).join(' · '),
    href: `/secretaria/alunos/${student.id}/editar`,
    icon: UserRound,
    keywords: [student.users.email, student.rm],
  }
}

function seedStudentToPaletteItem(
  seed: (typeof SEED_DEMO_STUDENTS)[number],
): PaletteItem {
  return {
    id: `seed-${seed.rm}`,
    label: seed.full_name,
    description: `${seed.rm} · ${seed.className}`,
    href: `/secretaria/alunos?q=${encodeURIComponent(seed.full_name)}`,
    icon: UserRound,
    keywords: [seed.email, seed.rm, seed.className],
  }
}

export function CommandPalette() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const [students, setStudents] = useState<Student[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const loadStudents = useCallback(async () => {
    if (user?.role !== 'SECRETARIA') return

    try {
      const data = await studentsApi.list()
      setStudents(data)
    } catch {
      setStudents([])
    }
  }, [user?.role])

  const closePalette = useCallback(() => {
    setIsOpen(false)
    setQuery('')
    setActiveIndex(0)
  }, [])

  const openPalette = useCallback(() => {
    setIsOpen(true)
    setQuery('')
    setActiveIndex(0)
    void loadStudents()
  }, [loadStudents])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const isModifier = event.metaKey || event.ctrlKey
      if (isModifier && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        if (isOpen) {
          closePalette()
        } else if (isAuthenticated) {
          openPalette()
        }
      }

      if (event.key === 'Escape' && isOpen) {
        event.preventDefault()
        closePalette()
      }
    }

    function handleOpenEvent() {
      if (isAuthenticated) {
        openPalette()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('classon:open-command-palette', handleOpenEvent)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('classon:open-command-palette', handleOpenEvent)
    }
  }, [closePalette, isAuthenticated, isOpen, openPalette])

  useEffect(() => {
    if (isOpen) {
      const timer = window.setTimeout(() => inputRef.current?.focus(), 50)
      return () => window.clearTimeout(timer)
    }
  }, [isOpen])

  const studentItems = useMemo(() => {
    const normalizedQuery = normalizeText(query)
    if (!normalizedQuery) return []

    const apiItems = students
      .filter((student) => {
        const haystack = [
          student.full_name,
          student.rm,
          student.users.email,
        ].join(' ')

        return normalizeText(haystack).includes(normalizedQuery)
      })
      .map(studentToPaletteItem)

    if (apiItems.length > 0) return apiItems

    return SEED_DEMO_STUDENTS.filter((seed) => {
      const haystack = [seed.full_name, seed.rm, seed.email, seed.className].join(
        ' ',
      )
      return normalizeText(haystack).includes(normalizedQuery)
    }).map(seedStudentToPaletteItem)
  }, [query, students])

  const navItems = useMemo(
    () => NAV_ACTIONS.filter((item) => matchesQuery(item, query)),
    [query],
  )

  const items = useMemo(
    () => [...navItems, ...studentItems],
    [navItems, studentItems],
  )

  useEffect(() => {
    setActiveIndex(0)
  }, [query])

  useEffect(() => {
    if (!listRef.current) return

    const activeElement = listRef.current.querySelector<HTMLElement>(
      `[data-index="${activeIndex}"]`,
    )
    activeElement?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex, items.length])

  function navigateTo(href: string) {
    closePalette()
    router.push(href)
  }

  function handleInputKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((current) => (current + 1) % Math.max(items.length, 1))
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((current) =>
        current === 0 ? Math.max(items.length - 1, 0) : current - 1,
      )
    }

    if (event.key === 'Enter' && items[activeIndex]) {
      event.preventDefault()
      navigateTo(items[activeIndex].href)
    }
  }

  if (!isAuthenticated) return null

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[min(20vh,120px)]">
          <button
            type="button"
            aria-label="Fechar paleta de comandos"
            className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm animate-in fade-in-0 duration-200"
            onClick={closePalette}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label="Paleta de comandos"
            className={cn(
              'relative z-10 w-full max-w-xl overflow-hidden rounded-modal border border-border bg-surface shadow-medium',
              'animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200',
            )}
          >
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <Search className="h-5 w-5 shrink-0 text-text-secondary" />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="Buscar ações ou alunos..."
                className="flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-secondary"
                aria-label="Buscar na paleta de comandos"
              />
              <kbd className="hidden rounded border border-border bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-text-secondary sm:inline">
                ESC
              </kbd>
            </div>

            <div ref={listRef} className="max-h-[min(50vh,360px)] overflow-y-auto p-2">
              {items.length === 0 ? (
                <p className="px-3 py-8 text-center text-sm text-text-secondary">
                  Nenhum resultado para &ldquo;{query}&rdquo;
                </p>
              ) : (
                <>
                  {navItems.length > 0 && (
                    <p className="px-3 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
                      Navegação rápida
                    </p>
                  )}

                  {navItems.map((item, index) => {
                    const Icon = item.icon
                    const isActive = activeIndex === index

                    return (
                      <button
                        key={item.id}
                        type="button"
                        data-index={index}
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => navigateTo(item.href)}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-component px-3 py-2.5 text-left transition-colors',
                          isActive
                            ? 'bg-primary text-white'
                            : 'text-text-primary hover:bg-neutral-200',
                        )}
                      >
                        <span
                          className={cn(
                            'flex h-9 w-9 shrink-0 items-center justify-center rounded-component',
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-brand-100 text-brand-700',
                          )}
                        >
                          <Icon size={18} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium">
                            {item.label}
                          </span>
                          {item.description && (
                            <span
                              className={cn(
                                'block truncate text-xs',
                                isActive ? 'text-white/80' : 'text-text-secondary',
                              )}
                            >
                              {item.description}
                            </span>
                          )}
                        </span>
                      </button>
                    )
                  })}

                  {studentItems.length > 0 && (
                    <>
                      <p className="px-3 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
                        Alunos
                      </p>

                      {studentItems.map((item, studentIndex) => {
                        const Icon = item.icon
                        const index = navItems.length + studentIndex
                        const isActive = activeIndex === index

                        return (
                          <button
                            key={item.id}
                            type="button"
                            data-index={index}
                            onMouseEnter={() => setActiveIndex(index)}
                            onClick={() => navigateTo(item.href)}
                            className={cn(
                              'flex w-full items-center gap-3 rounded-component px-3 py-2.5 text-left transition-colors',
                              isActive
                                ? 'bg-primary text-white'
                                : 'text-text-primary hover:bg-neutral-200',
                            )}
                          >
                            <span
                              className={cn(
                                'flex h-9 w-9 shrink-0 items-center justify-center rounded-component',
                                isActive
                                  ? 'bg-white/20 text-white'
                                  : 'bg-neutral-200 text-neutral-700',
                              )}
                            >
                              <Icon size={18} />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-medium">
                                {item.label}
                              </span>
                              {item.description && (
                                <span
                                  className={cn(
                                    'block truncate text-xs',
                                    isActive
                                      ? 'text-white/80'
                                      : 'text-text-secondary',
                                  )}
                                >
                                  {item.description}
                                </span>
                              )}
                            </span>
                          </button>
                        )
                      })}
                    </>
                  )}
                </>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-border bg-neutral-100 px-4 py-2.5 text-[11px] text-text-secondary">
              <span>Use ↑ ↓ para navegar</span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-border bg-surface px-1.5 py-0.5 font-medium">
                  Enter
                </kbd>
                <span>para abrir</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
