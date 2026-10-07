"use client"

import { Icon } from "../../icons/icon"
import { TextInput, type TextInputProps } from "./text-input"

export interface EmailInputProps extends Omit<TextInputProps, "type" | "thaana" | "thaanaToggle"> {
  /** Show a mail icon at the inline start. Ignored when `startAddon` is set. */
  showIcon?: boolean
}

/**
 * Email address input: `type="email"`, the email keyboard on phones, browser
 * autofill, and always left-to-right, even on a Dhivehi page (R11.7).
 */
export function EmailInput({ showIcon = false, startAddon, autoComplete = "email", ...props }: EmailInputProps) {
  return (
    <TextInput
      type="email"
      inputMode="email"
      autoComplete={autoComplete}
      autoCapitalize="none"
      autoCorrect="off"
      spellCheck={false}
      startAddon={startAddon ?? (showIcon ? <Icon name="mail" /> : undefined)}
      {...props}
      dir="ltr"
    />
  )
}
