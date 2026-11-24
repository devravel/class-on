import { Database, KeyRound, ShieldCheck } from 'lucide-react'

const STACK = [
  'Next.js 16',
  'React 19',
  'TypeScript',
  'NestJS 10',
  'Prisma 7',
  'PostgreSQL 15',
  'Tailwind CSS v4',
  'JWT + bcrypt',
]

const SECURITY = [
  {
    icon: KeyRound,
    title: 'Autenticação por Perfil',
    description:
      'JWT com guards de rota por papel — Secretaria, Professor e Aluno acessam exclusivamente o que lhes é permitido.',
  },
  {
    icon: Database,
    title: 'Integridade Relacional',
    description:
      'Modelagem com Prisma e PostgreSQL garante consistência entre matrículas, notas e frequência.',
  },
  {
    icon: ShieldCheck,
    title: 'Privacidade de Dados',
    description:
      'Segregação estrita de acesso: cada aluno visualiza exclusivamente seu próprio histórico acadêmico.',
  },
]

export function TechStack() {
  return (
    <section id="tecnologia" className="border-t border-white/5 bg-ink-900 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-400">
            Infraestrutura
          </span>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Construído com uma stack moderna e robusta
          </h2>
          <p className="mt-4 text-base text-white/70">
            Arquitetura full-stack desacoplada, pensada para segurança e escalabilidade
            acadêmica.
          </p>
        </div>

        <div className="mx-auto mt-10 flex max-w-3xl flex-wrap items-center justify-center gap-3">
          {STACK.map((tech) => (
            <span
              key={tech}
              className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-medium text-white/85"
            >
              {tech}
            </span>
          ))}
        </div>

        <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {SECURITY.map((item) => (
            <div
              key={item.title}
              className="rounded-card bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-6"
            >
              <item.icon size={20} className="mb-4 text-brand-400" />
              <h3 className="text-sm font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/70">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        <p className="mx-auto mt-10 max-w-xl text-center text-xs leading-relaxed text-white/60">
          Dados hospedados com controle de acesso por papel e boas práticas de proteção de
          dados educacionais, alinhados aos princípios da LGPD.
        </p>
      </div>
    </section>
  )
}
