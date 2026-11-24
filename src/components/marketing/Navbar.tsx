'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

import { Logo } from '@/components/brand/Logo'

const NAV_LINKS = [
  { href: '#demonstracao', label: 'Demonstração' },
  { href: '#funcionalidades', label: 'Funcionalidades' },
  { href: '#tecnologia', label: 'Tecnologia' },
]

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-ink-900/70 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <Link
          href="/"
          className="flex items-center rounded-component text-white focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand-400/60"
          aria-label="ClassOn — Página inicial"
        >
          <Logo size={26} tone="mono" />
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-white/85 transition-colors hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/login"
            className="text-sm font-medium text-white/85 transition-colors hover:text-white"
          >
            Entrar
          </Link>
          <Link
            href="/login"
            className="rounded-component bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-brand-500 hover:shadow-brand"
          >
            Testar Grátis
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((value) => !value)}
          className="flex h-9 w-9 items-center justify-center rounded-component text-white lg:hidden"
          aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={isOpen}
          aria-controls="menu-mobile"
        >
          {isOpen ? (
            <X size={20} aria-hidden="true" />
          ) : (
            <Menu size={20} aria-hidden="true" />
          )}
        </button>
      </nav>

      {isOpen && (
        <div
          id="menu-mobile"
          className="border-t border-white/5 bg-ink-900 px-6 py-5 lg:hidden"
        >
          <div className="flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-sm font-medium text-white/85"
              >
                {link.label}
              </a>
            ))}
            <div className="mt-1 flex flex-col gap-3 border-t border-white/5 pt-4">
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="text-sm font-medium text-white/85"
              >
                Entrar
              </Link>
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="rounded-component bg-brand-600 px-4 py-2.5 text-center text-sm font-semibold text-white"
              >
                Testar Grátis
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
