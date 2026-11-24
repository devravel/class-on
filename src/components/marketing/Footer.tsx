import Link from 'next/link'
import { Mail } from 'lucide-react'

import { Logo } from '@/components/brand/Logo'

const PRODUCT_LINKS = [
  { href: '#demonstracao', label: 'Demonstração' },
  { href: '#funcionalidades', label: 'Funcionalidades' },
  { href: '#tecnologia', label: 'Tecnologia' },
]

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-ink-900">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo size={30} tagline tone="mono" className="text-white" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
              Plataforma de gestão escolar full-stack que conecta secretaria, professores e
              alunos em um único ambiente digital.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-white/60">
              Produto
            </p>
            <ul className="mt-4 space-y-3">
              {PRODUCT_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-white/70 transition-colors hover:text-white"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-white/60">
              Acesso
            </p>
            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  href="/login"
                  className="text-sm text-white/70 transition-colors hover:text-white"
                >
                  Entrar
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="text-sm text-white/70 transition-colors hover:text-white"
                >
                  Testar Grátis
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-white/60">
              Contato
            </p>
            <a
              href="mailto:contato@classon.com.br"
              className="mt-4 inline-flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-white"
            >
              <Mail size={14} />
              contato@classon.com.br
            </a>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 sm:flex-row">
          <p className="text-xs text-white/60">
            © {new Date().getFullYear()} ClassOn. Todos os direitos reservados.
          </p>
          <p className="text-xs text-white/60">
            Desenvolvido como Trabalho de Conclusão de Curso (TCC)
          </p>
        </div>
      </div>
    </footer>
  )
}
