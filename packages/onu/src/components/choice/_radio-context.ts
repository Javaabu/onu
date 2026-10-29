"use client"

import * as React from "react"

export type RadioVariant = "default" | "card" | "image"
export type RadioSize = "default" | "lg"
/** Image variant: the shape of each image. */
export type RadioImageAspect = "square" | "video" | "portrait" | number

export interface RadioGroupContextValue {
  variant: RadioVariant
  size: RadioSize
  invalid?: boolean
  aspectRatio?: RadioImageAspect
  classNames?: { item?: string; label?: string; description?: string; indicator?: string }
}

export const RadioGroupStyleContext = React.createContext<RadioGroupContextValue>({
  variant: "default",
  size: "default",
})
