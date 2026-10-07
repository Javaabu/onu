"use client"

import * as React from "react"
import { formatDistanceToNowStrict } from "date-fns"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useOnu } from "../../providers/onu-provider"
import { Button } from "./button"

export type AutosaveStatus = "idle" | "saving" | "saved" | "error"

export interface AutosaveIndicatorProps extends Omit<React.ComponentProps<"div">, "children"> {
  status: AutosaveStatus
  /** When the last save finished. Shown as relative time ("Saved 2 minutes ago"), refreshed every 30 seconds. */
  lastSavedAt?: Date | number | null
  /** Error text. Defaults to "Couldn’t save changes". */
  error?: React.ReactNode
  /** Shows a Retry button in the error state. */
  onRetry?: () => void
  /** Hide the text and show only the icon (the status is still announced). */
  compact?: boolean
}

const JUST_NOW_MS = 45_000

/**
 * Shows whether changes are being saved automatically: idle, saving, saved
 * (with relative time) or error (with Retry). Status changes are announced
 * in a polite live region (R14.7).
 */
export function AutosaveIndicator({
  status,
  lastSavedAt,
  error,
  onRetry,
  compact = false,
  className,
  ...props
}: AutosaveIndicatorProps) {
  const { t, locale } = useOnu()
  const [now, setNow] = React.useState(() => Date.now())

  React.useEffect(() => {
    if (status !== "saved" || !lastSavedAt) return
    const timer = setInterval(() => setNow(Date.now()), 30_000)
    return () => clearInterval(timer)
  }, [status, lastSavedAt])

  const savedText = (() => {
    if (!lastSavedAt) return t("form.autosaveSaved")
    const at = typeof lastSavedAt === "number" ? lastSavedAt : lastSavedAt.getTime()
    if (Math.max(0, now - at) < JUST_NOW_MS) return t("form.autosaveSavedJustNow")
    const time = formatDistanceToNowStrict(at, { addSuffix: true, locale: locale.dateFns })
    return t("form.autosaveSavedAgo", { time })
  })()

  const text = {
    idle: t("form.autosaveIdle"),
    saving: t("form.autosaveSaving"),
    saved: savedText,
    error: error ?? t("form.autosaveError"),
  }[status]
  // The live region only gets the status word, not the ticking relative time.
  const spoken = {
    idle: "",
    saving: t("form.autosaveSaving"),
    saved: t("form.autosaveSaved"),
    error: typeof error === "string" ? error : t("form.autosaveError"),
  }[status]

  const icon = { idle: "check", saving: "loading", saved: "check", error: "error" }[status]

  return (
    <div
      data-slot="autosave-indicator"
      data-status={status}
      title={compact && typeof text === "string" ? text : undefined}
      className={cn(
        "gap-1.5 text-sm inline-flex items-center text-muted-foreground",
        status === "saved" && "text-success",
        status === "error" && "text-destructive",
        className,
      )}
      {...props}
    >
      <Icon name={icon} className={cn("size-4 shrink-0", status === "saving" && "animate-spin")} />
      <span className={cn(compact && "sr-only")}>{text}</span>
      {status === "error" && onRetry ? (
        <Button variant="link" size="sm" className="px-1 h-auto" onClick={onRetry}>
          {t("common.retry")}
        </Button>
      ) : null}
      <span role="status" aria-live="polite" className="sr-only">
        {spoken}
      </span>
    </div>
  )
}

export interface UseAutosaveOptions<T> {
  /** Saves the value. Return a promise; reject to show the error state. */
  onSave: (value: T) => unknown
  /** Wait this long after the last change before saving. Default 1000 ms. */
  delay?: number
  /** Skip saving (e.g. while the form is invalid). */
  enabled?: boolean
  /** Compare values; defaults to `JSON.stringify` equality. */
  isEqual?: (a: T, b: T) => boolean
}

/**
 * Debounced autosave for a value. Returns props for `AutosaveIndicator`
 * (`status`, `lastSavedAt`, `onRetry`) plus `flush()` to save immediately.
 */
export function useAutosave<T>(value: T, { onSave, delay = 1000, enabled = true, isEqual }: UseAutosaveOptions<T>) {
  const [status, setStatus] = React.useState<AutosaveStatus>("idle")
  const [lastSavedAt, setLastSavedAt] = React.useState<number | null>(null)
  const saved = React.useRef(value)
  const latest = React.useRef(value)
  const onSaveRef = React.useRef(onSave)
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const run = React.useRef(0)
  const equal = React.useCallback(
    (a: T, b: T) => (isEqual ? isEqual(a, b) : JSON.stringify(a) === JSON.stringify(b)),
    [isEqual],
  )

  React.useEffect(() => {
    onSaveRef.current = onSave
    latest.current = value
  })

  const flush = React.useCallback(async () => {
    clearTimeout(timer.current)
    const current = latest.current
    if (equal(current, saved.current)) return
    const id = ++run.current
    setStatus("saving")
    try {
      await onSaveRef.current(current)
      if (id !== run.current) return
      saved.current = current
      setLastSavedAt(Date.now())
      setStatus("saved")
    } catch {
      if (id === run.current) setStatus("error")
    }
  }, [equal])

  React.useEffect(() => {
    if (!enabled || equal(value, saved.current)) return
    clearTimeout(timer.current)
    timer.current = setTimeout(() => void flush(), delay)
    return () => clearTimeout(timer.current)
  }, [value, enabled, delay, equal, flush])

  return { status, lastSavedAt, onRetry: () => void flush(), flush }
}
