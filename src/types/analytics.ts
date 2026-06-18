export type RiskCategory = 'RISCO_CRITICO' | 'ALERTA' | 'ESTAVEL'

export interface StudentRiskEntry {
  id: string
  full_name: string
  rm: string
  score: number
  grade_average: number | null
  attendance_rate: number | null
  category: RiskCategory
}

export interface RiskAnalyticsResponse {
  year: number | null
  counts: {
    risco_critico: number
    alerta: number
    estavel: number
  }
  students: {
    risco_critico: StudentRiskEntry[]
    alerta: StudentRiskEntry[]
    estavel: StudentRiskEntry[]
  }
  total: number
}

export const RISK_CATEGORY_LABELS: Record<RiskCategory, string> = {
  RISCO_CRITICO: 'Risco Crítico',
  ALERTA: 'Alerta',
  ESTAVEL: 'Estável',
}
