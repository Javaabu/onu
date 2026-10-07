"use client"

import * as React from "react"
import { DynamicIcon as LucideDynamicIcon, type IconName } from "lucide-react/dynamic"

import { cn } from "../lib/utils"
import { useIconContext } from "./icon-context"

export interface DynamicIconProps {
  /** Portable icon id, e.g. `lucide:house`, `tabler:home`, `fa:regular:house` (R6.7). */
  id: string
  label?: string
  className?: string
}

/** Splits `prefix:name` ids. Ids without a prefix are treated as Lucide names. */
export function parseIconId(id: string): { prefix: string; name: string } {
  const i = id.indexOf(":")
  return i === -1 ? { prefix: "lucide", name: id } : { prefix: id.slice(0, i), name: id.slice(i + 1) }
}

/** Renders a stored icon id from any configured icon source (Lucide built in). */
export function DynamicIcon({ id, label, className }: DynamicIconProps) {
  const { sources } = useIconContext()
  const { prefix, name } = parseIconId(id)
  const a11y = label ? { role: "img", "aria-label": label } : { "aria-hidden": true as const }

  if (prefix === "lucide") {
    return <LucideDynamicIcon name={name as IconName} className={cn("size-4", className)} {...a11y} />
  }

  const source = sources?.find((s) => s.prefixes.includes(prefix)) ?? sources?.find((s) => s.prefixes.includes("*"))
  if (!source) return null

  return (
    <span data-slot="icon" data-icon-id={id} className="contents" {...a11y}>
      {source.render(name, { className: cn("size-4", className), prefix })}
    </span>
  )
}
