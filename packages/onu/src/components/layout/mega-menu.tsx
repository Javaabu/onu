"use client"

import * as React from "react"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useOnu } from "../../providers/onu-provider"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../ui/accordion"
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
import { NavIcon, NavLink, physicalSide } from "./_nav"
import { registerEnglish } from "../../i18n/english"
import { layout as en_layout } from "../../locales/en/layout"

registerEnglish({ layout: en_layout })

export interface MegaMenuLink {
  label: React.ReactNode
  href: string
  description?: React.ReactNode
  /** Semantic icon name or node. */
  icon?: string | React.ReactNode
  external?: boolean
}

export interface MegaMenuColumn {
  title?: React.ReactNode
  links: MegaMenuLink[]
}

export interface MegaMenuItem {
  id?: string
  label: React.ReactNode
  /** A plain link (no panel). */
  href?: string
  /** Columns shown in the panel. */
  columns?: MegaMenuColumn[]
  /** Highlighted content at the end of the panel (promo card, image). */
  featured?: React.ReactNode
}

export interface MegaMenuProps extends Omit<React.ComponentProps<"div">, "children"> {
  items: MegaMenuItem[]
  /** Logo at the top of the phone menu. */
  logo?: React.ReactNode
  /** Which side the phone menu slides in from. */
  mobileSide?: "start" | "end"
  navLabel?: string
  classNames?: { trigger?: string; panel?: string; column?: string; link?: string; sheet?: string }
}

const GRID = ["", "grid-cols-1", "md:grid-cols-2", "md:grid-cols-3", "md:grid-cols-4"] as const

function PanelLink({ link, className }: { link: MegaMenuLink; className?: string }) {
  return (
    <NavigationMenuLink asChild>
      <NavLink href={link.href} external={link.external} className={cn("gap-3 flex-row items-start", className)}>
        {link.icon ? (
          <span className="mt-0.5 size-8 [&_svg]:size-4 flex shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <NavIcon icon={link.icon} />
          </span>
        ) : null}
        <span className="gap-0.5 min-w-0 flex flex-col">
          <span className="font-medium">{link.label}</span>
          {link.description ? (
            <span className="text-xs line-clamp-2 text-muted-foreground">{link.description}</span>
          ) : null}
        </span>
      </NavLink>
    </NavigationMenuLink>
  )
}

/**
 * A header navigation whose items open wide panels with several columns of links
 * and an optional featured area. On phones it collapses to a menu button and a
 * drawer with one accordion section per item.
 */
export function MegaMenu({
  items,
  logo,
  mobileSide = "end",
  navLabel,
  className,
  classNames,
  ...props
}: MegaMenuProps) {
  const { t, dir } = useOnu()
  const [open, setOpen] = React.useState(false)
  const label = navLabel ?? t("layout.mainNavigation")

  return (
    <div data-slot="mega-menu" className={cn("flex items-center", className)} {...props}>
      <NavigationMenu aria-label={label} className="md:flex hidden">
        <NavigationMenuList className="gap-1">
          {items.map((item, i) =>
            item.columns?.length ? (
              <NavigationMenuItem key={item.id ?? i}>
                <NavigationMenuTrigger className={classNames?.trigger}>{item.label}</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div
                    data-slot="mega-menu-panel"
                    className={cn(
                      "gap-6 p-4 grid w-[min(90vw,48rem)]",
                      item.featured && "lg:grid-cols-[minmax(0,1fr)_14rem]",
                      classNames?.panel,
                    )}
                  >
                    <div className={cn("gap-6 grid", GRID[Math.min(item.columns.length, 4)])}>
                      {item.columns.map((column, ci) => (
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
                              <li key={link.href ?? li}>
                                <PanelLink link={link} className={classNames?.link} />
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                    {item.featured ? <div className="lg:block hidden">{item.featured}</div> : null}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            ) : (
              <NavigationMenuItem key={item.id ?? i}>
                <NavigationMenuLink asChild>
                  <NavLink href={item.href ?? "#"} className={navigationMenuTriggerStyle()}>
                    {item.label}
                  </NavLink>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ),
          )}
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
          className={cn("gap-0 w-[min(22rem,90vw)] pb-[env(safe-area-inset-bottom)]", classNames?.sheet)}
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
          <nav aria-label={label} className="px-4 flex-1 overflow-y-auto">
            <Accordion type="multiple">
              {items.map((item, i) =>
                item.columns?.length ? (
                  <AccordionItem key={item.id ?? i} value={String(item.id ?? i)}>
                    <AccordionTrigger className="py-3 text-base touch:min-h-11">{item.label}</AccordionTrigger>
                    <AccordionContent className="[&_a]:no-underline">
                      {item.columns.map((column, ci) => (
                        <div key={ci} className="gap-1 mb-3 flex flex-col">
                          {column.title ? (
                            <p className="text-xs font-medium text-muted-foreground">{column.title}</p>
                          ) : null}
                          <ul className="flex flex-col">
                            {column.links.map((link, li) => (
                              <li key={link.href ?? li}>
                                <NavLink
                                  href={link.href}
                                  external={link.external}
                                  onClick={() => setOpen(false)}
                                  className="gap-2 px-2 py-2 min-h-11 [&_svg]:size-4 flex items-center rounded-md hover:bg-muted"
                                >
                                  <NavIcon icon={link.icon} />
                                  {link.label}
                                </NavLink>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                ) : (
                  <div key={item.id ?? i} className="border-b">
                    <NavLink
                      href={item.href ?? "#"}
                      onClick={() => setOpen(false)}
                      className="py-3 min-h-11 text-base font-medium flex items-center"
                    >
                      {item.label}
                    </NavLink>
                  </div>
                ),
              )}
            </Accordion>
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  )
}
