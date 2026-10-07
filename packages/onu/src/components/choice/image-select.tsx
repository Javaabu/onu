"use client"

import * as React from "react"
import { Checkbox as CheckboxPrimitive, RadioGroup as RadioGroupPrimitive } from "radix-ui"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { useFormField, useFormFieldControl } from "../form/form-field"
import type { SelectionProps } from "./_selection"

export interface ImageOption {
  value: string
  /** Name of the option (shown under the image, and its accessible name). */
  label: string
  /** Image URL. */
  src: string
  /** Alternative text for the image (R14.10). Use `""` when the label already says it all. */
  alt: string
  description?: React.ReactNode
  disabled?: boolean
}

export type ImageSelectProps = SelectionProps &
  Omit<React.ComponentProps<"div">, "defaultValue" | "onChange" | "dir"> & {
    options: ReadonlyArray<ImageOption>
    /** Image shape. Default `square`. */
    aspectRatio?: "square" | "video" | "portrait" | number
    /** Minimum tile width; the grid fits as many columns as the container allows. Default `8rem`. */
    minItemWidth?: string
    /** Show labels under the images. Default `true`. */
    showLabels?: boolean
    /** Multi only: maximum number of choices. */
    max?: number
    name?: string
    disabled?: boolean
    required?: boolean
    classNames?: { item?: string; image?: string; label?: string; indicator?: string }
  }

const ASPECT: Record<string, string> = {
  square: "aspect-square",
  video: "aspect-video",
  portrait: "aspect-[3/4]",
}

const tileClasses = [
  "group/image-tile relative flex flex-col gap-1.5 rounded-lg border border-border bg-card p-1.5 text-start text-sm outline-none transition-colors",
  "hover:bg-muted/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "data-[state=checked]:border-primary data-[state=checked]:ring-2 data-[state=checked]:ring-primary",
  "aria-invalid:border-destructive disabled:cursor-not-allowed disabled:opacity-50",
]

/**
 * A grid of image options: one choice (radio semantics) or several
 * (`multiple`, checkbox semantics). Tiles fit the container width, so the grid
 * works in narrow columns and on phones.
 */
export function ImageSelect(props: ImageSelectProps) {
  const {
    multiple,
    value: valueProp,
    defaultValue,
    onValueChange,
    options,
    aspectRatio = "square",
    minItemWidth = "8rem",
    showLabels = true,
    max,
    className,
    classNames,
    style,
    ...rest
  } = props
  const { t } = useTranslation()
  const field = useFormField()
  const control = useFormFieldControl(rest as Record<string, unknown>) as React.ComponentProps<"div"> & {
    name?: string
    disabled?: boolean
    required?: boolean
  }
  const { name, disabled, required, ...divProps } = control
  const labelledBy = divProps["aria-labelledby"] ?? (field && !divProps["aria-label"] ? field.labelId : undefined)
  const baseId = React.useId()
  const isMulti = multiple === true
  const [inner, setInner] = React.useState<string[]>(() =>
    defaultValue === undefined || defaultValue === null
      ? []
      : Array.isArray(defaultValue)
        ? defaultValue
        : [defaultValue],
  )
  const values =
    valueProp === undefined ? inner : valueProp === null ? [] : Array.isArray(valueProp) ? valueProp : [valueProp]

  const emit = (next: string[]) => {
    if (valueProp === undefined) setInner(next)
    if (isMulti) (onValueChange as ((v: string[]) => void) | undefined)?.(next)
    else (onValueChange as ((v: string | null) => void) | undefined)?.(next[0] ?? null)
  }

  const aspect = typeof aspectRatio === "number" ? undefined : ASPECT[aspectRatio]
  const gridStyle = {
    ...style,
    gridTemplateColumns: `repeat(auto-fill, minmax(min(100%, ${minItemWidth}), 1fr))`,
  } as React.CSSProperties
  const atMax = isMulti && max !== undefined && values.length >= max

  const tile = (o: ImageOption, checked: boolean) => {
    const labelId = `${baseId}-${o.value}`
    return (
      <>
        <span
          className={cn("relative block w-full overflow-hidden rounded-md bg-muted", aspect, classNames?.image)}
          style={typeof aspectRatio === "number" ? { aspectRatio: String(aspectRatio) } : undefined}
        >
          <img src={o.src} alt={o.alt} loading="lazy" className="size-full object-cover" />
        </span>
        <span
          data-slot="image-select-indicator"
          aria-hidden="true"
          className={cn(
            "top-3 end-3 size-5 shadow-sm absolute flex items-center justify-center border-2 border-background bg-primary text-primary-foreground",
            isMulti ? "rounded-md" : "rounded-full",
            checked ? "flex" : "hidden",
            classNames?.indicator,
          )}
        >
          <Icon name="check" className="size-3" />
        </span>
        {showLabels ? (
          <span className={cn("px-0.5 pb-0.5 gap-0.5 grid", classNames?.label)}>
            <span id={labelId} className="font-medium truncate">
              {o.label}
            </span>
            {o.description ? <span className="text-xs text-muted-foreground">{o.description}</span> : null}
          </span>
        ) : null}
      </>
    )
  }

  const nameProps = (o: ImageOption) =>
    showLabels ? { "aria-labelledby": `${baseId}-${o.value}` } : { "aria-label": o.label }

  if (isMulti) {
    return (
      <div
        role="group"
        data-slot="image-select"
        {...divProps}
        aria-labelledby={labelledBy}
        aria-required={undefined}
        style={gridStyle}
        className={cn("gap-2 grid", className)}
      >
        {options.map((o) => {
          const checked = values.includes(o.value)
          return (
            <CheckboxPrimitive.Root
              key={o.value}
              data-slot="image-select-item"
              value={o.value}
              checked={checked}
              disabled={disabled || o.disabled || (atMax && !checked)}
              aria-invalid={divProps["aria-invalid"]}
              onCheckedChange={(c) => emit(c ? [...values, o.value] : values.filter((v) => v !== o.value))}
              className={cn(tileClasses, classNames?.item)}
              {...nameProps(o)}
            >
              {tile(o, checked)}
            </CheckboxPrimitive.Root>
          )
        })}
        {name
          ? values.map((v) => <input key={v} type="hidden" name={name.endsWith("[]") ? name : `${name}[]`} value={v} />)
          : null}
        {atMax ? (
          <p className="text-xs col-span-full text-muted-foreground" aria-live="polite">
            {t("choice.maxReached", { count: max })}
          </p>
        ) : null}
      </div>
    )
  }

  return (
    <RadioGroupPrimitive.Root
      data-slot="image-select"
      {...(divProps as Omit<React.ComponentProps<typeof RadioGroupPrimitive.Root>, "dir">)}
      aria-labelledby={labelledBy}
      name={name}
      required={required}
      disabled={disabled}
      value={values[0] ?? ""}
      onValueChange={(v) => emit([v])}
      style={gridStyle}
      className={cn("gap-2 grid", className)}
    >
      {options.map((o) => {
        const checked = values[0] === o.value
        return (
          <RadioGroupPrimitive.Item
            key={o.value}
            data-slot="image-select-item"
            value={o.value}
            disabled={o.disabled}
            aria-invalid={divProps["aria-invalid"]}
            className={cn(tileClasses, classNames?.item)}
            {...nameProps(o)}
          >
            {tile(o, checked)}
          </RadioGroupPrimitive.Item>
        )
      })}
    </RadioGroupPrimitive.Root>
  )
}
