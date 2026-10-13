// Vendored from shadcn/ui (radix base, nova style, RTL) by scripts/sync-shadcn.mjs.
// Onu changes are marked with "onu:" comments; keep them when re-syncing.
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../lib/utils"
import { Slot } from "radix-ui"

// onu: Ant Design buttons in the brand colour: 14px regular text, 32px tall, 15px
// padding, 6px corners, colour transitions and no press movement. `default` is
// Ant's primary (solid), `outline` Ant's default (white, bordered, brand border
// and text on hover), `dashed`, `ghost` Ant's text button, `link`, and a solid
// `destructive` (Ant's primary danger).
const buttonVariants = cva(
  "focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 rounded-lg border border-transparent bg-clip-padding text-sm font-normal focus-visible:ring-3 aria-invalid:ring-3 [&_svg:not([class*='size-'])]:size-4 group/button inline-flex shrink-0 items-center justify-center whitespace-nowrap transition-[color,background-color,border-color,box-shadow] duration-200 outline-none select-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active aria-expanded:bg-primary-hover",
        outline: "border-input bg-card text-foreground hover:border-primary-5 hover:text-primary-7 active:border-primary-7 active:text-primary-7 aria-expanded:border-primary-5 aria-expanded:text-primary-7",
        dashed: "border-input border-dashed bg-card text-foreground hover:border-primary-5 hover:text-primary-7 active:border-primary-7 active:text-primary-7 aria-expanded:border-primary-5 aria-expanded:text-primary-7",
        secondary: "bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklab,var(--secondary),var(--foreground)_6%)] aria-expanded:bg-[color-mix(in_oklab,var(--secondary),var(--foreground)_6%)]",
        ghost: "hover:bg-secondary hover:text-foreground active:bg-[color-mix(in_oklab,var(--secondary),var(--foreground)_6%)] aria-expanded:bg-secondary aria-expanded:text-foreground",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-[color-mix(in_oklab,var(--destructive),black_12%)] focus-visible:ring-destructive/30 focus-visible:border-destructive aria-expanded:bg-destructive/90",
        link: "text-primary-7 underline-offset-4 hover:text-primary hover:underline",
      },
      size: {
        default: "h-8 gap-2 px-3.75",
        xs: "h-6 gap-1 rounded-sm px-2 text-xs in-data-[slot=button-group]:rounded-sm [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1.5 rounded-md px-2.75 in-data-[slot=button-group]:rounded-md [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 gap-2 px-3.75",
        icon: "size-8",
        "icon-xs": "size-6 rounded-sm in-data-[slot=button-group]:rounded-sm [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-7 rounded-md in-data-[slot=button-group]:rounded-md",
        "icon-lg": "size-9",
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
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
