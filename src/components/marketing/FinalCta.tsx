import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const DEMO_ACCOUNTS = [
  { role: 'Secretaria', email: 'admin@classon.com' },
  { role: 'Professor', email: 'prof1@classon.com' },
  { role: 'Aluno', email: 'aluno0001@classon.com' },
]

export function FinalCta() {
  return (
    <section
      id="cta"
      className="relative overflow-hidden border-t border-white/5 bg-ink-900 py-24 sm:py-32"
    >
      <div
        className="app-shell-gradient pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25 blur-[130px]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-4xl px-6 text-center lg:px-8">
        <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Pronto para simplificar a gestão da sua escola?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base text-white/70">
          Explore o ambiente de demonstração completo — sem custo e sem cadastro — e veja o
          ClassOn funcionando com dados reais de uma escola de ensino médio.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/login"
            className="group inline-flex items-center justify-center gap-2 rounded-component bg-brand-600 px-7 py-3.5 text-sm font-semibold text-white transition-all hover:bg-brand-500 hover:shadow-brand"
          >
            Testar Grátis Agora
            <ArrowRight
              size={16}
              className="transition-transform duration-300 group-hover:translate-x-0.5"
            />
          </Link>
          <a
            href="mailto:contato@classon.com.br"
            className="inline-flex items-center justify-center gap-2 rounded-component bg-white/8 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/14"
          >
            Agendar Demonstração
          </a>
        </div>

        <div className="mx-auto mt-14 max-w-xl rounded-card bg-white/[0.05] p-6 text-left">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-white/70">
            Acesso de demonstração — senha para todas as contas:{' '}
            <span className="font-mono text-brand-400">123456</span>
          </p>
          <div className="grid gap-2 sm:grid-cols-3">
            {DEMO_ACCOUNTS.map((account) => (
              <div key={account.email} className="rounded-lg bg-white/5 px-3 py-2.5">
                <p className="text-[10px] font-medium text-white/60">{account.role}</p>
                <p className="mt-0.5 truncate text-xs font-medium text-white">
                  {account.email}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
