"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { REGEXP_ONLY_DIGITS, REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp"

import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "../../ui/input-otp"
import { useFormFieldControl } from "../form/form-field"
import { useControllableState } from "./_shared"
import { useMergedRef } from "./text-input"

export const otpSlotVariants = cva("", {
  variants: {
    size: {
      sm: "size-8 text-sm",
      default: "size-10 text-base touch:size-11",
      lg: "size-12 text-xl touch:size-12",
    },
  },
  defaultVariants: { size: "default" },
})

export interface OtpInputProps
  extends
    Omit<
      React.ComponentProps<"input">,
      "value" | "defaultValue" | "onChange" | "maxLength" | "size" | "pattern" | "children"
    >,
    VariantProps<typeof otpSlotVariants> {
  /** Number of characters. Default `6`. */
  length?: number
  /** Split the slots into groups, e.g. `3` for `123-456`. */
  groupSize?: number
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** Called once every slot is filled (including after a paste). */
  onComplete?: (code: string) => void
  /** Submit the surrounding form when the code is complete. */
  autoSubmit?: boolean
  /** Allow letters as well as digits. Default `false` (digits only, numeric keyboard). */
  alphanumeric?: boolean
  classNames?: { root?: string; group?: string; slot?: string; separator?: string }
}

/** Strips spaces and dashes from pasted codes ("123 456", "123-456"). */
export function cleanOtpPaste(text: string) {
  return text.replace(/[\s-]/g, "")
}

/**
 * One-time code input (shadcn `input-otp`): one slot per character, the
 * numeric keyboard on phones, `autocomplete="one-time-code"` so SMS codes are
 * offered, paste support, and an optional auto-submit when complete.
 */
export function OtpInput({
  length = 6,
  groupSize,
  value: valueProp,
  defaultValue = "",
  onValueChange,
  onComplete,
  autoSubmit = false,
  alphanumeric = false,
  size,
  className,
  classNames,
  ref,
  ...props
}: OtpInputProps) {
  const { t } = useTranslation()
  const local = React.useRef<HTMLInputElement>(null)
  const merged = useMergedRef(local, ref)
  const [value, setValue] = useControllableState(valueProp, defaultValue, onValueChange)
  const control = useFormFieldControl(props)
  const label = control["aria-label"] ?? (control["aria-labelledby"] || control.id ? undefined : t("input.otp"))

  const groups: number[][] = []
  const per = groupSize && groupSize > 0 ? groupSize : length
  for (let i = 0; i < length; i += per) groups.push(Array.from({ length: Math.min(per, length - i) }, (_, k) => i + k))

  return (
    <div dir="ltr" data-slot="otp-input" className={cn("w-fit", classNames?.root, className)}>
      <InputOTP
        {...control}
        ref={merged}
        aria-label={label}
        value={value}
        onChange={setValue}
        maxLength={length}
        pattern={alphanumeric ? REGEXP_ONLY_DIGITS_AND_CHARS : REGEXP_ONLY_DIGITS}
        inputMode={alphanumeric ? "text" : "numeric"}
        autoComplete="one-time-code"
        pasteTransformer={cleanOtpPaste}
        onComplete={(code: string) => {
          onComplete?.(code)
          if (autoSubmit) {
            const form = local.current?.form
            if (form) form.requestSubmit()
          }
        }}
        containerClassName="gap-2"
        dir="ltr"
      >
        {groups.map((slots, g) => (
          <React.Fragment key={g}>
            {g > 0 ? <InputOTPSeparator className={classNames?.separator} /> : null}
            <InputOTPGroup className={classNames?.group}>
              {slots.map((index) => (
                <InputOTPSlot
                  key={index}
                  index={index}
                  aria-invalid={control["aria-invalid"]}
                  className={cn(otpSlotVariants({ size }), classNames?.slot)}
                />
              ))}
            </InputOTPGroup>
          </React.Fragment>
        ))}
      </InputOTP>
    </div>
  )
}
