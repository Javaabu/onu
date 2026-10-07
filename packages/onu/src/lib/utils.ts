import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

/** Onu's fluid type steps (`text-fluid-*`, R3.4), so they merge as font sizes, not colours. */
export const FLUID_TEXT_STEPS = ["sm", "base", "lg", "xl", "2xl", "3xl", "4xl", "5xl"] as const

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: FLUID_TEXT_STEPS.map((step) => `fluid-${step}`) }],
    },
  },
})

/** Merges class names, letting later Tailwind classes override earlier ones. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
