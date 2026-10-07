"use client"

import * as React from "react"
import { Tabs as TabsPrimitive } from "radix-ui"

import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { NativeSelect, NativeSelectOption } from "../../ui/native-select"
import { NavBadge, NavIcon } from "./_nav"

export interface StackedTabItem {
  value: string
  label: React.ReactNode
  /** Plain-text label for the phone select when `label` is not a string. */
  textLabel?: string
  description?: React.ReactNode
  /** Semantic icon name or node. */
  icon?: string | React.ReactNode
  badge?: React.ReactNode
  disabled?: boolean
  content?: React.ReactNode
}

export interface StackedTabsProps extends Omit<React.ComponentProps<"div">, "defaultValue" | "onChange" | "dir"> {
  items: StackedTabItem[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** What the tab list becomes in narrow containers: a `select` (default) or a horizontal `scroll`er. */
  mobile?: "select" | "scroll"
  /** Accessible name for the tab list and the phone select. */
  listLabel?: string
  classNames?: { list?: string; trigger?: string; content?: string; select?: string }
}

function plainText(item: StackedTabItem) {
  if (item.textLabel) return item.textLabel
  return typeof item.label === "string" || typeof item.label === "number" ? String(item.label) : item.value
}

/**
 * Vertical tabs (e.g. settings pages). In narrow containers the list becomes a
 * select, or a horizontal scroller with `mobile="scroll"`. Arrow Up/Down move
 * between tabs (WAI-ARIA tabs, vertical).
 */
export function StackedTabs({
  items,
  value: valueProp,
  defaultValue,
  onValueChange,
  mobile = "select",
  listLabel,
  className,
  classNames,
  ...props
}: StackedTabsProps) {
  const { t } = useTranslation()
  const [inner, setInner] = React.useState(defaultValue ?? items.find((i) => !i.disabled)?.value ?? "")
  const value = valueProp ?? inner
  const setValue = (next: string) => {
    if (valueProp === undefined) setInner(next)
    onValueChange?.(next)
  }
  const selectId = React.useId()
  const label = listLabel ?? t("layout.chooseSection")
  const scroll = mobile === "scroll"

  return (
    <div data-slot="stacked-tabs" className={cn("@container/stacked-tabs", className)} {...props}>
      <TabsPrimitive.Root
        value={value}
        onValueChange={setValue}
        orientation="vertical"
        className="gap-4 @2xl/stacked-tabs:grid @2xl/stacked-tabs:grid-cols-[minmax(11rem,15rem)_minmax(0,1fr)] @2xl/stacked-tabs:gap-8 flex flex-col"
      >
        {!scroll ? (
          <div className="@2xl/stacked-tabs:hidden">
            <label htmlFor={selectId} className="sr-only">
              {label}
            </label>
            <NativeSelect
              id={selectId}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className={cn("touch:[&_select]:h-11 w-full", classNames?.select)}
            >
              {items.map((item) => (
                <NativeSelectOption key={item.value} value={item.value} disabled={item.disabled}>
                  {plainText(item)}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>
        ) : null}
        <TabsPrimitive.List
          data-slot="stacked-tabs-list"
          aria-label={label}
          className={cn(
            "gap-1 flex",
            scroll
              ? "@2xl/stacked-tabs:flex-col @2xl/stacked-tabs:overflow-visible no-scrollbar scroll-fade-x flex-row overflow-x-auto"
              : "@2xl/stacked-tabs:flex hidden flex-col",
            classNames?.list,
          )}
        >
          {items.map((item) => (
            <TabsPrimitive.Trigger
              key={item.value}
              value={item.value}
              disabled={item.disabled}
              data-slot="stacked-tabs-trigger"
              className={cn(
                "gap-2 px-3 py-2 text-sm font-medium flex shrink-0 items-start rounded-lg text-start text-muted-foreground transition-colors outline-none",
                "touch:min-h-11 hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
                "disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-muted data-[state=active]:text-foreground",
                "[&_svg]:mt-0.5 [&_svg]:size-4 [&_svg]:shrink-0",
                classNames?.trigger,
              )}
            >
              <NavIcon icon={item.icon} />
              <span className="gap-0.5 min-w-0 flex flex-1 flex-col">
                <span className="@2xl/stacked-tabs:whitespace-normal whitespace-nowrap">{item.label}</span>
                {item.description ? (
                  <span className="text-xs font-normal @2xl/stacked-tabs:block hidden text-muted-foreground">
                    {item.description}
                  </span>
                ) : null}
              </span>
              <NavBadge
                badge={item.badge}
                className="h-5 min-w-5 px-1.5 text-xs inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground tabular-nums"
              />
            </TabsPrimitive.Trigger>
          ))}
        </TabsPrimitive.List>
        {items.map((item) => (
          <TabsPrimitive.Content
            key={item.value}
            value={item.value}
            data-slot="stacked-tabs-content"
            className={cn("min-w-0 text-sm outline-none", classNames?.content)}
          >
            {item.content}
          </TabsPrimitive.Content>
        ))}
      </TabsPrimitive.Root>
    </div>
  )
}
