"use client"

import * as React from "react"

import { useIsMobile } from "../../hooks/use-mobile"
import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../../ui/breadcrumb"
import { Button } from "../../ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../ui/dropdown-menu"
import { NavIcon, NavLink } from "./_nav"

export interface BreadcrumbsItem {
  label: React.ReactNode
  /** Link target. The last item is always rendered as the current page, without a link. */
  href?: string
  /** Semantic icon name or node. */
  icon?: string | React.ReactNode
}

export interface BreadcrumbsProps extends Omit<React.ComponentProps<"nav">, "children"> {
  items: BreadcrumbsItem[]
  /**
   * Collapse middle items into a menu when there are more than this many items.
   * Phones always collapse to first › … › last (see `collapseOnMobile`).
   */
  maxItems?: number
  /** On phones, keep only the first and last items and put the rest in a menu (§25.8). */
  collapseOnMobile?: boolean
  /** Custom separator. The default chevron mirrors in RTL. */
  separator?: React.ReactNode
  classNames?: { list?: string; item?: string; link?: string; page?: string; separator?: string; menu?: string }
}

/**
 * Breadcrumb trail (§25.8): every part is a link except the last, which is the
 * current page. Middle parts collapse into a menu on phones or past `maxItems`.
 * Links go through the configured link component (R16.2).
 */
export function Breadcrumbs({
  items,
  maxItems,
  collapseOnMobile = true,
  separator,
  className,
  classNames,
  ...props
}: BreadcrumbsProps) {
  const { t } = useTranslation()
  const isMobile = useIsMobile()

  const limit = isMobile && collapseOnMobile ? 2 : maxItems
  const collapse = limit !== undefined && items.length > Math.max(limit, 2)
  // Keep the first item and the last (limit - 1) items; the rest go into the menu.
  const tailCount = collapse ? Math.max(1, (limit ?? 2) - 1) : 0
  const head = collapse ? items.slice(0, 1) : items
  const hidden = collapse ? items.slice(1, items.length - tailCount) : []
  const tail = collapse ? items.slice(items.length - tailCount) : []

  const sep = (key: string) => (
    <BreadcrumbSeparator key={key} className={classNames?.separator}>
      {separator ?? <Icon name="chevron-right" />}
    </BreadcrumbSeparator>
  )

  const renderItem = (item: BreadcrumbsItem, index: number, isLast: boolean) => (
    <BreadcrumbItem key={`item-${index}`} className={cn("min-w-0", classNames?.item)}>
      {isLast || !item.href ? (
        <BreadcrumbPage
          className={cn("gap-1.5 min-w-0 inline-flex items-center", classNames?.page)}
          {...(isLast ? {} : { "aria-current": undefined })}
        >
          <NavIcon icon={item.icon} className="size-3.5" />
          <span className="truncate">{item.label}</span>
        </BreadcrumbPage>
      ) : (
        <BreadcrumbLink
          asChild
          className={cn(
            // Ant: a muted link with a soft fill on hover.
            "gap-1.5 min-w-0 -mx-1 px-1 inline-flex items-center rounded-sm hover:bg-foreground/6",
            classNames?.link,
          )}
        >
          <NavLink href={item.href}>
            <NavIcon icon={item.icon} className="size-3.5" />
            <span className="truncate">{item.label}</span>
          </NavLink>
        </BreadcrumbLink>
      )}
    </BreadcrumbItem>
  )

  const nodes: React.ReactNode[] = []
  head.forEach((item, i) => {
    if (i > 0) nodes.push(sep(`sep-h${i}`))
    nodes.push(renderItem(item, i, !collapse && i === items.length - 1))
  })
  if (collapse) {
    nodes.push(sep("sep-menu"))
    nodes.push(
      <BreadcrumbItem key="menu">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label={t("layout.showMoreBreadcrumbs")}
              className="touch:size-11"
            >
              <Icon name="more" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className={cn("max-w-72 w-auto", classNames?.menu)}>
            {hidden.map((item, i) =>
              item.href ? (
                <DropdownMenuItem key={i} asChild>
                  <NavLink href={item.href}>
                    <NavIcon icon={item.icon} />
                    {item.label}
                  </NavLink>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem key={i} disabled>
                  {item.label}
                </DropdownMenuItem>
              ),
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </BreadcrumbItem>,
    )
    tail.forEach((item, i) => {
      nodes.push(sep(`sep-t${i}`))
      const index = items.length - tailCount + i
      nodes.push(renderItem(item, index, index === items.length - 1))
    })
  }

  return (
    <Breadcrumb
      aria-label={t("layout.breadcrumb")}
      data-collapsed={collapse || undefined}
      className={className}
      {...props}
    >
      <BreadcrumbList className={cn("gap-2 sm:flex-wrap flex-nowrap", classNames?.list)}>{nodes}</BreadcrumbList>
    </Breadcrumb>
  )
}
