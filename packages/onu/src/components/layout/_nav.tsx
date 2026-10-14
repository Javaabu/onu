"use client"

import * as React from "react"

import { Icon } from "../../icons/icon"
import { useLinkComponent, useTranslation } from "../../providers/onu-provider"
import { registerEnglish } from "../../i18n/english"
import { layout as en_layout } from "../../locales/en/layout"

registerEnglish({ layout: en_layout })

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
  /**
   * How a numeric badge looks in `AppSidebar` on the shell: `brand` (default)
   * is a brand-coloured pill for unread-like counts, read as "12 new";
   * `neutral` is a plain muted number for totals, read as the number alone.
   */
  badgeTone?: "brand" | "neutral"
  /**
   * A colour for folders and labels (`AppSidebar`): tints a semantic icon
   * (e.g. `icon: "folder"`), or shows a coloured dot when there is no icon.
   * Decorative only; the label carries the meaning.
   */
  color?: string
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

interface ParsedHref {
  path: string
  /** Query parameters, or `null` when the href has no query string. */
  query: URLSearchParams | null
}

/**
 * Splits an href into its path and query. Hash-router hrefs (`#/users?tab=a`,
 * `/app#!/users`) use the route inside the fragment.
 */
function parse(href: string): ParsedHref {
  const route = /#!?(\/.*)$/.exec(href)
  const target = (route ? route[1] : href.split("#")[0]) ?? ""
  const [rawPath, rawQuery] = target.split("?", 2) as [string, string | undefined]
  const path = rawPath || "/"
  const trimmed = path.length > 1 ? path.replace(/\/+$/, "") : path
  const query = rawQuery ? new URLSearchParams(rawQuery) : null
  return { path: trimmed, query: query && [...query.keys()].length ? query : null }
}

/** A canonical form of an href: path, plus the sorted query when it has one. */
function normalize(href: string) {
  const { path, query } = parse(href)
  if (!query) return path
  const sorted = new URLSearchParams([...query.entries()].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)))
  return `${path}?${sorted.toString()}`
}

/** Whether every parameter of `item` appears, with the same value(s), in `current`. */
function querySubset(item: URLSearchParams, current: URLSearchParams | null) {
  if (!current) return false
  return [...new Set(item.keys())].every((key) => {
    const want = item.getAll(key).sort()
    const have = current.getAll(key).sort()
    return want.length === have.length && want.every((v, i) => v === have[i])
  })
}

/**
 * How well an item's query matches the current one: higher is better,
 * `undefined` is no match. Equal or contained parameters score by how many
 * there are; an item whose parameters are all absent from the current URL
 * (e.g. the default tab on a bare `/reports`) scores lowest but still matches.
 */
function queryScore(item: URLSearchParams, current: URLSearchParams | null) {
  if (querySubset(item, current)) return 1 + new Set(item.keys()).size
  if ([...item.keys()].every((key) => !current?.has(key))) return -1
  return undefined
}

function collectHrefs(items: NavItem[], out: string[] = []) {
  for (const item of items) {
    if (item.href && !item.external) out.push(item.href)
    if (item.items) collectHrefs(item.items, out)
  }
  return out
}

/**
 * Resolves which href is "current" (in canonical form).
 *
 * - Paths match exactly; with `match="prefix"`, the longest item path that is
 *   a parent of `currentHref` matches when nothing matches exactly.
 * - When an item href has a query string (`?tab=history`), its parameters must
 *   match too: the item sharing the most parameters with the current URL wins,
 *   then an item with the bare path. So tabs that differ only by `?tab=`
 *   highlight one at a time. If the current URL has none of an item's
 *   parameters (a bare `/reports`), the first such item counts as the default.
 */
export function resolveActiveHref(items: NavItem[], currentHref: string | undefined, match: NavMatch = "prefix") {
  if (currentHref === undefined) return undefined
  const current = parse(currentHref)
  const hrefs = collectHrefs(items).map((href) => ({ key: normalize(href), ...parse(href) }))

  let best: { key: string; score: number } | undefined
  for (const href of hrefs) {
    if (href.path !== current.path) continue
    const score = href.query ? queryScore(href.query, current.query) : 0
    if (score !== undefined && (!best || score > best.score)) best = { key: href.key, score }
  }
  if (best) return best.key
  if (match === "exact") return undefined
  return hrefs
    .filter((h) => !h.query && h.path !== "/" && current.path.startsWith(`${h.path}/`))
    .sort((a, b) => b.path.length - a.path.length)[0]?.key
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

/**
 * A count badge with a screen-reader phrase ("3 new"); a `neutral` count (a
 * total, not unread items) reads as the number alone. Other nodes are
 * rendered as-is.
 */
export function NavBadge({
  badge,
  tone = "brand",
  className,
}: {
  badge: React.ReactNode
  tone?: NavItem["badgeTone"]
  className?: string
}) {
  const { t, locale } = useTranslation()
  if (badge === undefined || badge === null || badge === false) return null
  if (typeof badge === "number") {
    if (badge <= 0) return null
    if (tone === "neutral") {
      return (
        <span data-slot="nav-badge" className={className}>
          {formatCount(badge, locale.numberLocale)}
        </span>
      )
    }
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
