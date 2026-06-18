import {
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { GenerateLessonPlanDto } from './dto/generate-lesson-plan.dto'
import { GenerateParentReportDto } from './dto/generate-parent-report.dto'

interface LlmMessage {
  role: 'system' | 'user'
  content: string
}

@Injectable()
export class AiService {
  constructor(private readonly config: ConfigService) {}

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

  private async callLlm(
    systemPrompt: string,
    userPrompt: string,
  ): Promise<string> {
    const groqKey = this.config.get<string>('GROQ_API_KEY')
    const openaiKey = this.config.get<string>('OPENAI_API_KEY')

    if (groqKey) {
      return this.callGroq(groqKey, systemPrompt, userPrompt)
    }

    if (openaiKey) {
      return this.callOpenAi(openaiKey, systemPrompt, userPrompt)
    }

    return this.generateFallback(systemPrompt, userPrompt)
  }

  private async callGroq(
    apiKey: string,
    systemPrompt: string,
    userPrompt: string,
  ): Promise<string> {
    const model =
      this.config.get<string>('GROQ_MODEL') ?? 'llama-3.1-8b-instant'

    return this.callChatCompletions(
      'https://api.groq.com/openai/v1/chat/completions',
      apiKey,
      model,
      systemPrompt,
      userPrompt,
    )
  }

  private async callOpenAi(
    apiKey: string,
    systemPrompt: string,
    userPrompt: string,
  ): Promise<string> {
    const model = this.config.get<string>('OPENAI_MODEL') ?? 'gpt-4o-mini'

    return this.callChatCompletions(
      'https://api.openai.com/v1/chat/completions',
      apiKey,
      model,
      systemPrompt,
      userPrompt,
    )
  }

  private async callChatCompletions(
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
          max_tokens: 1500,
        }),
      })
    } catch {
      throw new ServiceUnavailableException(
        'Não foi possível conectar ao serviço de IA. Tente novamente.',
      )
    }

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '')
      throw new InternalServerErrorException(
        `Erro na geração por IA: ${errorBody || response.statusText}`,
      )
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>
    }

    const content = data.choices?.[0]?.message?.content?.trim()
    if (!content) {
      throw new InternalServerErrorException(
        'A IA não retornou conteúdo válido.',
      )
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
}
