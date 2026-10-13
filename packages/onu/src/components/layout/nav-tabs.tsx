"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { NavBadge, NavIcon, NavLink, formatCount, isItemActive, resolveActiveHref, type NavMatch } from "./_nav"

export const navTabsVariants = cva(
  "gap-1.5 text-sm font-medium touch:min-h-11 [&_svg]:size-4 relative inline-flex shrink-0 items-center whitespace-nowrap transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Ant's line tabs: plain labels 32px apart, the brand colour and a 2px ink bar on the current one.
        line: "h-11 px-0 font-normal after:inset-x-0 after:h-0.5 text-foreground after:absolute after:-bottom-px after:bg-transparent hover:text-primary data-active:text-primary data-active:[text-shadow:0_0_0.25px_currentColor] data-active:after:bg-primary",
        pill: "h-8 px-3 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground data-active:bg-primary-subtle data-active:text-primary-subtle-foreground",
      },
    },
    defaultVariants: { variant: "line" },
  },
)

export interface NavTabItem {
  label: React.ReactNode
  href: string
  /** Count after the label, e.g. Activity (12). */
  count?: number
  /** Semantic icon name or node. */
  icon?: string | React.ReactNode
  /** Badge at the end (number or node). */
  badge?: React.ReactNode
  /** Greyed out and not a link, e.g. tabs of a record that isn't saved yet (§25.9). */
  disabled?: boolean
  /** Force the current state. */
  isActive?: boolean
}

export interface NavTabsProps
  extends Omit<React.ComponentProps<"nav">, "children">, VariantProps<typeof navTabsVariants> {
  items: NavTabItem[]
  /** The current URL path; the matching tab is highlighted and gets `aria-current="page"`. */
  currentHref?: string
  /** `exact` (default) or `prefix` (longest matching parent path wins). */
  match?: NavMatch
  classNames?: { list?: string; item?: string; count?: string }
}

/**
 * Link-based tabs for record pages (§25.8): each tab is its own page, the current
 * one is highlighted, and the row scrolls sideways on phones. Uses the configured
 * link component (R16.2). Rendered as a `nav` with `aria-current`, not an ARIA
 * tablist, because each tab navigates.
 */
export function NavTabs({
  items,
  currentHref,
  match = "exact",
  variant,
  className,
  classNames,
  "aria-label": ariaLabel,
  ...props
}: NavTabsProps) {
  const { t, locale } = useTranslation()
  const listRef = React.useRef<HTMLUListElement>(null)
  const activeHref = React.useMemo(
    () =>
      resolveActiveHref(
        items.map((i) => ({ label: i.label, href: i.href })),
        currentHref,
        match,
      ),
    [items, currentHref, match],
  )
  const isActive = (item: NavTabItem) =>
    isItemActive({ label: item.label, href: item.href, isActive: item.isActive }, activeHref)

  const activeIndex = items.findIndex((item) => !item.disabled && isActive(item))
  React.useEffect(() => {
    if (activeIndex < 0) return
    const el = listRef.current?.children[activeIndex] as HTMLElement | undefined
    el?.scrollIntoView?.({ block: "nearest", inline: "nearest" })
  }, [activeIndex])

  return (
    <nav
      data-slot="nav-tabs"
      data-variant={variant ?? "line"}
      aria-label={ariaLabel ?? t("layout.sections")}
      className={cn("min-w-0", (variant ?? "line") === "line" && "border-b", className)}
      {...props}
    >
      <ul
        ref={listRef}
        className={cn(
          (variant ?? "line") === "line" ? "gap-8" : "gap-1",
          "no-scrollbar flex scroll-fade-x overflow-x-auto overscroll-x-contain",
          classNames?.list,
        )}
      >
        {items.map((item, i) => {
          const active = !item.disabled && isActive(item)
          const content = (
            <>
              <NavIcon icon={item.icon} />
              <span>{item.label}</span>
              {item.count !== undefined ? " " : null}
              {item.count !== undefined ? (
                <span
                  data-slot="nav-tabs-count"
                  className={cn("text-muted-foreground tabular-nums", classNames?.count)}
                >
                  ({formatCount(item.count, locale.numberLocale, 9999)})
                </span>
              ) : null}
              <NavBadge
                badge={item.badge}
                className="h-5 min-w-5 px-1.5 text-xs inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground tabular-nums"
              />
            </>
          )
          return (
            <li key={item.href ?? i} className="flex">
              {item.disabled ? (
                <span
                  data-slot="nav-tabs-item"
                  aria-disabled="true"
                  className={cn(navTabsVariants({ variant }), "cursor-not-allowed opacity-50", classNames?.item)}
                >
                  {content}
                </span>
              ) : (
                <NavLink
                  href={item.href}
                  data-slot="nav-tabs-item"
                  data-active={active || undefined}
                  aria-current={active ? "page" : undefined}
                  className={cn(navTabsVariants({ variant }), classNames?.item)}
                >
                  {content}
                </NavLink>
              )}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
