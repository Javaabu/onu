"use client"

import * as React from "react"

import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import {
  NavBadge,
  NavIcon,
  NavLink,
  isItemActive,
  itemKey,
  resolveActiveHref,
  type NavItem,
  type NavMatch,
} from "./_nav"

export interface BottomNavProps extends Omit<React.ComponentProps<"nav">, "children"> {
  /** Three to five destinations, each with an icon and a short label. */
  items: NavItem[]
  /** The current URL path; the matching item is highlighted and gets `aria-current="page"`. */
  currentHref?: string
  match?: NavMatch
  /** `fixed` sticks to the bottom of the viewport (default); `static` renders in place (e.g. demos). */
  position?: "fixed" | "static"
  /** Hide from this breakpoint up. Defaults to `md` (phones only). Use `"never"` to always show. */
  hideFrom?: "sm" | "md" | "lg" | "never"
  classNames?: { list?: string; item?: string; icon?: string; label?: string; badge?: string }
}

const HIDE = { sm: "sm:hidden", md: "md:hidden", lg: "lg:hidden", never: "" } as const

/**
 * Phone bottom navigation: large (≥ 44px) targets, icons with labels, badges and
 * the active state, padded for the home indicator (safe-area inset, R3.30).
 */
export function BottomNav({
  items,
  currentHref,
  match = "prefix",
  position = "fixed",
  hideFrom = "md",
  className,
  classNames,
  "aria-label": ariaLabel,
  ...props
}: BottomNavProps) {
  const { t } = useTranslation()
  const activeHref = React.useMemo(() => resolveActiveHref(items, currentHref, match), [items, currentHref, match])

  return (
    <nav
      data-slot="bottom-nav"
      aria-label={ariaLabel ?? t("layout.bottomNavigation")}
      className={cn(
        "supports-backdrop-filter:backdrop-blur z-40 w-full border-t bg-background/95 pb-[env(safe-area-inset-bottom)] supports-backdrop-filter:bg-background/80",
        position === "fixed" && "inset-x-0 bottom-0 fixed",
        HIDE[hideFrom],
        className,
      )}
      {...props}
    >
      <ul
        className={cn("grid", classNames?.list)}
        style={{ gridTemplateColumns: `repeat(${Math.max(items.length, 1)}, minmax(0, 1fr))` }}
      >
        {items.map((item, i) => {
          const active = isItemActive(item, activeHref)
          const itemClass = cn(
            "gap-0.5 px-1 py-1.5 min-h-14 font-medium leading-tight relative flex w-full flex-col items-center justify-center text-[0.6875rem] text-muted-foreground transition-colors outline-none",
            "hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset aria-disabled:opacity-50 data-active:text-primary",
            classNames?.item,
          )
          // The label comes first in the DOM so the accessible name reads "Inbox, 3 new";
          // CSS order puts the icon on top.
          const inner = (
            <>
              <span className={cn("order-2 max-w-full truncate", classNames?.label)}>{item.label}</span>{" "}
              <span
                className={cn(
                  "h-7 w-12 [&_svg]:size-5 relative order-1 flex items-center justify-center rounded-full transition-colors in-data-active:bg-primary/10",
                  classNames?.icon,
                )}
              >
                <NavIcon icon={item.icon} />
                <NavBadge
                  badge={item.badge}
                  className={cn(
                    "-top-1 h-4 min-w-4 px-1 leading-4 absolute start-[calc(50%+0.25rem)] inline-flex items-center justify-center rounded-full bg-destructive text-[0.625rem] text-destructive-foreground tabular-nums ring-2 ring-background",
                    classNames?.badge,
                  )}
                />
              </span>
            </>
          )
          return (
            <li key={itemKey(item, i)} className="flex">
              {item.href && !item.disabled ? (
                <NavLink
                  href={item.href}
                  external={item.external}
                  data-slot="bottom-nav-item"
                  data-active={active || undefined}
                  aria-current={active ? "page" : undefined}
                  onClick={item.onSelect}
                  className={itemClass}
                >
                  {inner}
                </NavLink>
              ) : (
                <button
                  type="button"
                  data-slot="bottom-nav-item"
                  data-active={active || undefined}
                  aria-pressed={item.isActive}
                  aria-disabled={item.disabled || undefined}
                  disabled={item.disabled}
                  onClick={item.onSelect}
                  className={itemClass}
                >
                  {inner}
                </button>
              )}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
