'use client'

import * as React from 'react'
import { Check } from 'lucide-react'

import { cn } from '@/lib/utils'

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onCheckedChange?: (checked: boolean) => void
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, onChange, ...props }, ref) => {
    return (
      <label className="relative inline-flex cursor-pointer items-center">
        <input
          type="checkbox"
          ref={ref}
          checked={checked}
          className="peer sr-only"
          onChange={(event) => {
            onChange?.(event)
            onCheckedChange?.(event.target.checked)
          }}
          {...props}
        />
        <span
          className={cn(
            'flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border border-neutral-400 bg-surface transition-[background-color,border-color,box-shadow]',
            'peer-hover:border-brand-400',
            'peer-focus-visible:outline-none peer-focus-visible:ring-3 peer-focus-visible:ring-ring/25',
            'peer-disabled:cursor-not-allowed peer-disabled:bg-neutral-200 peer-disabled:opacity-60',
            'peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground peer-checked:shadow-brand',
            className,
          )}
        >
          {checked ? <Check className="h-3 w-3" /> : null}
        </span>
      </label>
    )
  },
)
Checkbox.displayName = 'Checkbox'

export { Checkbox }
