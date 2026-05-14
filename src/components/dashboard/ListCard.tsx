import { cn } from '@/lib/utils'

interface ListItem {
  id: string | number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

interface ListCardProps<T extends ListItem> {
  items: T[]
  renderItem: (item: T) => React.ReactNode
  emptyMessage?: string
  className?: string
}

export function ListCard<T extends ListItem>({
  items,
  renderItem,
  emptyMessage = 'Nenhum item encontrado.',
  className,
}: ListCardProps<T>) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-card bg-surface shadow-light ring-1 ring-border',
        className,
      )}
    >
      {items.length === 0 ? (
        <div className="flex items-center justify-center py-10">
          <p className="text-sm text-text-secondary">{emptyMessage}</p>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {items.map((item) => (
            <li key={item.id}>{renderItem(item)}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
