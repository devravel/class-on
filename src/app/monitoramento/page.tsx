'use client'

import { Loader2, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader'
import { InlineError } from '@/components/dashboard/InlineError'
import { RiskDonutChart } from '@/components/dashboard/RiskDonutChart'
import { Section } from '@/components/dashboard/Section'
import { PageContainer } from '@/components/layout/PageContainer'
import { Input } from '@/components/ui/input'
import { analyticsApi, studentsApi } from '@/lib/api'
import { getClassLabel } from '@/lib/class-utils'
import { cn } from '@/lib/utils'
import {
  RISK_CATEGORY_LABELS,
  RiskAnalyticsResponse,
  RiskCategory,
  StudentRiskEntry,
} from '@/types/analytics'
import { Student } from '@/types/student'

const RISK_BADGE: Record<RiskCategory, string> = {
  ESTAVEL: 'bg-success/10 text-success',
  ALERTA: 'bg-warning/10 text-warning',
  RISCO_CRITICO: 'bg-danger/10 text-danger',
}

interface StudentMonitorRow {
  id: string
  full_name: string
  classLabel: string
  category: RiskCategory
}

function buildRiskMap(data: RiskAnalyticsResponse): Map<string, StudentRiskEntry> {
  const map = new Map<string, StudentRiskEntry>()
  for (const student of data.students.risco_critico) {
    map.set(student.id, student)
  }
  for (const student of data.students.alerta) {
    map.set(student.id, student)
  }
  for (const student of data.students.estavel) {
    map.set(student.id, student)
  }
  return map
}

export default function MonitoramentoPage() {
  const [riskAnalytics, setRiskAnalytics] = useState<RiskAnalyticsResponse | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [riskError, setRiskError] = useState<string | null>(null)
  const [studentsError, setStudentsError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      try {
        setIsLoading(true)
        setRiskError(null)
        setStudentsError(null)

        const [riskData, studentsData] = await Promise.all([
          analyticsApi.getRiskAnalytics(),
          studentsApi.list(),
        ])

        if (!isMounted) return

        setRiskAnalytics(riskData)
        setStudents(Array.isArray(studentsData) ? studentsData : [])
      } catch (error) {
        console.error('Erro ao carregar monitoramento:', error)
        if (isMounted) {
          setRiskError('Não foi possível carregar o índice de risco.')
          setStudentsError('Não foi possível carregar a lista de alunos.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void load()
    return () => {
      isMounted = false
    }
  }, [])

  const studentRows = useMemo<StudentMonitorRow[]>(() => {
    if (!riskAnalytics) return []

    const riskMap = buildRiskMap(riskAnalytics)

    return students
      .map((student) => {
        const enrollment = student.enrollments?.[0]
        const classLabel = enrollment?.classes
          ? getClassLabel(enrollment.classes)
          : 'Sem turma'

        const risk = riskMap.get(student.id)
        const category: RiskCategory = risk?.category ?? 'ESTAVEL'

        return {
          id: student.id,
          full_name: student.full_name,
          classLabel,
          category,
        }
      })
      .sort((a, b) => a.full_name.localeCompare(b.full_name, 'pt-BR'))
  }, [students, riskAnalytics])

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return studentRows
    return studentRows.filter(
      (row) =>
        row.full_name.toLowerCase().includes(q) ||
        row.classLabel.toLowerCase().includes(q) ||
        RISK_CATEGORY_LABELS[row.category].toLowerCase().includes(q),
    )
  }, [studentRows, search])

  return (
    <PageContainer>
      <DashboardPageHeader title="Monitoramento Preditivo" />

      <div className="mb-8">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center rounded-card bg-surface shadow-light ring-1 ring-border">
            <div className="text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
              <p className="mt-2 text-sm text-text-secondary">Calculando índice de risco...</p>
            </div>
          </div>
        ) : riskError ? (
          <InlineError message={riskError} />
        ) : riskAnalytics ? (
          <RiskDonutChart data={riskAnalytics} />
        ) : null}
      </div>

      <Section
        title="Alunos da Escola"
        description="Lista completa em ordem alfabética com status preditivo"
      >
        <div className="mb-4">
          <div className="relative max-w-md">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
            />
            <Input
              type="search"
              placeholder="Buscar aluno, turma ou status..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-full pl-9"
            />
          </div>
        </div>

        {studentsError ? (
          <InlineError message={studentsError} />
        ) : isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="overflow-hidden rounded-card bg-surface shadow-light ring-1 ring-border">
            <ul className="max-h-[420px] divide-y divide-border overflow-y-auto">
              {filteredRows.length === 0 ? (
                <li className="px-4 py-10 text-center text-sm text-text-secondary">
                  Nenhum aluno encontrado.
                </li>
              ) : (
                filteredRows.map((row) => (
                  <li
                    key={row.id}
                    className="flex items-center justify-between gap-4 px-4 py-3.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-text-primary">
                        {row.full_name}
                      </p>
                      <p className="truncate text-xs text-text-secondary">{row.classLabel}</p>
                    </div>
                    <span
                      className={cn(
                        'shrink-0 rounded-full px-2.5 py-1 text-xs font-medium',
                        RISK_BADGE[row.category],
                      )}
                    >
                      {RISK_CATEGORY_LABELS[row.category]}
                    </span>
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
      </Section>
    </PageContainer>
  )
}
