"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { Alert, AlertDescription, AlertTitle } from "../../ui/alert"
import { Button } from "../../ui/button"

export const calloutVariants = cva("", {
  variants: {
    variant: {
      default: "bg-card text-card-foreground *:[svg]:text-muted-foreground",
      info: "border-info/30 bg-info/5 text-foreground *:[svg]:text-info",
      success: "border-success/30 bg-success/5 text-foreground *:[svg]:text-success",
      warning: "border-warning/40 bg-warning/10 text-foreground *:[svg]:text-warning",
      destructive:
        "border-destructive/30 bg-destructive/5 text-foreground *:data-[slot=alert-title]:text-destructive *:[svg]:text-destructive",
    },
  },
  defaultVariants: { variant: "default" },
})

type CalloutVariant = NonNullable<VariantProps<typeof calloutVariants>["variant"]>

const ICONS: Record<CalloutVariant, string> = {
  default: "info",
  info: "info",
  success: "success",
  warning: "warning",
  destructive: "error",
}

export interface CalloutProps extends Omit<React.ComponentProps<"div">, "title">, VariantProps<typeof calloutVariants> {
  title?: React.ReactNode
  /** Description (also accepted as `children`). */
  description?: React.ReactNode
  /** Buttons or links shown under the description. */
  actions?: React.ReactNode
  /** Semantic icon name, a node, or `false` for none. Defaults to the variant's icon. */
  icon?: string | React.ReactNode | false
  /** Shows a dismiss (×) button. */
  dismissible?: boolean
  /** Controlled visibility. */
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** Called after the user dismisses it. */
  onDismiss?: () => void
  classNames?: { icon?: string; title?: string; description?: string; actions?: string; dismiss?: string }
}

/**
 * An alert box for messages that need attention: info, success, warning or
 * destructive, with a title, description, actions and an optional dismiss
 * button. Extends shadcn's `Alert`.
 *
 * Warning and destructive callouts use `role="alert"`; the others use
 * `role="status"` so they are announced politely. Pass `role` to override.
 */
export function Callout({
  variant,
  title,
  description,
  children,
  actions,
  icon,
  dismissible = false,
  open: openProp,
  onOpenChange,
  onDismiss,
  className,
  classNames,
  role,
  ...props
}: CalloutProps) {
  const { t } = useTranslation()
  const [openState, setOpenState] = React.useState(true)
  const open = openProp ?? openState
  const v = variant ?? "default"
  if (!open) return null

  const dismiss = () => {
    setOpenState(false)
    onOpenChange?.(false)
    onDismiss?.()
  }

  const iconValue = icon === undefined ? ICONS[v] : icon
  const body = description ?? children

  return (
    <Alert
      data-slot="callout"
      data-variant={v}
      role={role ?? (v === "warning" || v === "destructive" ? "alert" : "status")}
      className={cn(calloutVariants({ variant }), dismissible && "pe-10", className)}
      {...props}
    >
      {iconValue === false || iconValue === null ? null : typeof iconValue === "string" ? (
        <Icon name={iconValue} className={classNames?.icon} />
      ) : (
        iconValue
      )}
      {title ? <AlertTitle className={classNames?.title}>{title}</AlertTitle> : null}
      {body ? <AlertDescription className={cn("text-pretty", classNames?.description)}>{body}</AlertDescription> : null}
      {actions ? (
        <div
          data-slot="callout-actions"
          className={cn(
            "mt-2 gap-2 flex flex-wrap items-center group-has-[>svg]/alert:col-start-2",
            classNames?.actions,
          )}
        >
          {actions}
        </div>
      ) : null}
      {dismissible ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          data-slot="callout-dismiss"
          onClick={dismiss}
          aria-label={t("display.dismiss")}
          className={cn("top-2 end-2 touch:size-11 touch:top-0 touch:end-0 absolute", classNames?.dismiss)}
        >
          <Icon name="close" />
        </Button>
      ) : null}
    </Alert>
  )
}
