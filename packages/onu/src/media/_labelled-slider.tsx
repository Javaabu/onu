"use client"

import * as React from "react"
import { Slider as SliderPrimitive } from "radix-ui"

import { cn } from "../lib/utils"

export interface LabelledSliderProps extends Omit<React.ComponentProps<typeof SliderPrimitive.Root>, "aria-label"> {
  /** Accessible name, placed on the thumb (the focusable slider). */
  label: string
  /** Spoken value, e.g. "150%". */
  valueText?: string
}

/** A single-thumb Radix slider whose thumb carries the accessible name (used by the cropper). */
export function LabelledSlider({ label, valueText, className, ...props }: LabelledSliderProps) {
  return (
    <SliderPrimitive.Root
      data-slot="slider"
      className={cn("relative flex w-full touch-none items-center select-none data-disabled:opacity-50", className)}
      {...props}
    >
      <SliderPrimitive.Track className="h-1 relative grow overflow-hidden rounded-full bg-muted">
        <SliderPrimitive.Range className="absolute h-full bg-primary" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        aria-label={label}
        aria-valuetext={valueText}
        className="size-4 touch:size-6 shadow-sm block rounded-full border-2 border-primary bg-background ring-ring/50 outline-none focus-visible:ring-3"
      />
    </SliderPrimitive.Root>
  )
}
