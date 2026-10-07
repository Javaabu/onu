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

export interface TopNavProps extends Omit<React.ComponentProps<"div">, "children"> {
  items: NavItem[]
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
  classNames?: { list?: string; link?: string; content?: string; trigger?: string; sheet?: string }
}

const badgeClass =
  "h-5 min-w-5 rounded-full bg-primary px-1.5 text-xs text-primary-foreground inline-flex items-center justify-center tabular-nums"

/**
 * Horizontal main navigation for a header. Items with `items` open a dropdown
 * panel. Below the `md` breakpoint it collapses to a menu button that opens a
 * drawer with the same items (R3.20).
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
  const activeHref = React.useMemo(() => resolveActiveHref(items, currentHref, match), [items, currentHref, match])
  const label = navLabel ?? t("layout.mainNavigation")

  return (
    <div data-slot="top-nav" className={cn("flex items-center", className)} {...props}>
      <NavigationMenu viewport={false} aria-label={label} className="md:flex hidden">
        <NavigationMenuList className={cn("gap-1", classNames?.list)}>
          {items.map((item, i) => {
            const active = isItemActive(item, activeHref)
            if (item.items?.length) {
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
                    <ul className="gap-1 p-1 w-64 grid">
                      {item.items.map((child, ci) => {
                        const childActive = isSelfActive(child, activeHref)
                        return (
                          <li key={itemKey(child, ci)}>
                            <NavigationMenuLink asChild active={childActive}>
                              <NavLink
                                href={child.href ?? "#"}
                                external={child.external}
                                aria-current={childActive ? "page" : undefined}
                                onClick={child.onSelect}
                                className="gap-0.5 flex-col items-start"
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
          className={cn("gap-0 w-[min(20rem,85vw)] pb-[env(safe-area-inset-bottom)]", classNames?.sheet)}
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
              items={items}
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
