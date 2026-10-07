"use client"

import * as React from "react"

import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { Badge } from "../../ui/badge"
import { Tabs, TabsList, TabsTrigger } from "../../ui/tabs"

export interface FilterTab {
  value: string
  label: string
  /** Number of records with this status. */
  count?: number
  disabled?: boolean
}

export interface FilterTabsProps extends Omit<
  React.ComponentProps<typeof Tabs>,
  "value" | "defaultValue" | "onValueChange" | "children"
> {
  tabs: FilterTab[]
  value?: string
  defaultValue?: string
  /** Called with the chosen tab. Listings go back to page 1. */
  onValueChange?: (value: string) => void
  variant?: "default" | "line"
  /** Id of the listing the tabs filter (set as `aria-controls`). */
  controls?: string
  classNames?: { list?: string; tab?: string; count?: string }
}

/**
 * Status tabs above a listing ("All 312 · Active 280 · Banned 32"). A tablist
 * that filters the list; arrow keys move between tabs (mirrored in RTL) and the
 * list scrolls sideways on narrow screens.
 */
export function FilterTabs({
  tabs,
  value,
  defaultValue,
  onValueChange,
  variant = "line",
  controls,
  className,
  classNames,
  ...props
}: FilterTabsProps) {
  const { t, locale } = useTranslation()
  const format = new Intl.NumberFormat(locale.numberLocale)
  return (
    <Tabs
      value={value}
      defaultValue={defaultValue ?? tabs[0]?.value}
      onValueChange={onValueChange}
      data-slot="filter-tabs"
      className={cn("min-w-0", className)}
      {...props}
    >
      <div className="-mx-1 px-1 no-scrollbar overflow-x-auto">
        <TabsList variant={variant} aria-label={t("listing.filterTabs")} className={cn("w-max", classNames?.list)}>
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              disabled={tab.disabled}
              aria-controls={controls}
              className={cn("gap-1.5 touch:min-h-11", classNames?.tab)}
            >
              {tab.count !== undefined ? `${tab.label} ` : tab.label}
              {tab.count !== undefined ? (
                <>
                  <Badge variant="secondary" className={cn("tabular-nums", classNames?.count)} aria-hidden="true">
                    {format.format(tab.count)}
                  </Badge>
                  <span className="sr-only">{`(${format.format(tab.count)})`}</span>
                </>
              ) : null}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
    </Tabs>
  )
}
