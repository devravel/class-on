'use client'

import {
  BookOpen,
  School,
  ChevronRight,
  Clock,
  GraduationCap,
  Plus,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

import { InlineError } from '@/components/dashboard/InlineError'
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader'
import { DASHBOARD_LIST_LIMIT, ListCard } from '@/components/dashboard/ListCard'
import { KpiCard } from '@/components/dashboard/KpiCard'
import { Section } from '@/components/dashboard/Section'
import { UpcomingEventsCard } from '@/components/events/UpcomingEventsCard'
import { PageContainer } from '@/components/layout/PageContainer'
import { buttonVariants } from '@/components/ui/button'
import {
  academicYearsApi,
  classesApi,
  studentsApi,
  teachersApi,
} from '@/lib/api'
import { announcementsApi } from '@/lib/api/announcements'
import { ApiError } from '@/lib/api-client'
import { getClassLabel } from '@/lib/class-utils'
import { cn } from '@/lib/utils'
import { AcademicYear } from '@/types/academic-year'
import { Announcement } from '@/types/announcement'
import { Class, SHIFT_LABELS, Shift } from '@/types/class'

const shiftBadge: Record<string, string> = {
  MORNING: 'bg-brand-100 text-brand-700',
  AFTERNOON: 'bg-warning/10 text-warning',
  NIGHT: 'bg-neutral-200 text-neutral-700',
}

interface ClassWithStudents extends Class {
  studentCount: number
}

export default function SecretariaPage() {
  const [activeAcademicYear, setActiveAcademicYear] = useState<AcademicYear | null>(null)
  const [isAcademicYearLoading, setIsAcademicYearLoading] = useState(true)
  const [academicYearError, setAcademicYearError] = useState<string | null>(null)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [isAnnouncementsLoading, setIsAnnouncementsLoading] = useState(true)
  const [announcementsError, setAnnouncementsError] = useState<string | null>(null)
  const [studentCount, setStudentCount] = useState<number | null>(null)
  const [teacherCount, setTeacherCount] = useState<number | null>(null)
  const [classCount, setClassCount] = useState<number | null>(null)
  const [recentClasses, setRecentClasses] = useState<ClassWithStudents[]>([])
  const [isKpisLoading, setIsKpisLoading] = useState(true)
  const [kpisError, setKpisError] = useState<string | null>(null)

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

    const loadAnnouncements = async () => {
      try {
        setIsAnnouncementsLoading(true)
        setAnnouncementsError(null)
        const data = await announcementsApi.findAll()

        if (isMounted) {
          setAnnouncements(Array.isArray(data) ? data : [])
        }
      } catch (error) {
        console.error('Failed to fetch announcements:', error)
        if (isMounted) {
          setAnnouncements([])
          setAnnouncementsError('Não foi possível carregar os comunicados.')
        }
      } finally {
        if (isMounted) {
          setIsAnnouncementsLoading(false)
        }
      }
    }

    const loadKpis = async () => {
      try {
        setIsKpisLoading(true)
        setKpisError(null)

        const [students, teachers, classes] = await Promise.all([
          studentsApi.list(),
          teachersApi.list(),
          classesApi.list(),
        ])

        if (!isMounted) return

        const enrollmentCounts = new Map<string, number>()
        for (const student of students) {
          for (const enrollment of student.enrollments ?? []) {
            enrollmentCounts.set(
              enrollment.class_id,
              (enrollmentCounts.get(enrollment.class_id) ?? 0) + 1,
            )
          }
        }

        setStudentCount(students.length)
        setTeacherCount(teachers.length)
        setClassCount(classes.length)

        const classesWithStudents: ClassWithStudents[] = classes.map((classRecord) => ({
          ...classRecord,
          studentCount: enrollmentCounts.get(classRecord.id) ?? 0,
        }))

        setRecentClasses(classesWithStudents)
      } catch (error) {
        console.error('Erro ao carregar indicadores:', error)
        if (isMounted) {
          setKpisError('Não foi possível carregar os indicadores gerais.')
        }
      } finally {
        if (isMounted) {
          setIsKpisLoading(false)
        }
      }
    }

    loadActiveAcademicYear()
    loadAnnouncements()
    loadKpis()

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

  const kpiCards = useMemo(
    () => [
      {
        id: 'alunos',
        label: 'Total de Alunos',
        value: isKpisLoading ? '...' : String(studentCount ?? 0),
        icon: Users,
        trend: isKpisLoading ? undefined : `${studentCount ?? 0} matriculados`,
        trendType: 'neutral' as const,
      },
      {
        id: 'professores',
        label: 'Total de Professores',
        value: isKpisLoading ? '...' : String(teacherCount ?? 0),
        icon: GraduationCap,
        trend: isKpisLoading ? undefined : `${teacherCount ?? 0} cadastrados`,
        trendType: 'neutral' as const,
      },
      {
        id: 'turmas',
        label: 'Total de Turmas',
        value: isKpisLoading ? '...' : String(classCount ?? 0),
        icon: BookOpen,
        trend: isKpisLoading ? undefined : `${classCount ?? 0} turmas ativas`,
        trendType: 'neutral' as const,
      },
    ],
    [isKpisLoading, studentCount, teacherCount, classCount],
  )

  return (
    <PageContainer>
      <DashboardPageHeader title="Dashboard" />

      <Section title="Indicadores Gerais" className="mb-8">
        {kpisError && <InlineError message={kpisError} className="mb-4" />}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpiCards.map((kpi) => (
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

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Section
            title="Turmas Recentes"
            action={
              <Link
                href="/secretaria/turmas"
                className="link-action flex items-center gap-1 text-xs"
              >
                Ver todas <ChevronRight size={14} />
              </Link>
            }
          >
            {isKpisLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-neutral-200 border-t-primary" />
              </div>
            ) : (
              <ListCard
                items={recentClasses}
                limit={DASHBOARD_LIST_LIMIT}
                emptyMessage="Nenhuma turma cadastrada."
                renderItem={(item) => (
                  <div className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-neutral-100">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-component bg-primary/10">
                        <BookOpen size={14} className="text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-text-primary">
                          {getClassLabel(item)}
                        </p>
                        <p className="truncate text-xs text-text-secondary">
                          {item.studentCount} aluno{item.studentCount !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${shiftBadge[item.shift] ?? 'bg-neutral-200 text-neutral-700'}`}
                    >
                      {SHIFT_LABELS[item.shift as Shift] ?? item.shift}
                    </span>
                  </div>
                )}
              />
            )}
          </Section>
        </div>

        <div className="lg:col-span-1">
          <UpcomingEventsCard role="SECRETARIA" limit={4} />
        </div>

        <div className="lg:col-span-1">
          <Section
            title="Comunicados"
            action={
              <Link
                href="/secretaria/comunicados"
                className="link-action flex items-center gap-1 text-xs"
              >
                Ver todos <ChevronRight size={14} />
              </Link>
            }
          >
            {isAnnouncementsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-neutral-200 border-t-primary" />
                  <p className="mt-2 text-xs text-neutral-500">Carregando...</p>
                </div>
              </div>
            ) : announcementsError ? (
              <InlineError message={announcementsError} />
            ) : (
              <ListCard
                items={announcements}
                limit={DASHBOARD_LIST_LIMIT}
                renderItem={(item) => (
                  <div className="flex flex-col gap-1.5 px-4 py-3 transition-colors hover:bg-neutral-100">
                    <p className="text-sm font-medium leading-snug text-text-primary">
                      {item.title}
                    </p>
                    <span className="flex items-center gap-1 text-xs text-text-secondary">
                      <Clock size={12} />
                      {new Date(item.created_at).toLocaleDateString('pt-BR')} ·
                      {item.users.teachers?.[0]?.full_name || item.users.email}
                    </span>
                  </div>
                )}
                emptyMessage="Nenhum comunicado recente"
              />
            )}
          </Section>
        </div>
      </div>
    </PageContainer>
  )
}
