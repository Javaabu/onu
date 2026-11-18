"use client"

import * as React from "react"

import type { ThaanaProp } from "../../thaana/use-thaana-field"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { Button } from "../../ui/button"
import { Icon } from "../../icons/icon"
import { Textarea } from "../inputs/textarea"
import { registerEnglish } from "../../i18n/english"
import { common as en_common } from "../../locales/en/common"
import { display as en_display } from "../../locales/en/display"

registerEnglish({ common: en_common, display: en_display })

export interface ComposerProps {
  label: string
  placeholder?: string
  submitLabel: string
  onSubmit: (body: string) => void | Promise<unknown>
  onCancel?: () => void
  defaultValue?: string
  thaana?: ThaanaProp
  /** Focus the textarea when shown (reply / edit opened on demand). */
  focusOnMount?: boolean
  disabled?: boolean
  className?: string
}

/** Textarea + submit button shared by comments and notes. Ctrl/⌘+Enter submits. */
export function Composer({
  label,
  placeholder,
  submitLabel,
  onSubmit,
  onCancel,
  defaultValue = "",
  thaana,
  focusOnMount,
  disabled,
  className,
}: ComposerProps) {
  const { t } = useTranslation()
  const [body, setBody] = React.useState(defaultValue)
  const [pending, setPending] = React.useState(false)
  const [failed, setFailed] = React.useState(false)
  const hintId = React.useId()
  const textarea = React.useRef<HTMLTextAreaElement>(null)
  React.useEffect(() => {
    if (focusOnMount) textarea.current?.focus()
  }, [focusOnMount])
  const canSubmit = body.trim().length > 0 && !pending && !disabled
  // The textarea and button are disabled while posting, which drops focus to <body>.
  // Once the post settles, put focus back in the textarea, ready for the next one.
  const refocus = React.useRef(false)
  React.useEffect(() => {
    if (pending || !refocus.current) return
    refocus.current = false
    const active = document.activeElement
    if (!active || active === document.body) textarea.current?.focus()
  }, [pending])

  const submit = async () => {
    if (!canSubmit) return
    refocus.current = true
    setPending(true)
    setFailed(false)
    try {
      await onSubmit(body.trim())
      setBody("")
    } catch {
      // Keep the text so nothing is lost; the user can try again.
      setFailed(true)
    } finally {
      setPending(false)
    }
  }

  return (
    <form
      data-slot="composer"
      className={cn("gap-2 grid", className)}
      onSubmit={(e) => {
        e.preventDefault()
        void submit()
      }}
    >
      <Textarea
        ref={textarea}
        aria-label={label}
        aria-describedby={hintId}
        placeholder={placeholder}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
            e.preventDefault()
            void submit()
          }
          if (e.key === "Escape" && onCancel) {
            e.preventDefault()
            onCancel()
          }
        }}
        thaana={thaana}
        thaanaToggle={!!thaana}
        disabled={disabled || pending}
        className="min-h-20"
      />
      {failed ? (
        <p role="alert" className="text-sm text-destructive">
          {t("display.composerFailed")}
        </p>
      ) : null}
      <div className="gap-2 flex flex-wrap items-center justify-end">
        <span id={hintId} className="text-xs max-sm:sr-only me-auto text-muted-foreground">
          {t("display.submitHint")}
        </span>
        {onCancel ? (
          <Button type="button" variant="ghost" size="sm" className="touch:h-11" onClick={onCancel}>
            {t("common.cancel")}
          </Button>
        ) : null}
        <Button type="submit" size="sm" className="touch:h-11" disabled={!canSubmit}>
          {pending ? <Icon name="loading" data-icon="inline-start" className="animate-spin" /> : null}
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
