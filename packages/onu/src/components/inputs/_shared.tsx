"use client"

import * as React from "react"

import { LiveRegion } from "../../a11y/live-region"
import { Icon } from "../../icons/icon"
import { useCopyToClipboard } from "../../hooks/use-copy-to-clipboard"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { InputGroupButton } from "../../ui/input-group"
import { registerEnglish } from "../../i18n/english"
import { input as en_input } from "../../locales/en/input"

registerEnglish({ input: en_input })

export interface CopyButtonProps extends Omit<React.ComponentProps<typeof InputGroupButton>, "onCopy" | "value"> {
  value: string
  onCopy?: (value: string) => void
}

/** Icon button for input groups that copies `value` and announces "Copied". */
export function CopyButton({ value, onCopy, className, disabled, ...props }: CopyButtonProps) {
  const { t } = useTranslation()
  const { status, copy } = useCopyToClipboard()
  return (
    <>
      <InputGroupButton
        size="icon-xs"
        data-part="copy-button"
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
      <LiveRegion>
        {status === "copied" ? t("input.copied") : status === "failed" ? t("input.copyFailed") : null}
      </LiveRegion>
    </>
  )
}

/** Sets an input's value the way a user would, so React `onChange` and form libraries see it. */
export function setNativeValue(el: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set
  setter?.call(el, value)
  el.dispatchEvent(new Event("input", { bubbles: true }))
}
