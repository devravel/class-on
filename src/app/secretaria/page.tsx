'use client'

import {
  BookOpen,
  School,
  ChevronRight,
  Clock,
  FileText,
  GraduationCap,
  Plus,
  UserCheck,
  UserPlus,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import { KpiCard } from '@/components/dashboard/KpiCard'
import { ListCard } from '@/components/dashboard/ListCard'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { Section } from '@/components/dashboard/Section'
import { UpcomingEventsCard } from '@/components/events/UpcomingEventsCard'
import { PageContainer } from '@/components/layout/PageContainer'
import { buttonVariants } from '@/components/ui/button'
import { academicYearsApi } from '@/lib/api'
import { ApiError } from '@/lib/api-client'
import { cn } from '@/lib/utils'
import { AcademicYear } from '@/types/academic-year'

const kpis = [
  {
    id: 'alunos',
    label: 'Total de Alunos',
    value: '1.247',
    icon: Users,
    trend: '+23 este mês',
    trendType: 'positive' as const,
  },
  {
    id: 'professores',
    label: 'Total de Professores',
    value: '42',
    icon: GraduationCap,
    trend: '+2 este mês',
    trendType: 'positive' as const,
  },
  {
    id: 'turmas',
    label: 'Total de Turmas',
    value: '28',
    icon: BookOpen,
    trend: '5 com vagas disponíveis',
    trendType: 'neutral' as const,
  },
]

const recentClasses = [
  { id: 1, name: '9º Ano A', shift: 'Matutino', students: 32, teacher: 'João Silva', subject: 'Matemática' },
  { id: 2, name: '8º Ano B', shift: 'Vespertino', students: 28, teacher: 'Ana Lima', subject: 'Português' },
  { id: 3, name: '7º Ano C', shift: 'Matutino', students: 30, teacher: 'Carlos Souza', subject: 'Ciências' },
  { id: 4, name: '6º Ano A', shift: 'Noturno', students: 25, teacher: 'Maria Santos', subject: 'História' },
  { id: 5, name: '1º EM A', shift: 'Matutino', students: 35, teacher: 'Pedro Costa', subject: 'Física' },
]

const announcements = [
  { id: 1, title: 'Reunião pedagógica — 15/01', author: 'Coordenação', date: '03/01' },
  { id: 2, title: 'Entrega de relatórios bimestrais', author: 'Direção', date: '02/01' },
  { id: 3, title: 'Ano letivo 2025 — ciclo definido na secretaria', author: 'Secretaria', date: '01/01' },
]

const quickActions = [
  { label: 'Cadastrar Aluno', icon: UserPlus, href: '/secretaria/alunos/novo', variant: 'default' as const },
  { label: 'Cadastrar Professor', icon: UserCheck, href: '/secretaria/professores/novo', variant: 'outline' as const },
  { label: 'Nova Turma', icon: Plus, href: '/secretaria/turmas/nova', variant: 'outline' as const },
  { label: 'Emitir Relatório', icon: FileText, href: '/secretaria/relatorios', variant: 'outline' as const },
]

const shiftBadge: Record<string, string> = {
  Matutino: 'bg-brand-100 text-brand-700',
  Vespertino: 'bg-warning/10 text-warning',
  Noturno: 'bg-neutral-200 text-neutral-700',
}

export default function SecretariaPage() {
  const [activeAcademicYear, setActiveAcademicYear] = useState<AcademicYear | null>(null)
  const [isAcademicYearLoading, setIsAcademicYearLoading] = useState(true)
  const [academicYearError, setAcademicYearError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadActiveAcademicYear = async () => {
      try {
        setIsAcademicYearLoading(true)
        setAcademicYearError(null)

        const data = await academicYearsApi.getActive()

        if (isMounted) {
          setActiveAcademicYear(data)
        }
      } catch (error) {
        if (!isMounted) {
          return
        }

        setActiveAcademicYear(null)

        if (error instanceof ApiError && error.status === 404) {
          return
        }

        console.error('Erro ao carregar ano letivo ativo:', error)
        setAcademicYearError('Não foi possível carregar o ano letivo.')
      } finally {
        if (isMounted) {
          setIsAcademicYearLoading(false)
        }
      }
    }

    loadActiveAcademicYear()

    return () => {
      isMounted = false
    }
  }, [])

  const academicYearValue = isAcademicYearLoading
    ? 'Carregando...'
    : activeAcademicYear
      ? activeAcademicYear.year
      : 'Nenhum ano cadastrado no momento'

  const academicYearTrend = isAcademicYearLoading
    ? 'Buscando ano ativo'
    : activeAcademicYear
      ? 'Em andamento'
      : academicYearError

  return (
    <PageContainer>
      {/* Page heading */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
        <p className="mt-1 text-sm text-text-secondary">
          {activeAcademicYear
            ? `Visão geral do sistema — Ano Letivo ${activeAcademicYear.year}`
            : 'Visão geral do sistema'}
        </p>
      </div>

      {/* KPIs */}
      <Section title="Indicadores Gerais" className="mb-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((kpi) => (
            <KpiCard key={kpi.id} {...kpi} />
          ))}
          <KpiCard
            label="Ano Letivo"
            value={academicYearValue}
            icon={School}
            trend={academicYearTrend ?? undefined}
            trendType={academicYearError ? 'negative' : 'neutral'}
            valueClassName={!isAcademicYearLoading && !activeAcademicYear ? 'text-base leading-snug' : undefined}
            action={
              !isAcademicYearLoading && !activeAcademicYear && !academicYearError ? (
                <Link
                  href="/secretaria/academic-years/novo"
                  className={cn(buttonVariants({ size: 'sm' }), 'w-fit')}
                >
                  <Plus size={14} />
                  Cadastrar novo ano
                </Link>
              ) : undefined
            }
          />
        </div>
      </Section>

      {/* Turmas + Próximos Eventos + Comunicados */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Turmas recentes — 1/3 */}
        <div className="lg:col-span-1">
          <Section
            title="Turmas Recentes"
            action={
              <a
                href="/secretaria/turmas"
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                Ver todas <ChevronRight size={14} />
              </a>
            }
          >
            <ListCard
              items={recentClasses.slice(0, 4)} // Reduzir para caber no layout
              renderItem={(item) => (
                <div className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-neutral-100">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-component bg-primary/10">
                      <BookOpen size={14} className="text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-text-primary">{item.name}</p>
                      <p className="truncate text-xs text-text-secondary">
                        {item.students} alunos
                      </p>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${shiftBadge[item.shift] ?? 'bg-neutral-200 text-neutral-700'}`}
                  >
                    {item.shift}
                  </span>
                </div>
              )}
            />
          </Section>
        </div>

        {/* Próximos Eventos — 1/3 */}
        <div className="lg:col-span-1">
          <UpcomingEventsCard role="SECRETARIA" limit={4} />
        </div>

        {/* Comunicados — 1/3 */}
        <div className="lg:col-span-1">
          <Section
            title="Comunicados"
            action={
              <a
                href="/secretaria/comunicados"
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                Ver todos <ChevronRight size={14} />
              </a>
            }
          >
            <ListCard
              items={announcements.slice(0, 4)} // Reduzir para caber no layout
              renderItem={(item) => (
                <div className="flex flex-col gap-1.5 px-4 py-3 transition-colors hover:bg-neutral-100">
                  <p className="text-sm font-medium leading-snug text-text-primary">
                    {item.title}
                  </p>
                  <span className="flex items-center gap-1 text-xs text-text-secondary">
                    <Clock size={12} />
                    {item.date} · {item.author}
                  </span>
                </div>
              )}
            />
          </Section>
        </div>
      </div>

      {/* Quick Actions */}
      <Section
        title="Ações Rápidas"
        description="Acesso direto às principais funcionalidades"
      >
        <QuickActions actions={quickActions} />
      </Section>
    </PageContainer>
  )
}
