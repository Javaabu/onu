"use client"

import { cn } from "../../lib/utils"
import { CopyButton } from "./_shared"
import { TextInput, type TextInputProps } from "./text-input"

export interface CopyInputProps extends Omit<
  TextInputProps,
  "thaana" | "thaanaToggle" | "value" | "defaultValue" | "onChange" | "onCopy"
> {
  /** The value to show and copy. */
  value: string
  /** Called after the value is copied. */
  onCopy?: (value: string) => void
  /** Use the monospace font (IDs, keys, codes). */
  mono?: boolean
}

/**
 * A read-only value with a copy button, e.g. a share link or a reference
 * number. Focusing the input selects the whole value; the copy button
 * announces "Copied" to screen readers.
 */
export function CopyInput({ value, onCopy, mono = false, endAddon, className, classNames, ...props }: CopyInputProps) {
  return (
    <TextInput
      readOnly
      value={value}
      className={className}
      classNames={{ ...classNames, input: cn(mono && "font-mono", classNames?.input) }}
      onFocus={(e) => e.currentTarget.select()}
      endAddon={
        <>
          {endAddon}
          <CopyButton value={value} onCopy={onCopy} disabled={props.disabled} />
        </>
      }
      {...props}
      data-copy-input=""
    />
  )
}
