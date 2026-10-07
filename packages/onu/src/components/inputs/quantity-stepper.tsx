"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { InputGroupButton } from "../../ui/input-group"
import { useControllableState } from "./_shared"
import { NumberInput, type NumberInputProps } from "./number-input"

export const quantityStepperVariants = cva("", {
  variants: {
    size: {
      sm: "h-8 w-28",
      default: "h-10 w-36",
      lg: "h-12 w-44 text-lg",
    },
  },
  defaultVariants: { size: "default" },
})

const buttonSizes = {
  sm: "size-7 touch:size-11",
  default: "size-9 touch:size-11",
  lg: "size-11",
} as const

export interface QuantityStepperProps
  extends
    Omit<NumberInputProps, "value" | "defaultValue" | "onValueChange" | "startAddon" | "endAddon">,
    VariantProps<typeof quantityStepperVariants> {
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  /** Delay before press-and-hold starts repeating, in ms. Default `400`. */
  repeatDelay?: number
  /** Interval between repeats while held, in ms. Default `80`. */
  repeatInterval?: number
  classNames?: NumberInputProps["classNames"] & { decrement?: string; increment?: string }
}

/**
 * Starts `action` on pointer down and repeats it while the pointer is held
 * (press-and-hold). Keyboard activation (Enter/Space) runs it once.
 */
function usePressRepeat(action: () => boolean, delay: number, interval: number) {
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined)
  const actionRef = React.useRef(action)
  React.useEffect(() => {
    actionRef.current = action
  })
  const stop = React.useCallback(() => {
    clearTimeout(timer.current)
    clearInterval(timer.current)
    timer.current = undefined
  }, [])
  React.useEffect(() => stop, [stop])

  return {
    onPointerDown: (e: React.PointerEvent<HTMLButtonElement>) => {
      if (e.button !== 0) return
      e.preventDefault()
      stop()
      if (!actionRef.current()) return
      timer.current = setTimeout(() => {
        timer.current = setInterval(() => {
          if (!actionRef.current()) stop()
        }, interval)
      }, delay)
      window.addEventListener("pointerup", stop, { once: true })
      window.addEventListener("pointercancel", stop, { once: true })
    },
    onPointerLeave: stop,
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
      // Pointer presses are handled on pointer down; detail 0 means keyboard or assistive tech.
      if (e.detail === 0) actionRef.current()
    },
  }
}

/**
 * A number with large − and + buttons: press-and-hold repeats, keyboard
 * arrows step, and the value stays within `min` / `max`. For cart quantities,
 * guest counts and the like.
 */
export function QuantityStepper({
  value: valueProp,
  defaultValue,
  onValueChange,
  min = 0,
  max,
  step = 1,
  size = "default",
  repeatDelay = 400,
  repeatInterval = 80,
  className,
  classNames,
  disabled,
  readOnly,
  ...props
}: QuantityStepperProps) {
  const { t } = useTranslation()
  const [value, setValue] = useControllableState<number>(valueProp, defaultValue ?? min, onValueChange)
  const latest = React.useRef(value)
  React.useEffect(() => {
    latest.current = value
  }, [value])

  const change = (delta: number) => () => {
    const next = Math.min(max ?? Infinity, Math.max(min, Number((latest.current + delta).toFixed(10))))
    if (next === latest.current) return false
    latest.current = next
    setValue(next)
    return true
  }
  const dec = usePressRepeat(change(-step), repeatDelay, repeatInterval)
  const inc = usePressRepeat(change(step), repeatDelay, repeatInterval)
  // Buttons at a limit use aria-disabled, not disabled: a disabled descendant would grey out the whole group.
  const inactive = disabled || readOnly
  const btn = buttonSizes[size ?? "default"]

  return (
    <NumberInput
      {...props}
      value={value}
      onValueChange={(n) => setValue(n ?? min)}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      readOnly={readOnly}
      data-size={size}
      className={cn(quantityStepperVariants({ size }), "touch:h-12", className)}
      classNames={{ ...classNames, input: cn("font-medium text-center", classNames?.input) }}
      startAddon={
        <InputGroupButton
          size="icon-sm"
          variant="ghost"
          tabIndex={-1}
          data-slot="quantity-decrement"
          aria-label={t("input.decrement")}
          disabled={inactive}
          aria-disabled={value <= min || undefined}
          className={cn(btn, "aria-disabled:pointer-events-none aria-disabled:opacity-40", classNames?.decrement)}
          {...dec}
        >
          <Icon name="minus" />
        </InputGroupButton>
      }
      endAddon={
        <InputGroupButton
          size="icon-sm"
          variant="ghost"
          tabIndex={-1}
          data-slot="quantity-increment"
          aria-label={t("input.increment")}
          disabled={inactive}
          aria-disabled={(max !== undefined && value >= max) || undefined}
          className={cn(btn, "aria-disabled:pointer-events-none aria-disabled:opacity-40", classNames?.increment)}
          {...inc}
        >
          <Icon name="plus" />
        </InputGroupButton>
      }
    />
  )
}
