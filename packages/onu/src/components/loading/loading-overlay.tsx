"use client"

import * as React from "react"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { registerEnglish } from "../../i18n/english"
import { overlay as en_overlay } from "../../locales/en/overlay"

registerEnglish({ overlay: en_overlay })

/** Becomes `true` only after `value` has stayed `true` for `delay` ms (avoids flicker). */
export function useDelayedFlag(value: boolean, delay: number) {
  const [shown, setShown] = React.useState(value && delay <= 0)
  React.useEffect(() => {
    if (!value) {
      const reset = setTimeout(() => setShown(false), 0)
      return () => clearTimeout(reset)
    }
    const timer = setTimeout(() => setShown(true), Math.max(0, delay))
    return () => clearTimeout(timer)
  }, [value, delay])
  return value && shown
}

export interface LoadingOverlayProps extends React.ComponentProps<"div"> {
  /** Show the overlay. */
  loading: boolean
  /** Text under the spinner, e.g. "Saving changes…". Without it, "Loading…" is read to screen readers only. */
  message?: React.ReactNode
  /** Wait this long (ms) before showing, so quick loads don't flash. Default 200. */
  delay?: number
  /** Cover the whole viewport instead of the container. */
  fullScreen?: boolean
  /** Blur the content underneath. Default `true`. */
  blur?: boolean
  classNames?: { content?: string; overlay?: string; spinner?: string; message?: string }
}

/**
 * Covers a container (a card, table or form) while it loads or saves. The
 * container gets `aria-busy`, the content underneath is made inert, and a
 * status message is announced. Shows only after `delay` to avoid flicker.
 */
export function LoadingOverlay({
  loading,
  message,
  delay = 200,
  fullScreen = false,
  blur = true,
  className,
  classNames,
  children,
  ...props
}: LoadingOverlayProps) {
  const { t } = useTranslation()
  const visible = useDelayedFlag(loading, delay)

  return (
    <div
      data-slot="loading-overlay"
      data-loading={loading || undefined}
      aria-busy={loading}
      className={cn("relative", className)}
      {...props}
    >
      {children !== undefined ? (
        <div data-slot="loading-overlay-content" inert={visible} className={classNames?.content}>
          {children}
        </div>
      ) : null}
      {visible ? (
        <div
          data-slot="loading-overlay-overlay"
          className={cn(
            "gap-3 p-4 z-10 flex animate-in flex-col items-center justify-center bg-background/70 text-center duration-150 fade-in-0",
            fullScreen ? "inset-0 fixed z-50" : "inset-0 absolute rounded-[inherit]",
            blur && "backdrop-blur-[2px]",
            classNames?.overlay,
          )}
        >
          <Icon name="loading" className={cn("size-6 animate-spin text-primary", classNames?.spinner)} />
          {message ? (
            <span aria-hidden="true" className={cn("text-sm font-medium", classNames?.message)}>
              {message}
            </span>
          ) : null}
        </div>
      ) : null}
      {/* Always mounted so screen readers announce the change (R14.7). */}
      <span role="status" className="sr-only" data-slot="loading-overlay-status">
        {visible ? (message ?? t("overlay.loading")) : null}
      </span>
    </div>
  )
}
