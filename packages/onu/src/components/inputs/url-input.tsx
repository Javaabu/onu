"use client"

import { Icon } from "../../icons/icon"
import { setNativeValue } from "./_shared"
import { TextInput, type TextInputProps } from "./text-input"

const HAS_SCHEME = /^[a-z][a-z\d+.-]*:/i

/** Adds `protocol` to a URL that has no scheme (`example.mv` → `https://example.mv`). */
export function normalizeUrl(value: string, protocol = "https://"): string {
  const trimmed = value.trim()
  if (!trimmed || HAS_SCHEME.test(trimmed)) return trimmed
  return protocol + trimmed.replace(/^\/\//, "")
}

export interface UrlInputProps extends Omit<TextInputProps, "type" | "thaana" | "thaanaToggle"> {
  /** Added on blur when the URL has no scheme. `false` turns this off. Default `"https://"`. */
  defaultProtocol?: string | false
  /** Show a link icon at the inline start. Ignored when `startAddon` is set. */
  showIcon?: boolean
}

/**
 * URL input: `type="url"`, the URL keyboard on phones, always left-to-right,
 * and adds `https://` on blur when the user leaves it out.
 */
export function UrlInput({
  defaultProtocol = "https://",
  showIcon = false,
  startAddon,
  onBlur,
  ...props
}: UrlInputProps) {
  return (
    <TextInput
      type="url"
      inputMode="url"
      autoComplete="url"
      autoCapitalize="none"
      autoCorrect="off"
      spellCheck={false}
      startAddon={startAddon ?? (showIcon ? <Icon name="link" /> : undefined)}
      onBlur={(e) => {
        if (defaultProtocol !== false) {
          const next = normalizeUrl(e.currentTarget.value, defaultProtocol)
          if (next !== e.currentTarget.value) setNativeValue(e.currentTarget, next)
        }
        onBlur?.(e)
      }}
      {...props}
      dir="ltr"
    />
  )
}
