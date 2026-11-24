import { FileText, Sparkles } from 'lucide-react'

export function IaPanel() {
  return (
    <div className="flex h-full flex-col gap-4 p-4 sm:p-6">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wide text-text-tertiary">
          Copiloto Pedagógico
        </p>
        <h3 className="text-lg font-semibold text-neutral-900">
          Geração de Conteúdo com IA
        </h3>
      </div>

      <div className="rounded-xl bg-surface p-4 shadow-card">
        <p className="mb-2 text-xs font-semibold text-neutral-700">Gerador de Tarefas</p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex-1 truncate rounded-lg border border-neutral-200 bg-surface-muted px-3 py-2 text-xs text-text-secondary">
            &ldquo;Equações do 2º grau — 9º ano&rdquo;
          </div>
          <span className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-brand-700 px-3 py-2 text-xs font-medium text-white">
            <Sparkles size={12} />
            Gerar
          </span>
        </div>
      </div>

      <div className="flex-1 rounded-xl bg-surface p-4 shadow-card">
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-neutral-700">
          <FileText size={13} className="text-brand-500" />
          Comunicado para Responsáveis — Gerado
        </div>
        <p className="text-[11px] leading-relaxed text-text-secondary">
          &ldquo;Prezados responsáveis, escrevemos para compartilhar informações sobre o
          desempenho acadêmico recente e propor um plano de acompanhamento conjunto...&rdquo;
        </p>
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
          <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-brand-400 to-brand-700" />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="rounded-full bg-neutral-100 px-3 py-1 text-[10px] font-medium text-neutral-600">
          Groq · Llama 3.1
        </span>
        <span className="rounded-full bg-neutral-100 px-3 py-1 text-[10px] font-medium text-neutral-600">
          OpenAI · GPT-4o-mini
        </span>
        <span className="rounded-full bg-neutral-100 px-3 py-1 text-[10px] font-medium text-neutral-600">
          Interpretação de Comandos
        </span>
      </div>
    </div>
  )
}
