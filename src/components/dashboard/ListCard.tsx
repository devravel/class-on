import { cn } from '@/lib/utils'

interface ListItem {
  id: string | number
}

export const DASHBOARD_LIST_LIMIT = 4

/** Approximate row height for dashboard list items (px). */
export const DASHBOARD_LIST_ROW_HEIGHT = 56

export const DASHBOARD_LIST_AREA_HEIGHT =
  DASHBOARD_LIST_LIMIT * DASHBOARD_LIST_ROW_HEIGHT

interface ListCardProps<T extends ListItem> {
  items: T[]
  renderItem: (item: T) => React.ReactNode
  emptyMessage?: string
  className?: string
  /** When set, shows at most this many rows statically; extra items scroll inside the card. */
  limit?: number
  /** Locks list body to `limit` row heights; scrolls when item count reaches `limit`. */
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
  const rowAreaHeight =
    limit != null ? limit * DASHBOARD_LIST_ROW_HEIGHT : undefined
  const hasInternalScroll = fixedRowArea
    ? limit != null && items.length >= limit
    : limit != null && items.length > limit

  return (
    <div
      className={cn(
        'overflow-hidden rounded-card bg-surface shadow-light ring-1 ring-border',
        className,
      )}
    >
      {items.length === 0 ? (
        <div
          className="flex items-center justify-center"
          style={
            fixedRowArea && rowAreaHeight != null
              ? { height: rowAreaHeight }
              : undefined
          }
        >
          <p
            className={cn(
              'text-sm text-text-secondary',
              !(fixedRowArea && rowAreaHeight != null) && 'py-10',
            )}
          >
            {emptyMessage}
          </p>
        </div>
      ) : (
        <ul
          className={cn(
            'divide-y divide-border',
            (hasInternalScroll || fixedRowArea) && 'overflow-y-auto',
          )}
          style={
            fixedRowArea && rowAreaHeight != null
              ? { height: rowAreaHeight }
              : hasInternalScroll && rowAreaHeight != null
                ? { maxHeight: rowAreaHeight }
                : undefined
          }
        >
          {items.map((item) => (
            <li key={item.id}>{renderItem(item)}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
