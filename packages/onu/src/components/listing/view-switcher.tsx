"use client"

import * as React from "react"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { ToggleGroup, ToggleGroupItem } from "../../ui/toggle-group"

export type ListingView = "table" | "list" | "grid" | "kanban" | (string & {})

export interface ViewOption {
  value: ListingView
  label: string
  /** Semantic icon name. */
  icon: string
}

export interface ViewSwitcherProps extends Omit<
  React.ComponentProps<typeof ToggleGroup>,
  "type" | "value" | "defaultValue" | "onValueChange"
> {
  value?: ListingView
  defaultValue?: ListingView
  onValueChange?: (view: ListingView) => void
  /** Which views to offer. Default table, list, grid and kanban. Strings use the built-in labels and icons. */
  views?: (ListingView | ViewOption)[]
  /** Show the labels next to the icons. Default `false` (labels are still the accessible names). */
  showLabels?: boolean
}

const BUILT_IN: Record<string, { icon: string; key: string }> = {
  table: { icon: "table", key: "listing.viewTable" },
  list: { icon: "list", key: "listing.viewList" },
  grid: { icon: "grid", key: "listing.viewGrid" },
  kanban: { icon: "kanban", key: "listing.viewKanban" },
}

/**
 * Switches a listing between table, list, grid and board views. A single-choice
 * toggle group: arrow keys move between views (mirrored in RTL).
 */
export function ViewSwitcher({
  value,
  defaultValue = "table",
  onValueChange,
  views = ["table", "list", "grid", "kanban"],
  showLabels = false,
  className,
  ...props
}: ViewSwitcherProps) {
  const { t } = useTranslation()
  const [internal, setInternal] = React.useState<ListingView>(defaultValue)
  const current = value ?? internal

  const options: ViewOption[] = views.map((view) => {
    if (typeof view !== "string") return view
    const known = BUILT_IN[view]
    return { value: view, label: known ? t(known.key) : view, icon: known?.icon ?? "grid" }
  })

  return (
    <ToggleGroup
      type="single"
      variant="outline"
      size="sm"
      data-slot="view-switcher"
      aria-label={t("listing.view")}
      value={current}
      onValueChange={(next) => {
        if (!next) return
        setInternal(next)
        onValueChange?.(next)
      }}
      className={cn("w-fit", className)}
      {...props}
    >
      {options.map((option) => (
        <ToggleGroupItem
          key={option.value}
          value={option.value}
          aria-label={showLabels ? undefined : option.label}
          title={showLabels ? undefined : option.label}
          className="touch:min-h-11 touch:min-w-11"
        >
          <Icon name={option.icon} />
          {showLabels ? <span>{option.label}</span> : null}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}
