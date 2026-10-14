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
import { registerEnglish } from "../../i18n/english"
import { listing as en_listing } from "../../locales/en/listing"

registerEnglish({ listing: en_listing })

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
  /**
   * `popover` (default): the Filters button with a dropdown (bottom sheet on
   * phones). `form`: an inline query form (Ant ProTable's QueryFilter), with
   * labelled fields in a grid and Reset, Filter and Expand buttons.
   */
  variant?: "popover" | "form"
  /** Form variant: how many fields show before Expand. Default `3`. */
  collapsedCount?: number
  /** Form variant: start expanded. */
  defaultExpanded?: boolean
  /** Form variant: the form's accessible name. Default "Filters". */
  formLabel?: string
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
 *
 * With `variant="form"` it is an inline query form instead: the fields stay on
 * the page, changes are a draft until Filter (or Enter), Reset clears the
 * form's filters, and Expand shows the fields past `collapsedCount`.
 */
export function FilterPanel(props: FilterPanelProps) {
  return props.variant === "form" ? <FilterQueryForm {...props} /> : <FilterPopoverPanel {...props} />
}

function FilterQueryForm({
  filters,
  value,
  onApply,
  collapsedCount = 3,
  defaultExpanded = false,
  formLabel,
  className,
  classNames,
}: FilterPanelProps) {
  const { t } = useTranslation()
  const baseId = React.useId()
  const [draft, setDraft] = React.useState<FilterValues>(value)
  const [expanded, setExpanded] = React.useState(defaultExpanded)

  // Follow the applied filters when chips, tabs or Clear change them (adjusting state while rendering).
  const signature = JSON.stringify(value)
  const [seen, setSeen] = React.useState(signature)
  if (seen !== signature) {
    setSeen(signature)
    setDraft(value)
  }

  const collapsible = filters.length > collapsedCount
  const visible = expanded || !collapsible ? filters : filters.slice(0, collapsedCount)
  const setDraftValue = (key: string, next: FilterValue | undefined) => setDraft((prev) => ({ ...prev, [key]: next }))

  return (
    <form
      data-slot="filter-form"
      aria-label={formLabel ?? t("listing.filtersTitle")}
      className={cn(
        "gap-x-6 gap-y-4 grid grid-cols-[repeat(auto-fill,minmax(min(100%,17.5rem),1fr))]",
        classNames?.body,
        className,
      )}
      onSubmit={(e) => {
        e.preventDefault()
        onApply(cleanFilters(draft))
      }}
    >
      {visible.map((definition) => {
        const id = `${baseId}-${definition.key}`
        const labelId = `${id}-label`
        return (
          <div
            key={definition.key}
            data-slot="filter-form-item"
            className={cn("gap-2 sm:grid-cols-[5rem_minmax(0,1fr)] sm:gap-0 grid items-center", classNames?.filter)}
          >
            <span
              id={labelId}
              className={cn(
                // Ant's horizontal form label: end-aligned, with a colon.
                "text-sm sm:pe-2 sm:text-end sm:after:ms-0.5 sm:after:content-[':'] truncate text-foreground",
                classNames?.label,
              )}
            >
              {definition.label}
            </span>
            <div className="min-w-0 [&>*]:w-full">
              <FilterControl
                definition={definition}
                value={draft[definition.key]}
                onChange={(next) => setDraftValue(definition.key, next)}
                id={id}
                labelId={labelId}
                compact
              />
            </div>
          </div>
        )
      })}
      <div
        data-slot="filter-form-actions"
        className={cn("gap-2 col-end-[-1] flex flex-wrap items-center justify-end", classNames?.footer)}
      >
        <Button
          type="button"
          variant="outline"
          className="touch:min-h-11"
          onClick={() => {
            // Reset clears this form's fields and keeps any other filters.
            const next = { ...draft }
            for (const definition of filters) delete next[definition.key]
            setDraft(next)
            onApply(cleanFilters(next))
          }}
        >
          {t("listing.filterReset")}
        </Button>
        <Button type="submit" className="touch:min-h-11">
          {t("listing.filterSubmit")}
        </Button>
        {collapsible ? (
          <Button
            type="button"
            variant="link"
            className="px-1 touch:min-h-11"
            aria-expanded={expanded}
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? t("listing.collapse") : t("listing.expand")}
            <Icon name={expanded ? "chevron-up" : "chevron-down"} />
          </Button>
        ) : null}
      </div>
    </form>
  )
}
function FilterPopoverPanel({
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
