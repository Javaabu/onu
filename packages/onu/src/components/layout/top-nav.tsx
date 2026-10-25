"use client"

import * as React from "react"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useOnu } from "../../providers/onu-provider"
import { Button } from "../../ui/button"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "../../ui/navigation-menu"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "../../ui/sheet"
import {
  NavBadge,
  NavIcon,
  NavLink,
  isItemActive,
  isSelfActive,
  itemKey,
  physicalSide,
  resolveActiveHref,
  type NavItem,
  type NavMatch,
} from "./_nav"
import { SideNav } from "./side-nav"
import { registerEnglish } from "../../i18n/english"
import { layout as en_layout } from "../../locales/en/layout"

registerEnglish({ layout: en_layout })

export interface TopNavLink extends Pick<
  NavItem,
  "id" | "label" | "description" | "icon" | "badge" | "isActive" | "external" | "onSelect"
> {
  href: string
}

export interface TopNavColumn {
  title?: React.ReactNode
  links: TopNavLink[]
}

export interface TopNavItem extends NavItem {
  /** Columns of links shown in a wide panel (a mega menu). Used instead of `items`. */
  columns?: TopNavColumn[]
  /** Highlighted content at the end of a `columns` panel (promo card, image), from `lg`. */
  featured?: React.ReactNode
}

export interface TopNavProps extends Omit<React.ComponentProps<"div">, "children"> {
  items: TopNavItem[]
  currentHref?: string
  match?: NavMatch
  /** Shown at the top of the phone menu. */
  logo?: React.ReactNode
  /** Extra content at the bottom of the phone menu (language switcher, sign in). */
  mobileFooter?: React.ReactNode
  /** Which side the phone menu slides in from. */
  mobileSide?: "start" | "end"
  /** Accessible name of the navigation landmark. */
  navLabel?: string
  classNames?: {
    list?: string
    /** Top-level links. */
    link?: string
    content?: string
    trigger?: string
    sheet?: string
    /** A `columns` panel, and each of its columns. */
    panel?: string
    column?: string
    /** Links inside dropdowns and panels. */
    panelLink?: string
  }
}

const badgeClass =
  "h-5 min-w-5 rounded-full bg-primary px-1.5 text-xs text-primary-foreground inline-flex items-center justify-center tabular-nums"

const GRID = ["", "grid-cols-1", "md:grid-cols-2", "md:grid-cols-3", "md:grid-cols-4"] as const

/**
 * A `columns` item as plain nested items, for the phone menu and the active
 * state: a titled column becomes a sub-section, an untitled one's links sit
 * directly under the item.
 */
function toNavItem(item: TopNavItem): NavItem {
  const { columns, featured: _featured, ...rest } = item
  if (!columns?.length) return rest
  return {
    ...rest,
    items: columns.flatMap<NavItem>((column, i) =>
      column.title ? [{ id: `column-${i}`, label: column.title, items: column.links }] : column.links,
    ),
  }
}

function PanelLink({ link, active, className }: { link: TopNavLink; active: boolean; className?: string }) {
  return (
    <NavigationMenuLink asChild active={active}>
      <NavLink
        href={link.href}
        external={link.external}
        aria-current={active ? "page" : undefined}
        onClick={link.onSelect}
        className={cn("gap-3 flex-row items-start", className)}
      >
        {link.icon ? (
          <span className="mt-0.5 size-8 [&_svg]:size-4 flex shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <NavIcon icon={link.icon} />
          </span>
        ) : null}
        <span className="gap-0.5 min-w-0 flex flex-1 flex-col">
          <span className="font-medium">{link.label}</span>
          {link.description ? (
            <span className="text-xs line-clamp-2 text-muted-foreground">{link.description}</span>
          ) : null}
        </span>
        <NavBadge badge={link.badge} className={badgeClass} />
      </NavLink>
    </NavigationMenuLink>
  )
}

/**
 * Horizontal main navigation for a header. Items with `items` open a dropdown;
 * items with `columns` open a wide panel with several columns of links and an
 * optional featured area. Below the `md` breakpoint it collapses to a menu
 * button that opens a drawer with the same items (R3.20).
 */
export function TopNav({
  items,
  currentHref,
  match = "prefix",
  logo,
  mobileFooter,
  mobileSide = "end",
  navLabel,
  className,
  classNames,
  ...props
}: TopNavProps) {
  const { t, dir } = useOnu()
  const [open, setOpen] = React.useState(false)
  const tree = React.useMemo(() => items.map(toNavItem), [items])
  const activeHref = React.useMemo(() => resolveActiveHref(tree, currentHref, match), [tree, currentHref, match])
  const label = navLabel ?? t("layout.mainNavigation")
  // Wide panels open in the shared viewport under the whole bar, so they stay on screen.
  const mega = items.some((item) => item.columns?.length)

  return (
    <div data-slot="top-nav" className={cn("flex items-center", className)} {...props}>
      <NavigationMenu viewport={mega} aria-label={label} className="md:flex hidden">
        <NavigationMenuList className={cn("gap-1", classNames?.list)}>
          {items.map((item, i) => {
            const active = isItemActive(tree[i]!, activeHref)
            const { columns } = item
            if (columns?.length || item.items?.length) {
              return (
                <NavigationMenuItem key={itemKey(item, i)}>
                  <NavigationMenuTrigger
                    data-active={active || undefined}
                    className={cn(
                      "gap-1.5 [&>svg:first-child]:size-4 data-active:text-foreground",
                      classNames?.trigger,
                    )}
                  >
                    <NavIcon icon={item.icon} />
                    {item.label}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className={cn("z-50", classNames?.content)}>
                    {columns?.length ? (
                      <div
                        data-slot="mega-menu-panel"
                        className={cn(
                          "gap-6 p-4 grid w-[min(90vw,48rem)]",
                          item.featured && "lg:grid-cols-[minmax(0,1fr)_14rem]",
                          classNames?.panel,
                        )}
                      >
                        <div className={cn("gap-6 grid", GRID[Math.min(columns.length, 4)])}>
                          {columns.map((column, ci) => (
                            <div
                              key={ci}
                              data-slot="mega-menu-column"
                              className={cn("gap-2 flex flex-col", classNames?.column)}
                            >
                              {column.title ? (
                                <p className="px-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                  {column.title}
                                </p>
                              ) : null}
                              <ul className="gap-0.5 grid">
                                {column.links.map((link, li) => (
                                  <li key={link.id ?? link.href ?? li}>
                                    <PanelLink
                                      link={link}
                                      active={isSelfActive(link, activeHref)}
                                      className={classNames?.panelLink}
                                    />
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                        {item.featured ? <div className="lg:block hidden">{item.featured}</div> : null}
                      </div>
                    ) : (
                      <ul className="gap-1 p-1 w-64 grid">
                        {item.items!.map((child, ci) => {
                          const childActive = isSelfActive(child, activeHref)
                          return (
                            <li key={itemKey(child, ci)}>
                              <NavigationMenuLink asChild active={childActive}>
                                <NavLink
                                  href={child.href ?? "#"}
                                  external={child.external}
                                  aria-current={childActive ? "page" : undefined}
                                  onClick={child.onSelect}
                                  className={cn("gap-0.5 flex-col items-start", classNames?.panelLink)}
                                >
                                  <span className="gap-2 font-medium flex items-center">
                                    <NavIcon icon={child.icon} />
                                    {child.label}
                                  </span>
                                  {child.description ? (
                                    <span className="text-xs text-muted-foreground">{child.description}</span>
                                  ) : null}
                                </NavLink>
                              </NavigationMenuLink>
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </NavigationMenuContent>
                </NavigationMenuItem>
              )
            }
            const selfActive = isSelfActive(item, activeHref)
            return (
              <NavigationMenuItem key={itemKey(item, i)}>
                <NavigationMenuLink asChild active={selfActive}>
                  <NavLink
                    href={item.href ?? "#"}
                    external={item.external}
                    aria-current={selfActive ? "page" : undefined}
                    onClick={item.onSelect}
                    className={cn(
                      navigationMenuTriggerStyle(),
                      "gap-1.5 data-active:font-semibold [&_svg]:size-4 text-muted-foreground data-active:bg-transparent data-active:text-foreground",
                      classNames?.link,
                    )}
                  >
                    <NavIcon icon={item.icon} />
                    {item.label}
                    <NavBadge badge={item.badge} className={badgeClass} />
                  </NavLink>
                </NavigationMenuLink>
              </NavigationMenuItem>
            )
          })}
        </NavigationMenuList>
      </NavigationMenu>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={t("layout.openMenu")} className="touch:size-11 md:hidden">
            <Icon name="menu" />
          </Button>
        </SheetTrigger>
        <SheetContent
          side={physicalSide(mobileSide, dir)}
          showCloseButton={false}
          className={cn(
            "gap-0 pb-[env(safe-area-inset-bottom)]",
            mega ? "w-[min(22rem,90vw)]" : "w-[min(20rem,85vw)]",
            classNames?.sheet,
          )}
        >
          <SheetHeader className="gap-2 p-4 flex-row items-center justify-between border-b">
            <div className="min-w-0">{logo}</div>
            <Button
              variant="ghost"
              size="icon"
              aria-label={t("layout.closeMenu")}
              onClick={() => setOpen(false)}
              className="touch:size-11"
            >
              <Icon name="close" />
            </Button>
            <SheetTitle className="sr-only">{t("layout.menu")}</SheetTitle>
            <SheetDescription className="sr-only">{label}</SheetDescription>
          </SheetHeader>
          <div className="p-3 flex-1 overflow-y-auto">
            <SideNav
              items={tree}
              currentHref={currentHref}
              match={match}
              aria-label={label}
              onNavigate={() => setOpen(false)}
            />
          </div>
          {mobileFooter ? <div className="p-4 border-t">{mobileFooter}</div> : null}
        </SheetContent>
      </Sheet>
    </div>
  )
}
