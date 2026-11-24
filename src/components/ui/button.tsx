import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-component border border-transparent bg-clip-padding text-sm font-semibold whitespace-nowrap transition-all outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/40 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        // Sólido de marca com sombra tingida — o botão de ação da referência
        default:
          "bg-primary text-primary-foreground shadow-brand hover:bg-primary-hover hover:shadow-card-hover",
        // "Secundário" da referência: branco com sombra, sem borda
        outline:
          "bg-surface text-text-primary shadow-sm hover:shadow-card hover:text-primary aria-expanded:shadow-card aria-expanded:text-primary",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-neutral-300 aria-expanded:bg-neutral-300",
        ghost:
          "text-text-secondary hover:bg-neutral-200 hover:text-text-primary aria-expanded:bg-neutral-200 aria-expanded:text-text-primary",
        // Mantém o texto na cor de perigo e só aprofunda o fundo. Inverter pra
        // fundo sólido + texto branco quebrava no escuro, onde --color-danger
        // é rosa claro e branco em cima dele não tem contraste.
        destructive:
          "bg-danger-soft text-danger hover:bg-danger-soft-hover focus-visible:ring-destructive/25",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-9 gap-2 px-3.5 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        xs: "h-7 gap-1 rounded-sm px-2 text-xs has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 rounded-md px-3 text-[0.8rem] has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-11 gap-2 px-5 text-md has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        icon: "size-9",
        "icon-xs": "size-7 rounded-sm [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8 rounded-md",
        "icon-lg": "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
