"use client"

import * as React from "react"

import { LiveRegion } from "../../a11y/live-region"
import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { InputGroupButton } from "../../ui/input-group"
import { CopyButton, useControllableState } from "./_shared"
import { TextInput, type TextInputProps } from "./text-input"
import { registerEnglish } from "../../i18n/english"
import { input as en_input } from "../../locales/en/input"

registerEnglish({ input: en_input })

/** `sk_live_abcd1234` → `••••••••1234`. The dot count is fixed so the length is not leaked. */
export function maskSecret(value: string, visibleChars = 4, maskLength = 8, maskChar = "•"): string {
  if (!value) return ""
  const tail = visibleChars > 0 && value.length > visibleChars ? value.slice(-visibleChars) : ""
  return maskChar.repeat(maskLength) + tail
}

export interface SensitiveInputProps extends Omit<
  TextInputProps,
  "type" | "thaana" | "thaanaToggle" | "value" | "defaultValue" | "onChange" | "readOnly" | "onCopy"
> {
  /** The secret, e.g. an API key or token. */
  value: string
  /**
   * Mask the value except for its last characters. Default `true`. `false`
   * shows the value as is, with no reveal button: a share link, a reference.
   */
  masked?: boolean
  /** How many trailing characters stay visible while masked. Default `4`. */
  visibleChars?: number
  /** Number of mask characters shown. Default `8`. */
  maskLength?: number
  /** Controlled reveal state. */
  revealed?: boolean
  defaultRevealed?: boolean
  onRevealedChange?: (revealed: boolean) => void
  /** Show the reveal button. Default `true`. */
  revealable?: boolean
  /** Show the copy button. Default `true`. The full secret is copied even while masked. */
  copyable?: boolean
  onCopy?: (value: string) => void
  /** Use the monospace font. Default `true`. */
  mono?: boolean
}

/**
 * Read-only display of a secret such as an API key: masked except for the
 * last characters, with reveal and copy buttons. The full value is never in
 * the DOM while masked. With `masked={false}` it is a plain read-only value
 * with a copy button.
 */
export function SensitiveInput({
  value,
  masked = true,
  visibleChars = 4,
  maskLength = 8,
  revealed: revealedProp,
  defaultRevealed = false,
  onRevealedChange,
  revealable = true,
  copyable = true,
  onCopy,
  mono = true,
  endAddon,
  dir,
  className,
  classNames,
  ...props
}: SensitiveInputProps) {
  const { t } = useTranslation()
  const [revealed, setRevealed] = useControllableState(revealedProp, defaultRevealed, onRevealedChange)
  const [announced, setAnnounced] = React.useState<string | null>(null)
  const shown = !masked || revealed

  return (
    <>
      <TextInput
        readOnly
        value={shown ? value : maskSecret(value, visibleChars, maskLength)}
        className={cn(masked && mono && "font-mono", className)}
        classNames={{ ...classNames, input: cn(masked && "tracking-wide", mono && "font-mono", classNames?.input) }}
        onFocus={(e) => e.currentTarget.select()}
        endAddon={
          <>
            {endAddon}
            {masked && revealable ? (
              <InputGroupButton
                size="icon-xs"
                data-slot="sensitive-reveal"
                aria-label={t("input.reveal")}
                aria-pressed={revealed}
                title={t("input.reveal")}
                disabled={props.disabled}
                className="touch:size-11"
                onClick={() => {
                  setRevealed(!revealed)
                  setAnnounced(revealed ? t("input.concealed") : t("input.revealed"))
                }}
              >
                <Icon name={revealed ? "eye-off" : "eye"} />
              </InputGroupButton>
            ) : null}
            {copyable ? <CopyButton value={value} onCopy={onCopy} disabled={props.disabled} /> : null}
          </>
        }
        {...props}
        data-revealed={(masked && revealed) || undefined}
        autoComplete="off"
        spellCheck={false}
        // A secret is a Latin token; a plain value keeps the page direction unless `dir` is passed.
        dir={masked ? "ltr" : dir}
      />
      {masked ? <LiveRegion>{announced}</LiveRegion> : null}
    </>
  )
}
