"use client"

import * as React from "react"

import { useIsMobile } from "../../hooks/use-mobile"
import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { Badge } from "../../ui/badge"
import { Button } from "../../ui/button"
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "../../ui/drawer"
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover"
import { FilterControl } from "./_filter-controls"
import type { FilterDefinition, FilterValue, FilterValues } from "./listing-types"
import { cleanFilters, isFilterValueEmpty } from "./use-listing-state"

export type { FilterDefinition } from "./listing-types"

export interface FilterPanelProps {
  /** The filters on offer. */
  filters: FilterDefinition[]
  /** The applied filters. */
  value: FilterValues
  /** Called with the new filters on Apply, and with `{}` on Clear all. */
  onApply: (filters: FilterValues) => void
  /** Controlled open state. */
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** Force the bottom sheet (`true`) or the dropdown (`false`). Defaults to the bottom sheet below 768px. */
  sheet?: boolean
  /** Replace the trigger button's content. */
  trigger?: React.ReactNode
  /** Dropdown alignment. Default `start`. */
  align?: "start" | "center" | "end"
  className?: string
  classNames?: {
    trigger?: string
    badge?: string
    content?: string
    body?: string
    filter?: string
    label?: string
    footer?: string
  }
}

/**
 * The Filters button and panel (§25.7): a dropdown on desktop and a bottom sheet
 * on phones. Changes are a draft until Apply; Cancel, Escape or clicking outside
 * throw them away, and reopening shows the applied filters. Clear all removes
 * every filter at once. The button shows how many filters are applied.
 */
export function FilterPanel({
  filters,
  value,
  onApply,
  open: openProp,
  onOpenChange,
  sheet,
  trigger,
  align = "start",
  className,
  classNames,
}: FilterPanelProps) {
  const { t, locale } = useTranslation()
  const isMobile = useIsMobile()
  const useSheet = sheet ?? isMobile
  const baseId = React.useId()
  const triggerRef = React.useRef<HTMLButtonElement>(null)

  const [openState, setOpenState] = React.useState(false)
  const open = openProp ?? openState
  const [draft, setDraft] = React.useState<FilterValues>(value)

  const setOpen = (next: boolean) => {
    // Reopening always starts from the applied filters (§25.7).
    if (next) setDraft(value)
    setOpenState(next)
    onOpenChange?.(next)
  }

  const [prevOpen, setPrevOpen] = React.useState(open)
  if (prevOpen !== open) {
    setPrevOpen(open)
    if (open) setDraft(value)
  }

  const count = Object.values(cleanFilters(value)).length
  const format = new Intl.NumberFormat(locale.numberLocale)

  const apply = () => {
    onApply(cleanFilters(draft))
    setOpen(false)
  }
  const clearAll = () => {
    onApply({})
    setOpen(false)
  }

  const setDraftValue = (key: string, next: FilterValue | undefined) => setDraft((prev) => ({ ...prev, [key]: next }))

  const body = (
    <div className={cn("gap-4 grid", classNames?.body)} data-slot="filter-panel-body">
      {filters.map((definition) => {
        const id = `${baseId}-${definition.key}`
        const labelId = `${id}-label`
        const current = draft[definition.key]
        return (
          <div key={definition.key} className={cn("gap-1.5 grid", classNames?.filter)} data-slot="filter-panel-filter">
            <div className="gap-2 flex items-center justify-between">
              <span id={labelId} className={cn("text-sm font-medium", classNames?.label)}>
                {definition.label}
              </span>
              {!isFilterValueEmpty(current) ? (
                <Button
                  variant="link"
                  size="xs"
                  className="px-0 touch:min-h-11 h-auto"
                  aria-label={t("listing.clearFilterNamed", { name: definition.label })}
                  onClick={() => setDraftValue(definition.key, undefined)}
                >
                  {t("listing.clearFilter")}
                </Button>
              ) : null}
            </div>
            <FilterControl
              definition={definition}
              value={current}
              onChange={(next) => setDraftValue(definition.key, next)}
              id={id}
              labelId={labelId}
            />
          </div>
        )
      })}
    </div>
  )

  const footer = (
    <div
      className={cn(
        "gap-2 flex items-center",
        useSheet ? "sm:flex-row flex-col-reverse items-stretch" : "pt-3 border-t",
        classNames?.footer,
      )}
      data-slot="filter-panel-footer"
    >
      <Button
        variant="ghost"
        onClick={clearAll}
        disabled={count === 0}
        className={cn(!useSheet && "me-auto", "touch:min-h-11")}
      >
        {t("listing.clearAllFilters")}
      </Button>
      <Button variant="outline" onClick={() => setOpen(false)} className="touch:min-h-11">
        {t("listing.cancel")}
      </Button>
      <Button onClick={apply} className="touch:min-h-11">
        {t("listing.applyFilters")}
      </Button>
    </div>
  )

  const triggerButton = (
    <Button
      ref={triggerRef}
      variant="outline"
      data-slot="filter-panel-trigger"
      aria-label={count ? t("listing.filtersCount", { count }) : undefined}
      aria-haspopup="dialog"
      aria-expanded={open}
      className={cn("touch:min-h-11", classNames?.trigger, className)}
      onClick={useSheet ? () => setOpen(!open) : undefined}
    >
      {trigger ?? (
        <>
          <Icon name="filter" />
          {t("listing.filters")}
          {count ? (
            <Badge className={cn("min-w-5 tabular-nums", classNames?.badge)} aria-hidden="true">
              {format.format(count)}
            </Badge>
          ) : null}
        </>
      )}
    </Button>
  )

  if (useSheet) {
    return (
      <>
        {triggerButton}
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent
            className={cn("pb-[env(safe-area-inset-bottom)]", classNames?.content)}
            data-slot="filter-panel"
          >
            <DrawerHeader>
              <DrawerTitle>{t("listing.filtersTitle")}</DrawerTitle>
              <DrawerDescription className="sr-only">{t("listing.filtersTitle")}</DrawerDescription>
            </DrawerHeader>
            <div className="px-4 overflow-y-auto">{body}</div>
            <DrawerFooter>{footer}</DrawerFooter>
          </DrawerContent>
        </Drawer>
      </>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{triggerButton}</PopoverTrigger>
      <PopoverContent
        align={align}
        role="dialog"
        aria-label={t("listing.filtersTitle")}
        data-slot="filter-panel"
        className={cn(
          "gap-3 p-4 max-h-(--radix-popover-content-available-height) w-[min(24rem,calc(100vw-2rem))] overflow-y-auto",
          classNames?.content,
        )}
      >
        {body}
        {footer}
      </PopoverContent>
    </Popover>
  )
}
