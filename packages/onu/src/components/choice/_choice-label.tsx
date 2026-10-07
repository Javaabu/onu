"use client"

import * as React from "react"

import { cn } from "../../lib/utils"
import { Label } from "../../ui/label"

export interface ChoiceLabelClassNames {
  root?: string
  label?: string
  description?: string
}

/**
 * Control + label + description, the label-beside-control pattern used by
 * checkboxes, radios and switches in both form layouts (R3.34).
 */
export function ChoiceLabelLayout({
  slot,
  control,
  htmlFor,
  labelId,
  label,
  description,
  descriptionId,
  disabled,
  position = "end",
  align = "start",
  className,
  classNames,
}: {
  slot: string
  control: React.ReactNode
  htmlFor: string
  labelId?: string
  label?: React.ReactNode
  description?: React.ReactNode
  descriptionId?: string
  disabled?: boolean
  /** Label after (default) or before the control. */
  position?: "start" | "end"
  align?: "start" | "center"
  className?: string
  classNames?: ChoiceLabelClassNames
}) {
  return (
    <div
      data-slot={slot}
      data-disabled={disabled || undefined}
      className={cn(
        "gap-2.5 flex",
        align === "center" ? "items-center" : "items-start",
        position === "start" && "flex-row-reverse justify-end",
        className,
        classNames?.root,
      )}
    >
      <span className={cn("flex shrink-0 items-center", align === "start" && "min-h-5")}>{control}</span>
      <div className="min-w-0 gap-1 grid">
        {label ? (
          <Label
            id={labelId}
            htmlFor={htmlFor}
            className={cn("leading-5 font-normal", disabled && "opacity-50", classNames?.label)}
          >
            {label}
          </Label>
        ) : null}
        {description ? (
          <p
            id={descriptionId}
            className={cn("text-sm text-muted-foreground", disabled && "opacity-50", classNames?.description)}
          >
            {description}
          </p>
        ) : null}
      </div>
    </div>
  )
}

/** Joins ids for aria-describedby, dropping empty ones. */
export function joinIds(...ids: (string | undefined | null | false)[]) {
  return ids.filter(Boolean).join(" ") || undefined
}
