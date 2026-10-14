"use client"

import * as React from "react"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { Button } from "../../ui/button"
import { AppLink } from "./_link"
import { registerEnglish } from "../../i18n/english"
import { display as en_display } from "../../locales/en/display"

registerEnglish({ display: en_display })

export type ErrorPageCode = 403 | 404 | 500 | 503

const DEFAULTS: Record<ErrorPageCode, { icon: string; title: string; message: string }> = {
  403: { icon: "lock", title: "display.error403Title", message: "display.error403Message" },
  404: { icon: "search", title: "display.error404Title", message: "display.error404Message" },
  500: { icon: "error", title: "display.error500Title", message: "display.error500Message" },
  503: { icon: "wrench", title: "display.error503Title", message: "display.error503Message" },
}

export interface ErrorPageProps extends Omit<React.ComponentProps<"main">, "title"> {
  /** HTTP status shown and used for the default title, message and icon. */
  code: ErrorPageCode | (number & {})
  title?: React.ReactNode
  message?: React.ReactNode
  /** Illustration slot (image, SVG). Defaults to a large icon. */
  illustration?: React.ReactNode
  /** Where "Go home" goes. Default `/`. Pass `null` to hide it. */
  homeHref?: string | null
  /** Show "Go back". Default `true` (hidden when there is no history). */
  showBack?: boolean
  /** Show "Try again" (calls `onRetry`, or reloads the page). Default: on for 500 and 503. */
  showRetry?: boolean
  onRetry?: () => void
  /** Extra actions after the defaults; or replace them all with `actions`. */
  extraActions?: React.ReactNode
  actions?: React.ReactNode
  /** Render the page as a `<div>` instead of `<main>` (when your layout already has a main landmark). */
  as?: "main" | "div"
  classNames?: { illustration?: string; code?: string; title?: string; message?: string; actions?: string }
}

/**
 * Full-page error state with a code, title, message, illustration and actions
 * (Go home, Go back, Try again). Use the ready-made `ForbiddenPage`,
 * `NotFoundPage`, `ServerErrorPage` and `MaintenancePage`, or `ErrorPage` with
 * any `code`.
 */
export function ErrorPage({
  code,
  title,
  message,
  illustration,
  homeHref = "/",
  showBack = true,
  showRetry,
  onRetry,
  extraActions,
  actions,
  as = "main",
  className,
  classNames,
  ...props
}: ErrorPageProps) {
  const { t } = useTranslation()
  const titleId = React.useId()
  const Comp = as as React.ElementType
  const defaults = DEFAULTS[code as ErrorPageCode] ?? DEFAULTS[500]
  const retry = showRetry ?? (code === 500 || code === 503)

  return (
    <Comp
      aria-labelledby={titleId}
      data-slot="error-page"
      data-code={code}
      className={cn(
        "gap-6 px-4 py-16 max-w-xl mx-auto flex min-h-[60dvh] w-full flex-col items-center justify-center text-center",
        className,
      )}
      {...props}
    >
      <div data-slot="error-page-illustration" className={classNames?.illustration}>
        {illustration ?? (
          <div className="size-20 flex items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Icon name={defaults.icon} className="size-9" />
          </div>
        )}
      </div>
      <div className="gap-2 grid">
        <p className={cn("text-sm font-medium tracking-wide text-primary tabular-nums", classNames?.code)}>
          {t("display.errorCode", { code: String(code) })}
        </p>
        <h1
          id={titleId}
          className={cn("text-2xl font-semibold tracking-tight sm:text-3xl text-balance", classNames?.title)}
        >
          {title ?? t(defaults.title)}
        </h1>
        <p className={cn("text-pretty text-muted-foreground", classNames?.message)}>{message ?? t(defaults.message)}</p>
      </div>
      <div
        data-slot="error-page-actions"
        className={cn(
          "gap-2 sm:w-auto sm:flex-row sm:justify-center flex w-full flex-col-reverse",
          classNames?.actions,
        )}
      >
        {actions ?? (
          <>
            {showBack ? (
              <Button variant="outline" className="touch:h-11" onClick={() => window.history.back()}>
                <Icon name="back" data-icon="inline-start" />
                {t("display.goBack")}
              </Button>
            ) : null}
            {retry ? (
              <Button
                variant={homeHref ? "outline" : "default"}
                className="touch:h-11"
                onClick={() => (onRetry ? onRetry() : window.location.reload())}
              >
                <Icon name="refresh" data-icon="inline-start" />
                {t("display.tryAgain")}
              </Button>
            ) : null}
            {homeHref ? (
              <Button asChild className="touch:h-11">
                <AppLink href={homeHref}>
                  <Icon name="home" data-icon="inline-start" />
                  {t("display.goHome")}
                </AppLink>
              </Button>
            ) : null}
            {extraActions}
          </>
        )}
      </div>
    </Comp>
  )
}

export type PresetErrorPageProps = Omit<ErrorPageProps, "code">

/** 403: the user is signed in but not allowed here. */
export function ForbiddenPage(props: PresetErrorPageProps) {
  return <ErrorPage code={403} {...props} />
}

/** 404: nothing at this address. */
export function NotFoundPage(props: PresetErrorPageProps) {
  return <ErrorPage code={404} {...props} />
}

/** 500: unexpected server error, with "Try again". */
export function ServerErrorPage(props: PresetErrorPageProps) {
  return <ErrorPage code={500} {...props} />
}

/** 503: down for maintenance, with "Try again". */
export function MaintenancePage(props: PresetErrorPageProps) {
  return <ErrorPage code={503} {...props} />
}
