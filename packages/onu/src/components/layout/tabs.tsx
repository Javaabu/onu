"use client"

import * as React from "react"
import { Tabs as TabsPrimitive } from "radix-ui"

import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { TabsContent, TabsList, TabsTrigger } from "../../ui/tabs"
import { NavIcon } from "./_nav"

export interface TabItem {
  value: string
  label: React.ReactNode
  /** Semantic icon name or node. */
  icon?: string | React.ReactNode
  /** Count shown after the label, e.g. Activity (12). */
  count?: number
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
  /** Accessible name for the tab list. */
  listLabel?: string
  classNames?: { list?: string; trigger?: string; content?: string; count?: string }
}

/**
 * shadcn `Tabs`, extended with an `items` API, counts, icons and a scrollable tab
 * list. Arrow keys follow the visual order in RTL (direction comes from
 * `OnuProvider`). Without `items` it is the shadcn component.
 */
export function Tabs({
  items,
  variant = "default",
  scrollable = true,
  listLabel,
  orientation = "horizontal",
  className,
  classNames,
  children,
  defaultValue,
  ...props
}: TabsProps) {
  const { locale } = useTranslation()
  const vertical = orientation === "vertical"

  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      orientation={orientation}
      defaultValue={defaultValue ?? (items && !props.value ? items.find((i) => !i.disabled)?.value : undefined)}
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
                  {item.label}
                  {item.count !== undefined ? (
                    <span
                      data-slot="tabs-count"
                      className={cn("text-xs text-muted-foreground tabular-nums", classNames?.count)}
                    >
                      ({new Intl.NumberFormat(locale.numberLocale).format(item.count)})
                    </span>
                  ) : null}
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
