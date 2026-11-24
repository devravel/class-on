/**
 * Benchmark reprodutível do ClassOn — gera os dados quantitativos usados no
 * resumo do CICTED 2026.
 *
 * Mede três coisas, todas contra a API real (nada é reimplementado aqui):
 *   1. Classificação de risco  — concordância entre a heurística do endpoint
 *      /dashboard/analytics/risk e a estratificação conhecida da base sintética.
 *   2. Latência da API         — p50/p95 dos endpoints de uso corrente.
 *   3. Latência da IA          — p50/p95 das gerações via LLM (Groq/OpenAI).
 *
 * Pré-requisitos:
 *   docker compose up -d
 *   createdb classon_bench && npx prisma db push --url <bench>
 *   DATABASE_URL=<bench> npx ts-node --project tsconfig.seed.json prisma/seed.ts
 *   DATABASE_URL=<bench> npx nest start
 *
 * Uso:
 *   node scripts/benchmark.mjs
 *   node scripts/benchmark.mjs --selftest
 */

const API = process.env.API_URL ?? 'http://localhost:3001/api'
const EMAIL = process.env.BENCH_EMAIL ?? 'admin@classon.com'
const PASSWORD = process.env.BENCH_PASSWORD ?? '123456'
const API_RUNS = Number(process.env.BENCH_API_RUNS ?? 30)
const AI_RUNS = Number(process.env.BENCH_AI_RUNS ?? 5)
const AI_PAUSE_MS = Number(process.env.BENCH_AI_PAUSE_MS ?? 20_000)

/** Espelha riskProfileForGlobalIndex() de backend/prisma/seed.ts. */
function seedProfile(globalIndex, total) {
  const ratio = globalIndex / total
  if (ratio < 0.7) return 'ESTAVEL'
  if (ratio < 0.9) return 'ALERTA'
  return 'RISCO_CRITICO'
}

/** RM = <ano><numero sequencial de 4 dígitos>; globalIndex = numero - 1. */
function globalIndexFromRm(rm) {
  return Number(rm.slice(4)) - 1
}

function percentile(values, p) {
  if (values.length === 0) return NaN
  const sorted = [...values].sort((a, b) => a - b)
  const rank = Math.ceil((p / 100) * sorted.length)
  return sorted[Math.min(Math.max(rank, 1), sorted.length) - 1]
}

const mean = (v) => v.reduce((a, b) => a + b, 0) / v.length
const round = (n, d = 1) => Math.round(n * 10 ** d) / 10 ** d

async function timed(fn) {
  const start = performance.now()
  const result = await fn()
  return { ms: performance.now() - start, result }
}

async function login() {
  const response = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  })
  if (!response.ok) {
    throw new Error(`Login falhou (${response.status}). A API está no ar em ${API}?`)
  }
  return (await response.json()).access_token
}

function client(token) {
  return async (method, path, body) => {
    const response = await fetch(`${API}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    })
    if (!response.ok) {
      throw new Error(`${method} ${path} → ${response.status} ${await response.text()}`)
    }
    return response.json()
  }
}

// ── 1. Classificação de risco ────────────────────────────────────────────────

async function measureRisk(call) {
  const data = await call('GET', '/dashboard/analytics/risk')
  const predicted = [
    ...data.students.estavel,
    ...data.students.alerta,
    ...data.students.risco_critico,
  ]
  const total = predicted.length

  const CATEGORIES = ['ESTAVEL', 'ALERTA', 'RISCO_CRITICO']
  const matrix = Object.fromEntries(
    CATEGORIES.map((expected) => [
      expected,
      Object.fromEntries(CATEGORIES.map((got) => [got, 0])),
    ]),
  )

  for (const student of predicted) {
    const expected = seedProfile(globalIndexFromRm(student.rm), total)
    matrix[expected][student.category] += 1
  }

  const hits = CATEGORIES.reduce((sum, c) => sum + matrix[c][c], 0)

  const perCategory = CATEGORIES.map((category) => {
    const truePositives = matrix[category][category]
    const actual = CATEGORIES.reduce((s, got) => s + matrix[category][got], 0)
    const flagged = CATEGORIES.reduce((s, exp) => s + matrix[exp][category], 0)
    return {
      category,
      suporte: actual,
      classificados: flagged,
      precisao: flagged ? round((truePositives / flagged) * 100, 2) : null,
      revocacao: actual ? round((truePositives / actual) * 100, 2) : null,
    }
  })

  return {
    total,
    anoLetivo: data.year,
    acuracia: round((hits / total) * 100, 2),
    distribuicao: {
      estavel: round((data.counts.estavel / total) * 100, 1),
      alerta: round((data.counts.alerta / total) * 100, 1),
      risco_critico: round((data.counts.risco_critico / total) * 100, 1),
    },
    matrizConfusao: matrix,
    perCategory,
  }
}

// ── 2 e 3. Latências ─────────────────────────────────────────────────────────

/**
 * O backend serve um template local quando a LLM falha, e a resposta tem o
 * mesmo formato da real. Sem separar as duas, a latência média vira ficção.
 */
const FALLBACK_MARKER = 'modo demonstração'
const isFallback = (result) =>
  typeof result?.content === 'string' && result.content.includes(FALLBACK_MARKER)

async function measureLatency(label, runs, fn, { pauseMs = 0 } = {}) {
  await fn() // descarta a primeira execução (conexão fria, JIT, cache do Prisma)

  const samples = []
  let fallbacks = 0

  for (let i = 0; i < runs; i += 1) {
    const { ms, result } = await timed(fn)
    if (isFallback(result)) fallbacks += 1
    else samples.push(ms)
    if (pauseMs) await new Promise((r) => setTimeout(r, pauseMs))
  }

  if (samples.length === 0) {
    return { label, amostras: 0, fallbacks, erro: 'todas as execuções caíram no fallback' }
  }

  return {
    label,
    amostras: samples.length,
    ...(fallbacks ? { fallbacks } : {}),
    media: round(mean(samples)),
    p50: round(percentile(samples, 50)),
    p95: round(percentile(samples, 95)),
    min: round(Math.min(...samples)),
    max: round(Math.max(...samples)),
  }
}

async function measureApi(call) {
  const classes = await call('GET', '/classes')
  const someClassId = classes[0]?.id

  const endpoints = [
    ['GET /auth/me', () => call('GET', '/auth/me')],
    ['GET /classes', () => call('GET', '/classes')],
    ['GET /students', () => call('GET', '/students')],
    ['GET /teachers', () => call('GET', '/teachers')],
    ['GET /dashboard/analytics/risk', () => call('GET', '/dashboard/analytics/risk')],
    ...(someClassId
      ? [['GET /classes/:id/details', () => call('GET', `/classes/${someClassId}/details`)]]
      : []),
  ]

  const results = []
  for (const [label, fn] of endpoints) {
    results.push(await measureLatency(label, API_RUNS, fn))
  }
  return results
}

async function measureAi(call) {
  const scenarios = [
    [
      'POST /ai/command-intent',
      () =>
        call('POST', '/ai/command-intent', {
          input: 'criar nova turma',
          role: 'SECRETARIA',
        }),
    ],
    [
      'POST /ai/generate-lesson-plan',
      () =>
        call('POST', '/ai/generate-lesson-plan', {
          subject: 'Matemática',
          class_name: '9º Ano A',
          topic: 'Equações do 1º grau',
        }),
    ],
    [
      'POST /ai/generate-parent-report',
      () =>
        call('POST', '/ai/generate-parent-report', {
          student_name: 'Aluno de Teste',
          grade_average: 3.2,
          attendance_rate: 62,
          risk_score: 90,
        }),
    ],
  ]

  const results = []
  for (const [label, fn] of scenarios) {
    try {
      // pausa entre chamadas: o tier gratuito da Groq limita 8.000 tokens/min e,
      // sem espaçar, as gerações longas estouram o limite e caem no fallback
      results.push(await measureLatency(label, AI_RUNS, fn, { pauseMs: AI_PAUSE_MS }))
    } catch (error) {
      results.push({ label, erro: error.message })
    }
  }
  return results
}

// ── Saída ────────────────────────────────────────────────────────────────────

function selftest() {
  const assert = (condition, message) => {
    if (!condition) throw new Error(`FALHOU: ${message}`)
  }

  assert(seedProfile(0, 220) === 'ESTAVEL', 'índice 0 de 220 é estável')
  assert(seedProfile(153, 220) === 'ESTAVEL', 'ratio 0.695 ainda é estável')
  assert(seedProfile(154, 220) === 'ALERTA', 'ratio 0.70 vira alerta')
  assert(seedProfile(197, 220) === 'ALERTA', 'ratio 0.895 ainda é alerta')
  assert(seedProfile(198, 220) === 'RISCO_CRITICO', 'ratio 0.90 vira crítico')

  assert(globalIndexFromRm('20260001') === 0, 'RM 20260001 é o índice 0')
  assert(globalIndexFromRm('20260220') === 219, 'RM 20260220 é o índice 219')

  assert(percentile([1, 2, 3, 4], 50) === 2, 'p50 de [1..4]')
  assert(percentile([1, 2, 3, 4], 95) === 4, 'p95 de [1..4]')
  assert(percentile([10], 95) === 10, 'p95 de amostra única')

  assert(isFallback({ content: '…(modo demonstração — configure…)' }), 'detecta fallback')
  assert(!isFallback({ content: '# Plano de Aula – Matemática' }), 'não marca resposta real')
  assert(!isFallback({ status: 'recognized' }), 'resposta sem content não é fallback')

  console.log('selftest: ok')
}

async function main() {
  if (process.argv.includes('--selftest')) return selftest()

  const call = client(await login())

  console.log('Medindo classificação de risco…')
  const risco = await measureRisk(call)

  console.log('Medindo latência da API…')
  const api = await measureApi(call)

  console.log('Medindo latência da IA…')
  const ia = await measureAi(call)

  const resultado = { geradoEm: new Date().toISOString(), risco, api, ia }

  console.log('\n═══ CLASSIFICAÇÃO DE RISCO ═══')
  console.log(`Base: ${risco.total} estudantes · ano letivo ${risco.anoLetivo}`)
  console.log(`Acurácia global: ${risco.acuracia}%`)
  console.log(
    `Distribuição obtida: ${risco.distribuicao.estavel}% estável · ` +
      `${risco.distribuicao.alerta}% alerta · ${risco.distribuicao.risco_critico}% crítico`,
  )
  console.table(risco.perCategory)
  console.log('Matriz de confusão (linha = esperado, coluna = classificado):')
  console.table(risco.matrizConfusao)

  console.log('\n═══ LATÊNCIA DA API (ms) ═══')
  console.table(api)

  console.log('\n═══ LATÊNCIA DA IA (ms) ═══')
  console.table(ia)

  const { writeFileSync } = await import('node:fs')
  writeFileSync(
    new URL('./benchmark-resultado.json', import.meta.url),
    JSON.stringify(resultado, null, 2),
  )
  console.log('\nResultado salvo em scripts/benchmark-resultado.json')
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
