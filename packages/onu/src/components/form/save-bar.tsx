"use client"

import * as React from "react"
import { format as formatDate } from "date-fns"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useOnu } from "../../providers/onu-provider"
import type { OnuLocale, Translate } from "../../i18n/types"
import { Button } from "./button"
import { useOnuForm } from "./form"
import { useUnsavedChangesGuard } from "./unsaved-changes-guard"
import { registerEnglish } from "../../i18n/english"
import { common as en_common } from "../../locales/en/common"
import { form as en_form } from "../../locales/en/form"

registerEnglish({ common: en_common, form: en_form })

export interface SaveBarChange {
  /** Stable key. Defaults to the field label. */
  key?: string
  /** Field label in plain words, e.g. "Email". */
  field: string
  /** The new value. Strings, numbers, booleans, dates and arrays are formatted for the locale; empty values read "… is cleared". */
  value?: unknown
  /** Replace the generated sentence entirely. */
  description?: React.ReactNode
}

export interface SaveBarProps extends Omit<React.ComponentProps<"aside">, "title"> {
  /** What changed, listed in plain words: "Email changes to jane@new.com". */
  changes?: SaveBarChange[]
  /** Whether there is anything to save. Defaults to `changes.length > 0`. */
  dirty?: boolean
  /**
   * Saves. Return a promise for a spinner and a success/error message. Without
   * `onSave` the Save button submits the form (the enclosing one, or `form`).
   */
  onSave?: () => unknown
  /** Puts every field back to its last saved value. */
  onDiscard?: () => void
  /** Show the saving state (e.g. Inertia's `processing`). Defaults to the enclosing `Form`'s state. */
  saving?: boolean
  /** Id of the `<form>` the Save button submits when the bar sits outside it. */
  form?: string
  /** Result of the last save. Defaults to the enclosing `Form`'s status or `onSave`'s outcome. */
  status?: "idle" | "success" | "error"
  successMessage?: React.ReactNode
  errorMessage?: React.ReactNode
  title?: React.ReactNode
  saveLabel?: React.ReactNode
  discardLabel?: React.ReactNode
  /** Warn before leaving with unsaved changes (beforeunload + in-app links). Default `true`. */
  guard?: boolean
  /**
   * `responsive` (default): sticky side panel from `lg`, fixed bottom bar on phones.
   * `side` / `bottom` force one layout.
   */
  layout?: "responsive" | "side" | "bottom"
  classNames?: { title?: string; list?: string; item?: string; actions?: string; message?: string }
}

/** Formats a changed value for the save bar; `null` means "cleared". */
export function formatChangeValue(value: unknown, t: Translate, locale: OnuLocale): React.ReactNode | null {
  if (value === null || value === undefined || value === "") return null
  if (React.isValidElement(value)) return value
  if (Array.isArray(value)) {
    const parts = value.map((v) => formatChangeValue(v, t, locale)).filter((v) => v !== null)
    return parts.length ? parts.map((p) => (typeof p === "string" ? p : String(p))).join(", ") : null
  }
  if (typeof value === "boolean") return value ? t("common.yes") : t("common.no")
  if (typeof value === "number") return new Intl.NumberFormat(locale.numberLocale).format(value)
  if (value instanceof Date) return formatDate(value, "PP", { locale: locale.dateFns })
  if (typeof value === "object") {
    const label = (value as { label?: unknown }).label
    return typeof label === "string" ? label : JSON.stringify(value)
  }
  return String(value)
}

/** Puts React nodes into a translated sentence: `{field}` / `{value}` placeholders. */
function sentence(t: Translate, key: string, parts: Record<string, React.ReactNode>) {
  const marker = (name: string) => `\u0000${name}\u0000`
  const text = t(key, Object.fromEntries(Object.keys(parts).map((k) => [k, marker(k)])))
  return text.split("\u0000").map((chunk, i) =>
    i % 2 === 1 && chunk in parts ? (
      <strong key={i} className="font-medium text-foreground">
        {parts[chunk]}
      </strong>
    ) : (
      chunk
    ),
  )
}

/**
 * Builds save-bar changes by comparing saved and current values. Only keys in
 * `labels` are compared (in that order); values are compared as JSON.
 */
export function describeChanges<T extends object>(
  initial: Partial<NoInfer<T>> | undefined,
  current: T,
  labels: Partial<Record<keyof NoInfer<T> & string, string>>,
  format?: Partial<{ [K in keyof NoInfer<T> & string]: (value: T[K]) => unknown }>,
): SaveBarChange[] {
  return (Object.keys(labels) as (keyof T & string)[]).flatMap((key) => {
    const before = initial?.[key]
    const after = current[key]
    if (JSON.stringify(before ?? null) === JSON.stringify(after ?? null)) return []
    return [{ key, field: labels[key] ?? key, value: format?.[key] ? format[key]!(after) : after }]
  })
}

/**
 * While the bar is fixed to the bottom, keeps it inside the page's content
 * column (`AppLayout`'s main area, or the nearest `<main>`) so it never covers
 * a desktop sidebar. Writes the column's inline offsets to CSS variables.
 */
function useContentColumnInset(ref: React.RefObject<HTMLElement | null>, enabled: boolean) {
  React.useLayoutEffect(() => {
    const bar = ref.current
    if (!enabled || !bar || typeof window === "undefined") return
    const column = bar.closest<HTMLElement>('[data-slot="app-layout-main"], [data-slot="sidebar-inset"], main')
    if (!column) return
    const update = () => {
      const rect = column.getBoundingClientRect()
      const viewport = document.documentElement.clientWidth
      const rtl = getComputedStyle(bar).direction === "rtl"
      const left = Math.max(0, rect.left)
      const right = Math.max(0, viewport - rect.right)
      bar.style.setProperty("--save-bar-start", `${rtl ? right : left}px`)
      bar.style.setProperty("--save-bar-end", `${rtl ? left : right}px`)
    }
    update()
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(update)
    observer?.observe(column)
    window.addEventListener("resize", update)
    return () => {
      observer?.disconnect()
      window.removeEventListener("resize", update)
      bar.style.removeProperty("--save-bar-start")
      bar.style.removeProperty("--save-bar-end")
    }
  }, [ref, enabled])
}

/**
 * The edit-page save bar (§25.9): lists each change in plain words, keeps Save
 * disabled until something changed, Discard restores, a sticky side panel on
 * desktop and a fixed bottom bar on phones, and warns before leaving with
 * unsaved changes.
 */
export function SaveBar({
  changes = [],
  dirty: dirtyProp,
  onSave,
  onDiscard,
  saving: savingProp,
  form: formId,
  status: statusProp,
  successMessage,
  errorMessage,
  title,
  saveLabel,
  discardLabel,
  guard = true,
  layout = "responsive",
  className,
  classNames,
  ...props
}: SaveBarProps) {
  const { t, locale } = useOnu()
  const formCtx = useOnuForm()
  const [ownSaving, setOwnSaving] = React.useState(false)
  const [ownStatus, setOwnStatus] = React.useState<"idle" | "success" | "error">("idle")
  const [expanded, setExpanded] = React.useState(false)
  const listId = React.useId()
  const barRef = React.useRef<HTMLElement>(null)
  const dirty = dirtyProp ?? changes.length > 0
  const saving = savingProp ?? (ownSaving || (!onSave && !!formCtx?.processing))
  const formStatus = formCtx?.status === "success" ? "success" : formCtx?.status === "error" ? "error" : "idle"
  const status = statusProp ?? (onSave ? ownStatus : formStatus)
  const { dialog } = useUnsavedChangesGuard(guard && dirty && !saving, { interceptLinks: guard, beforeUnload: guard })

  async function save() {
    if (!onSave || saving) return
    setOwnSaving(true)
    try {
      await onSave()
      setOwnStatus("success")
    } catch {
      setOwnStatus("error")
    } finally {
      setOwnSaving(false)
    }
  }

  const side = layout === "side"
  const bottom = layout === "bottom"
  const responsive = layout === "responsive"
  const showSuccess = status === "success" && !dirty
  const showError = status === "error"
  const count = changes.length
  useContentColumnInset(barRef, bottom || responsive)

  const message = showError ? (
    <p role="alert" className={cn("gap-1.5 text-sm flex items-start text-destructive", classNames?.message)}>
      <Icon name="error" className="mt-0.5 size-4 shrink-0" />
      <span>{errorMessage ?? t("form.saveFailed")}</span>
    </p>
  ) : showSuccess ? (
    <p className={cn("gap-1.5 text-sm flex items-start text-success", classNames?.message)}>
      <Icon name="success" className="mt-0.5 size-4 shrink-0" />
      <span>{successMessage ?? t("form.saveSucceeded")}</span>
    </p>
  ) : null

  return (
    <>
      <aside
        ref={barRef}
        data-slot="save-bar"
        data-layout={layout}
        data-dirty={dirty || undefined}
        aria-label={typeof title === "string" ? title : t("form.unsavedChanges")}
        className={cn(
          "gap-3 grid bg-background text-foreground",
          // phones: fixed to the bottom, above the safe area
          (bottom || responsive) &&
            "bottom-0 px-4 pt-3 fixed start-(--save-bar-start,0px) end-(--save-bar-end,0px) z-40 border-t border-border pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-4px_16px_-8px_rgb(0_0_0/0.15)]",
          // desktop: sticky side panel
          responsive &&
            "lg:inset-auto lg:top-4 lg:rounded-xl lg:p-4 lg:sticky lg:z-auto lg:border lg:bg-card lg:shadow-none",
          side && "top-4 p-4 sticky rounded-xl border border-border bg-card",
          className,
        )}
        {...props}
      >
        <div className="gap-2 flex items-center justify-between">
          <h2 className={cn("text-sm font-semibold", classNames?.title)}>
            {dirty ? (title ?? t("form.unsavedChanges")) : t("form.noChanges")}
          </h2>
          {count > 0 ? (
            <button
              type="button"
              aria-expanded={expanded}
              aria-controls={listId}
              onClick={() => setExpanded((v) => !v)}
              className={cn(
                "gap-1 px-1.5 py-0.5 text-xs touch:min-h-11 inline-flex items-center rounded-md text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
                side && "hidden",
                responsive && "lg:hidden",
              )}
            >
              <span className="sr-only">{t("form.showChanges")}: </span>
              {t("form.changeCount", { count })}
              <Icon name="chevron-up" className={cn("size-3.5 transition-transform", expanded && "rotate-180")} />
            </button>
          ) : null}
        </div>

        <div aria-live="polite" className="gap-2 grid empty:hidden">
          {count > 0 ? (
            <ul
              id={listId}
              data-slot="save-bar-changes"
              className={cn(
                "gap-1.5 text-sm max-h-48 grid overflow-y-auto text-muted-foreground",
                !side && !expanded && "hidden",
                responsive && "lg:grid lg:max-h-none",
                classNames?.list,
              )}
            >
              {changes.map((change) => {
                const value = formatChangeValue(change.value, t, locale)
                return (
                  <li key={change.key ?? change.field} className={cn("gap-2 flex items-start", classNames?.item)}>
                    <Icon name="dot" className="mt-1 size-3.5 shrink-0 text-primary" />
                    <span className="min-w-0 break-words">
                      {change.description ??
                        (value === null
                          ? sentence(t, "form.changeCleared", { field: change.field })
                          : sentence(t, "form.changeTo", { field: change.field, value }))}
                    </span>
                  </li>
                )
              })}
            </ul>
          ) : null}
          {message}
        </div>

        <div
          className={cn(
            "gap-2 grid grid-cols-2",
            side && "grid-cols-1",
            responsive && "lg:grid-cols-1",
            classNames?.actions,
          )}
        >
          <Button
            variant="outline"
            disabled={!dirty || saving}
            onClick={onDiscard}
            startIcon="undo"
            className={cn("touch:min-h-11", (side || responsive) && "lg:order-2")}
          >
            {discardLabel ?? t("form.discard")}
          </Button>
          <Button
            type={onSave ? "button" : "submit"}
            form={onSave ? undefined : formId}
            disabled={!dirty}
            loading={saving}
            onClick={onSave ? () => void save() : undefined}
            startIcon="save"
            className={cn("touch:min-h-11", (side || responsive) && "lg:order-1")}
          >
            {saveLabel ?? t("common.save")}
          </Button>
        </div>
      </aside>
      {/* Keeps page content clear of the fixed bar on phones. */}
      {bottom || responsive ? (
        <div aria-hidden="true" data-slot="save-bar-spacer" className={cn("h-32", responsive && "lg:hidden")} />
      ) : null}
      {guard ? dialog : null}
    </>
  )
}
