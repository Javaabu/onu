"use client"

import * as React from "react"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { InputGroupButton } from "../../ui/input-group"
import { registerEnglish } from "../../i18n/english"
import { input as en_input } from "../../locales/en/input"

registerEnglish({ input: en_input })

/**
 * Controlled/uncontrolled state in one hook: uses `value` when it is not
 * `undefined`, otherwise internal state seeded from `defaultValue`.
 */
export function useControllableState<T>(
  value: T | undefined,
  defaultValue: T,
  onChange?: (value: T) => void,
): [T, (next: T) => void] {
  const [inner, setInner] = React.useState<T>(defaultValue)
  const controlled = value !== undefined
  const current = controlled ? value : inner
  const onChangeRef = React.useRef(onChange)
  React.useEffect(() => {
    onChangeRef.current = onChange
  })
  const set = React.useCallback(
    (next: T) => {
      if (!controlled) setInner(next)
      onChangeRef.current?.(next)
    },
    [controlled],
  )
  return [current, set]
}

/** Writes text to the clipboard, falling back to `execCommand("copy")`. */
export async function writeClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // fall through to the legacy path
  }
  const el = document.createElement("textarea")
  el.value = text
  el.setAttribute("readonly", "")
  el.style.position = "fixed"
  el.style.opacity = "0"
  document.body.appendChild(el)
  el.select()
  let ok: boolean
  try {
    ok = document.execCommand?.("copy") ?? false
  } catch {
    ok = false
  }
  el.remove()
  return ok
}

/** Copies text and reports `"copied"` / `"failed"` for `timeout` ms. */
export function useCopy(timeout = 2000) {
  const [status, setStatus] = React.useState<"idle" | "copied" | "failed">("idle")
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined)
  React.useEffect(() => () => clearTimeout(timer.current), [])
  const copy = React.useCallback(
    async (text: string) => {
      const ok = await writeClipboard(text)
      setStatus(ok ? "copied" : "failed")
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setStatus("idle"), timeout)
      return ok
    },
    [timeout],
  )
  return { status, copy }
}

/** A visually hidden polite live region. */
export function LiveMessage({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <span className={cn("sr-only", className)} aria-live="polite" aria-atomic="true">
      {children}
    </span>
  )
}

export interface CopyButtonProps extends Omit<React.ComponentProps<typeof InputGroupButton>, "onCopy" | "value"> {
  value: string
  onCopy?: (value: string) => void
}

/** Icon button for input groups that copies `value` and announces "Copied". */
export function CopyButton({ value, onCopy, className, disabled, ...props }: CopyButtonProps) {
  const { t } = useTranslation()
  const { status, copy } = useCopy()
  return (
    <>
      <InputGroupButton
        size="icon-xs"
        data-slot="copy-button"
        data-copied={status === "copied" || undefined}
        aria-label={t("input.copy")}
        title={t("input.copy")}
        disabled={disabled}
        className={cn("touch:size-11", className)}
        onClick={async () => {
          if (await copy(value)) onCopy?.(value)
        }}
        {...props}
      >
        <Icon name={status === "copied" ? "check" : "copy"} />
      </InputGroupButton>
      <LiveMessage>
        {status === "copied" ? t("input.copied") : status === "failed" ? t("input.copyFailed") : null}
      </LiveMessage>
    </>
  )
}

/** Sets an input's value the way a user would, so React `onChange` and form libraries see it. */
export function setNativeValue(el: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set
  setter?.call(el, value)
  el.dispatchEvent(new Event("input", { bubbles: true }))
}
