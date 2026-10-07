"use client"

import * as React from "react"

import { Icon } from "../../icons/icon"
import { useLinkComponent, useTranslation } from "../../providers/onu-provider"

/** A navigation entry shared by AppSidebar, SideNav, TopNav, OverlayMenu, BottomNav and MegaMenu. */
export interface NavItem {
  /** Stable key. Defaults to `href`, then the index. */
  id?: string
  label: React.ReactNode
  href?: string
  /** Semantic icon name (`"home"`) or any node. */
  icon?: string | React.ReactNode
  /** Count or node shown at the end, e.g. `12` or `<Badge>New</Badge>`. */
  badge?: React.ReactNode
  /** Force the active state. Otherwise derived from `currentHref`. */
  isActive?: boolean
  disabled?: boolean
  /** Open in a new tab with `rel="noopener noreferrer"`. */
  external?: boolean
  /** Secondary text (mega menu, overlay menu). */
  description?: React.ReactNode
  /** Nested items. */
  items?: NavItem[]
  /** Called on activation (after navigation for links). */
  onSelect?: (event: React.MouseEvent<HTMLElement>) => void
}

/** A labelled group of navigation items. */
export interface NavGroup {
  id?: string
  label?: React.ReactNode
  items: NavItem[]
}

export type NavMatch = "exact" | "prefix"

function normalize(href: string) {
  const path = href.split(/[?#]/)[0] || "/"
  return path.length > 1 ? path.replace(/\/+$/, "") : path
}

function collectHrefs(items: NavItem[], out: string[] = []) {
  for (const item of items) {
    if (item.href && !item.external) out.push(normalize(item.href))
    if (item.items) collectHrefs(item.items, out)
  }
  return out
}

/**
 * Resolves which href is "current": an exact match, or with `match="prefix"`
 * the longest item href that is a parent path of `currentHref`.
 */
export function resolveActiveHref(items: NavItem[], currentHref: string | undefined, match: NavMatch = "prefix") {
  if (currentHref === undefined) return undefined
  const current = normalize(currentHref)
  const hrefs = collectHrefs(items)
  if (hrefs.includes(current)) return current
  if (match === "exact") return undefined
  return hrefs.filter((h) => h !== "/" && current.startsWith(`${h}/`)).sort((a, b) => b.length - a.length)[0]
}

/** Whether the item itself is the current page. */
export function isSelfActive(item: NavItem, activeHref: string | undefined): boolean {
  if (item.isActive !== undefined) return item.isActive
  return Boolean(item.href && !item.external && activeHref !== undefined && normalize(item.href) === activeHref)
}

/** Whether an item or one of its descendants is active. */
export function isItemActive(item: NavItem, activeHref: string | undefined): boolean {
  return isSelfActive(item, activeHref) || (item.items?.some((child) => isItemActive(child, activeHref)) ?? false)
}

/** Hook form of `resolveActiveHref`, memoised. */
export function useActiveHref(items: NavItem[], currentHref: string | undefined, match: NavMatch = "prefix") {
  return React.useMemo(() => resolveActiveHref(items, currentHref, match), [items, currentHref, match])
}

export function itemKey(item: NavItem, index: number) {
  return item.id ?? item.href ?? String(index)
}

/** Renders a semantic icon name or a node. */
export function NavIcon({ icon, className }: { icon: NavItem["icon"]; className?: string }) {
  if (icon === undefined || icon === null || icon === false) return null
  if (typeof icon === "string") return <Icon name={icon} className={className} />
  return <>{icon}</>
}

export interface NavLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string
  external?: boolean
  ref?: React.Ref<HTMLAnchorElement>
}

/**
 * A link rendered through the configured link component (R16.2). External links
 * use a plain `<a target="_blank">` with a screen-reader note.
 */
export function NavLink({ href, external, children, ...props }: NavLinkProps) {
  const LinkComponent = useLinkComponent()
  const { t } = useTranslation()
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
        <span className="sr-only"> {t("layout.opensInNewTab")}</span>
      </a>
    )
  }
  // createElement: the link component comes from context, not from this render.
  return React.createElement(LinkComponent, { href, ...props }, children)
}

/** Formats a numeric badge (caps at `max`, e.g. "99+"). */
export function formatCount(count: number, numberLocale: string, max = 99) {
  const fmt = new Intl.NumberFormat(numberLocale)
  return count > max ? `${fmt.format(max)}+` : fmt.format(count)
}

/** A count badge with a screen-reader phrase ("3 new"); other nodes are rendered as-is. */
export function NavBadge({ badge, className }: { badge: React.ReactNode; className?: string }) {
  const { t, locale } = useTranslation()
  if (badge === undefined || badge === null || badge === false) return null
  if (typeof badge === "number") {
    if (badge <= 0) return null
    return (
      <span data-slot="nav-badge" className={className}>
        <span aria-hidden="true">{formatCount(badge, locale.numberLocale)}</span>
        <span className="sr-only">{t("layout.badgeCount", { count: badge })}</span>
      </span>
    )
  }
  return (
    <span data-slot="nav-badge" className={className}>
      {badge}
    </span>
  )
}

/** Resolves a logical side to the physical side Radix/shadcn sheets expect. */
export function physicalSide(side: "start" | "end", dir: "ltr" | "rtl"): "left" | "right" {
  return (side === "start") === (dir === "ltr") ? "left" : "right"
}
