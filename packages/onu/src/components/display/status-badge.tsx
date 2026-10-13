"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"

export type StatusTone = "success" | "warning" | "danger" | "info" | "neutral" | "pending"

/**
 * Ant Design's bordered preset-colour tags: info blue (submitted), pending cyan
 * (in review), success green (approved), danger red (rejected), warning gold
 * (suspended), and the default grey tag for neutral.
 */
export const statusBadgeVariants = cva(
  "gap-1 font-normal inline-flex w-fit shrink-0 items-center rounded-sm border whitespace-nowrap [&>svg]:shrink-0",
  {
    variants: {
      tone: {
        success: "border-preset-green-border bg-preset-green text-preset-green-foreground",
        warning: "border-preset-gold-border bg-preset-gold text-preset-gold-foreground",
        danger: "border-preset-red-border bg-preset-red text-preset-red-foreground",
        info: "border-preset-blue-border bg-preset-blue text-preset-blue-foreground",
        neutral: "border-input bg-muted text-foreground",
        pending: "border-preset-cyan-border bg-preset-cyan text-preset-cyan-foreground",
      },
      size: {
        sm: "h-5 px-1.5 text-xs [&>svg]:size-3",
        md: "h-5.5 px-1.75 text-xs [&>svg]:size-3",
        lg: "h-7 px-2.5 text-sm [&>svg]:size-3.5",
      },
    },
    defaultVariants: { tone: "neutral", size: "md" },
  },
)

const TONE_ICONS: Record<StatusTone, string> = {
  success: "success",
  warning: "warning",
  danger: "error",
  info: "info",
  neutral: "dot",
  pending: "clock",
}

const TONE_LABELS: Record<StatusTone, string> = {
  success: "display.statusSuccess",
  warning: "display.statusWarning",
  danger: "display.statusDanger",
  info: "display.statusInfo",
  neutral: "display.statusNeutral",
  pending: "display.statusPending",
}

/** How a custom status (e.g. `"approved"`) is shown. */
export interface StatusDefinition {
  tone: StatusTone
  label?: React.ReactNode
  /** Semantic icon name or a node. */
  icon?: string | React.ReactNode
}

export type StatusMap = Record<string, StatusDefinition>

export interface StatusBadgeProps
  extends Omit<React.ComponentProps<"span">, "children">, Pick<VariantProps<typeof statusBadgeVariants>, "size"> {
  /** A tone (`success`, `warning`, …) or a key of `statusMap`. */
  status: StatusTone | (string & {})
  /** Maps your own statuses to a tone, label and icon. */
  statusMap?: StatusMap
  /** Override the label. Defaults to the map's label or the tone's translated name. */
  children?: React.ReactNode
  /** Override the icon: a semantic name, a node, or `false` to hide it. */
  icon?: string | React.ReactNode | false
  asChild?: boolean
}

const TONES = new Set<string>(Object.keys(TONE_ICONS))

/**
 * A status pill. Colour always comes with an icon and text, so status is never
 * conveyed by colour alone (R14.6).
 */
export function StatusBadge({
  status,
  statusMap,
  children,
  icon,
  size,
  className,
  asChild = false,
  ...props
}: StatusBadgeProps) {
  const { t } = useTranslation()
  const definition: StatusDefinition = statusMap?.[status] ?? {
    tone: TONES.has(status) ? (status as StatusTone) : "neutral",
  }
  const tone = definition.tone
  const label = children ?? definition.label ?? (TONES.has(status) ? t(TONE_LABELS[tone]) : status)
  const iconValue = icon === undefined ? (definition.icon ?? TONE_ICONS[tone]) : icon
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="status-badge"
      data-tone={tone}
      data-status={status}
      className={cn(statusBadgeVariants({ tone, size }), className)}
      {...props}
    >
      {iconValue === false || iconValue === null ? null : typeof iconValue === "string" ? (
        <Icon
          name={iconValue}
          className={tone === "neutral" ? "size-2! fill-current text-muted-foreground" : undefined}
        />
      ) : (
        iconValue
      )}
      {asChild ? <Slot.Slottable>{label}</Slot.Slottable> : label}
    </Comp>
  )
}
