"use client"

import * as React from "react"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import type { ThaanaProp } from "../../thaana/use-thaana-field"
import { TextInput } from "../inputs/text-input"
import { Textarea } from "../inputs/textarea"
import { Button } from "./button"
import { registerEnglish } from "../../i18n/english"
import { form as en_form } from "../../locales/en/form"

registerEnglish({ form: en_form })

export interface InlineEditProps extends Omit<
  React.ComponentProps<"div">,
  "onChange" | "defaultValue" | "children" | "onSubmit"
> {
  /** What is being edited, e.g. "Name". Used for the accessible names. */
  label: string
  value?: string
  defaultValue?: string
  /** Saves the new value. Return a promise to show a saving state; reject (or throw) to show an error. */
  onSave?: (value: string) => unknown
  onCancel?: () => void
  /** Called with every edit while typing. */
  onChange?: (value: string) => void
  placeholder?: string
  /** Use a textarea (Ctrl/Cmd+Enter saves). */
  multiline?: boolean
  /** Type Thaana from a Latin keyboard (R13.3). */
  thaana?: ThaanaProp
  disabled?: boolean
  /** Returns an error message to block saving. */
  validate?: (value: string) => string | null | undefined
  /** What happens when focus leaves the editor. Default `save`. */
  blurBehavior?: "save" | "cancel" | "none"
  /** Custom display of the value in view mode. */
  renderValue?: (value: string) => React.ReactNode
  /** Start in edit mode. */
  defaultEditing?: boolean
  inputProps?: Omit<React.ComponentProps<"input">, "value" | "onChange" | "defaultValue">
  classNames?: { display?: string; input?: string; actions?: string; error?: string }
}

/**
 * Text that turns into an input when clicked (or on Enter). Enter saves,
 * Escape cancels, async saves show progress and errors keep the editor open.
 */
export function InlineEdit({
  label,
  value: valueProp,
  defaultValue = "",
  onSave,
  onCancel,
  onChange,
  placeholder,
  multiline = false,
  thaana,
  disabled = false,
  validate,
  blurBehavior = "save",
  renderValue,
  defaultEditing = false,
  inputProps,
  className,
  classNames,
  ...props
}: InlineEditProps) {
  const { t } = useTranslation()
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue)
  const value = valueProp ?? uncontrolled
  const [editing, setEditing] = React.useState(defaultEditing)
  const [draft, setDraft] = React.useState(value)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [announcement, setAnnouncement] = React.useState("")
  const rootRef = React.useRef<HTMLDivElement>(null)
  const displayRef = React.useRef<HTMLButtonElement>(null)
  const fieldRef = React.useRef<HTMLInputElement & HTMLTextAreaElement>(null)
  const returnFocus = React.useRef(false)
  const id = React.useId()
  const hintId = `${id}-hint`
  const errorId = `${id}-error`

  React.useEffect(() => {
    if (editing) {
      fieldRef.current?.focus()
      fieldRef.current?.select()
    } else if (returnFocus.current) {
      returnFocus.current = false
      displayRef.current?.focus()
    }
  }, [editing])

  function start() {
    if (disabled) return
    setDraft(value)
    setError(null)
    setEditing(true)
  }

  function cancel() {
    returnFocus.current = true
    setDraft(value)
    setError(null)
    setEditing(false)
    onCancel?.()
  }

  async function save() {
    if (saving) return
    if (draft === value) {
      returnFocus.current = true
      setEditing(false)
      return
    }
    const invalid = validate?.(draft)
    if (invalid) {
      setError(invalid)
      fieldRef.current?.focus()
      return
    }
    setSaving(true)
    setError(null)
    try {
      await onSave?.(draft)
      if (valueProp === undefined) setUncontrolled(draft)
      returnFocus.current = true
      setEditing(false)
      setAnnouncement(t("form.inlineEditSaved", { label }))
    } catch (e) {
      setError(e instanceof Error && e.message ? e.message : t("form.inlineEditFailed"))
      requestAnimationFrame(() => fieldRef.current?.focus())
    } finally {
      setSaving(false)
    }
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Escape") {
      event.preventDefault()
      event.stopPropagation()
      cancel()
    } else if (event.key === "Enter" && !event.nativeEvent.isComposing) {
      if (multiline && !(event.ctrlKey || event.metaKey)) return
      event.preventDefault()
      void save()
    }
  }

  function onBlur(event: React.FocusEvent) {
    if (blurBehavior === "none" || saving) return
    if (rootRef.current?.contains(event.relatedTarget as Node | null)) return
    if (blurBehavior === "cancel") cancel()
    else void save()
  }

  const shown = renderValue ? renderValue(value) : value

  return (
    <div
      ref={rootRef}
      data-slot="inline-edit"
      data-state={editing ? "editing" : "viewing"}
      className={cn("min-w-0 inline-block max-w-full align-top", className)}
      {...props}
    >
      {editing ? (
        <div className="gap-1.5 grid" onBlur={onBlur}>
          <div className="gap-1.5 flex items-start">
            {multiline ? (
              <Textarea
                ref={fieldRef}
                aria-label={label}
                value={draft}
                thaana={thaana}
                placeholder={placeholder}
                readOnly={saving}
                aria-busy={saving || undefined}
                aria-invalid={!!error || undefined}
                aria-describedby={cn(hintId, error && errorId)}
                onChange={(e) => {
                  setDraft(e.target.value)
                  onChange?.(e.target.value)
                }}
                onKeyDown={onKeyDown}
                className={cn("min-w-48 flex-1", classNames?.input)}
              />
            ) : (
              <TextInput
                ref={fieldRef}
                aria-label={label}
                {...inputProps}
                value={draft}
                thaana={thaana}
                placeholder={placeholder}
                readOnly={saving}
                aria-busy={saving || undefined}
                aria-invalid={!!error || undefined}
                aria-describedby={cn(hintId, error && errorId)}
                onChange={(e) => {
                  setDraft(e.target.value)
                  onChange?.(e.target.value)
                }}
                onKeyDown={onKeyDown}
                className={cn("min-w-48 flex-1", classNames?.input)}
              />
            )}
            <div className={cn("gap-1 flex shrink-0", classNames?.actions)}>
              <Button
                size="icon"
                aria-label={t("form.saveEdit")}
                title={t("form.saveEdit")}
                loading={saving}
                startIcon="check"
                onClick={() => void save()}
              />
              <Button
                size="icon"
                variant="outline"
                aria-label={t("form.cancelEdit")}
                title={t("form.cancelEdit")}
                disabled={saving}
                startIcon="close"
                onClick={cancel}
              />
            </div>
          </div>
          <p id={hintId} className="sr-only">
            {t(multiline ? "form.inlineEditHintMultiline" : "form.inlineEditHint")}
          </p>
          {error ? (
            <p
              id={errorId}
              role="alert"
              className={cn("gap-1.5 text-sm flex items-start text-destructive", classNames?.error)}
            >
              <Icon name="error" className="mt-0.5 size-3.5 shrink-0" />
              <span>{error}</span>
            </p>
          ) : null}
        </div>
      ) : (
        <button
          ref={displayRef}
          type="button"
          data-slot="inline-edit-display"
          disabled={disabled}
          onClick={start}
          aria-label={`${t("form.edit", { label })}: ${value || t("form.emptyValue")}`}
          {...(thaana && value ? { lang: "dv", dir: "rtl" } : {})}
          className={cn(
            "group/inline-edit gap-2 px-1.5 py-1 min-h-8 touch:min-h-11 inline-flex max-w-full items-center rounded-md text-start outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
            thaana && value && "font-thaana",
            classNames?.display,
          )}
        >
          <span className={cn("min-w-0 break-words", !value && "text-muted-foreground italic")}>
            {value ? shown : (placeholder ?? t("form.emptyValue"))}
          </span>
          <Icon
            name="edit"
            className="size-3.5 shrink-0 text-muted-foreground opacity-60 group-hover/inline-edit:opacity-100 group-focus-visible/inline-edit:opacity-100"
          />
        </button>
      )}
      <span role="status" aria-live="polite" className="sr-only">
        {announcement}
      </span>
    </div>
  )
}
