import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import pdfParse = require('pdf-parse')
import {
  AlunoCommandAction,
  CommandIntentResult,
  CommandIntentStatus,
  ProfessorCommandAction,
  SecretariaCommandAction,
} from './command-intent.types'
import { CommandIntentDto } from './dto/command-intent.dto'
import { GenerateLessonPlanDto } from './dto/generate-lesson-plan.dto'
import { GenerateParentReportDto } from './dto/generate-parent-report.dto'
import {
  GenerateTaskInput,
  GeneratedTaskResult,
  TaskWebContext,
  WebSearchSource,
} from './generate-task.types'

interface LlmMessage {
  role: 'system' | 'user'
  content: string
}

const TASK_LLM_TIMEOUT_MS = 60_000
const MAX_PDF_CHARS = 8000

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name)

  constructor(private readonly config: ConfigService) {}

  async extractPdfText(buffer: Buffer): Promise<string> {
    try {
      const parsed = await pdfParse(buffer)
      const text = (parsed.text ?? '').replace(/\s+\n/g, '\n').trim()
      if (text.length <= MAX_PDF_CHARS) return text
      return `${text.slice(0, MAX_PDF_CHARS)}\n[...conteúdo truncado para otimização...]`
    } catch (error) {
      this.logger.warn(
        `Falha ao extrair texto do PDF: ${
          error instanceof Error ? error.message : 'erro desconhecido'
        }`,
      )
      return ''
    }
  }

  async generateTask(input: GenerateTaskInput): Promise<GeneratedTaskResult> {
    const title = input.title.trim()
    const schoolYear = input.schoolYear.trim()
    const pdfText = input.pdfText?.trim() ?? ''
    const manualLinks = (input.links ?? [])
      .map((link) => link.trim())
      .filter((link) => link.length > 0)

    const webContext: TaskWebContext | null = input.searchWeb
      ? this.buildWebSearchContext(title, manualLinks)
      : manualLinks.length > 0
        ? this.buildManualLinksContext(manualLinks)
        : null

    const systemPrompt = this.buildTaskSystemPrompt(
      input.searchWeb,
      Boolean(pdfText),
    )
    const userPrompt = this.buildTaskUserPrompt({
      title,
      schoolYear,
      pdfText,
      webContext,
      refinePrompt: input.refinePrompt?.trim(),
      historyText: input.historyText?.trim(),
    })

    const sources = webContext?.sources ?? []

    try {
      const content = await this.callTaskLlm(systemPrompt, userPrompt)
      const finalContent =
        input.searchWeb && sources.length > 0
          ? this.ensureSourcesSection(content, sources)
          : content

      return {
        content: finalContent,
        usedWebSearch: input.searchWeb,
        usedPdf: Boolean(pdfText),
        sources,
        fallbackUsed: false,
      }
    } catch (error) {
      this.logger.warn(
        `Geração de tarefa via IA falhou, usando fallback estruturado: ${
          error instanceof Error ? error.message : 'erro desconhecido'
        }`,
      )

      return {
        content: this.buildTaskFallback({
          title,
          schoolYear,
          pdfText,
          sources,
        }),
        usedWebSearch: input.searchWeb,
        usedPdf: Boolean(pdfText),
        sources,
        fallbackUsed: true,
      }
    }
  }

  async generateLessonPlan(
    dto: GenerateLessonPlanDto,
  ): Promise<{ content: string }> {
    const topicHint = dto.topic?.trim()
      ? ` com foco no tema "${dto.topic.trim()}"`
      : ''

    const systemPrompt = `Você é um especialista em pedagogia brasileira do ensino fundamental e médio.
Crie planos de aula claros, práticos e alinhados à BNCC.
Responda SOMENTE em Markdown bem estruturado, em português do Brasil.
Use seções: Objetivos, Conteúdos, Metodologia, Recursos, Avaliação e Tarefa de Casa.`

    const userPrompt = `Crie um plano de aula completo para a disciplina "${dto.subject}", turma "${dto.class_name}"${topicHint}.
Inclua objetivos mensuráveis, sequência didática de 50 minutos e estratégias de engajamento.`

    const content = await this.callLlm(systemPrompt, userPrompt)
    return { content }
  }

  async parseCommandIntent(
    dto: CommandIntentDto,
    authenticatedRole: string,
  ): Promise<CommandIntentResult> {
    const input = dto.input.trim()
    if (!input) {
      return this.createUnknownIntentResult()
    }

    if (dto.role !== authenticatedRole) {
      return this.createUnknownIntentResult()
    }

    const classesHint =
      dto.availableClasses && dto.availableClasses.length > 0
        ? `\nTurmas disponíveis do professor: ${dto.availableClasses.join('; ')}`
        : ''

    const systemPrompt = this.buildCommandIntentSystemPrompt(dto.role)
    const userPrompt = `Comando do usuário (${dto.role}): "${input}"${classesHint}`

    try {
      const raw = await this.callLlm(systemPrompt, userPrompt, {
        temperature: 0.1,
        maxTokens: 160,
      })
      const parsed = this.parseCommandIntentJson(raw, dto.role)
      if (parsed) return parsed
    } catch {
      // fallback heurístico abaixo
    }

    return this.parseCommandIntentHeuristic(input, dto.role)
  }

  async generateParentReport(
    dto: GenerateParentReportDto,
  ): Promise<{ content: string }> {
    const gradeText =
      dto.grade_average != null
        ? `Média de notas: ${dto.grade_average.toFixed(1)} (mínimo para aprovação: 6,0).`
        : 'Média de notas abaixo do esperado.'
    const attendanceText =
      dto.attendance_rate != null
        ? `Frequência escolar: ${dto.attendance_rate.toFixed(0)}% (mínimo recomendado: 75%).`
        : 'Frequência escolar abaixo do recomendado.'
    const scoreText =
      dto.risk_score != null
        ? `Índice de risco pedagógico: ${dto.risk_score} pontos (Risco Crítico).`
        : ''

    const systemPrompt = `Você é um coordenador pedagógico de uma escola brasileira.
Redija comunicações formais, acolhedoras e assertivas para responsáveis, em português do Brasil.
O tom deve ser empático, profissional e orientado à parceria família-escola.
Responda SOMENTE com o texto da carta/comunicado, sem metadados extras.`

    const userPrompt = `Redija uma carta de notificação e acolhimento para os responsáveis pelo(a) aluno(a) ${dto.student_name}.

Dados do aluno:
- ${gradeText}
- ${attendanceText}
${scoreText ? `- ${scoreText}` : ''}

A carta deve:
1. Cumprimentar os responsáveis de forma respeitosa
2. Apresentar os indicadores de forma clara, sem culpar o aluno
3. Convocar para uma conversa ou reunião com a coordenação
4. Oferecer apoio e plano de acompanhamento conjunto
5. Encerrar com disponibilidade para contato`

    const content = await this.callLlm(systemPrompt, userPrompt)
    return { content }
  }

  private buildCommandIntentSystemPrompt(role: string): string {
    if (role === 'SECRETARIA') {
      return `Você interpreta comandos da secretaria escolar em um sistema brasileiro.
Responda SOMENTE com JSON válido, sem markdown:
{"status":"recognized"|"unknown","action":"dashboard"|"alunos"|"comunicados"|null,"detectedClass":null,"route":string|null}

Mapeamentos:
- dashboard: painel, gráfico de risco, métricas de evasão
- alunos: listar alunos, buscar estudante, filtro de busca
- comunicados: gerar comunicado, enviar avisos para os pais
Se não reconhecer, use status "unknown" e action null.`
    }

    if (role === 'ALUNO') {
      return `Você interpreta comandos de alunos em um sistema escolar brasileiro.
Responda SOMENTE com JSON válido, sem markdown:
{"status":"recognized"|"unknown","action":"boletim"|"frequencia"|"tarefas"|null,"detectedClass":null,"route":string|null}

Mapeamentos:
- boletim: ver meu boletim, minhas notas
- frequencia: ver frequência, minha frequência, presença, faltas
- tarefas: entregar tarefas, atividades pendentes
Nunca retorne ações de professor ou secretaria. Se não reconhecer, use status "unknown".`
    }

    return `Você interpreta comandos de professores em um sistema escolar brasileiro.
Responda SOMENTE com JSON válido, sem markdown:
{"status":"recognized"|"unknown","action":"chamada"|"notas"|"tarefa"|null,"detectedClass":string|null,"route":null}

Mapeamentos:
- chamada: realizar chamada, diário de classe, faltas, frequência
- notas: lançar notas, digitar médias, recuperação
- tarefa: criar tarefa, passar dever de casa
detectedClass: turma mencionada (ex: "9º Ano A") ou null
Se não reconhecer, use status "unknown".`
  }

  private createUnknownIntentResult(): CommandIntentResult {
    return {
      status: 'unknown',
      action: null,
      detectedClass: null,
      route: null,
    }
  }

  private createRecognizedIntentResult(
    action: string,
    route: string | null,
    detectedClass: string | null = null,
  ): CommandIntentResult {
    return {
      status: 'recognized',
      action,
      detectedClass,
      route,
    }
  }

  private parseCommandIntentJson(
    raw: string,
    role: string,
  ): CommandIntentResult | null {
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return null

    try {
      const data = JSON.parse(jsonMatch[0]) as {
        status?: unknown
        action?: unknown
        detectedClass?: unknown
        route?: unknown
      }

      const status = this.normalizeCommandStatus(data.status)
      if (status === 'unknown') {
        return this.createUnknownIntentResult()
      }

      const action = this.normalizeCommandActionForRole(data.action, role)
      if (!action) {
        return this.createUnknownIntentResult()
      }

      const detectedClass =
        typeof data.detectedClass === 'string' && data.detectedClass.trim()
          ? data.detectedClass.trim()
          : null

      const route =
        typeof data.route === 'string' && data.route.trim()
          ? data.route.trim()
          : this.resolveRouteForRole(role, action)

      return this.createRecognizedIntentResult(action, route, detectedClass)
    } catch {
      return null
    }
  }

  private normalizeCommandStatus(value: unknown): CommandIntentStatus {
    return value === 'recognized' ? 'recognized' : 'unknown'
  }

  private normalizeCommandActionForRole(
    value: unknown,
    role: string,
  ): string | null {
    if (role === 'SECRETARIA') {
      return this.normalizeSecretariaAction(value)
    }

    if (role === 'ALUNO') {
      return this.normalizeAlunoAction(value)
    }

    return this.normalizeProfessorAction(value)
  }

  private normalizeProfessorAction(value: unknown): ProfessorCommandAction | null {
    if (value === 'chamada' || value === 'notas' || value === 'tarefa') {
      return value
    }
    return null
  }

  private normalizeSecretariaAction(
    value: unknown,
  ): SecretariaCommandAction | null {
    if (value === 'dashboard' || value === 'alunos' || value === 'comunicados') {
      return value
    }
    return null
  }

  private normalizeAlunoAction(value: unknown): AlunoCommandAction | null {
    if (value === 'boletim' || value === 'frequencia' || value === 'tarefas') {
      return value
    }
    return null
  }

  private resolveRouteForRole(role: string, action: string): string | null {
    if (role === 'SECRETARIA') {
      const routes: Record<SecretariaCommandAction, string> = {
        dashboard: '/secretaria',
        alunos: '/secretaria/alunos',
        comunicados: '/secretaria/comunicados',
      }
      return routes[action as SecretariaCommandAction] ?? null
    }

    if (role === 'ALUNO') {
      const routes: Record<AlunoCommandAction, string> = {
        boletim: '/aluno/notas',
        frequencia: '/aluno/frequencia',
        tarefas: '/aluno/tarefas',
      }
      return routes[action as AlunoCommandAction] ?? null
    }

    return null
  }

  private normalizeCommandText(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
  }

  private parseCommandIntentHeuristic(
    input: string,
    role: string,
  ): CommandIntentResult {
    const normalized = this.normalizeCommandText(input)

    if (role === 'SECRETARIA') {
      const patterns: Record<SecretariaCommandAction, string[]> = {
        dashboard: [
          'visualizar painel',
          'grafico de risco',
          'metricas de evasao',
          'painel',
          'dashboard',
          'evasao',
          'risco',
        ],
        alunos: [
          'listar alunos',
          'buscar estudante',
          'filtro de busca',
          'gerenciar alunos',
          'estudante',
          'alunos',
        ],
        comunicados: [
          'gerar comunicado',
          'enviar avisos para os pais',
          'enviar avisos',
          'comunicado',
          'avisos',
        ],
      }

      const action = this.matchIntentPatterns(normalized, patterns)
      if (!action) return this.createUnknownIntentResult()
      return this.createRecognizedIntentResult(
        action,
        this.resolveRouteForRole(role, action),
      )
    }

    if (role === 'ALUNO') {
      const patterns: Record<AlunoCommandAction, string[]> = {
        boletim: [
          'ver meu boletim',
          'minhas notas',
          'meu boletim',
          'boletim',
        ],
        frequencia: [
          'ver frequencia',
          'minha frequencia',
          'frequencia escolar',
          'frequencia',
          'presenca',
          'faltas',
        ],
        tarefas: [
          'entregar tarefas',
          'atividades pendentes',
          'minhas tarefas',
          'atividades',
          'tarefas',
        ],
      }

      const action = this.matchIntentPatterns(normalized, patterns)
      if (!action) return this.createUnknownIntentResult()
      return this.createRecognizedIntentResult(
        action,
        this.resolveRouteForRole(role, action),
      )
    }

    const patterns: Record<ProfessorCommandAction, string[]> = {
      chamada: [
        'realizar chamada',
        'fazer chamada',
        'diario de classe',
        'diario',
        'chamada',
        'presenca',
        'frequencia',
        'faltas',
      ],
      notas: [
        'lancar notas',
        'lancamento de notas',
        'digitar medias',
        'recuperacao',
        'notas',
        'nota',
      ],
      tarefa: [
        'criar tarefa',
        'passar dever de casa',
        'dever de casa',
        'tarefas',
        'tarefa',
        'atividade',
      ],
    }

    const action = this.matchIntentPatterns(normalized, patterns)
    if (!action) return this.createUnknownIntentResult()

    const classMatch = input.match(
      /(\d+\s*[º°]?\s*(?:ano|serie|série)?\s*[a-z])/i,
    )
    const detectedClass = classMatch?.[1]?.trim() ?? null

    return this.createRecognizedIntentResult(action, null, detectedClass)
  }

  private matchIntentPatterns<T extends string>(
    normalizedInput: string,
    patterns: Record<T, string[]>,
  ): T | null {
    const ranked = Object.entries(patterns)
      .flatMap(([key, values]) =>
        (values as string[]).map((pattern) => ({
          action: key as T,
          pattern,
          length: pattern.length,
        })),
      )
      .sort((a, b) => b.length - a.length)

    for (const entry of ranked) {
      if (normalizedInput.includes(this.normalizeCommandText(entry.pattern))) {
        return entry.action
      }
    }

    return null
  }

  private async callLlm(
    systemPrompt: string,
    userPrompt: string,
    options?: { temperature?: number; maxTokens?: number },
  ): Promise<string> {
    const groqKey = this.config.get<string>('GROQ_API_KEY')
    const openaiKey = this.config.get<string>('OPENAI_API_KEY')

    if (groqKey) {
      try {
        return await this.callGroq(groqKey, systemPrompt, userPrompt, options)
      } catch {
        if (options) throw new Error('Groq indisponível para command-intent')
        return this.generateFallback(systemPrompt, userPrompt)
      }
    }

    if (openaiKey) {
      try {
        return await this.callOpenAi(openaiKey, systemPrompt, userPrompt, options)
      } catch {
        if (options) throw new Error('OpenAI indisponível para command-intent')
        return this.generateFallback(systemPrompt, userPrompt)
      }
    }

    if (options) {
      throw new Error('Nenhuma chave de IA configurada')
    }

    return this.generateFallback(systemPrompt, userPrompt)
  }

  private async callGroq(
    apiKey: string,
    systemPrompt: string,
    userPrompt: string,
    options?: { temperature?: number; maxTokens?: number },
  ): Promise<string> {
    const model =
      this.config.get<string>('GROQ_MODEL') ?? 'llama-3.1-8b-instant'

    return this.callChatCompletions(
      'https://api.groq.com/openai/v1/chat/completions',
      apiKey,
      model,
      systemPrompt,
      userPrompt,
      options,
    )
  }

  private async callOpenAi(
    apiKey: string,
    systemPrompt: string,
    userPrompt: string,
    options?: { temperature?: number; maxTokens?: number },
  ): Promise<string> {
    const model = this.config.get<string>('OPENAI_MODEL') ?? 'gpt-4o-mini'

    return this.callChatCompletions(
      'https://api.openai.com/v1/chat/completions',
      apiKey,
      model,
      systemPrompt,
      userPrompt,
      options,
    )
  }

  private async callChatCompletions(
    url: string,
    apiKey: string,
    model: string,
    systemPrompt: string,
    userPrompt: string,
    options?: { temperature?: number; maxTokens?: number },
  ): Promise<string> {
    const messages: LlmMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]

    let response: Response
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: options?.temperature ?? 0.7,
          max_tokens: options?.maxTokens ?? 1500,
        }),
      })
    } catch {
      throw new Error('Não foi possível conectar ao serviço de IA.')
    }

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '')
      throw new Error(
        `Erro na geração por IA: ${errorBody || response.statusText}`,
      )
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>
    }

    const content = data.choices?.[0]?.message?.content?.trim()
    if (!content) {
      throw new Error('A IA não retornou conteúdo válido.')
    }

    return content
  }

  private generateFallback(
    systemPrompt: string,
    userPrompt: string,
  ): string {
    const isLessonPlan = systemPrompt.includes('planos de aula')

    if (isLessonPlan) {
      const subjectMatch = userPrompt.match(/disciplina "([^"]+)"/)
      const classMatch = userPrompt.match(/turma "([^"]+)"/)
      const subject = subjectMatch?.[1] ?? 'Disciplina'
      const className = classMatch?.[1] ?? 'Turma'

      return `# Plano de Aula — ${subject} · ${className}

## Objetivos
- Compreender os conceitos centrais da unidade em desenvolvimento
- Aplicar o conteúdo em situações-problema do cotidiano
- Desenvolver autonomia e trabalho colaborativo

## Conteúdos
- Revisão dos pré-requisitos da aula anterior
- Apresentação do tema principal com exemplos contextualizados
- Exercícios guiados e discussão em duplas

## Metodologia (50 min)
1. **Aquecimento (10 min):** Retomada rápida com perguntas diagnósticas
2. **Desenvolvimento (25 min):** Exposição dialogada e prática orientada
3. **Sistematização (10 min):** Síntese coletiva dos aprendizados
4. **Fechamento (5 min):** Registro no caderno e orientação da tarefa

## Recursos
- Quadro ou lousa digital
- Material impresso ou slides
- Caderno dos alunos

## Avaliação
- Participação nas atividades em sala
- Resolução dos exercícios propostos
- Entrega da tarefa de casa na próxima aula

## Tarefa de Casa
- Lista de exercícios complementares sobre o tema trabalhado
- Leitura preparatória para a aula seguinte

---
*Plano gerado pelo Copiloto ClassOn (modo demonstração — configure GROQ_API_KEY ou OPENAI_API_KEY para IA generativa completa).*`
    }

    const nameMatch = userPrompt.match(/aluno\(a\) ([^\.\n]+)/)
    const studentName = nameMatch?.[1] ?? 'o(a) aluno(a)'

    return `Prezados responsáveis por ${studentName},

Esperamos que esta mensagem os encontre bem. Escrevemos para compartilhar, com carinho e transparência, uma atualização sobre o desempenho escolar de ${studentName}.

Nossos registros indicam que ${studentName} tem enfrentado dificuldades tanto nas avaliações quanto na frequência às aulas. Sabemos que cada aluno percorre um caminho único, e nosso compromisso é oferecer o suporte necessário para que retome o ritmo de aprendizagem com confiança.

Gostaríamos de convidá-los para uma conversa com a coordenação pedagógica, onde poderemos, juntos, traçar um plano de acompanhamento personalizado — incluindo reforço escolar, orientação de estudos e monitoramento da assiduidade.

A parceria entre família e escola é fundamental. Estamos à disposição para esclarecer dúvidas e caminhar ao lado de vocês neste processo.

Atenciosamente,
Coordenação Pedagógica — ClassOn

---
*Comunicado gerado pelo Copiloto ClassOn (modo demonstração — configure GROQ_API_KEY ou OPENAI_API_KEY para IA generativa completa).*`
  }

  private buildTaskSystemPrompt(searchWeb: boolean, hasPdf: boolean): string {
    const lines = [
      'Você é um especialista em design instrucional da educação básica brasileira, alinhado à BNCC.',
      'Sua função é criar tarefas escolares completas, claras e prontas para serem aplicadas em sala.',
      'Responda SOMENTE em Markdown bem estruturado, em português do Brasil.',
      'Estruture a tarefa com: um título (#), um breve enunciado/contextualização, objetivos de aprendizagem, instruções para o aluno e uma lista numerada de questões variadas (objetivas e dissertativas).',
    ]

    if (hasPdf) {
      lines.push(
        'PRIORIDADE ABSOLUTA: o bloco marcado como [CONTEÚDO BASE DO PROFESSOR] contém o material enviado pelo professor. Baseie obrigatoriamente as questões nesse conteúdo, respeitando os temas, dados e exemplos presentes nele.',
      )
    }

    if (searchWeb) {
      lines.push(
        'Você recebeu um bloco [CONTEXTO DE PESQUISA NA WEB] com trechos e fontes reais de portais educacionais brasileiros. Utilize-o para enriquecer e fundamentar as questões.',
        'OBRIGATÓRIO: encerre SEMPRE a resposta com uma seção em Markdown exatamente assim: "### 📚 Fontes Reais de Pesquisa Utilizadas:" seguida de uma lista com os links fornecidos no contexto, em formato Markdown clicável.',
      )
    }

    return lines.join('\n')
  }

  private buildTaskUserPrompt(params: {
    title: string
    schoolYear: string
    pdfText: string
    webContext: TaskWebContext | null
    refinePrompt?: string
    historyText?: string
  }): string {
    const sections: string[] = []

    sections.push(
      `Crie uma tarefa escolar com o título "${params.title}", destinada à turma/ano "${params.schoolYear}".`,
    )

    if (params.pdfText) {
      sections.push(
        `[CONTEÚDO BASE DO PROFESSOR]\n${params.pdfText}\n[FIM DO CONTEÚDO BASE]`,
      )
    }

    if (params.webContext) {
      sections.push(
        `[CONTEXTO DE PESQUISA NA WEB]\n${params.webContext.contextText}\n[FIM DO CONTEXTO DE PESQUISA NA WEB]`,
      )
    }

    if (params.historyText) {
      sections.push(
        `Esta é a versão atual da tarefa que deve ser ajustada (não recomece do zero, apenas aplique os ajustes solicitados):\n"""\n${params.historyText}\n"""`,
      )
    }

    if (params.refinePrompt) {
      sections.push(
        `Ajuste específico solicitado pelo professor: ${params.refinePrompt}`,
      )
    } else if (!params.historyText) {
      sections.push(
        'Gere de 5 a 8 questões adequadas ao nível da turma, com nível de dificuldade progressivo.',
      )
    }

    return sections.join('\n\n')
  }

  private buildManualLinksContext(links: string[]): TaskWebContext {
    const sources: WebSearchSource[] = links.map((url) => ({
      label: this.describeUrl(url),
      url,
    }))

    const contextText = sources
      .map((source) => `- ${source.label}: ${source.url}`)
      .join('\n')

    return { contextText, sources }
  }

  private buildWebSearchContext(
    title: string,
    manualLinks: string[],
  ): TaskWebContext {
    const curated = this.resolveCuratedSources(title)

    const manualSources: WebSearchSource[] = manualLinks.map((url) => ({
      label: this.describeUrl(url),
      url,
    }))

    const seen = new Set<string>()
    const sources: WebSearchSource[] = [...curated, ...manualSources].filter(
      (source) => {
        if (seen.has(source.url)) return false
        seen.add(source.url)
        return true
      },
    )

    const contextText = sources
      .map(
        (source, index) =>
          `Fonte ${index + 1} — ${source.label}\nURL: ${source.url}\nResumo: ${this.buildSourceSummary(source.label, title)}`,
      )
      .join('\n\n')

    return { contextText, sources }
  }

  private resolveCuratedSources(title: string): WebSearchSource[] {
    const normalized = title
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()

    const catalog: Array<{ keywords: string[]; sources: WebSearchSource[] }> = [
      {
        keywords: ['matematica', 'fracao', 'equacao', 'geometria', 'algebra', 'numero'],
        sources: [
          {
            label: 'Nova Escola — Planos e atividades de Matemática (BNCC)',
            url: 'https://novaescola.org.br/planos-de-aula/fundamental/matematica',
          },
          {
            label: 'Khan Academy Brasil — Matemática',
            url: 'https://pt.khanacademy.org/math',
          },
          {
            label: 'Brasil Escola — Matemática',
            url: 'https://brasilescola.uol.com.br/matematica',
          },
        ],
      },
      {
        keywords: ['portugues', 'redacao', 'gramatica', 'interpretacao', 'texto', 'literatura'],
        sources: [
          {
            label: 'Nova Escola — Língua Portuguesa (BNCC)',
            url: 'https://novaescola.org.br/planos-de-aula/fundamental/lingua-portuguesa',
          },
          {
            label: 'Brasil Escola — Gramática e Redação',
            url: 'https://brasilescola.uol.com.br/gramatica',
          },
          {
            label: 'Mundo Educação — Português',
            url: 'https://mundoeducacao.uol.com.br/portugues',
          },
        ],
      },
      {
        keywords: ['ciencias', 'biologia', 'celula', 'corpo', 'ecossistema', 'fisica', 'quimica'],
        sources: [
          {
            label: 'Nova Escola — Ciências (BNCC)',
            url: 'https://novaescola.org.br/planos-de-aula/fundamental/ciencias',
          },
          {
            label: 'Khan Academy Brasil — Ciências',
            url: 'https://pt.khanacademy.org/science',
          },
          {
            label: 'Brasil Escola — Biologia',
            url: 'https://brasilescola.uol.com.br/biologia',
          },
        ],
      },
      {
        keywords: ['historia', 'brasil colonia', 'republica', 'guerra', 'revolucao'],
        sources: [
          {
            label: 'Nova Escola — História (BNCC)',
            url: 'https://novaescola.org.br/planos-de-aula/fundamental/historia',
          },
          {
            label: 'Brasil Escola — História do Brasil',
            url: 'https://brasilescola.uol.com.br/historiab',
          },
          {
            label: 'Mundo Educação — História',
            url: 'https://mundoeducacao.uol.com.br/historiadobrasil',
          },
        ],
      },
      {
        keywords: ['geografia', 'mapa', 'clima', 'relevo', 'globalizacao'],
        sources: [
          {
            label: 'Nova Escola — Geografia (BNCC)',
            url: 'https://novaescola.org.br/planos-de-aula/fundamental/geografia',
          },
          {
            label: 'Brasil Escola — Geografia',
            url: 'https://brasilescola.uol.com.br/geografia',
          },
          {
            label: 'IBGE Educa — Geografia do Brasil',
            url: 'https://educa.ibge.gov.br/',
          },
        ],
      },
    ]

    const matched = catalog.find((entry) =>
      entry.keywords.some((keyword) => normalized.includes(keyword)),
    )

    const base: WebSearchSource[] = [
      {
        label: 'Base Nacional Comum Curricular (BNCC) — MEC',
        url: 'https://www.gov.br/mec/pt-br/escola-em-tempo-integral/BNCC',
      },
    ]

    if (matched) {
      return [...matched.sources, ...base]
    }

    return [
      {
        label: 'Nova Escola — Planos de aula alinhados à BNCC',
        url: 'https://novaescola.org.br/planos-de-aula',
      },
      {
        label: 'Khan Academy Brasil — Conteúdos por disciplina',
        url: 'https://pt.khanacademy.org/',
      },
      {
        label: 'Brasil Escola — Conteúdos didáticos',
        url: 'https://brasilescola.uol.com.br/',
      },
      ...base,
    ]
  }

  private buildSourceSummary(label: string, title: string): string {
    return `Material didático brasileiro com explicações, exemplos e atividades aplicáveis ao tema "${title}". Referência confiável (${label}) para fundamentar as questões da tarefa.`
  }

  private describeUrl(url: string): string {
    try {
      const host = new URL(url).hostname.replace(/^www\./, '')
      return `Referência externa (${host})`
    } catch {
      return 'Referência externa'
    }
  }

  private ensureSourcesSection(
    content: string,
    sources: WebSearchSource[],
  ): string {
    const header = '### 📚 Fontes Reais de Pesquisa Utilizadas:'
    if (content.includes(header)) {
      return content
    }

    const list = sources
      .map((source) => `- [${source.label}](${source.url})`)
      .join('\n')

    return `${content.trim()}\n\n${header}\n${list}`
  }

  private buildTaskFallback(params: {
    title: string
    schoolYear: string
    pdfText: string
    sources: WebSearchSource[]
  }): string {
    const baseNote = params.pdfText
      ? '\n> As questões abaixo foram estruturadas a partir do conteúdo base enviado pelo professor.'
      : ''

    const sourcesSection =
      params.sources.length > 0
        ? `\n\n### 📚 Fontes Reais de Pesquisa Utilizadas:\n${params.sources
            .map((source) => `- [${source.label}](${source.url})`)
            .join('\n')}`
        : ''

    return `# ${params.title}

**Turma/Ano:** ${params.schoolYear}
${baseNote}

## Objetivos de Aprendizagem
- Revisar e consolidar os conceitos centrais relacionados a "${params.title}".
- Desenvolver a capacidade de análise e aplicação prática do tema.
- Estimular a escrita argumentativa e a resolução de problemas.

## Instruções
- Leia atentamente cada questão antes de responder.
- Justifique suas respostas sempre que solicitado.
- A tarefa pode ser feita individualmente ou em duplas, conforme orientação do professor.

## Questões
1. Explique, com suas palavras, o conceito principal abordado em "${params.title}".
2. Cite dois exemplos do cotidiano que se relacionam com o tema estudado.
3. Resolva a situação-problema proposta pelo professor aplicando o conteúdo da aula.
4. Compare duas ideias ou abordagens diferentes relacionadas ao tema e aponte semelhanças e diferenças.
5. (Dissertativa) Produza um pequeno texto (5 a 10 linhas) refletindo sobre a importância de "${params.title}" no seu dia a dia.

## Critérios de Avaliação
- Clareza e coerência das respostas.
- Correta aplicação dos conceitos estudados.
- Capacidade de argumentação e organização das ideias.

---
*Tarefa gerada pelo Copiloto ClassOn (modelo estruturado de contingência — verifique a chave GROQ_API_KEY/OPENAI_API_KEY para geração generativa completa).*${sourcesSection}`
  }

  private async callTaskLlm(
    systemPrompt: string,
    userPrompt: string,
  ): Promise<string> {
    const groqKey = this.config.get<string>('GROQ_API_KEY')
    const openaiKey = this.config.get<string>('OPENAI_API_KEY')

    if (groqKey) {
      const model =
        this.config.get<string>('GROQ_MODEL') ?? 'llama-3.1-8b-instant'
      return this.callChatCompletionsWithTimeout(
        'https://api.groq.com/openai/v1/chat/completions',
        groqKey,
        model,
        systemPrompt,
        userPrompt,
      )
    }

    if (openaiKey) {
      const model = this.config.get<string>('OPENAI_MODEL') ?? 'gpt-4o-mini'
      return this.callChatCompletionsWithTimeout(
        'https://api.openai.com/v1/chat/completions',
        openaiKey,
        model,
        systemPrompt,
        userPrompt,
      )
    }

    throw new Error('Nenhuma chave de IA configurada para geração de tarefas.')
  }

  private async callChatCompletionsWithTimeout(
    url: string,
    apiKey: string,
    model: string,
    systemPrompt: string,
    userPrompt: string,
  ): Promise<string> {
    const messages: LlmMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), TASK_LLM_TIMEOUT_MS)

    let response: Response
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7,
          max_tokens: 1800,
        }),
        signal: controller.signal,
      })
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(
          `Tempo limite de ${TASK_LLM_TIMEOUT_MS}ms excedido ao chamar a IA.`,
        )
      }
      throw new Error('Não foi possível conectar ao serviço de IA.')
    } finally {
      clearTimeout(timeout)
    }

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '')
      throw new Error(
        `Erro na geração por IA: ${errorBody || response.statusText}`,
      )
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>
    }

    const content = data.choices?.[0]?.message?.content?.trim()
    if (!content) {
      throw new Error('A IA não retornou conteúdo válido.')
    }

    return content
  }
}
