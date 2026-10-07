"use client"

import * as React from "react"

export type RadioVariant = "default" | "card"
export type RadioSize = "default" | "lg"

export interface RadioGroupContextValue {
  variant: RadioVariant
  size: RadioSize
  invalid?: boolean
  classNames?: { item?: string; label?: string; description?: string; indicator?: string }
}

export const RadioGroupStyleContext = React.createContext<RadioGroupContextValue>({
  variant: "default",
  size: "default",
})
