import { cn } from '@/lib/utils'

interface ListItem {
  id: string | number
}

export const DASHBOARD_LIST_LIMIT = 4

/**
 * Piso de altura por linha (px), só pra alinhar cards vizinhos na grade.
 * **Não** é a altura real de uma linha — ela varia com o conteúdo (61–66px
 * nos dashboards). Nunca usar isso pra recortar a lista: era o que cortava a
 * última linha ao meio.
 */
export const DASHBOARD_LIST_ROW_HEIGHT = 56

export const DASHBOARD_LIST_AREA_HEIGHT =
  DASHBOARD_LIST_LIMIT * DASHBOARD_LIST_ROW_HEIGHT

interface ListCardProps<T extends ListItem> {
  items: T[]
  renderItem: (item: T) => React.ReactNode
  emptyMessage?: string
  className?: string
  /** Mostra no máximo esta quantidade de itens. O resto fica pro "Ver todos". */
  limit?: number
  /** Garante altura mínima de `limit` linhas, pra alinhar cards lado a lado. */
  fixedRowArea?: boolean
}

export function ListCard<T extends ListItem>({
  items,
  renderItem,
  emptyMessage = 'Nenhum item encontrado.',
  className,
  limit,
  fixedRowArea = false,
}: ListCardProps<T>) {
  // Corta pela contagem, não por pixel. Antes a lista era travada em
  // `limit × 56px` e as linhas reais tinham 61–66px, então a última aparecia
  // partida no meio e o card ganhava um scroll que não deveria existir —
  // esses cards têm "Ver todos" justamente pra não precisar rolar por dentro.
  const visibleItems = limit != null ? items.slice(0, limit) : items

  const minHeight =
    fixedRowArea && limit != null
      ? limit * DASHBOARD_LIST_ROW_HEIGHT
      : undefined

  return (
    <div className={cn('surface-card overflow-hidden', className)}>
      {visibleItems.length === 0 ? (
        <div
          className="flex items-center justify-center"
          style={minHeight != null ? { minHeight } : undefined}
        >
          <p
            className={cn(
              'text-sm text-text-secondary',
              minHeight == null && 'py-10',
            )}
          >
            {emptyMessage}
          </p>
        </div>
      ) : (
        <ul
          className="divide-y divide-border"
          style={minHeight != null ? { minHeight } : undefined}
        >
          {visibleItems.map((item) => (
            <li key={item.id}>{renderItem(item)}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
