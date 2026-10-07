"use client"

import * as React from "react"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { Button } from "../../ui/button"
import { Spinner } from "../../ui/spinner"
import { ConfirmDialog, useNoun, type ConfirmOptions } from "./_shared"
import type { ListingNoun } from "./listing-types"

export interface BulkActionFormProps<V = unknown> {
  value: V | undefined
  onChange: (value: V | undefined) => void
  /** Id for the form control; the action's label is linked to it. */
  id: string
}

export interface BulkAction<V = unknown> {
  id: string
  label: string
  /** Semantic icon name. */
  icon?: string
  /** Red styling. Destructive actions confirm first ("Delete 3 selected users?"). */
  destructive?: boolean
  /** Ask before running. Defaults to `destructive`. */
  confirm?: boolean | Partial<ConfirmOptions>
  /** A small form shown in the bar before running, for actions that need input (e.g. "Change status"). */
  form?: (props: BulkActionFormProps<V>) => React.ReactNode
  /** Initial value of the form. */
  defaultValue?: V
  /** Runs the action on the selected ids. May return (or resolve to) a custom success message. */
  run: (ids: string[], value: V | undefined) => unknown
  /** Success message. Defaults to "3 users deleted" for `id: "delete"`, otherwise "Label: 3 users done". */
  successMessage?: string | ((count: number) => string)
  /** `false` hides the action (permissions). */
  permitted?: boolean
}

export interface BulkActionBarProps extends Omit<React.ComponentProps<"div">, "children" | "onError"> {
  /** Selected row ids. The bar appears as soon as one is selected. */
  selected: string[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- each action has its own value type
  actions: BulkAction<any>[]
  onClearSelection: () => void
  /** What is being listed, e.g. `{ one: "user", other: "users" }`. */
  noun?: ListingNoun
  /** Called after an action succeeds, with its message. */
  onSuccess?: (message: string, action: BulkAction<unknown>, ids: string[]) => void
  /** Called when an action throws. The selection is kept. */
  onError?: (error: unknown, action: BulkAction<unknown>) => void
  classNames?: { bar?: string; count?: string; actions?: string; form?: string; message?: string }
}

type Phase =
  | { kind: "idle" }
  | { kind: "form"; action: BulkAction<unknown>; value: unknown }
  | { kind: "running"; action: BulkAction<unknown> }

/**
 * Bulk action bar (§25.6): "3 selected", the actions and Clear selection.
 * Actions that need input show a small form in the bar; destructive ones
 * confirm first; while running the bar shows a spinner and its buttons are
 * disabled; afterwards a success message appears and the selection clears.
 */
export function BulkActionBar({
  selected,
  actions,
  onClearSelection,
  noun,
  onSuccess,
  onError,
  className,
  classNames,
  ...props
}: BulkActionBarProps) {
  const { t, locale } = useTranslation()
  const nounFor = useNoun(noun)
  const formId = React.useId()
  const [phase, setPhase] = React.useState<Phase>({ kind: "idle" })
  const [confirming, setConfirming] = React.useState<{ action: BulkAction<unknown>; value: unknown } | null>(null)
  const [message, setMessage] = React.useState<{ text: string; tone: "success" | "error" } | null>(null)
  const messageRef = React.useRef<HTMLDivElement>(null)
  // The bar goes away with the selection: keep keyboard focus on the result instead of losing it.
  React.useEffect(() => {
    if (message && (selected.length === 0 || message.tone === "error")) messageRef.current?.focus()
  }, [message, selected.length])

  const count = selected.length
  const visible = actions.filter((a) => a.permitted !== false)
  const running = phase.kind === "running"
  const format = new Intl.NumberFormat(locale.numberLocale)

  // A new selection hides the last result; an emptied selection closes any open form.
  const [prevCount, setPrevCount] = React.useState(count)
  if (prevCount !== count) {
    setPrevCount(count)
    if (count > 0 && message?.tone === "success") setMessage(null)
    if (count === 0 && phase.kind === "form") setPhase({ kind: "idle" })
  }

  const successText = (action: BulkAction<unknown>, n: number, returned: unknown) => {
    if (typeof returned === "string") return returned
    if (typeof action.successMessage === "function") return action.successMessage(n)
    if (action.successMessage) return action.successMessage
    if (action.id === "delete") return t("listing.bulkDeleted", { count: format.format(n), noun: nounFor(n) })
    return t("listing.bulkDone", { action: action.label, count: format.format(n), noun: nounFor(n) })
  }

  const execute = async (action: BulkAction<unknown>, value: unknown) => {
    const ids = [...selected]
    setPhase({ kind: "running", action })
    setMessage(null)
    try {
      const returned = await action.run(ids, value)
      const text = successText(action, ids.length, returned)
      setMessage({ text, tone: "success" })
      setPhase({ kind: "idle" })
      onClearSelection()
      onSuccess?.(text, action, ids)
    } catch (error) {
      setMessage({
        text: error instanceof Error && error.message ? error.message : t("listing.bulkFailed"),
        tone: "error",
      })
      setPhase({ kind: "idle" })
      onError?.(error, action)
    }
  }

  const wantsConfirm = (action: BulkAction<unknown>) =>
    action.confirm === undefined ? !!action.destructive : action.confirm !== false

  const proceed = (action: BulkAction<unknown>, value: unknown) => {
    if (wantsConfirm(action)) setConfirming({ action, value })
    else void execute(action, value)
  }

  const choose = (action: BulkAction<unknown>) => {
    if (action.form) setPhase({ kind: "form", action, value: action.defaultValue })
    else proceed(action, undefined)
  }

  const confirmOptions = (action: BulkAction<unknown>): ConfirmOptions => {
    const custom = typeof action.confirm === "object" ? action.confirm : {}
    const n = format.format(count)
    return {
      title:
        action.id === "delete"
          ? t("listing.bulkDeleteTitle", { count: n, noun: nounFor(count) })
          : t("listing.bulkConfirmTitle", { action: action.label, count: n, noun: nounFor(count) }),
      description: action.destructive ? t("listing.bulkConfirmDescription") : undefined,
      confirmLabel: action.label,
      destructive: !!action.destructive,
      ...custom,
    }
  }

  const messageEl = message ? (
    <div
      ref={messageRef}
      tabIndex={-1}
      role={message.tone === "error" ? "alert" : "status"}
      data-slot="bulk-action-message"
      data-tone={message.tone}
      className={cn(
        "gap-2 px-3 py-2 text-sm flex items-center rounded-lg border outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        message.tone === "success"
          ? "border-success/30 bg-success/10 text-foreground"
          : "border-destructive/30 bg-destructive/10 text-destructive",
        classNames?.message,
      )}
    >
      <Icon
        name={message.tone === "success" ? "success" : "error"}
        className={message.tone === "success" ? "text-success" : undefined}
      />
      <span className="flex-1">{message.text}</span>
      <Button
        variant="ghost"
        size="icon-xs"
        className="touch:size-11"
        aria-label={t("listing.dismiss")}
        onClick={() => setMessage(null)}
      >
        <Icon name="close" />
      </Button>
    </div>
  ) : null

  return (
    <div data-slot="bulk-actions" className={cn("gap-2 grid empty:hidden", className)} {...props}>
      {count > 0 || running ? (
        <div
          role="region"
          aria-label={t("listing.bulkActions")}
          aria-busy={running || undefined}
          data-slot="bulk-action-bar"
          className={cn(
            "gap-x-3 gap-y-2 px-3 py-2 flex flex-wrap items-center rounded-lg border border-primary/30 bg-primary/5",
            classNames?.bar,
          )}
        >
          <span
            aria-live="polite"
            aria-atomic="true"
            className={cn("text-sm font-medium tabular-nums", classNames?.count)}
          >
            {t("listing.selectedCount", { count })}
          </span>

          {phase.kind === "form" ? (
            <form
              className={cn("gap-2 flex flex-wrap items-center", classNames?.form)}
              data-slot="bulk-action-form"
              onSubmit={(e) => {
                e.preventDefault()
                proceed(phase.action, phase.value)
              }}
            >
              <label htmlFor={formId} className="text-sm text-muted-foreground">
                {phase.action.label}
              </label>
              {phase.action.form?.({
                id: formId,
                value: phase.value,
                onChange: (value) => setPhase({ ...phase, value }),
              })}
              <Button type="submit" size="sm" className="touch:min-h-11">
                {t("listing.bulkApply")}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="touch:min-h-11"
                onClick={() => setPhase({ kind: "idle" })}
              >
                {t("listing.cancel")}
              </Button>
            </form>
          ) : (
            <div className={cn("gap-2 flex flex-wrap items-center", classNames?.actions)}>
              {visible.map((action) => (
                <Button
                  key={action.id}
                  size="sm"
                  variant={action.destructive ? "destructive" : "outline"}
                  disabled={running}
                  className="touch:min-h-11"
                  onClick={() => choose(action)}
                >
                  {running && phase.action.id === action.id ? (
                    <Spinner />
                  ) : action.icon ? (
                    <Icon name={action.icon} />
                  ) : null}
                  {action.label}
                </Button>
              ))}
            </div>
          )}

          {running ? (
            <span className="text-sm gap-1.5 flex items-center text-muted-foreground" role="status">
              {t("listing.bulkRunning")}
            </span>
          ) : null}

          <Button
            variant="link"
            size="sm"
            className="px-0 touch:min-h-11 ms-auto"
            disabled={running}
            onClick={onClearSelection}
          >
            {t("listing.clearSelection")}
          </Button>
        </div>
      ) : null}
      {messageEl}
      {confirming ? (
        <ConfirmDialog
          open
          onOpenChange={(open) => !open && setConfirming(null)}
          onConfirm={() => {
            const { action, value } = confirming
            setConfirming(null)
            void execute(action, value)
          }}
          {...confirmOptions(confirming.action)}
        />
      ) : null}
    </div>
  )
}
