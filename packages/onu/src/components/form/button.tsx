"use client"

import * as React from "react"
import type { VariantProps } from "class-variance-authority"
import { Loader2Icon } from "lucide-react"
import { Slot } from "radix-ui"

import { Icon } from "../../icons/icon"
import type { SemanticIconName } from "../../icons/types"
import { cn } from "../../lib/utils"
import { buttonVariants as baseButtonVariants } from "../../ui/button"

type BaseVariantProps = VariantProps<typeof baseButtonVariants>

export type ButtonVariant = NonNullable<BaseVariantProps["variant"]> | "success" | "warning"
export type ButtonSize = NonNullable<BaseVariantProps["size"]>

export interface ButtonVariantProps {
  variant?: ButtonVariant | null
  size?: ButtonSize | null
  className?: string
}

const extraVariants: Record<"success" | "warning", string> = {
  success:
    "bg-success text-success-foreground hover:bg-success/85 focus-visible:ring-success/40 aria-expanded:bg-success/85",
  warning:
    "bg-warning text-warning-foreground hover:bg-warning/85 focus-visible:ring-warning/40 aria-expanded:bg-warning/85",
}

/**
 * Class names for Onu buttons: shadcn's `buttonVariants` plus `success` and
 * `warning` variants (R15.3). Use it to style links or other elements as buttons.
 */
export function buttonVariants({ variant, size, className }: ButtonVariantProps = {}) {
  if (variant === "success" || variant === "warning") {
    return cn(baseButtonVariants({ variant: "default", size }), extraVariants[variant], className)
  }
  return baseButtonVariants({ variant, size, className })
}

/** An icon prop: a semantic icon name (follows the configured icon set) or any node. */
export type IconProp = SemanticIconName | (string & {}) | React.ReactElement

/** Renders an `IconProp` as a button icon. */
export function renderIcon(icon: IconProp | undefined | null, position: "inline-start" | "inline-end") {
  if (icon === undefined || icon === null) return null
  if (typeof icon === "string") return <Icon name={icon} data-icon={position} />
  return icon
}

export interface ButtonProps extends Omit<React.ComponentProps<"button">, "children"> {
  variant?: ButtonVariant
  size?: ButtonSize
  /** Render the child element (e.g. a link) with button styles. */
  asChild?: boolean
  /** Show a spinner, set `aria-busy` and ignore clicks. */
  loading?: boolean
  /** Text shown while loading. Defaults to the normal label. */
  loadingText?: React.ReactNode
  /** Icon before the label: a semantic icon name or a node. Mirrors in RTL when directional. */
  startIcon?: IconProp
  /** Icon after the label. */
  endIcon?: IconProp
  children?: React.ReactNode
}

/**
 * Onu's button: shadcn's `Button` with `loading`, `startIcon` / `endIcon` and
 * extra `success` / `warning` variants.
 */
export function Button({
  variant = "default",
  size = "default",
  asChild = false,
  loading = false,
  loadingText,
  startIcon,
  endIcon,
  className,
  children,
  disabled,
  onClick,
  type,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button"
  const start = loading ? (
    <Icon
      name="loading"
      fallback={Loader2Icon}
      data-icon="inline-start"
      data-slot="button-spinner"
      className="animate-spin"
    />
  ) : (
    renderIcon(startIcon, "inline-start")
  )
  const end = renderIcon(endIcon, "inline-end")
  const label = loading && loadingText !== undefined ? loadingText : children

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      data-loading={loading || undefined}
      type={asChild ? type : (type ?? "button")}
      // Loading keeps focus on the button (aria-disabled) instead of dropping it like `disabled` does.
      disabled={disabled}
      aria-disabled={loading || undefined}
      aria-busy={loading || undefined}
      className={cn(buttonVariants({ variant, size }), loading && "cursor-progress", className)}
      onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
        if (loading) {
          event.preventDefault()
          return
        }
        onClick?.(event)
      }}
      {...props}
    >
      {start}
      {asChild ? <Slot.Slottable>{label}</Slot.Slottable> : label}
      {end}
    </Comp>
  )
}
