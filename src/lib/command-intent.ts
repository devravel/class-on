import { getClassLabel, getClassShortLabel } from '@/lib/class-utils'
import type { Assignment } from '@/types/assignment'
import type { UserRole } from '@/contexts/auth-context'

export type CommandIntentStatus = 'recognized' | 'unknown'

export type ProfessorCommandAction = 'chamada' | 'notas' | 'tarefa'
export type SecretariaCommandAction = 'dashboard' | 'alunos' | 'comunicados'
export type AlunoCommandAction = 'boletim' | 'frequencia' | 'tarefas'

export interface CommandIntentResponse {
  status: CommandIntentStatus
  action: string | null
  detectedClass: string | null
  route: string | null
}

export interface ProfessorClassOption {
  assignmentId: string
  classId: string
  label: string
  shortLabel: string
  subjectName: string
}

export interface PaletteNestedView {
  mode: 'class-picker'
  action: ProfessorCommandAction
  source: 'heuristic' | 'ai'
}

export type IntentResolution =
  | { type: 'navigate'; href: string }
  | { type: 'class-picker'; action: ProfessorCommandAction }
  | { type: 'unknown' }

const ACTION_TAB: Record<ProfessorCommandAction, string> = {
  chamada: 'diario',
  notas: 'notas',
  tarefa: 'tarefas',
}

const ACTION_LABELS: Record<ProfessorCommandAction, string> = {
  chamada: 'Realizar chamada',
  notas: 'Lançar notas',
  tarefa: 'Criar tarefa',
}

const SECRETARIA_ROUTES: Record<SecretariaCommandAction, string> = {
  dashboard: '/secretaria',
  alunos: '/secretaria/alunos',
  comunicados: '/secretaria/comunicados',
}

const ALUNO_ROUTES: Record<AlunoCommandAction, string> = {
  boletim: '/aluno/notas',
  frequencia: '/aluno/frequencia',
  tarefas: '/aluno/tarefas',
}

const PROFESSOR_INTENT_PATTERNS: Record<ProfessorCommandAction, readonly string[]> = {
  chamada: [
    'realizar chamada',
    'fazer chamada',
    'registrar chamada',
    'diario de classe',
    'diario',
    'chamada',
    'presenca',
    'frequencia',
    'faltas',
    'falta',
  ],
  notas: [
    'lancar notas',
    'lançar notas',
    'lancamento de notas',
    'digitar medias',
    'digitar médias',
    'recuperacao',
    'recuperação',
    'notas',
    'nota',
    'boletim',
    'media',
    'média',
  ],
  tarefa: [
    'criar tarefa',
    'nova tarefa',
    'passar dever de casa',
    'dever de casa',
    'tarefas',
    'tarefa',
    'atividade',
    'atividades',
  ],
}

const SECRETARIA_INTENT_PATTERNS: Record<SecretariaCommandAction, readonly string[]> = {
  dashboard: [
    'visualizar painel',
    'grafico de risco',
    'gráfico de risco',
    'metricas de evasao',
    'métricas de evasão',
    'painel',
    'dashboard',
    'evasao',
    'evasão',
    'risco',
    'metricas',
    'métricas',
  ],
  alunos: [
    'listar alunos',
    'buscar estudante',
    'filtro de busca',
    'gerenciar alunos',
    'cadastro de alunos',
    'matriculas',
    'matrículas',
    'estudante',
    'alunos',
    'aluno',
  ],
  comunicados: [
    'gerar comunicado',
    'enviar avisos para os pais',
    'enviar avisos',
    'avisos para os pais',
    'comunicados',
    'comunicado',
    'avisos',
  ],
}

const ALUNO_INTENT_PATTERNS: Record<AlunoCommandAction, readonly string[]> = {
  boletim: [
    'ver meu boletim',
    'minhas notas',
    'meu boletim',
    'boletim',
  ],
  frequencia: [
    'ver frequencia',
    'ver frequência',
    'minha frequencia',
    'minha frequência',
    'frequencia escolar',
    'frequência escolar',
    'frequencia',
    'frequência',
    'presenca',
    'presença',
    'faltas',
  ],
  tarefas: [
    'entregar tarefas',
    'atividades pendentes',
    'minhas tarefas',
    'atividades',
    'atividade',
    'tarefas',
    'tarefa',
    'entregar',
  ],
}

const PEDAGOGICAL_KEYWORDS: readonly string[] = [
  ...Object.values(PROFESSOR_INTENT_PATTERNS).flat(),
  ...Object.values(SECRETARIA_INTENT_PATTERNS).flat(),
  ...Object.values(ALUNO_INTENT_PATTERNS).flat(),
  'secretaria',
  'professor',
  'turma',
  'escola',
  'aula',
  'disciplina',
]

const KEYBOARD_MASH_PATTERNS: readonly RegExp[] = [
  /^[asdfghjkl]+$/i,
  /^[qwertyuiop]+$/i,
  /^[zxcvbnm]+$/i,
  /^[0-9]{4,}$/,
  /^(.)\1{4,}$/,
]

export const UNRECOGNIZED_FALLBACK_HINT: Record<UserRole, string> = {
  SECRETARIA: 'Listar alunos',
  PROFESSOR: 'Lançar notas',
  ALUNO: 'Ver meu boletim',
}

export function normalizeCommandText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

export function getProfessorActionLabel(action: ProfessorCommandAction): string {
  return ACTION_LABELS[action]
}

export function getUnrecognizedFallbackMessage(role: UserRole): string {
  return `Nenhum comando ou turma reconhecida. Que tal tentar "${UNRECOGNIZED_FALLBACK_HINT[role]}" ou usar um dos atalhos abaixo?`
}

export function buildProfessorActionHref(
  assignmentId: string,
  action: ProfessorCommandAction,
): string {
  return `/professor/turmas/${assignmentId}?tab=${ACTION_TAB[action]}`
}

export function buildSecretariaActionHref(action: SecretariaCommandAction): string {
  return SECRETARIA_ROUTES[action]
}

export function buildAlunoActionHref(action: AlunoCommandAction): string {
  return ALUNO_ROUTES[action]
}

function matchIntentPatterns<T extends string>(
  input: string,
  patterns: Record<T, readonly string[]>,
): T | null {
  const normalized = normalizeCommandText(input)
  if (!normalized) return null

  const ranked = (Object.entries(patterns) as Array<[T, readonly string[]]>)
    .flatMap(([action, values]) =>
      values.map((pattern) => ({ action, pattern, length: pattern.length })),
    )
    .sort((a, b) => b.length - a.length)

  for (const { action, pattern } of ranked) {
    if (normalized.includes(normalizeCommandText(pattern))) {
      return action
    }
  }

  return null
}

export function detectLocalCommandIntent(input: string): ProfessorCommandAction | null {
  return matchIntentPatterns(input, PROFESSOR_INTENT_PATTERNS)
}

export function detectSecretariaIntent(input: string): SecretariaCommandAction | null {
  return matchIntentPatterns(input, SECRETARIA_INTENT_PATTERNS)
}

export function detectAlunoIntent(input: string): AlunoCommandAction | null {
  return matchIntentPatterns(input, ALUNO_INTENT_PATTERNS)
}

export function containsPedagogicalKeyword(input: string): boolean {
  const normalized = normalizeCommandText(input)
  return PEDAGOGICAL_KEYWORDS.some((keyword) =>
    normalized.includes(normalizeCommandText(keyword)),
  )
}

export function isLikelyGibberishInput(input: string): boolean {
  const normalized = normalizeCommandText(input)
  if (normalized.length < 3) return false

  if (KEYBOARD_MASH_PATTERNS.some((pattern) => pattern.test(normalized))) {
    return true
  }

  const vowels = normalized.match(/[aeiou]/g)?.length ?? 0
  if (normalized.length >= 6 && vowels / normalized.length < 0.12) {
    return true
  }

  return false
}

export function shouldShowUnrecognizedFallback(
  input: string,
  role: UserRole | undefined,
  hasFilteredResults: boolean,
): boolean {
  const trimmed = input.trim()
  if (!trimmed || !role || hasFilteredResults) return false

  if (isLikelyGibberishInput(trimmed)) return true

  const localResolution = resolveLocalIntentForRole(role, trimmed, [])
  if (localResolution && localResolution.type !== 'unknown') return false

  if (trimmed.length >= 8 && !containsPedagogicalKeyword(trimmed)) {
    return true
  }

  return false
}

export function resolveLocalIntentForRole(
  role: UserRole,
  input: string,
  classes: ProfessorClassOption[],
): IntentResolution | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  if (role === 'SECRETARIA') {
    const action = detectSecretariaIntent(trimmed)
    if (action) {
      return { type: 'navigate', href: buildSecretariaActionHref(action) }
    }
    return null
  }

  if (role === 'ALUNO') {
    const action = detectAlunoIntent(trimmed)
    if (action) {
      return { type: 'navigate', href: buildAlunoActionHref(action) }
    }
    return null
  }

  if (role === 'PROFESSOR') {
    const action = detectLocalCommandIntent(trimmed)
    if (!action) return null

    const matchedClass = matchProfessorClassFromText(trimmed, classes)
    if (matchedClass) {
      return {
        type: 'navigate',
        href: buildProfessorActionHref(matchedClass.assignmentId, action),
      }
    }

    return { type: 'class-picker', action }
  }

  return null
}

export function resolveCommandIntentResponse(
  role: UserRole,
  response: CommandIntentResponse,
  classes: ProfessorClassOption[],
): IntentResolution | null {
  if (response.status === 'unknown' || !response.action) {
    return { type: 'unknown' }
  }

  if (role === 'SECRETARIA') {
    const action = response.action as SecretariaCommandAction
    if (action in SECRETARIA_ROUTES) {
      return {
        type: 'navigate',
        href: response.route ?? buildSecretariaActionHref(action),
      }
    }
    return { type: 'unknown' }
  }

  if (role === 'ALUNO') {
    const action = response.action as AlunoCommandAction
    if (action in ALUNO_ROUTES) {
      return {
        type: 'navigate',
        href: response.route ?? buildAlunoActionHref(action),
      }
    }
    return { type: 'unknown' }
  }

  if (role === 'PROFESSOR') {
    const action = response.action as ProfessorCommandAction
    if (!(action in ACTION_TAB)) {
      return { type: 'unknown' }
    }

    const professorResponse: CommandIntentResponse = {
      ...response,
      action,
    }
    const resolution = resolveProfessorCommandNavigation(professorResponse, classes)
    if (!resolution) return { type: 'unknown' }
    return resolution
  }

  return { type: 'unknown' }
}

export function assignmentToClassOption(assignment: Assignment): ProfessorClassOption {
  return {
    assignmentId: assignment.id,
    classId: assignment.class_id,
    label: getClassLabel(assignment.classes),
    shortLabel: getClassShortLabel(assignment.classes),
    subjectName: assignment.subjects.name,
  }
}

export function matchProfessorClassFromText(
  input: string,
  classes: ProfessorClassOption[],
): ProfessorClassOption | null {
  const normalized = normalizeCommandText(input)
  if (!normalized) return null

  for (const classOption of classes) {
    const candidates = [classOption.label, classOption.shortLabel]
    for (const candidate of candidates) {
      if (normalized.includes(normalizeCommandText(candidate))) {
        return classOption
      }
    }
  }

  return null
}

export function filterProfessorClasses(
  classes: ProfessorClassOption[],
  query: string,
  action?: ProfessorCommandAction | null,
): ProfessorClassOption[] {
  const filterQuery = action ? getClassFilterQuery(query, action) : query
  const normalized = normalizeCommandText(filterQuery)
  if (!normalized) return classes

  return classes.filter((classOption) => {
    const haystack = [
      classOption.label,
      classOption.shortLabel,
      classOption.subjectName,
    ].join(' ')
    return normalizeCommandText(haystack).includes(normalized)
  })
}

export function getClassFilterQuery(
  input: string,
  action: ProfessorCommandAction,
): string {
  let remaining = normalizeCommandText(input)

  for (const pattern of PROFESSOR_INTENT_PATTERNS[action]) {
    remaining = remaining.replace(normalizeCommandText(pattern), ' ')
  }

  return remaining.replace(/\s+/g, ' ').trim()
}

export function resolveProfessorCommandNavigation(
  response: Pick<CommandIntentResponse, 'action' | 'detectedClass'>,
  classes: ProfessorClassOption[],
): IntentResolution | null {
  const action = response.action as ProfessorCommandAction | null
  if (!action || !(action in ACTION_TAB)) return null

  if (response.detectedClass) {
    const normalizedClass = normalizeCommandText(response.detectedClass)
    const matched = classes.find((classOption) => {
      const labels = [classOption.label, classOption.shortLabel]
      return labels.some(
        (label) =>
          normalizeCommandText(label) === normalizedClass ||
          normalizeCommandText(label).includes(normalizedClass) ||
          normalizedClass.includes(normalizeCommandText(label)),
      )
    })

    if (matched) {
      return {
        type: 'navigate',
        href: buildProfessorActionHref(matched.assignmentId, action),
      }
    }
  }

  return { type: 'class-picker', action }
}

export function createUnknownIntentResponse(): CommandIntentResponse {
  return {
    status: 'unknown',
    action: null,
    detectedClass: null,
    route: null,
  }
}

export function createLocalIntentResponse(
  role: UserRole,
  input: string,
  classes: ProfessorClassOption[],
): CommandIntentResponse {
  const resolution = resolveLocalIntentForRole(role, input, classes)

  if (!resolution || resolution.type === 'unknown') {
    return createUnknownIntentResponse()
  }

  if (resolution.type === 'navigate') {
    return {
      status: 'recognized',
      action: inferActionFromHref(role, resolution.href),
      detectedClass: null,
      route: resolution.href,
    }
  }

  return {
    status: 'recognized',
    action: resolution.action,
    detectedClass: null,
    route: null,
  }
}

function inferActionFromHref(role: UserRole, href: string): string | null {
  if (role === 'SECRETARIA') {
    const entry = Object.entries(SECRETARIA_ROUTES).find(([, route]) => route === href)
    return entry?.[0] ?? null
  }

  if (role === 'ALUNO') {
    const entry = Object.entries(ALUNO_ROUTES).find(([, route]) => route === href)
    return entry?.[0] ?? null
  }

  return null
}
