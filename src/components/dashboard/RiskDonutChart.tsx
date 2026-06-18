'use client'

import { useMemo, useState } from 'react'
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { AlertTriangle, Copy, Loader2, ShieldCheck, ShieldAlert, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

import { MarkdownContent } from '@/components/ai/MarkdownContent'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { aiApi } from '@/lib/api/ai'
import {
  RISK_CATEGORY_LABELS,
  RiskAnalyticsResponse,
  RiskCategory,
  StudentRiskEntry,
} from '@/types/analytics'
import { cn } from '@/lib/utils'

const CATEGORY_COLORS: Record<RiskCategory, string> = {
  RISCO_CRITICO: '#ef4444',
  ALERTA: '#f59e0b',
  ESTAVEL: '#22c55e',
}

const CATEGORY_ICONS: Record<RiskCategory, typeof ShieldCheck> = {
  RISCO_CRITICO: AlertTriangle,
  ALERTA: ShieldAlert,
  ESTAVEL: ShieldCheck,
}

interface RiskDonutChartProps {
  data: RiskAnalyticsResponse
  className?: string
}

interface ChartSlice {
  category: RiskCategory
  name: string
  value: number
  color: string
}

export function RiskDonutChart({ data, className }: RiskDonutChartProps) {
  const [activeCategory, setActiveCategory] = useState<RiskCategory | null>(
    data.counts.risco_critico > 0 ? 'RISCO_CRITICO' : null,
  )
  const [reportStudent, setReportStudent] = useState<StudentRiskEntry | null>(null)
  const [parentReport, setParentReport] = useState<string | null>(null)
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  const [generatingStudentId, setGeneratingStudentId] = useState<string | null>(null)

  const chartData = useMemo<ChartSlice[]>(
    () => [
      {
        category: 'RISCO_CRITICO',
        name: RISK_CATEGORY_LABELS.RISCO_CRITICO,
        value: data.counts.risco_critico,
        color: CATEGORY_COLORS.RISCO_CRITICO,
      },
      {
        category: 'ALERTA',
        name: RISK_CATEGORY_LABELS.ALERTA,
        value: data.counts.alerta,
        color: CATEGORY_COLORS.ALERTA,
      },
      {
        category: 'ESTAVEL',
        name: RISK_CATEGORY_LABELS.ESTAVEL,
        value: data.counts.estavel,
        color: CATEGORY_COLORS.ESTAVEL,
      },
    ],
    [data.counts],
  )

  const activeStudents: StudentRiskEntry[] = activeCategory
    ? data.students[
        activeCategory === 'RISCO_CRITICO'
          ? 'risco_critico'
          : activeCategory === 'ALERTA'
            ? 'alerta'
            : 'estavel'
      ]
    : []

  const hasData = data.total > 0

  const handleGenerateParentReport = async (student: StudentRiskEntry) => {
    try {
      setGeneratingStudentId(student.id)
      setIsGeneratingReport(true)
      setParentReport(null)
      setReportStudent(student)

      const result = await aiApi.generateParentReport({
        student_name: student.full_name,
        grade_average: student.grade_average ?? undefined,
        attendance_rate: student.attendance_rate ?? undefined,
        risk_score: student.score,
      })

      setParentReport(result.content)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao gerar comunicado.'
      toast.error(message)
      setReportStudent(null)
    } finally {
      setIsGeneratingReport(false)
      setGeneratingStudentId(null)
    }
  }

  const handleCopyReport = async () => {
    if (!parentReport) return
    try {
      await navigator.clipboard.writeText(parentReport)
      toast.success('Texto copiado para a área de transferência!')
    } catch {
      toast.error('Não foi possível copiar o texto.')
    }
  }

  const handleCloseReportDialog = () => {
    setReportStudent(null)
    setParentReport(null)
    setIsGeneratingReport(false)
  }

  return (
    <div
      className={cn(
        'rounded-card bg-surface p-5 shadow-light ring-1 ring-border',
        className,
      )}
    >
      <div className="mb-4">
        <h3 className="text-base font-semibold text-text-primary">
          Índice de Risco de Evasão/Reprovação
        </h3>
        <p className="mt-0.5 text-sm text-text-secondary">
          {data.year
            ? `Análise preditiva — Ano Letivo ${data.year} · ${data.total} alunos monitorados`
            : 'Nenhum ano letivo ativo para análise'}
        </p>
      </div>

      {!hasData ? (
        <div className="flex h-48 items-center justify-center text-sm text-text-secondary">
          Cadastre alunos e registre notas/frequência para gerar o índice.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="relative h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  onClick={(_, index) => {
                    const slice = chartData[index]
                    if (slice && slice.value > 0) {
                      setActiveCategory(slice.category)
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  {chartData.map((entry) => (
                    <Cell
                      key={entry.category}
                      fill={entry.color}
                      opacity={
                        activeCategory === null ||
                        activeCategory === entry.category
                          ? 1
                          : 0.35
                      }
                      stroke="transparent"
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${value} aluno(s)`, name]}
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid var(--color-border)',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-text-primary">
                {data.total}
              </span>
              <span className="text-xs text-text-secondary">alunos</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {chartData.map((slice) => {
              const Icon = CATEGORY_ICONS[slice.category]
              const isActive = activeCategory === slice.category
              return (
                <button
                  key={slice.category}
                  type="button"
                  onClick={() =>
                    setActiveCategory(
                      slice.value > 0
                        ? isActive
                          ? null
                          : slice.category
                        : null,
                    )
                  }
                  disabled={slice.value === 0}
                  className={cn(
                    'flex items-center justify-between rounded-component px-3 py-2.5 text-left transition-colors',
                    isActive
                      ? 'bg-primary/10 ring-1 ring-primary/30'
                      : 'hover:bg-neutral-100',
                    slice.value === 0 && 'cursor-default opacity-50',
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: slice.color }}
                    />
                    <Icon
                      size={14}
                      style={{ color: slice.color }}
                    />
                    <span className="text-sm font-medium text-text-primary">
                      {slice.name}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-text-primary">
                    {slice.value}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {activeCategory && activeStudents.length > 0 && (
        <div className="mt-5 border-t border-border pt-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-secondary">
            Alunos em {RISK_CATEGORY_LABELS[activeCategory]}
          </p>
          <ul className="flex flex-col gap-2">
            {activeStudents.map((student) => (
              <li
                key={student.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-component bg-neutral-50 px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    {student.full_name}
                  </p>
                  <p className="text-xs text-text-secondary">
                    RM {student.rm}
                    {student.grade_average !== null &&
                      ` · Média ${student.grade_average.toFixed(1)}`}
                    {student.attendance_rate !== null &&
                      ` · Frequência ${student.attendance_rate.toFixed(0)}%`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {activeCategory === 'RISCO_CRITICO' && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={generatingStudentId === student.id}
                      onClick={() => handleGenerateParentReport(student)}
                      className="border-destructive/30 text-destructive hover:bg-destructive/5"
                    >
                      {generatingStudentId === student.id ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Sparkles size={12} />
                      )}
                      Gerar Notificação para os Pais via IA
                    </Button>
                  )}
                  <span
                    className="rounded-full px-2 py-0.5 text-xs font-semibold"
                    style={{
                      backgroundColor: `${CATEGORY_COLORS[activeCategory]}20`,
                      color: CATEGORY_COLORS[activeCategory],
                    }}
                  >
                    Score {student.score}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Dialog open={reportStudent !== null} onOpenChange={(open) => !open && handleCloseReportDialog()}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles size={18} className="text-primary" />
              Comunicado para Responsáveis
            </DialogTitle>
            <DialogDescription>
              {reportStudent
                ? `Carta gerada para os responsáveis de ${reportStudent.full_name} — pronta para cópia e envio.`
                : 'Gerando comunicado...'}
            </DialogDescription>
          </DialogHeader>

          {isGeneratingReport ? (
            <div className="flex items-center gap-3 py-12">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <p className="text-sm text-text-secondary">
                A IA está redigindo o comunicado acolhedor...
              </p>
            </div>
          ) : parentReport ? (
            <div className="rounded-lg border border-border bg-neutral-50 p-4">
              <MarkdownContent content={parentReport} />
            </div>
          ) : null}

          {parentReport && (
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseReportDialog}>
                Fechar
              </Button>
              <Button type="button" onClick={handleCopyReport}>
                <Copy size={16} />
                Copiar Texto
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
