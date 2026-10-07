"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"

export const noticeVariants = cva(
  "gap-2 text-sm [&>svg]:mt-0.5 [&>svg]:size-4 flex items-start text-pretty [&>svg]:shrink-0",
  {
    variants: {
      tone: {
        neutral: "text-muted-foreground",
        info: "text-muted-foreground [&>svg]:text-info",
        success: "text-muted-foreground [&>svg]:text-success",
        warning: "text-foreground [&>svg]:text-warning",
        destructive: "text-destructive",
      },
      variant: {
        plain: "",
        subtle: "px-3 py-2 rounded-md bg-muted/60",
        bordered: "px-3 py-2 rounded-md border-s-2 bg-muted/40",
      },
    },
    compoundVariants: [
      { variant: "bordered", tone: "info", className: "border-info" },
      { variant: "bordered", tone: "success", className: "border-success" },
      { variant: "bordered", tone: "warning", className: "border-warning" },
      { variant: "bordered", tone: "destructive", className: "border-destructive" },
      { variant: "bordered", tone: "neutral", className: "border-border" },
    ],
    defaultVariants: { tone: "neutral", variant: "plain" },
  },
)

type Tone = NonNullable<VariantProps<typeof noticeVariants>["tone"]>

const ICONS: Record<Tone, string> = {
  neutral: "info",
  info: "info",
  success: "success",
  warning: "warning",
  destructive: "error",
}

export interface NoticeProps extends React.ComponentProps<"div">, VariantProps<typeof noticeVariants> {
  /** Semantic icon name, a node, or `false` for none. */
  icon?: string | React.ReactNode | false
}

/**
 * A subtle inline notice: a short line of supporting text with an icon, for
 * hints such as "Changes apply from the next billing period". Quieter than a
 * `Callout`; uses `role="note"`.
 */
export function Notice({ tone, variant, icon, className, children, ...props }: NoticeProps) {
  const iconValue = icon === undefined ? ICONS[tone ?? "neutral"] : icon
  return (
    <div
      role="note"
      data-slot="notice"
      data-tone={tone ?? "neutral"}
      className={cn(noticeVariants({ tone, variant }), className)}
      {...props}
    >
      {iconValue === false || iconValue === null ? null : typeof iconValue === "string" ? (
        <Icon name={iconValue} />
      ) : (
        iconValue
      )}
      <div className="min-w-0">{children}</div>
    </div>
  )
}
