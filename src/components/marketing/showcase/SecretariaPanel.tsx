import { BookOpen, GraduationCap, Users } from 'lucide-react'

import { MiniDonut } from '../MiniDonut'

const KPIS = [
  {
    label: 'Alunos Matriculados',
    value: '428',
    icon: Users,
    tint: 'bg-tint-sky text-tint-sky-fg',
  },
  {
    label: 'Professores Ativos',
    value: '34',
    icon: GraduationCap,
    tint: 'bg-tint-mint text-tint-mint-fg',
  },
  {
    label: 'Turmas Abertas',
    value: '12',
    icon: BookOpen,
    tint: 'bg-tint-violet text-tint-violet-fg',
  },
]

const TURMAS = [
  { name: '3º Ano A', shift: 'Manhã', count: 38 },
  { name: '2º Ano B', shift: 'Tarde', count: 35 },
  { name: '1º Ano C', shift: 'Manhã', count: 41 },
]

const RISK_DATA = [
  { label: 'Estável', value: 291, color: 'var(--color-success)' },
  { label: 'Alerta', value: 94, color: 'var(--color-warning)' },
  { label: 'Risco Crítico', value: 43, color: 'var(--color-danger)' },
]

export function SecretariaPanel() {
  return (
    <div className="flex h-full flex-col gap-4 p-4 sm:p-6">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wide text-text-tertiary">
          Dashboard
        </p>
        <h3 className="text-lg font-semibold text-neutral-900">
          Visão Geral — Ano Letivo 2026
        </h3>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {KPIS.map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-xl bg-surface p-3 shadow-card"
          >
            <div className="mb-2 flex items-start justify-between gap-2">
              <p className="text-[10px] leading-tight text-text-secondary">
                {kpi.label}
              </p>
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${kpi.tint}`}
              >
                <kpi.icon size={14} />
              </div>
            </div>
            <p className="tabular text-lg font-bold text-text-primary">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-surface p-4 shadow-card">
          <p className="mb-3 text-xs font-semibold text-neutral-700">Turmas Ativas</p>
          <ul className="space-y-2">
            {TURMAS.map((turma) => (
              <li
                key={turma.name}
                className="flex items-center justify-between gap-2 rounded-lg bg-surface-muted px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-neutral-800">
                    {turma.name}
                  </p>
                  <p className="text-[10px] text-text-secondary">{turma.count} alunos</p>
                </div>
                <span className="shrink-0 rounded-full bg-brand-500/10 px-2 py-0.5 text-[10px] font-medium text-brand-700">
                  {turma.shift}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl bg-surface p-4 shadow-card">
          <p className="mb-3 text-xs font-semibold text-neutral-700">
            Índice de Risco Pedagógico
          </p>
          <div className="flex items-center gap-4">
            <MiniDonut
              segments={RISK_DATA}
              size={92}
              thickness={12}
              centerValue="428"
              centerLabel="alunos"
            />
            <ul className="flex-1 space-y-2">
              {RISK_DATA.map((risk) => (
                <li key={risk.label} className="flex items-center gap-2 text-[11px]">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: risk.color }}
                  />
                  <span className="truncate text-neutral-600">{risk.label}</span>
                  <span className="ml-auto shrink-0 font-semibold text-neutral-800">
                    {risk.value}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
