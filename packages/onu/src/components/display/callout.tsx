"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { Alert, AlertDescription, AlertTitle } from "../../ui/alert"
import { Button } from "../../ui/button"
import { registerEnglish } from "../../i18n/english"
import { display as en_display } from "../../locales/en/display"

registerEnglish({ display: en_display })

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

/** Classes for the inline appearances (`plain`, `subtle`, `bordered`). Notice's `neutral` tone is Callout's `default`. */
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

type CalloutVariant = NonNullable<VariantProps<typeof calloutVariants>["variant"]>
type InlineAppearance = NonNullable<VariantProps<typeof noticeVariants>["variant"]>

const ICONS: Record<CalloutVariant, string> = {
  default: "info",
  info: "info",
  success: "success",
  warning: "warning",
  destructive: "error",
}

export interface CalloutProps extends Omit<React.ComponentProps<"div">, "title">, VariantProps<typeof calloutVariants> {
  /**
   * `box` (default): an alert box with title, actions and dismiss. `plain`,
   * `subtle` and `bordered`: a quiet inline line of text with an icon
   * (`role="note"`, not announced); title, actions and dismiss are box-only.
   */
  appearance?: "box" | InlineAppearance
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
 * button. Extends shadcn's `Alert`. With `appearance` set to `plain`,
 * `subtle` or `bordered` it is a quiet inline hint instead (see `Notice`).
 *
 * Warning and destructive callouts use `role="alert"`; the others use
 * `role="status"` so they are announced politely, and the inline appearances
 * use `role="note"`. Pass `role` to override.
 */
export function Callout({
  variant,
  appearance = "box",
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
  const iconNode =
    iconValue === false || iconValue === null ? null : typeof iconValue === "string" ? (
      <Icon name={iconValue} className={classNames?.icon} />
    ) : (
      iconValue
    )
  const body = description ?? children

  if (appearance !== "box") {
    return (
      <div
        role={role ?? "note"}
        data-slot="callout"
        data-variant={v}
        data-appearance={appearance}
        className={cn(noticeVariants({ tone: v === "default" ? "neutral" : v, variant: appearance }), className)}
        {...props}
      >
        {iconNode}
        <div className={cn("min-w-0", classNames?.description)}>{body}</div>
      </div>
    )
  }

  return (
    <Alert
      data-slot="callout"
      data-variant={v}
      role={role ?? (v === "warning" || v === "destructive" ? "alert" : "status")}
      className={cn(calloutVariants({ variant }), dismissible && "pe-10", className)}
      {...props}
    >
      {iconNode}
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

export interface NoticeProps extends Omit<React.ComponentProps<"div">, "title">, VariantProps<typeof noticeVariants> {
  /** Semantic icon name, a node, or `false` for none. */
  icon?: string | React.ReactNode | false
}

/**
 * `Callout` with an inline `appearance` (`variant` here, default `plain`) and
 * `tone` for its colour: a subtle line of supporting text with an icon, for
 * hints such as "Changes apply from the next billing period". Uses `role="note"`.
 */
export function Notice({ tone, variant, ...props }: NoticeProps) {
  return (
    <Callout
      data-slot="notice"
      data-tone={tone ?? "neutral"}
      variant={!tone || tone === "neutral" ? "default" : tone}
      appearance={variant ?? "plain"}
      {...props}
    />
  )
}
