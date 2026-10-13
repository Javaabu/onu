"use client"

import * as React from "react"
import { cva } from "class-variance-authority"
import { RadioGroup as RadioGroupPrimitive } from "radix-ui"

import { cn } from "../../lib/utils"
import { RadioGroupItem } from "../../ui/radio-group"
import { ChoiceLabelLayout, joinIds } from "./_choice-label"
import { RadioGroupStyleContext, type RadioSize, type RadioVariant } from "./_radio-context"

/** The selectable card used by `variant="card"` (also by payment and image selects). */
export const radioCardVariants = cva(
  [
    "group/radio-card min-w-0 gap-3 relative flex w-full items-start rounded-lg border border-border bg-card text-start text-card-foreground transition-colors outline-none",
    "hover:border-primary-5 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
    "data-[state=checked]:border-primary data-[state=checked]:bg-primary-1 data-[state=checked]:ring-1 data-[state=checked]:ring-primary",
    "disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive",
  ],
  {
    variants: {
      size: {
        default: "p-3.5 min-h-11",
        lg: "p-5 min-h-20 gap-4 text-base",
      },
    },
    defaultVariants: { size: "default" },
  },
)

export interface RadioProps extends Omit<React.ComponentProps<typeof RadioGroupPrimitive.Item>, "children"> {
  /** Visible label. */
  label?: React.ReactNode
  /** Secondary text. */
  description?: React.ReactNode
  /** Icon, logo or image shown in the card (card variant). */
  media?: React.ReactNode
  /** Extra content at the end of a card, e.g. a price. */
  aside?: React.ReactNode
  /** Override the group's variant for this item. */
  variant?: RadioVariant
  size?: RadioSize
  classNames?: { root?: string; label?: string; description?: string; indicator?: string }
}

function Indicator({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      data-slot="radio-indicator"
      className={cn(
        "size-4 flex shrink-0 items-center justify-center rounded-full border border-input bg-card",
        "group-data-[state=checked]/radio-card:border-primary group-data-[state=checked]/radio-card:bg-primary",
        className,
      )}
    >
      <span className="size-1.5 hidden rounded-full bg-primary-foreground group-data-[state=checked]/radio-card:block" />
    </span>
  )
}

/**
 * One radio button with a label and description. Use inside a `RadioGroup`;
 * in the `card` variant the whole card is the control.
 */
export function Radio({
  label,
  description,
  media,
  aside,
  variant: variantProp,
  size: sizeProp,
  id: idProp,
  className,
  classNames,
  ...props
}: RadioProps) {
  const group = React.useContext(RadioGroupStyleContext)
  const variant = variantProp ?? group.variant
  const size = sizeProp ?? group.size
  const generated = React.useId()
  const id = idProp ?? `radio-${generated}`
  const labelId = label ? `${id}-label` : undefined
  const descriptionId = description ? `${id}-description` : undefined
  const invalid = props["aria-invalid"] ?? (group.invalid || undefined)

  if (variant === "card") {
    return (
      <RadioGroupPrimitive.Item
        data-slot="radio-card"
        data-size={size}
        id={id}
        aria-labelledby={labelId}
        aria-describedby={joinIds(props["aria-describedby"], descriptionId)}
        aria-invalid={invalid}
        {...props}
        className={cn(radioCardVariants({ size }), group.classNames?.item, classNames?.root, className)}
      >
        <Indicator className={cn("mt-0.5", group.classNames?.indicator, classNames?.indicator)} />
        {media ? (
          <span data-slot="radio-card-media" className="flex shrink-0 items-center">
            {media}
          </span>
        ) : null}
        <span className="min-w-0 gap-0.5 grid flex-1">
          {label ? (
            <span id={labelId} className={cn("font-medium leading-5", group.classNames?.label, classNames?.label)}>
              {label}
            </span>
          ) : null}
          {description ? (
            <span
              id={descriptionId}
              className={cn("text-sm text-muted-foreground", group.classNames?.description, classNames?.description)}
            >
              {description}
            </span>
          ) : null}
        </span>
        {aside ? <span className="text-sm font-medium ms-auto shrink-0">{aside}</span> : null}
      </RadioGroupPrimitive.Item>
    )
  }

  const item = (
    <RadioGroupItem
      id={id}
      aria-describedby={joinIds(props["aria-describedby"], descriptionId)}
      aria-invalid={invalid}
      {...props}
      className={cn(
        "touch:after:-inset-3.5",
        size === "lg" && "size-5 [&_[data-slot=radio-group-indicator]]:size-5",
        group.classNames?.indicator,
        classNames?.indicator,
        !label && !description && className,
      )}
    />
  )
  if (!label && !description) return item

  return (
    <ChoiceLabelLayout
      slot="radio-field"
      control={item}
      htmlFor={id}
      label={label}
      description={description}
      descriptionId={descriptionId}
      disabled={props.disabled}
      className={className}
      classNames={{
        root: cn(group.classNames?.item, classNames?.root),
        label: cn(group.classNames?.label, classNames?.label),
        description: cn(group.classNames?.description, classNames?.description),
      }}
    />
  )
}
