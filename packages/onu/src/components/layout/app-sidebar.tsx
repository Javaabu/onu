"use client"

import * as React from "react"

import { Icon } from "../../icons/icon"
import { useOnu, useTranslation } from "../../providers/onu-provider"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from "../../ui/sidebar"
import {
  NavBadge,
  NavIcon,
  NavLink,
  isItemActive,
  isSelfActive,
  itemKey,
  physicalSide,
  resolveActiveHref,
  type NavGroup,
  type NavItem,
  type NavMatch,
} from "./_nav"

export interface AppSidebarProps extends Omit<React.ComponentProps<typeof Sidebar>, "children"> {
  /** Flat list of items (or use `groups`). */
  items?: NavItem[]
  /** Labelled groups of items. */
  groups?: NavGroup[]
  /** The current URL path; the matching item is highlighted and gets `aria-current="page"`. */
  currentHref?: string
  /** `prefix` (default): `/users/12` keeps `/users` active. `exact`: only exact matches. */
  match?: NavMatch
  /** Top of the sidebar, e.g. a `Logo`. */
  header?: React.ReactNode
  /** Bottom of the sidebar, e.g. a `UserProfile`. */
  footer?: React.ReactNode
  /** Extra content after the groups. */
  children?: React.ReactNode
  /** Show the thin rail that toggles the sidebar on desktop. */
  rail?: boolean
  /** Called after an item is activated (the phone drawer closes by itself). */
  onNavigate?: (item: NavItem) => void
  /** Accessible name of the navigation landmark. */
  navLabel?: string
  classNames?: {
    header?: string
    content?: string
    footer?: string
    group?: string
    groupLabel?: string
    item?: string
    badge?: string
  }
}

function plainLabel(label: React.ReactNode) {
  return typeof label === "string" || typeof label === "number" ? String(label) : undefined
}

interface Ctx {
  activeHref: string | undefined
  navigate: (item: NavItem, event: React.MouseEvent<HTMLElement>) => void
  collapsedIcons: boolean
  menuSide: "left" | "right"
  classNames: AppSidebarProps["classNames"]
}

function Badge({ item, ctx }: { item: NavItem; ctx: Ctx }) {
  if (item.badge === undefined || item.badge === null || item.badge === false) return null
  return (
    <SidebarMenuBadge className={ctx.classNames?.badge}>
      <NavBadge badge={item.badge} />
    </SidebarMenuBadge>
  )
}

function LeafItem({ item, ctx }: { item: NavItem; ctx: Ctx }) {
  const active = isSelfActive(item, ctx.activeHref)
  const content = (
    <>
      <NavIcon icon={item.icon} />
      <span>{item.label}</span>
    </>
  )
  return (
    <SidebarMenuItem className={ctx.classNames?.item}>
      {item.href && !item.disabled ? (
        <SidebarMenuButton asChild isActive={active} tooltip={plainLabel(item.label)} className="touch:min-h-11">
          <NavLink
            href={item.href}
            external={item.external}
            aria-current={active ? "page" : undefined}
            onClick={(e) => ctx.navigate(item, e)}
          >
            {content}
          </NavLink>
        </SidebarMenuButton>
      ) : (
        <SidebarMenuButton
          tooltip={plainLabel(item.label)}
          aria-disabled={item.disabled || undefined}
          onClick={item.disabled ? undefined : (e) => ctx.navigate(item, e)}
          className="touch:min-h-11"
        >
          {content}
        </SidebarMenuButton>
      )}
      <Badge item={item} ctx={ctx} />
    </SidebarMenuItem>
  )
}

function ParentItem({ item, ctx }: { item: NavItem; ctx: Ctx }) {
  const { t } = useTranslation()
  const withinActive = isItemActive(item, ctx.activeHref)
  const selfActive = isSelfActive(item, ctx.activeHref)
  const [open, setOpen] = React.useState(withinActive)
  const children = item.items ?? []

  // Collapsed to icons on desktop: nested items open in a flyout menu instead.
  if (ctx.collapsedIcons) {
    return (
      <SidebarMenuItem className={ctx.classNames?.item}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton isActive={withinActive} tooltip={plainLabel(item.label)}>
              <NavIcon icon={item.icon} />
              <span>{item.label}</span>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent side={ctx.menuSide} align="start" className="w-56">
            <DropdownMenuLabel>{item.label}</DropdownMenuLabel>
            {[...(item.href ? [{ ...item, items: undefined }] : []), ...children].map((child, i) => {
              const active = isSelfActive(child, ctx.activeHref)
              return child.href ? (
                <DropdownMenuItem key={itemKey(child, i)} asChild disabled={child.disabled}>
                  <NavLink
                    href={child.href}
                    external={child.external}
                    aria-current={active ? "page" : undefined}
                    data-active={active || undefined}
                    className="data-active:font-medium"
                    onClick={(e) => ctx.navigate(child, e)}
                  >
                    <NavIcon icon={child.icon} />
                    {child.label}
                  </NavLink>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  key={itemKey(child, i)}
                  disabled={child.disabled}
                  onClick={(e) => ctx.navigate(child, e)}
                >
                  <NavIcon icon={child.icon} />
                  {child.label}
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    )
  }

  // Points to the inline end when closed (mirrors in RTL) and down when open.
  const chevron = (
    <>
      <Icon name="chevron-right" className="ms-auto [[data-state=open]>&]:hidden" />
      <Icon name="chevron-down" className="ms-auto hidden [[data-state=open]>&]:block" />
    </>
  )

  return (
    <Collapsible asChild open={open} onOpenChange={setOpen}>
      <SidebarMenuItem className={ctx.classNames?.item}>
        {item.href ? (
          <>
            <SidebarMenuButton
              asChild
              isActive={selfActive}
              tooltip={plainLabel(item.label)}
              className="touch:min-h-11"
            >
              <NavLink
                href={item.href}
                external={item.external}
                aria-current={selfActive ? "page" : undefined}
                onClick={(e) => ctx.navigate(item, e)}
              >
                <NavIcon icon={item.icon} />
                <span>{item.label}</span>
              </NavLink>
            </SidebarMenuButton>
            <CollapsibleTrigger asChild>
              <SidebarMenuAction
                aria-label={t("layout.toggleSubmenu", { label: plainLabel(item.label) ?? "" })}
                className="touch:size-9"
              >
                {chevron}
              </SidebarMenuAction>
            </CollapsibleTrigger>
          </>
        ) : (
          <CollapsibleTrigger asChild>
            <SidebarMenuButton isActive={false} tooltip={plainLabel(item.label)} className="touch:min-h-11">
              <NavIcon icon={item.icon} />
              <span>{item.label}</span>
              {chevron}
            </SidebarMenuButton>
          </CollapsibleTrigger>
        )}
        {!item.href ? <Badge item={item} ctx={ctx} /> : null}
        <CollapsibleContent>
          <SidebarMenuSub>
            {children.map((child, i) => {
              const active = isSelfActive(child, ctx.activeHref)
              return (
                <SidebarMenuSubItem key={itemKey(child, i)}>
                  {child.href && !child.disabled ? (
                    <SidebarMenuSubButton asChild isActive={active} className="touch:min-h-11">
                      <NavLink
                        href={child.href}
                        external={child.external}
                        aria-current={active ? "page" : undefined}
                        onClick={(e) => ctx.navigate(child, e)}
                      >
                        <NavIcon icon={child.icon} />
                        <span>{child.label}</span>
                        <NavBadge
                          badge={child.badge}
                          className="text-xs ms-auto text-sidebar-foreground/70 tabular-nums"
                        />
                      </NavLink>
                    </SidebarMenuSubButton>
                  ) : (
                    <SidebarMenuSubButton aria-disabled="true">
                      <NavIcon icon={child.icon} />
                      <span>{child.label}</span>
                    </SidebarMenuSubButton>
                  )}
                </SidebarMenuSubItem>
              )
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
}

/**
 * The app's main sidebar with a simple `items`/`groups` API: icons, badges,
 * nested items and the active state from `currentHref`. Built on the shadcn
 * sidebar, so it collapses to icons (`collapsible="icon"`) or off-canvas on
 * desktop and becomes a drawer on phones. Use inside `AppLayout` (or a
 * `SidebarProvider`).
 */
export function AppSidebar({
  items,
  groups,
  currentHref,
  match = "prefix",
  header,
  footer,
  children,
  rail = true,
  onNavigate,
  navLabel,
  collapsible = "icon",
  side = "start",
  className,
  classNames,
  ...props
}: AppSidebarProps) {
  const { t, dir } = useOnu()
  const { isMobile, setOpenMobile, state } = useSidebar()
  const allGroups = React.useMemo<NavGroup[]>(() => groups ?? [{ items: items ?? [] }], [groups, items])
  const flat = React.useMemo(() => allGroups.flatMap((g) => g.items), [allGroups])
  const activeHref = React.useMemo(() => resolveActiveHref(flat, currentHref, match), [flat, currentHref, match])

  const logicalSide = side === "end" || side === "right" ? "end" : "start"
  const ctx: Ctx = {
    activeHref,
    navigate: (item, event) => {
      item.onSelect?.(event)
      onNavigate?.(item)
      if (isMobile) setOpenMobile(false)
    },
    collapsedIcons: !isMobile && state === "collapsed" && collapsible === "icon",
    menuSide: physicalSide(logicalSide === "start" ? "end" : "start", dir),
    classNames,
  }

  return (
    <Sidebar collapsible={collapsible} side={side} className={className} {...props}>
      {header ? <SidebarHeader className={classNames?.header}>{header}</SidebarHeader> : null}
      <SidebarContent className={classNames?.content}>
        <nav aria-label={navLabel ?? t("layout.mainNavigation")} className="flex flex-col">
          {allGroups.map((group, gi) => (
            <SidebarGroup key={group.id ?? gi} className={classNames?.group}>
              {group.label ? (
                <SidebarGroupLabel className={classNames?.groupLabel}>{group.label}</SidebarGroupLabel>
              ) : null}
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item, i) =>
                    item.items?.length ? (
                      <ParentItem key={itemKey(item, i)} item={item} ctx={ctx} />
                    ) : (
                      <LeafItem key={itemKey(item, i)} item={item} ctx={ctx} />
                    ),
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </nav>
        {children}
      </SidebarContent>
      {footer ? <SidebarFooter className={classNames?.footer}>{footer}</SidebarFooter> : null}
      {rail ? <SidebarRail /> : null}
    </Sidebar>
  )
}
