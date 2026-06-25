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
  assignmentToClassOption,
  buildProfessorActionHref,
  createLocalIntentResponse,
  detectLocalCommandIntent,
  filterProfessorClasses,
  getProfessorActionLabel,
  getUnrecognizedFallbackMessage,
  normalizeCommandText,
  resolveCommandIntentResponse,
  resolveLocalIntentForRole,
  shouldShowUnrecognizedFallback,
  type CommandIntentResponse,
  type PaletteNestedView,
  type ProfessorClassOption,
  type ProfessorCommandAction,
} from '@/lib/command-intent'
import {
  BarChart2,
  BookOpen,
  Calendar,
  ClipboardList,
  GraduationCap,
  ListTodo,
  Loader2,
  Megaphone,
  Plus,
  Search,
  UserCheck,
  UserRound,
  type LucideIcon,
} from 'lucide-react'

import { useAuth, type UserRole } from '@/contexts/auth-context'
import { assignmentsApi, authApi } from '@/lib/api'
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
  professorIntent?: ProfessorCommandAction
}

const COMMAND_INTENT_TIMEOUT_MS = 1500

const NAV_BY_ROLE: Record<UserRole, PaletteItem[]> = {
  SECRETARIA: [
    {
      id: 'nav-secretaria-painel',
      label: 'Painel e Métricas',
      description: 'Gráfico de risco e evasão escolar',
      href: '/secretaria',
      icon: BarChart2,
      keywords: ['secretaria', 'painel', 'dashboard', 'risco', 'evasao', 'metricas', 'grafico'],
    },
    {
      id: 'nav-alunos',
      label: 'Gerenciar Alunos',
      description: 'Cadastro, matrículas e busca',
      href: '/secretaria/alunos',
      icon: UserRound,
      keywords: ['alunos', 'matricula', 'cadastro', 'estudante', 'listar', 'buscar'],
    },
    {
      id: 'nav-criar-turma',
      label: 'Criar Turma',
      description: 'Cadastrar nova turma no ano letivo',
      href: '/secretaria/turmas/nova',
      icon: Plus,
      keywords: [
        'criar turma',
        'nova turma',
        'cadastrar turma',
        'adicionar turma',
        'registrar turma',
        'turma nova',
        'criar classe',
        'nova classe',
      ],
    },
    {
      id: 'nav-secretaria-turmas',
      label: 'Gerenciar Turmas',
      description: 'Turmas, séries e matrículas',
      href: '/secretaria/turmas',
      icon: BookOpen,
      keywords: ['turmas', 'series', 'classes', 'matricula', 'gerenciar turmas', 'listar turmas'],
    },
    {
      id: 'nav-comunicados',
      label: 'Enviar Comunicado',
      description: 'Avisos institucionais e comunicados',
      href: '/secretaria/comunicados',
      icon: Megaphone,
      keywords: ['comunicado', 'avisos', 'mensagem', 'gerar comunicado', 'pais'],
    },
  ],
  PROFESSOR: [
    {
      id: 'prof-chamada',
      label: 'Realizar Chamada',
      description: 'Registrar presença e faltas',
      href: '/professor/turmas',
      icon: UserCheck,
      professorIntent: 'chamada',
      keywords: ['chamada', 'presenca', 'frequencia', 'faltas', 'diario'],
    },
    {
      id: 'prof-notas',
      label: 'Lançar Notas',
      description: 'Lançamento e recuperação',
      href: '/professor/turmas',
      icon: ClipboardList,
      professorIntent: 'notas',
      keywords: ['notas', 'lancar notas', 'medias', 'recuperacao', 'boletim'],
    },
    {
      id: 'prof-tarefa',
      label: 'Criar Tarefa',
      description: 'Dever de casa e atividades',
      href: '/professor/turmas',
      icon: ListTodo,
      professorIntent: 'tarefa',
      keywords: ['tarefa', 'tarefas', 'atividade', 'dever de casa'],
    },
    {
      id: 'nav-professor-turmas',
      label: 'Minhas Turmas',
      description: 'Ver todas as turmas atribuídas',
      href: '/professor/turmas',
      icon: BookOpen,
      keywords: ['turmas', 'disciplinas', 'salas'],
    },
  ],
  ALUNO: [
    {
      id: 'nav-aluno-boletim',
      label: 'Ver Meu Boletim',
      description: 'Notas por disciplina e bimestre',
      href: '/aluno/notas',
      icon: GraduationCap,
      keywords: ['boletim', 'notas', 'minhas notas'],
    },
    {
      id: 'nav-aluno-frequencia',
      label: 'Minha Frequência',
      description: 'Frequência geral e por disciplina',
      href: '/aluno/frequencia',
      icon: GraduationCap,
      keywords: ['frequencia', 'frequência', 'presenca', 'presença', 'faltas', 'chamada'],
    },
    {
      id: 'nav-aluno-tarefas',
      label: 'Minhas Tarefas',
      description: 'Atividades pendentes e entregas',
      href: '/aluno/tarefas',
      icon: ClipboardList,
      keywords: ['tarefas', 'atividades', 'entregar', 'pendentes'],
    },
    {
      id: 'nav-aluno-comunicados',
      label: 'Comunicados',
      description: 'Avisos e mensagens da escola',
      href: '/aluno/comunicados',
      icon: Megaphone,
      keywords: ['comunicado', 'avisos', 'mensagens'],
    },
    {
      id: 'nav-aluno-calendario',
      label: 'Agendão Escolar',
      description: 'Eventos e calendário acadêmico',
      href: '/aluno/calendario',
      icon: Calendar,
      keywords: ['agendao', 'calendario', 'eventos', 'datas'],
    },
  ],
}

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
  return normalizeCommandText(value)
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

async function fetchCommandIntent(
  input: string,
  role: UserRole,
  availableClasses: string[],
  token: string | null,
): Promise<CommandIntentResponse | null> {
  if (!token) return null

  const controller = new AbortController()
  const timeoutId = window.setTimeout(
    () => controller.abort(),
    COMMAND_INTENT_TIMEOUT_MS,
  )

  try {
    const response = await fetch('/api/ai/command-intent', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ input, role, availableClasses }),
      signal: controller.signal,
    })

    if (!response.ok) return null
    return (await response.json()) as CommandIntentResponse
  } catch {
    return null
  } finally {
    window.clearTimeout(timeoutId)
  }
}

export function CommandPalette() {
  const router = useRouter()
  const { isAuthenticated, user, token } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const [students, setStudents] = useState<Student[]>([])
  const [professorClasses, setProfessorClasses] = useState<ProfessorClassOption[]>([])
  const [nestedView, setNestedView] = useState<PaletteNestedView | null>(null)
  const [isResolvingIntent, setIsResolvingIntent] = useState(false)
  const [forceUnrecognized, setForceUnrecognized] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const prevQueryRef = useRef('')

  const loadStudents = useCallback(async () => {
    if (user?.role !== 'SECRETARIA') return

    try {
      const data = await studentsApi.list()
      setStudents(data)
    } catch {
      setStudents([])
    }
  }, [user?.role])

  const loadProfessorClasses = useCallback(async () => {
    if (user?.role !== 'PROFESSOR') return

    try {
      const me = await authApi.getMe()
      if (!me.teacher) {
        setProfessorClasses([])
        return
      }

      const assignments = await assignmentsApi.getByTeacher(me.teacher.id)
      setProfessorClasses(assignments.map(assignmentToClassOption))
    } catch {
      setProfessorClasses([])
    }
  }, [user?.role])

  const closePalette = useCallback(() => {
    setIsOpen(false)
    setQuery('')
    setActiveIndex(0)
    setNestedView(null)
    setIsResolvingIntent(false)
    setForceUnrecognized(false)
    prevQueryRef.current = ''
  }, [])

  const openPalette = useCallback(() => {
    setIsOpen(true)
    setQuery('')
    setActiveIndex(0)
    setNestedView(null)
    setIsResolvingIntent(false)
    setForceUnrecognized(false)
    prevQueryRef.current = ''
    void loadStudents()
    void loadProfessorClasses()
  }, [loadProfessorClasses, loadStudents])

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

  useEffect(() => {
    const hadQuery = prevQueryRef.current.trim().length > 0
    const hasQuery = query.trim().length > 0

    // Reset nested view only when the user clears typed text — not when opening
    // a class picker from a nav shortcut with an empty query.
    if (hadQuery && !hasQuery && nestedView) {
      setNestedView(null)
    }

    prevQueryRef.current = query
    setForceUnrecognized(false)
  }, [nestedView, query])

  const heuristicIntent = useMemo(() => {
    if (user?.role !== 'PROFESSOR') return null
    return detectLocalCommandIntent(query)
  }, [query, user?.role])

  const activePickerAction = nestedView?.action ?? heuristicIntent

  const classPickerOptions = useMemo(() => {
    if (!activePickerAction) return []
    return filterProfessorClasses(
      professorClasses,
      query,
      activePickerAction,
    )
  }, [activePickerAction, professorClasses, query])

  const isClassPickerMode =
    user?.role === 'PROFESSOR' && Boolean(activePickerAction)

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

    if (process.env.NODE_ENV !== 'development') {
      return []
    }

    return SEED_DEMO_STUDENTS.filter((seed) => {
      const haystack = [seed.full_name, seed.rm, seed.email, seed.className].join(
        ' ',
      )
      return normalizeText(haystack).includes(normalizedQuery)
    }).map(seedStudentToPaletteItem)
  }, [query, students])

  const staticNavItems = useMemo(() => {
    return user?.role ? NAV_BY_ROLE[user.role] : []
  }, [user?.role])

  const navItems = useMemo(() => {
    return staticNavItems.filter((item) => matchesQuery(item, query))
  }, [query, staticNavItems])

  const defaultItems = useMemo(
    () => [...navItems, ...studentItems],
    [navItems, studentItems],
  )

  const isUnrecognized = useMemo(() => {
    if (forceUnrecognized) return true
    if (!query.trim() || isClassPickerMode) return false
    if (defaultItems.length > 0) return false
    return shouldShowUnrecognizedFallback(query, user?.role, false)
  }, [defaultItems.length, forceUnrecognized, isClassPickerMode, query, user?.role])

  const displayNavItems = isUnrecognized ? staticNavItems : navItems
  const displayItems = isUnrecognized ? staticNavItems : defaultItems

  const visibleItemCount = isClassPickerMode
    ? classPickerOptions.length
    : displayItems.length

  useEffect(() => {
    setActiveIndex(0)
  }, [query, isClassPickerMode, classPickerOptions.length, displayItems.length])

  useEffect(() => {
    if (!listRef.current) return

    const activeElement = listRef.current.querySelector<HTMLElement>(
      `[data-index="${activeIndex}"]`,
    )
    activeElement?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex, visibleItemCount])

  const navigateTo = useCallback(
    (href: string) => {
      closePalette()
      router.push(href)
    },
    [closePalette, router],
  )

  const navigateProfessorAction = useCallback(
    (assignmentId: string, action: ProfessorCommandAction) => {
      navigateTo(buildProfessorActionHref(assignmentId, action))
    },
    [navigateTo],
  )

  const openProfessorIntentPicker = useCallback(
    (action: ProfessorCommandAction) => {
      setForceUnrecognized(false)
      setNestedView({ mode: 'class-picker', action, source: 'heuristic' })
      setActiveIndex(0)
    },
    [],
  )

  const handlePaletteItemSelect = useCallback(
    (item: PaletteItem) => {
      if (item.professorIntent && user?.role === 'PROFESSOR') {
        openProfessorIntentPicker(item.professorIntent)
        return
      }

      navigateTo(item.href)
    },
    [navigateTo, openProfessorIntentPicker, user?.role],
  )

  const resolveHybridIntent = useCallback(async (): Promise<boolean> => {
    const trimmedQuery = query.trim()
    if (!trimmedQuery || !user?.role) return false

    setForceUnrecognized(false)
    setIsResolvingIntent(true)

    try {
      const localResolution = resolveLocalIntentForRole(
        user.role,
        trimmedQuery,
        professorClasses,
      )

      if (localResolution?.type === 'navigate') {
        navigateTo(localResolution.href)
        return true
      }

      const aiResponse = await fetchCommandIntent(
        trimmedQuery,
        user.role,
        user.role === 'PROFESSOR'
          ? professorClasses.map((classOption) => classOption.shortLabel)
          : [],
        token,
      )

      if (aiResponse) {
        const aiResolution = resolveCommandIntentResponse(
          user.role,
          aiResponse,
          professorClasses,
        )

        if (aiResolution?.type === 'navigate') {
          navigateTo(aiResolution.href)
          return true
        }

        if (aiResolution?.type === 'class-picker') {
          setNestedView({
            mode: 'class-picker',
            action: aiResolution.action,
            source: 'ai',
          })
          return true
        }

        if (aiResolution?.type === 'unknown') {
          const fallbackResponse = createLocalIntentResponse(
            user.role,
            trimmedQuery,
            professorClasses,
          )
          const fallbackResolution = resolveCommandIntentResponse(
            user.role,
            fallbackResponse,
            professorClasses,
          )

          if (fallbackResolution?.type === 'navigate') {
            navigateTo(fallbackResolution.href)
            return true
          }

          if (fallbackResolution?.type === 'class-picker') {
            setNestedView({
              mode: 'class-picker',
              action: fallbackResolution.action,
              source: 'heuristic',
            })
            return true
          }

          setForceUnrecognized(true)
          return true
        }
      }

      if (localResolution?.type === 'class-picker') {
        setNestedView({
          mode: 'class-picker',
          action: localResolution.action,
          source: 'heuristic',
        })
        return true
      }

      if (shouldShowUnrecognizedFallback(trimmedQuery, user.role, false)) {
        setForceUnrecognized(true)
        return true
      }
    } catch {
      const fallbackResponse = createLocalIntentResponse(
        user.role,
        trimmedQuery,
        professorClasses,
      )
      const fallbackResolution = resolveCommandIntentResponse(
        user.role,
        fallbackResponse,
        professorClasses,
      )

      if (fallbackResolution?.type === 'navigate') {
        navigateTo(fallbackResolution.href)
        return true
      }

      if (fallbackResolution?.type === 'class-picker') {
        setNestedView({
          mode: 'class-picker',
          action: fallbackResolution.action,
          source: 'heuristic',
        })
        return true
      }

      setForceUnrecognized(true)
      return true
    } finally {
      setIsResolvingIntent(false)
    }

    return false
  }, [
    navigateTo,
    professorClasses,
    query,
    token,
    user?.role,
  ])

  const handleInputKeyDown = useCallback(
    async (event: ReactKeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setActiveIndex(
          (current) => (current + 1) % Math.max(visibleItemCount, 1),
        )
        return
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault()
        setActiveIndex((current) =>
          current === 0 ? Math.max(visibleItemCount - 1, 0) : current - 1,
        )
        return
      }

      if (event.key !== 'Enter') return

      if (isClassPickerMode && classPickerOptions[activeIndex]) {
        event.preventDefault()
        const selected = classPickerOptions[activeIndex]
        if (activePickerAction) {
          navigateProfessorAction(selected.assignmentId, activePickerAction)
        }
        return
      }

      if (query.trim() && !isClassPickerMode) {
        event.preventDefault()
        const handled = await resolveHybridIntent()
        if (handled) return
      }

      const selectedItem = displayItems[activeIndex]
      if (selectedItem) {
        event.preventDefault()
        handlePaletteItemSelect(selectedItem)
      }
    },
    [
      activeIndex,
      activePickerAction,
      classPickerOptions,
      displayItems,
      handlePaletteItemSelect,
      isClassPickerMode,
      navigateProfessorAction,
      query,
      resolveHybridIntent,
      visibleItemCount,
    ],
  )

  const inputPlaceholder =
    user?.role === 'PROFESSOR'
      ? 'Buscar ações ou digite um comando (ex: Realizar chamada)...'
      : user?.role === 'SECRETARIA'
        ? 'Buscar ações, alunos ou digite um comando (ex: Criar turma)...'
        : 'Buscar ações ou alunos...'

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
                placeholder={inputPlaceholder}
                className="flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-secondary"
                aria-label="Buscar na paleta de comandos"
              />
              {isResolvingIntent && (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin text-text-secondary" />
              )}
              <kbd className="hidden rounded border border-border bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-text-secondary sm:inline">
                ESC
              </kbd>
            </div>

            <div ref={listRef} className="max-h-[min(50vh,360px)] overflow-y-auto p-2">
              {isClassPickerMode && activePickerAction ? (
                <>
                  <p className="px-3 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
                    {getProfessorActionLabel(activePickerAction)} — escolha a turma
                  </p>

                  {classPickerOptions.length === 0 ? (
                    <p className="px-3 py-8 text-center text-sm text-text-secondary">
                      Nenhuma turma atribuída encontrada.
                    </p>
                  ) : (
                    classPickerOptions.map((classOption, index) => {
                      const isActive = activeIndex === index

                      return (
                        <button
                          key={classOption.assignmentId}
                          type="button"
                          data-index={index}
                          onMouseEnter={() => setActiveIndex(index)}
                          onClick={() =>
                            navigateProfessorAction(
                              classOption.assignmentId,
                              activePickerAction,
                            )
                          }
                          className={cn(
                            'flex w-full items-center gap-3 rounded-component px-3 py-2.5 text-left transition-colors',
                            isActive
                              ? 'bg-primary text-white'
                              : 'nav-item-light-emphasis',
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
                            <BookOpen size={18} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium">
                              {classOption.shortLabel}
                            </span>
                            <span
                              className={cn(
                                'block truncate text-xs',
                                isActive ? 'text-white/80' : 'text-text-secondary',
                              )}
                            >
                              {classOption.subjectName}
                            </span>
                          </span>
                        </button>
                      )
                    })
                  )}
                </>
              ) : isUnrecognized && user?.role ? (
                <>
                  <p className="px-3 py-4 text-center text-sm text-text-secondary">
                    {getUnrecognizedFallbackMessage(user.role)}
                  </p>
                  <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
                    Atalhos disponíveis
                  </p>
                  {displayNavItems.map((item, index) => {
                    const Icon = item.icon
                    const isActive = activeIndex === index

                    return (
                      <button
                        key={item.id}
                        type="button"
                        data-index={index}
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => handlePaletteItemSelect(item)}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-component px-3 py-2.5 text-left transition-colors',
                          isActive
                            ? 'bg-primary text-white'
                            : 'nav-item-light-emphasis',
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
                </>
              ) : displayItems.length === 0 ? (
                <p className="px-3 py-8 text-center text-sm text-text-secondary">
                  Nenhum resultado para &ldquo;{query}&rdquo;
                </p>
              ) : (
                <>
                  {displayNavItems.length > 0 && (
                    <p className="px-3 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
                      Navegação rápida
                    </p>
                  )}

                  {displayNavItems.map((item, index) => {
                    const Icon = item.icon
                    const isActive = activeIndex === index

                    return (
                      <button
                        key={item.id}
                        type="button"
                        data-index={index}
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => handlePaletteItemSelect(item)}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-component px-3 py-2.5 text-left transition-colors',
                          isActive
                            ? 'bg-primary text-white'
                            : 'nav-item-light-emphasis',
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

                  {studentItems.length > 0 && !isUnrecognized && (
                    <>
                      <p className="px-3 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
                        Alunos
                      </p>

                      {studentItems.map((item, studentIndex) => {
                        const Icon = item.icon
                        const index = displayNavItems.length + studentIndex
                        const isActive = activeIndex === index

                        return (
                          <button
                            key={item.id}
                            type="button"
                            data-index={index}
                            onMouseEnter={() => setActiveIndex(index)}
                            onClick={() => handlePaletteItemSelect(item)}
                            className={cn(
                              'flex w-full items-center gap-3 rounded-component px-3 py-2.5 text-left transition-colors',
                              isActive
                                ? 'bg-primary text-white'
                                : 'nav-item-light-emphasis',
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
              <span>
                {isClassPickerMode
                  ? 'Escolha a turma com ↑ ↓'
                  : isUnrecognized
                    ? 'Escolha um atalho abaixo'
                    : 'Use ↑ ↓ para navegar'}
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-border bg-surface px-1.5 py-0.5 font-medium">
                  Enter
                </kbd>
                <span>{isClassPickerMode ? 'para confirmar' : 'para abrir'}</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
