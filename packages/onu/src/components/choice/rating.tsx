"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useOnu, useTranslation } from "../../providers/onu-provider"
import { useFormField, useFormFieldControl } from "../form/form-field"
import { useControllableState } from "./_hooks"

export const ratingVariants = cva("inline-flex items-center", {
  variants: {
    size: {
      sm: "gap-0.5 [&_[data-slot=rating-star]]:size-4",
      default: "gap-1 [&_[data-slot=rating-star]]:size-5",
      lg: "gap-1.5 [&_[data-slot=rating-star]]:size-8",
    },
  },
  defaultVariants: { size: "default" },
})

export interface RatingProps
  extends Omit<React.ComponentProps<"div">, "defaultValue" | "onChange">, VariantProps<typeof ratingVariants> {
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  /** Number of stars. Default 5. */
  max?: number
  /** Allow half stars. */
  allowHalf?: boolean
  /** Show the value without letting it change. */
  readOnly?: boolean
  disabled?: boolean
  /** Clicking the current value again clears it. Default `true`. */
  clearable?: boolean
  /** Name of a hidden input for form submission. */
  name?: string
  /** Icon name for the symbol. Default `star`. */
  icon?: string
  classNames?: { star?: string; filled?: string }
}

function Star({
  fill,
  icon,
  className,
  filledClassName,
}: {
  fill: number
  icon: string
  className?: string
  filledClassName?: string
}) {
  return (
    <span data-slot="rating-star" data-fill={fill} className={cn("relative inline-flex shrink-0", className)}>
      <Icon name={icon} className="size-full text-muted-foreground/40" />
      {fill > 0 ? (
        <Icon
          name={icon}
          className={cn(
            "inset-0 absolute size-full fill-current text-warning",
            // A half star clips the filled icon to its reading-start half.
            fill < 1 && "[clip-path:inset(0_50%_0_0)] rtl:[clip-path:inset(0_0_0_50%)]",
            filledClassName,
          )}
        />
      ) : null}
    </span>
  )
}

/**
 * A star rating. Interactive ratings are a `slider` for assistive tech (arrow
 * keys, Home/End, number keys); read-only ratings are an image with a text
 * alternative. Supports half stars and RTL (stars fill from the right).
 */
export function Rating({
  value: valueProp,
  defaultValue = 0,
  onValueChange,
  max = 5,
  allowHalf = false,
  readOnly = false,
  disabled: disabledProp,
  clearable = true,
  name: nameProp,
  icon = "star",
  size,
  className,
  classNames,
  ...props
}: RatingProps) {
  const { t, locale } = useTranslation()
  const { dir } = useOnu()
  const field = useFormField()
  const control = useFormFieldControl({ ...props, name: nameProp, disabled: disabledProp } as Record<
    string,
    unknown
  >) as React.ComponentProps<"div"> & { name?: string; disabled?: boolean; required?: boolean }
  // `aria-required` is not supported on role="slider".
  const { name, disabled, required: _required, "aria-required": _ariaRequired, ...rest } = control
  const [value, setValue] = useControllableState<number>(valueProp, defaultValue, onValueChange)
  const [hover, setHover] = React.useState<number | null>(null)
  const step = allowHalf ? 0.5 : 1
  const shown = hover ?? value
  const nf = new Intl.NumberFormat(locale.numberLocale, { maximumFractionDigits: 1 })
  const text = value > 0 ? t("choice.ratingValue", { value: nf.format(value), max }) : t("choice.notRated")
  const interactive = !readOnly && !disabled

  const clamp = (v: number) => Math.min(max, Math.max(0, Math.round(v / step) * step))
  const commit = (v: number) => {
    const next = clamp(v)
    setValue(clearable && next === value ? 0 : next)
  }

  /** Value under the pointer: the half of the star nearest the reading start counts as half. */
  const valueAt = (e: React.PointerEvent<HTMLElement>, index: number) => {
    if (!allowHalf) return index + 1
    const rect = e.currentTarget.getBoundingClientRect()
    const fromStart = dir === "rtl" ? rect.right - e.clientX : e.clientX - rect.left
    return fromStart < rect.width / 2 ? index + 0.5 : index + 1
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    rest.onKeyDown?.(e)
    if (!interactive || e.defaultPrevented) return
    const forward = dir === "rtl" ? "ArrowLeft" : "ArrowRight"
    const backward = dir === "rtl" ? "ArrowRight" : "ArrowLeft"
    let next: number | null = null
    if (e.key === forward || e.key === "ArrowUp") next = value + step
    else if (e.key === backward || e.key === "ArrowDown") next = value - step
    else if (e.key === "Home") next = 0
    else if (e.key === "End") next = max
    else if (/^[0-9]$/.test(e.key)) next = Number(e.key)
    if (next === null) return
    e.preventDefault()
    setValue(clamp(next))
  }

  const stars = Array.from({ length: max }, (_, i) => {
    const fill = shown >= i + 1 ? 1 : shown >= i + 0.5 ? 0.5 : 0
    const star = <Star fill={fill} icon={icon} className={classNames?.star} filledClassName={classNames?.filled} />
    if (!interactive) return <React.Fragment key={i}>{star}</React.Fragment>
    return (
      <span
        key={i}
        aria-hidden="true"
        className="touch:p-1.5 cursor-pointer"
        onPointerMove={(e) => setHover(valueAt(e, i))}
        onClick={(e) => commit(valueAt(e as unknown as React.PointerEvent<HTMLElement>, i))}
      >
        {star}
      </span>
    )
  })

  if (!interactive) {
    return (
      <div
        role="img"
        aria-label={text}
        data-slot="rating"
        data-readonly={readOnly || undefined}
        data-disabled={disabled || undefined}
        {...rest}
        className={cn(ratingVariants({ size }), disabled && "opacity-50", className)}
      >
        {stars}
        {name ? <input type="hidden" name={name} value={value} /> : null}
      </div>
    )
  }

  return (
    <div
      role="slider"
      tabIndex={0}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-valuetext={text}
      aria-labelledby={field && !rest["aria-label"] ? field.labelId : undefined}
      data-slot="rating"
      {...rest}
      onKeyDown={onKeyDown}
      onPointerLeave={(e) => {
        rest.onPointerLeave?.(e)
        setHover(null)
      }}
      className={cn(
        ratingVariants({ size }),
        "rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        className,
      )}
    >
      {stars}
      {name ? <input type="hidden" name={name} value={value} /> : null}
    </div>
  )
}
