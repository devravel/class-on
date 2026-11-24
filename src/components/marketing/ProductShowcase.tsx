'use client'

import { useState } from 'react'
import {
  Activity,
  BarChart2,
  BookOpen,
  Calendar,
  ClipboardList,
  FileText,
  GraduationCap,
  LayoutDashboard,
  ListTodo,
  Megaphone,
  MessageSquareText,
  Sparkles,
  UserCheck,
  Users,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { AppShellMockup } from './AppShellMockup'
import { AlunoPanel } from './showcase/AlunoPanel'
import { IaPanel } from './showcase/IaPanel'
import { ProfessorPanel } from './showcase/ProfessorPanel'
import { SecretariaPanel } from './showcase/SecretariaPanel'

const TABS = [
  {
    id: 'secretaria',
    label: 'Painel da Secretaria',
    description: 'Indicadores gerais, turmas ativas e monitoramento preditivo de risco.',
    icon: LayoutDashboard,
    navIcons: [LayoutDashboard, Activity, BookOpen, Users, GraduationCap, Megaphone],
    Panel: SecretariaPanel,
  },
  {
    id: 'professor',
    label: 'Portal do Professor',
    description: 'Lançamento de notas, chamada digital e tarefas por turma.',
    icon: ClipboardList,
    navIcons: [LayoutDashboard, BookOpen, ListTodo, Megaphone, Calendar],
    Panel: ProfessorPanel,
  },
  {
    id: 'aluno',
    label: 'Área do Aluno',
    description: 'Boletim, frequência e comunicados em um só lugar.',
    icon: GraduationCap,
    navIcons: [LayoutDashboard, BarChart2, UserCheck, ListTodo, Megaphone],
    Panel: AlunoPanel,
  },
  {
    id: 'ia',
    label: 'Inteligência Artificial',
    description: 'Copiloto que gera tarefas, planos de aula e comunicados.',
    icon: Sparkles,
    navIcons: [Sparkles, LayoutDashboard, FileText, MessageSquareText],
    Panel: IaPanel,
  },
] as const

type TabId = (typeof TABS)[number]['id']

export function ProductShowcase() {
  const [activeId, setActiveId] = useState<TabId>('secretaria')
  const activeTab = TABS.find((tab) => tab.id === activeId) ?? TABS[0]
  const ActivePanel = activeTab.Panel

  return (
    <section
      id="demonstracao"
      className="relative border-t border-white/5 bg-ink-900 py-24 sm:py-32"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-400">
            Demonstração Interativa
          </span>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Veja o sistema por dentro
          </h2>
          <p className="mt-4 text-base text-white/70">
            Explore os perfis de acesso e o copiloto de IA que já rodam em produção no
            ClassOn — sem dados fictícios de apresentação, a mesma interface real.
          </p>
        </div>

        <p className="mt-8 text-center text-xs font-medium text-white/60 lg:hidden">
          Deslize para explorar os perfis →
        </p>

        <div className="mt-4 grid gap-6 lg:mt-14 lg:grid-cols-[300px_1fr] lg:gap-10">
          {/* Navegação vertical das abas (horizontal em mobile) */}
          <div className="relative -mx-6 lg:mx-0">
            <div className="flex snap-x gap-2 overflow-x-auto px-6 pb-2 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0">
              {TABS.map((tab) => {
                const Icon = tab.icon
                const isActive = tab.id === activeId

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveId(tab.id)}
                    aria-pressed={isActive}
                    className={cn(
                      'group flex shrink-0 snap-start items-center gap-2.5 rounded-card px-3.5 py-3 text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 lg:w-full lg:shrink lg:items-start lg:gap-3 lg:px-4 lg:py-3.5',
                      isActive
                        ? 'bg-brand-500/15 shadow-brand'
                        : 'bg-white/[0.04] hover:bg-white/[0.07]',
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors duration-300',
                        isActive
                          ? 'bg-brand-500 text-white'
                          : 'bg-white/5 text-white/70 group-hover:text-white',
                      )}
                    >
                      <Icon size={16} />
                    </span>
                    <span className="lg:min-w-[170px]">
                      <span
                        className={cn(
                          'block whitespace-nowrap text-sm font-semibold',
                          isActive ? 'text-white' : 'text-white/85',
                        )}
                      >
                        {tab.label}
                      </span>
                      <span className="mt-0.5 hidden text-xs leading-snug text-white/60 lg:block">
                        {tab.description}
                      </span>
                    </span>
                  </button>
                )
              })}
              {/* Espaçador para a última aba não ficar sob o gradiente de scroll */}
              <div className="w-8 shrink-0 lg:hidden" aria-hidden />
            </div>
            {/* Indicador de scroll — sinaliza que há mais abas fora da tela */}
            <div
              className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-ink-900 to-transparent lg:hidden"
              aria-hidden
            />
          </div>

          {/* Mockup do produto */}
          <div className="min-w-0">
            <AppShellMockup navIcons={[...activeTab.navIcons]} url={`app.classon.com.br/${activeTab.id}`}>
              <div key={activeTab.id} className="h-full animate-in fade-in slide-in-from-right-3 duration-300">
                <ActivePanel />
              </div>
            </AppShellMockup>
          </div>
        </div>
      </div>
    </section>
  )
}
