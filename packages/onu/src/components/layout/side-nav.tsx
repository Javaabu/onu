"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../ui/collapsible"
import {
  NavBadge,
  NavIcon,
  NavLink,
  isItemActive,
  isSelfActive,
  itemKey,
  resolveActiveHref,
  type NavGroup,
  type NavItem,
  type NavMatch,
} from "./_nav"

export type { NavGroup, NavItem, NavMatch }

export const sideNavItemVariants = cva(
  "gap-2 min-w-0 font-medium flex w-full items-center rounded-lg text-start text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-active:bg-muted data-active:text-foreground [&_svg]:shrink-0",
  {
    variants: {
      size: {
        sm: "min-h-7 px-2 py-1 text-xs [&_svg]:size-3.5 touch:min-h-11",
        default: "min-h-8 px-2.5 py-1.5 text-sm [&_svg]:size-4 touch:min-h-11",
        lg: "min-h-12 px-4 py-3 text-lg [&_svg]:size-5",
      },
    },
    defaultVariants: { size: "default" },
  },
)

type Size = NonNullable<VariantProps<typeof sideNavItemVariants>["size"]>

export interface SideNavProps extends Omit<React.ComponentProps<"nav">, "children"> {
  /** Flat list of items (or use `groups`). */
  items?: NavItem[]
  /** Labelled groups of items. */
  groups?: NavGroup[]
  /** The current URL path; the matching item gets `aria-current="page"`. */
  currentHref?: string
  /** `prefix` (default): `/users/12` keeps `/users` active. `exact`: only exact matches. */
  match?: NavMatch
  size?: Size
  /** Called after any item is activated, e.g. to close a drawer. */
  onNavigate?: (item: NavItem) => void
  classNames?: {
    group?: string
    groupLabel?: string
    list?: string
    item?: string
    sub?: string
    badge?: string
  }
}

interface ItemContext {
  activeHref: string | undefined
  size: Size
  onNavigate?: (item: NavItem) => void
  classNames: SideNavProps["classNames"]
}

const badgeClass =
  "ms-auto h-5 min-w-5 rounded-full bg-muted px-1.5 text-xs font-medium text-muted-foreground inline-flex shrink-0 items-center justify-center tabular-nums"

function ItemInner({ item }: { item: NavItem }) {
  return (
    <>
      <NavIcon icon={item.icon} />
      <span className="gap-0.5 min-w-0 flex flex-1 flex-col">
        <span className="truncate">{item.label}</span>
        {item.description ? (
          <span className="text-xs font-normal text-muted-foreground">{item.description}</span>
        ) : null}
      </span>
    </>
  )
}

function SideNavEntry({ item, ctx }: { item: NavItem; ctx: ItemContext }) {
  const { t } = useTranslation()
  const self = isSelfActive(item, ctx.activeHref)
  const withinActive = isItemActive(item, ctx.activeHref)
  const [open, setOpen] = React.useState(withinActive)
  const hasChildren = Boolean(item.items?.length)
  const itemClass = cn(sideNavItemVariants({ size: ctx.size }), ctx.classNames?.item)
  const badge = <NavBadge badge={item.badge} className={cn(badgeClass, ctx.classNames?.badge)} />

  const activate = (event: React.MouseEvent<HTMLElement>) => {
    item.onSelect?.(event)
    ctx.onNavigate?.(item)
  }

  let main: React.ReactNode
  if (item.disabled) {
    main = (
      <span data-slot="side-nav-item" aria-disabled="true" className={itemClass}>
        <ItemInner item={item} />
        {badge}
      </span>
    )
  } else if (item.href) {
    main = (
      <NavLink
        href={item.href}
        external={item.external}
        data-slot="side-nav-item"
        data-active={self || undefined}
        aria-current={self ? "page" : undefined}
        onClick={activate}
        className={cn(itemClass, hasChildren && "flex-1", withinActive && !self && "text-foreground")}
      >
        <ItemInner item={item} />
        {badge}
      </NavLink>
    )
  } else if (hasChildren) {
    main = (
      <CollapsibleTrigger data-slot="side-nav-item" className={cn(itemClass, withinActive && "text-foreground")}>
        <ItemInner item={item} />
        {badge}
        <Icon
          name="chevron-down"
          className="transition-transform duration-200 motion-reduce:transition-none [[data-state=open]>&]:rotate-180"
        />
      </CollapsibleTrigger>
    )
  } else {
    main = (
      <button type="button" data-slot="side-nav-item" onClick={activate} className={itemClass}>
        <ItemInner item={item} />
        {badge}
      </button>
    )
  }

  if (!hasChildren) return <li data-slot="side-nav-entry">{main}</li>

  return (
    <li data-slot="side-nav-entry">
      <Collapsible open={open} onOpenChange={setOpen}>
        {item.href && !item.disabled ? (
          <div className="gap-1 flex items-center">
            {main}
            <CollapsibleTrigger
              aria-label={t("layout.toggleSubmenu", { label: typeof item.label === "string" ? item.label : "" })}
              className={cn(
                sideNavItemVariants({ size: ctx.size }),
                "px-2 touch:min-w-11 w-auto shrink-0 justify-center",
              )}
            >
              <Icon
                name="chevron-down"
                className="transition-transform duration-200 motion-reduce:transition-none [[data-state=open]>&]:rotate-180"
              />
            </CollapsibleTrigger>
          </div>
        ) : (
          main
        )}
        <CollapsibleContent>
          <ul
            data-slot="side-nav-sub"
            className={cn("gap-0.5 mt-0.5 ms-4 ps-2 flex flex-col border-s", ctx.classNames?.sub)}
          >
            {item.items!.map((child, i) => (
              <SideNavEntry key={itemKey(child, i)} item={child} ctx={ctx} />
            ))}
          </ul>
        </CollapsibleContent>
      </Collapsible>
    </li>
  )
}

/**
 * A vertical navigation list with groups, icons, badges and collapsible nested
 * items. The current page is marked with `aria-current="page"` and its parents
 * start expanded. Works on its own (settings pages, docs) and inside drawers.
 */
export function SideNav({
  items,
  groups,
  currentHref,
  match = "prefix",
  size = "default",
  onNavigate,
  className,
  classNames,
  "aria-label": ariaLabel,
  ...props
}: SideNavProps) {
  const { t } = useTranslation()
  const uid = React.useId()
  const allGroups = React.useMemo<NavGroup[]>(() => groups ?? [{ items: items ?? [] }], [groups, items])
  const flat = React.useMemo(() => allGroups.flatMap((g) => g.items), [allGroups])
  const activeHref = React.useMemo(() => resolveActiveHref(flat, currentHref, match), [flat, currentHref, match])
  const ctx: ItemContext = { activeHref, size, onNavigate, classNames }

  return (
    <nav
      data-slot="side-nav"
      aria-label={ariaLabel ?? t("layout.mainNavigation")}
      className={cn("gap-4 flex flex-col", className)}
      {...props}
    >
      {allGroups.map((group, gi) => {
        const labelId = group.label ? `${uid}-group-${gi}` : undefined
        return (
          <div key={group.id ?? gi} data-slot="side-nav-group" className={cn("gap-1 flex flex-col", classNames?.group)}>
            {group.label ? (
              <div
                id={labelId}
                data-slot="side-nav-group-label"
                className={cn("px-2.5 text-xs font-medium text-muted-foreground", classNames?.groupLabel)}
              >
                {group.label}
              </div>
            ) : null}
            <ul
              aria-labelledby={labelId}
              data-slot="side-nav-list"
              className={cn("gap-0.5 flex flex-col", classNames?.list)}
            >
              {group.items.map((item, i) => (
                <SideNavEntry key={itemKey(item, i)} item={item} ctx={ctx} />
              ))}
            </ul>
          </div>
        )
      })}
    </nav>
  )
}
