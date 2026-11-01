"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { Icon } from "../../icons/icon"
import { toneSurface, type Tone } from "../../lib/tone"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { Alert, AlertDescription, AlertTitle } from "../../ui/alert"
import { Button } from "../../ui/button"
import { registerEnglish } from "../../i18n/english"
import { display as en_display } from "../../locales/en/display"
import { useControllableState } from "../../hooks/use-controllable-state"

registerEnglish({ display: en_display })

export const calloutVariants = cva("", {
  variants: {
    tone: {
      neutral: cn(toneSurface.neutral, "*:[svg]:text-muted-foreground"),
      info: cn(toneSurface.info, "*:[svg]:text-info"),
      success: cn(toneSurface.success, "*:[svg]:text-success"),
      warning: cn(toneSurface.warning, "*:[svg]:text-warning"),
      danger: cn(toneSurface.danger, "*:data-[slot=alert-title]:text-destructive *:[svg]:text-destructive"),
    },
  },
  defaultVariants: { tone: "neutral" },
})

/** Classes for the inline appearances (`plain`, `subtle`, `bordered`). */
export const calloutInlineVariants = cva(
  "gap-2 text-sm [&>svg]:mt-0.5 [&>svg]:size-4 flex items-start text-pretty [&>svg]:shrink-0",
  {
    variants: {
      tone: {
        neutral: "text-muted-foreground",
        info: "text-muted-foreground [&>svg]:text-info",
        success: "text-muted-foreground [&>svg]:text-success",
        warning: "text-foreground [&>svg]:text-warning",
        danger: "text-destructive",
      },
      appearance: {
        plain: "",
        subtle: "px-3 py-2 rounded-md bg-muted/60",
        bordered: "px-3 py-2 rounded-md border-s-2 bg-muted/40",
      },
    },
    compoundVariants: [
      { appearance: "bordered", tone: "info", className: "border-info" },
      { appearance: "bordered", tone: "success", className: "border-success" },
      { appearance: "bordered", tone: "warning", className: "border-warning" },
      { appearance: "bordered", tone: "danger", className: "border-destructive" },
      { appearance: "bordered", tone: "neutral", className: "border-border" },
    ],
    defaultVariants: { tone: "neutral", appearance: "plain" },
  },
)

type InlineAppearance = NonNullable<VariantProps<typeof calloutInlineVariants>["appearance"]>

const ICONS: Record<Tone, string> = {
  neutral: "info",
  info: "info",
  success: "success",
  warning: "warning",
  danger: "error",
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
  /** Semantic icon name, a node, or `false` for none. Defaults to the tone's icon. */
  icon?: string | React.ReactNode | false
  /** Shows a dismiss (×) button. */
  dismissible?: boolean
  /** Controlled visibility. */
  open?: boolean
  /** Initial visibility when uncontrolled. Default `true`. */
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Called after the user dismisses it. */
  onDismiss?: () => void
  classNames?: { icon?: string; title?: string; description?: string; actions?: string; dismiss?: string }
}

/**
 * An alert box for messages that need attention: info, success, warning or
 * destructive, with a title, description, actions and an optional dismiss
 * button. Extends shadcn's `Alert`. With `appearance` set to `plain`,
 * `subtle` or `bordered` it is a quiet inline hint instead.
 *
 * Warning and destructive callouts use `role="alert"`; the others use
 * `role="status"` so they are announced politely, and the inline appearances
 * use `role="note"`. Pass `role` to override.
 */
export function Callout({
  tone,
  appearance = "box",
  title,
  description,
  children,
  actions,
  icon,
  dismissible = false,
  open: openProp,
  defaultOpen = true,
  onOpenChange,
  onDismiss,
  className,
  classNames,
  role,
  ...props
}: CalloutProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useControllableState(openProp, defaultOpen, onOpenChange)
  const v = tone ?? "neutral"
  if (!open) return null

  const dismiss = () => {
    setOpen(false)
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
        data-tone={v}
        data-appearance={appearance}
        className={cn(calloutInlineVariants({ tone: v, appearance }), className)}
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
      data-tone={v}
      role={role ?? (v === "warning" || v === "danger" ? "alert" : "status")}
      className={cn(calloutVariants({ tone }), dismissible && "pe-10", className)}
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
          data-part="callout-dismiss"
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
