"use client"

import * as React from "react"
import { Tabs as TabsPrimitive } from "radix-ui"

import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { NativeSelect, NativeSelectOption } from "../../ui/native-select"
import { TabsContent, TabsList, TabsTrigger } from "../../ui/tabs"
import { NavBadge, NavIcon } from "./_nav"
import { registerEnglish } from "../../i18n/english"
import { layout as en_layout } from "../../locales/en/layout"

registerEnglish({ layout: en_layout })

export interface TabItem {
  value: string
  label: React.ReactNode
  /** Plain-text label for the `narrow="select"` select when `label` is not a string. */
  textLabel?: string
  /** Secondary text under the label (vertical tabs). */
  description?: React.ReactNode
  /** Semantic icon name or node. */
  icon?: string | React.ReactNode
  /** Count shown after the label, e.g. Activity (12). */
  count?: number
  /** Count or node shown at the end: `3` reads as "3 new", or pass `<Badge>New</Badge>`. */
  badge?: React.ReactNode
  disabled?: boolean
  content?: React.ReactNode
}

export interface TabsProps extends React.ComponentProps<typeof TabsPrimitive.Root> {
  /** Data-driven tabs. Without `items`, compose `TabsList`/`TabsTrigger`/`TabsContent` as children. */
  items?: TabItem[]
  /** Tab list style. */
  variant?: "default" | "line"
  /** Let the tab list scroll horizontally when it does not fit (phones). */
  scrollable?: boolean
  /**
   * With `orientation="vertical"` and `items`: a settings-style layout, the list
   * at the inline start and the panel beside it. In narrow containers (below
   * about 42rem) the list becomes a `select` or a horizontal `scroll`er.
   * `variant` and `scrollable` do not apply.
   */
  narrow?: "select" | "scroll"
  /** Accessible name for the tab list (and the `narrow="select"` select, default "Choose a section"). */
  listLabel?: string
  classNames?: { list?: string; trigger?: string; content?: string; count?: string; select?: string }
}

const badgeClass =
  "h-5 min-w-5 px-1.5 text-xs inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground tabular-nums"

function plainText(item: TabItem) {
  if (item.textLabel) return item.textLabel
  return typeof item.label === "string" || typeof item.label === "number" ? String(item.label) : item.value
}

function TabCount({ count, className }: { count: number | undefined; className?: string }) {
  const { locale } = useTranslation()
  if (count === undefined) return null
  return (
    <span data-slot="tabs-count" className={cn("text-xs text-muted-foreground tabular-nums", className)}>
      ({new Intl.NumberFormat(locale.numberLocale).format(count)})
    </span>
  )
}

/**
 * shadcn `Tabs`, extended with an `items` API, counts, badges, icons and a
 * scrollable tab list. Vertical tabs with `narrow` lay out like a settings page
 * and fall back to a select (or a scroller) in narrow containers. Arrow keys
 * follow the visual order in RTL (direction comes from `OnuProvider`). Without
 * `items` it is the shadcn component.
 */
export function Tabs({
  items,
  variant = "default",
  scrollable = true,
  narrow,
  listLabel,
  orientation = "horizontal",
  value: valueProp,
  defaultValue,
  onValueChange,
  dir,
  activationMode,
  asChild,
  className,
  classNames,
  children,
  ...props
}: TabsProps) {
  const { t } = useTranslation()
  const vertical = orientation === "vertical"
  const [inner, setInner] = React.useState(defaultValue ?? items?.find((i) => !i.disabled)?.value ?? "")
  const value = valueProp ?? inner
  const setValue = (next: string) => {
    if (valueProp === undefined) setInner(next)
    onValueChange?.(next)
  }
  const selectId = React.useId()
  const root = { value, onValueChange: setValue, orientation, dir, activationMode }

  if (vertical && narrow && items) {
    const label = listLabel ?? t("layout.chooseSection")
    const scroll = narrow === "scroll"
    return (
      <div data-slot="stacked-tabs" className={cn("@container/stacked-tabs", className)} {...props}>
        <TabsPrimitive.Root
          {...root}
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
                  "disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary-subtle data-[state=active]:text-primary-subtle-foreground",
                  "[&_svg]:mt-0.5 [&_svg]:size-4 [&_svg]:shrink-0",
                  classNames?.trigger,
                )}
              >
                <NavIcon icon={item.icon} />
                <span className="gap-0.5 min-w-0 flex flex-1 flex-col">
                  <span className="@2xl/stacked-tabs:whitespace-normal whitespace-nowrap">
                    {item.label}
                    <TabCount count={item.count} className={cn("ms-1", classNames?.count)} />
                  </span>
                  {item.description ? (
                    <span className="text-xs font-normal @2xl/stacked-tabs:block hidden text-muted-foreground">
                      {item.description}
                    </span>
                  ) : null}
                </span>
                <NavBadge badge={item.badge} className={badgeClass} />
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
          {children}
        </TabsPrimitive.Root>
      </div>
    )
  }

  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      {...root}
      asChild={asChild}
      className={cn("gap-2 group/tabs flex data-horizontal:flex-col", className)}
      {...props}
    >
      {items ? (
        <>
          <div
            data-slot="tabs-list-scroller"
            className={cn(
              !vertical && scrollable && "-mx-1 px-1 pb-1.5 no-scrollbar max-w-full scroll-fade-x overflow-x-auto",
            )}
          >
            <TabsList variant={variant} aria-label={listLabel} className={classNames?.list}>
              {items.map((item) => (
                <TabsTrigger
                  key={item.value}
                  value={item.value}
                  disabled={item.disabled}
                  className={cn("touch:min-h-11", classNames?.trigger)}
                >
                  <NavIcon icon={item.icon} />
                  {vertical && item.description ? (
                    <span className="gap-0.5 min-w-0 flex flex-col items-start">
                      <span>{item.label}</span>
                      <span className="text-xs font-normal text-muted-foreground">{item.description}</span>
                    </span>
                  ) : (
                    item.label
                  )}
                  <TabCount count={item.count} className={classNames?.count} />
                  <NavBadge badge={item.badge} className={badgeClass} />
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          {items.map((item) => (
            <TabsContent key={item.value} value={item.value} className={classNames?.content}>
              {item.content}
            </TabsContent>
          ))}
          {children}
        </>
      ) : (
        children
      )}
    </TabsPrimitive.Root>
  )
}
