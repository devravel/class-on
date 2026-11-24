import { ArrowRight } from 'lucide-react'

const STATS = [
  { value: '3', label: 'Perfis de acesso integrados' },
  { value: '16', label: 'Módulos REST no backend' },
  { value: '4', label: 'Funcionalidades nativas de IA' },
]

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-ink-900 pb-24 pt-40 sm:pb-32 sm:pt-48">
      {/* Glow ambiente — mesma paleta do app-shell do produto real */}
      <div
        className="app-shell-gradient pointer-events-none absolute -top-56 left-1/2 h-[560px] w-[1100px] -translate-x-1/2 rounded-full opacity-40 blur-[130px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage: 'linear-gradient(to bottom, black, transparent 85%)',
        }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-4xl px-6 text-center lg:px-8">
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/85">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
          Sistema de Gestão Escolar · Secretaria, Professores e Alunos
        </div>

        <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-6xl">
          A gestão da sua escola,{' '}
          <span className="bg-gradient-to-r from-brand-400 to-brand-500 bg-clip-text text-transparent">
            simplificada de ponta a ponta.
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/70">
          O ClassOn conecta secretaria, professores e alunos em uma plataforma full-stack
          única — com matrículas, boletim, frequência e comunicação centralizados, além de
          um copiloto de Inteligência Artificial nativo.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href="#cta"
            className="group inline-flex w-full items-center justify-center gap-2 rounded-component bg-brand-600 px-7 py-3.5 text-sm font-semibold text-white transition-all hover:bg-brand-500 hover:shadow-brand sm:w-auto"
          >
            Agendar Demonstração
            <ArrowRight
              size={16}
              className="transition-transform duration-300 group-hover:translate-x-0.5"
            />
          </a>
          <a
            href="#demonstracao"
            className="inline-flex w-full items-center justify-center gap-2 rounded-component bg-white/8 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/14 sm:w-auto"
          >
            Ver Demonstração
          </a>
        </div>

        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-3 gap-4 border-t border-white/5 pt-10">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <p className="text-2xl font-semibold text-white sm:text-3xl">{stat.value}</p>
              <p className="mt-1 text-xs leading-snug text-white/60">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
