import { Activity, BookOpen, ClipboardList, Megaphone, Sparkles, UserCheck } from 'lucide-react'

const FEATURES = [
  {
    icon: BookOpen,
    title: 'Matrículas & Turmas',
    description:
      'Wizard multi-etapa para criação de turmas, matrícula individual ou em lote e progressão automática entre anos letivos.',
  },
  {
    icon: ClipboardList,
    title: 'Boletim Automatizado',
    description:
      'Lançamento de notas por bimestre (N1 a N4) com cálculo automático de médias, recuperação e status final.',
  },
  {
    icon: UserCheck,
    title: 'Frequência Inteligente',
    description:
      'Chamada digital por aula com cálculo automático do percentual de frequência por disciplina e por aluno.',
  },
  {
    icon: Activity,
    title: 'Monitoramento Preditivo',
    description:
      'Classificação automática de risco pedagógico — Estável, Alerta ou Crítico — com base em notas e presença.',
  },
  {
    icon: Megaphone,
    title: 'Comunicação & Agenda',
    description:
      'Comunicados segmentados por turma ou aluno e um calendário único de eventos escolares, o "Agendão".',
  },
  {
    icon: Sparkles,
    title: 'Copiloto de IA',
    description:
      'Geração de tarefas, planos de aula e comunicados a responsáveis com Groq (Llama 3.1) e OpenAI.',
  },
]

export function FeaturesGrid() {
  return (
    <section id="funcionalidades" className="border-t border-white/5 bg-ink-900 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-400">
            Funcionalidades
          </span>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Tudo o que a rotina escolar precisa
          </h2>
          <p className="mt-4 text-base text-white/70">
            Módulos integrados que cobrem o ciclo acadêmico completo — da matrícula ao
            boletim final.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-card bg-white/[0.04] p-6 transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.07]"
            >
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400 transition-colors duration-300 group-hover:bg-brand-500 group-hover:text-white">
                <feature.icon size={20} />
              </div>
              <h3 className="text-base font-semibold text-white">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/70">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
