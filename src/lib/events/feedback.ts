import { toast } from 'sonner'
import { ApiError } from '@/lib/api-client'

/** Parse YYYY-MM-DD ou ISO para Date local ao meio-dia (evita deslocar o dia civil em pt-BR). */
export function parseLocalDateFromApi(value: string): Date {
  const ymd = value.slice(0, 10)
  const [y, m, d] = ymd.split('-').map(Number)
  if (!y || !m || !d) {
    return new Date(value)
  }
  return new Date(y, m - 1, d, 12, 0, 0, 0)
}

function isAllDayDateString(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value.trim())
}

/** Fim exclusivo (FullCalendar) → último dia inclusivo */
function inclusiveEndFromExclusiveYmd(exclusiveYmd: string): Date {
  const end = parseLocalDateFromApi(exclusiveYmd)
  end.setDate(end.getDate() - 1)
  end.setHours(12, 0, 0, 0)
  return end
}

export function formatEventRangeLabel(
  start: string,
  end: string,
  allDay: boolean,
): { dateLine: string; isMultiDay: boolean } {
  if (!allDay) {
    const s = new Date(start)
    const e = new Date(end)
    const sameCalendarDay =
      s.getFullYear() === e.getFullYear() &&
      s.getMonth() === e.getMonth() &&
      s.getDate() === e.getDate()
    const dateFmt: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }
    const dateLine = sameCalendarDay
      ? s.toLocaleDateString('pt-BR', dateFmt)
      : `${s.toLocaleDateString('pt-BR', dateFmt)} – ${e.toLocaleDateString('pt-BR', dateFmt)}`
    return { dateLine, isMultiDay: !sameCalendarDay }
  }

  const startDay = parseLocalDateFromApi(start)
  const endExclusive = isAllDayDateString(end) ? end.trim() : end.slice(0, 10)
  const endInclusive = inclusiveEndFromExclusiveYmd(endExclusive)
  const sameDay =
    startDay.getFullYear() === endInclusive.getFullYear() &&
    startDay.getMonth() === endInclusive.getMonth() &&
    startDay.getDate() === endInclusive.getDate()
  const dateFmt: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }
  const dateLine = sameDay
    ? startDay.toLocaleDateString('pt-BR', dateFmt)
    : `${startDay.toLocaleDateString('pt-BR', dateFmt)} – ${endInclusive.toLocaleDateString(
        'pt-BR',
        dateFmt,
      )}`
  return { dateLine, isMultiDay: !sameDay }
}

const LEGACY_ACTIVE_YEAR = 'Nenhum ano letivo ativo encontrado.'

export function mapEventApiError(err: unknown): { title: string; description: string } {
  if (err instanceof ApiError) {
    const m = err.message

    if (
      m.includes('Não encontramos um ano letivo ativo') ||
      m === LEGACY_ACTIVE_YEAR ||
      m.toLowerCase().includes('ano letivo')
    ) {
      return {
        title: 'Ano letivo necessário',
        description:
          'Não encontramos um ano letivo ativo. Em Secretaria, abra Anos letivos e marque um ano como ativo para continuar.',
      }
    }

    if (err.status === 403) {
      return {
        title: 'Sem permissão para esta ação',
        description:
          m ||
          'Sua função no ClassOn não permite esta operação. Se precisar de acesso, fale com a secretaria.',
      }
    }

    if (err.status === 404) {
      return {
        title: 'Evento não encontrado',
        description: 'Esse evento pode ter sido removido ou você não tem acesso a ele.',
      }
    }

    if (err.status === 400) {
      return {
        title: 'Não foi possível concluir',
        description: m || 'Confira os dados do evento e tente novamente.',
      }
    }

    if (err.status === 401) {
      return {
        title: 'Sessão expirada',
        description: 'Faça login novamente para continuar.',
      }
    }

    return {
      title: 'Algo deu errado',
      description: m || 'Tente novamente em instantes. Se persistir, avise a secretaria.',
    }
  }

  if (err instanceof Error) {
    return {
      title: 'Não foi possível concluir',
      description: err.message,
    }
  }

  return {
    title: 'Algo deu errado',
    description: 'Tente novamente em instantes. Se persistir, avise a secretaria.',
  }
}

export function toastEventCreateError(err: unknown) {
  const { title, description } = mapEventApiError(err)
  toast.error(title, { description })
}

export function toastEventCreated() {
  toast.success('Evento criado', {
    description: 'Ele já aparece no calendário para quem tem permissão para vê-lo.',
  })
}

export function toastEventUpdated() {
  toast.success('Alterações salvas', {
    description: 'O evento foi atualizado no calendário.',
  })
}

export function toastEventRemoved() {
  toast.success('Evento removido', {
    description: 'O evento foi retirado do calendário.',
  })
}

export function toastCalendarLoadError(err: unknown) {
  const { title, description } = mapEventApiError(err)
  toast.error(title, { description })
}

export function toastCalendarRetryInfo() {
  toast.message('Tentando de novo', {
    description: 'Recarregando os eventos do calendário.',
  })
}
