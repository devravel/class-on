import { BadRequestException } from '@nestjs/common'

/**
 * Extrai o dia civil (YYYY-MM-DD) a partir de uma data ISO ou só data.
 * Usa componentes locais quando há horário, para refletir o que o usuário escolheu.
 */
export function extractCalendarYmd(input: string): string {
  const s = input.trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    return s
  }
  const d = new Date(s)
  if (Number.isNaN(d.getTime())) {
    throw new BadRequestException('Informe datas válidas para o evento.')
  }
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Compara duas strings YYYY-MM-DD (-1 / 0 / 1) */
export function compareYmd(a: string, b: string): number {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

/**
 * Armazena evento de dia inteiro em UTC: início 00:00 do primeiro dia,
 * fim 23:59:59.999 do último dia (inclusivo), evitando ambiguidade de fuso no calendário.
 */
export function inclusiveAllDayRangeToUtcBounds(
  startYmd: string,
  endYmdInclusive: string,
): { start: Date; end: Date } {
  const [ys, ms, ds] = startYmd.split('-').map(Number)
  const [ye, me, de] = endYmdInclusive.split('-').map(Number)
  const start = new Date(Date.UTC(ys, ms - 1, ds, 0, 0, 0, 0))
  const end = new Date(Date.UTC(ye, me - 1, de, 23, 59, 59, 999))
  return { start, end }
}

export function utcYmd(d: Date): string {
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Próximo dia civil após ymd (UTC), como string YYYY-MM-DD */
export function addUtcDaysToYmd(ymd: string, days: number): string {
  const [y, m, d] = ymd.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0))
  dt.setUTCDate(dt.getUTCDate() + days)
  return utcYmd(dt)
}
