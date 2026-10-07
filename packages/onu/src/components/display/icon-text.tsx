import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"

export const iconTextVariants = cva("inline-flex items-center [&>svg]:shrink-0", {
  variants: {
    size: {
      sm: "gap-1 text-xs [&>svg]:size-3.5",
      md: "gap-1.5 text-sm [&>svg]:size-4",
      lg: "gap-2 text-base [&>svg]:size-5",
    },
    tone: {
      default: "",
      muted: "text-muted-foreground",
      primary: "text-primary",
      success: "text-success",
      warning: "[&>svg]:text-warning",
      destructive: "text-destructive",
      info: "text-info",
    },
  },
  defaultVariants: { size: "md", tone: "default" },
})

export interface IconTextProps extends React.ComponentProps<"span">, VariantProps<typeof iconTextVariants> {
  /** Semantic icon name or an icon node. */
  icon: string | React.ReactNode
  /** Put the icon after the text. */
  iconPosition?: "start" | "end"
  /** Accessible label for the icon when it adds meaning the text doesn't. */
  iconLabel?: string
  asChild?: boolean
  classNames?: { icon?: string; text?: string }
}

/**
 * An icon next to a short piece of text ("📍 Malé", "🕑 2 hours"), aligned and
 * sized together. The icon is decorative unless `iconLabel` is given.
 */
export function IconText({
  icon,
  iconPosition = "start",
  iconLabel,
  size,
  tone,
  asChild = false,
  className,
  classNames,
  children,
  ...props
}: IconTextProps) {
  const Comp = asChild ? Slot.Root : "span"
  const iconNode = typeof icon === "string" ? <Icon name={icon} label={iconLabel} className={classNames?.icon} /> : icon
  const text = <span className={cn("min-w-0", classNames?.text)}>{children}</span>
  return (
    <Comp data-slot="icon-text" className={cn(iconTextVariants({ size, tone }), className)} {...props}>
      {iconPosition === "start" ? iconNode : null}
      {asChild ? <Slot.Slottable>{children}</Slot.Slottable> : text}
      {iconPosition === "end" ? iconNode : null}
    </Comp>
  )
}
