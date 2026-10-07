"use client"

import * as React from "react"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { Button } from "../../ui/button"
import { AppLink } from "./_link"

type ButtonProps = React.ComponentProps<typeof Button>

export interface PrintButtonProps extends Omit<ButtonProps, "asChild"> {
  /** Runs before printing (e.g. expand collapsed sections). */
  onBeforePrint?: () => void
  /** Hide the label and show only the icon (the label stays as the accessible name). */
  iconOnly?: boolean
}

/** Opens the browser's print dialog. Hidden when printing. */
export function PrintButton({
  onBeforePrint,
  onClick,
  iconOnly = false,
  variant = "outline",
  size,
  className,
  children,
  ...props
}: PrintButtonProps) {
  const { t } = useTranslation()
  const label = children ?? t("display.print")
  return (
    <Button
      type="button"
      variant={variant}
      size={size ?? (iconOnly ? "icon" : "default")}
      data-slot="print-button"
      aria-label={iconOnly ? (typeof label === "string" ? label : t("display.print")) : undefined}
      className={cn("touch:min-h-11 print:hidden", iconOnly && "touch:min-w-11", className)}
      onClick={(e) => {
        onClick?.(e)
        if (e.defaultPrevented) return
        onBeforePrint?.()
        window.print()
      }}
      {...props}
    >
      <Icon name="print" data-icon="inline-start" />
      {iconOnly ? null : label}
    </Button>
  )
}

export interface BackButtonProps extends Omit<ButtonProps, "asChild"> {
  /** Go to this URL instead of the previous page. */
  href?: string
  /** Where to go when there is no previous page in this tab (opened from a link or bookmark). */
  fallbackHref?: string
  iconOnly?: boolean
}

/**
 * Goes back: to `href` when given (rendered as a link), otherwise one step
 * back in history, falling back to `fallbackHref` when there is no history.
 * The arrow mirrors in RTL. Hidden when printing.
 */
export function BackButton({
  href,
  fallbackHref,
  onClick,
  iconOnly = false,
  variant = "ghost",
  size,
  className,
  children,
  ...props
}: BackButtonProps) {
  const { t } = useTranslation()
  const label = children ?? t("common.back")
  const shared = {
    variant,
    size: size ?? (iconOnly ? "icon" : "default"),
    "data-slot": "back-button",
    "aria-label": iconOnly ? (typeof label === "string" ? label : t("common.back")) : undefined,
    className: cn("touch:min-h-11 print:hidden", iconOnly && "touch:min-w-11", className),
  } as const
  const content = (
    <>
      <Icon name="back" data-icon="inline-start" />
      {iconOnly ? null : label}
    </>
  )

  if (href) {
    return (
      <Button asChild {...shared}>
        <AppLink href={href}>{content}</AppLink>
      </Button>
    )
  }

  return (
    <Button
      type="button"
      {...shared}
      onClick={(e) => {
        onClick?.(e)
        if (e.defaultPrevented) return
        if (window.history.length <= 1 && fallbackHref) window.location.assign(fallbackHref)
        else window.history.back()
      }}
      {...props}
    >
      {content}
    </Button>
  )
}
