"use client"

import * as React from "react"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
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
import { shellClasses } from "./_shell"
import { useAppLayout } from "./app-layout"
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
import { registerEnglish } from "../../i18n/english"
import { layout as en_layout } from "../../locales/en/layout"

registerEnglish({ layout: en_layout })

export interface AppSidebarProps extends Omit<React.ComponentProps<typeof Sidebar>, "children"> {
  /** Flat list of items (or use `groups`). */
  items?: NavItem[]
  /** Labelled groups of items. */
  groups?: NavGroup[]
  /** The current URL path; the matching item is highlighted and gets `aria-current="page"`. */
  currentHref?: string
  /** `prefix` (default): `/users/12` keeps `/users` active. `exact`: only exact matches. */
  match?: NavMatch
  /** Top of the sidebar, e.g. a `Logo` (and an `AppSwitcher`). */
  header?: React.ReactNode
  /**
   * The main call to action under the header, e.g. a "New application"
   * `Button` or `LinkButton`. Shown as a full-width 44px button; collapsed to
   * icons, only its icon shows.
   */
  action?: React.ReactNode
  /** Bottom of the sidebar, e.g. a quota `ProgressBar` or a `UserProfile`. */
  footer?: React.ReactNode
  /**
   * `shell` (the default inside a panel `AppLayout`): Proton's sidebar on the
   * app shell colour, with grey hover and active items, brand count pills and
   * no edge line. `sidebar`: the sidebar colour with an edge line and
   * brand-tinted active items (the default elsewhere).
   */
  surface?: "sidebar" | "shell"
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
    action?: string
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
  shell: boolean
  activeHref: string | undefined
  navigate: (item: NavItem, event: React.MouseEvent<HTMLElement>) => void
  collapsedIcons: boolean
  menuSide: "left" | "right"
  classNames: AppSidebarProps["classNames"]
}

/** Count pills on the shell: brand pills for unread-like counts, plain muted numbers for `badgeTone: "neutral"`. */
const SHELL_BADGE = {
  brand:
    "h-5 min-w-6 px-1.5 rounded-full bg-primary font-semibold text-primary-foreground peer-hover/menu-button:text-primary-foreground peer-data-active/menu-button:text-primary-foreground",
  neutral:
    "font-medium text-muted-foreground peer-hover/menu-button:text-muted-foreground peer-data-active/menu-button:text-muted-foreground",
} as const

function Badge({ item, ctx }: { item: NavItem; ctx: Ctx }) {
  if (item.badge === undefined || item.badge === null || item.badge === false) return null
  return (
    <SidebarMenuBadge
      data-tone={item.badgeTone ?? "brand"}
      className={cn(
        ctx.shell &&
          cn(
            "end-2 peer-data-[size=default]/menu-button:top-2 touch:peer-data-[size=default]/menu-button:top-3",
            typeof item.badge === "number" ? SHELL_BADGE[item.badgeTone ?? "brand"] : "",
          ),
        ctx.classNames?.badge,
      )}
    >
      <NavBadge badge={item.badge} tone={item.badgeTone} />
    </SidebarMenuBadge>
  )
}

/**
 * Proton's navigation items: 36px rows with 8px corners, grey hover and
 * active states on the shell, a semibold active label and a brand icon.
 */
const SHELL_BUTTON = cn(
  "h-9 gap-3 px-2.5 text-sm rounded-lg text-[color:var(--shell-foreground,var(--foreground))]",
  "hover:text-[color:var(--shell-foreground,var(--foreground))] active:text-[color:var(--shell-foreground,var(--foreground))] data-active:text-[color:var(--shell-foreground,var(--foreground))]",
  shellClasses.hover,
  "active:bg-[color:var(--shell-active,rgb(194_192_190/0.35))] dark:active:bg-[color:var(--shell-active,rgb(91_87_107/0.4))]",
  shellClasses.active,
  "data-active:font-semibold [&>svg]:text-muted-foreground data-active:[&>svg]:text-primary",
  "group-has-data-[sidebar=menu-badge]/menu-item:pe-12",
)

/** An item's icon: a semantic name or node, tinted by `color` (folders and labels), or a coloured dot. */
function ItemIcon({ item }: { item: NavItem }) {
  if (item.color) {
    if (item.icon === undefined || item.icon === null || item.icon === false) {
      return (
        <span
          aria-hidden="true"
          data-slot="nav-dot"
          className="size-2.5 mx-[3px] shrink-0 rounded-full bg-(--nav-color) forced-colors:border"
          style={{ "--nav-color": item.color } as React.CSSProperties}
        />
      )
    }
    if (typeof item.icon === "string") {
      return (
        <Icon
          name={item.icon}
          data-slot="nav-color-icon"
          style={{ color: item.color, fill: `color-mix(in oklab, ${item.color} 25%, transparent)` }}
        />
      )
    }
  }
  return <NavIcon icon={item.icon} />
}

function hasBadge(item: NavItem) {
  return !(item.badge === undefined || item.badge === null || item.badge === false || item.badge === 0)
}

/**
 * A parent item's badge, laid out inside the button before the chevron (the
 * absolutely placed `SidebarMenuBadge` would sit on top of the chevron or the
 * submenu toggle).
 */
function InlineBadge({ item, ctx }: { item: NavItem; ctx: Ctx }) {
  if (!hasBadge(item)) return null
  return (
    <NavBadge
      badge={item.badge}
      tone={item.badgeTone}
      className={cn(
        "h-5 min-w-5 px-1 text-xs font-medium ms-auto flex shrink-0 items-center justify-center rounded-md tabular-nums group-data-[collapsible=icon]:hidden",
        ctx.shell &&
          typeof item.badge === "number" &&
          ((item.badgeTone ?? "brand") === "brand"
            ? "min-w-6 px-1.5 font-semibold rounded-full bg-primary text-primary-foreground"
            : "text-muted-foreground"),
        ctx.classNames?.badge,
      )}
    />
  )
}

function LeafItem({ item, ctx }: { item: NavItem; ctx: Ctx }) {
  const active = isSelfActive(item, ctx.activeHref)
  const buttonClass = cn("touch:min-h-11", ctx.shell && SHELL_BUTTON)
  const content = (
    <>
      <ItemIcon item={item} />
      <span>{item.label}</span>
    </>
  )
  return (
    <SidebarMenuItem className={ctx.classNames?.item}>
      {item.href && !item.disabled ? (
        <SidebarMenuButton asChild isActive={active} tooltip={plainLabel(item.label)} className={buttonClass}>
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
          className={buttonClass}
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
  const [wasWithinActive, setWasWithinActive] = React.useState(withinActive)
  if (wasWithinActive !== withinActive) {
    // Navigating into this item's pages expands it (state adjusted during render).
    setWasWithinActive(withinActive)
    if (withinActive) setOpen(true)
  }
  const children = item.items ?? []
  const buttonClass = cn("touch:min-h-11", ctx.shell && SHELL_BUTTON, ctx.shell && "pe-2.5")

  // Collapsed to icons on desktop: nested items open in a flyout menu instead.
  if (ctx.collapsedIcons) {
    return (
      <SidebarMenuItem className={ctx.classNames?.item}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              isActive={withinActive}
              tooltip={plainLabel(item.label)}
              className={cn(ctx.shell && SHELL_BUTTON)}
            >
              <ItemIcon item={item} />
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
  // With a badge, the badge takes the free space and the chevron follows it.
  const badged = hasBadge(item)
  const chevron = (
    <>
      <Icon name="chevron-right" className={cn(!badged && "ms-auto", "[[data-state=open]>&]:hidden")} />
      <Icon name="chevron-down" className={cn(!badged && "ms-auto", "hidden [[data-state=open]>&]:block")} />
    </>
  )

  return (
    <Collapsible asChild open={open} onOpenChange={setOpen}>
      <SidebarMenuItem className={ctx.classNames?.item}>
        {item.href ? (
          <>
            <SidebarMenuButton asChild isActive={selfActive} tooltip={plainLabel(item.label)} className={buttonClass}>
              <NavLink
                href={item.href}
                external={item.external}
                aria-current={selfActive ? "page" : undefined}
                onClick={(e) => ctx.navigate(item, e)}
              >
                <ItemIcon item={item} />
                <span className="min-w-0 truncate">{item.label}</span>
                <InlineBadge item={item} ctx={ctx} />
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
            <SidebarMenuButton isActive={false} tooltip={plainLabel(item.label)} className={buttonClass}>
              <ItemIcon item={item} />
              <span className="min-w-0 truncate">{item.label}</span>
              <InlineBadge item={item} ctx={ctx} />
              {chevron}
            </SidebarMenuButton>
          </CollapsibleTrigger>
        )}
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
                          tone={child.badgeTone}
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
  action,
  footer,
  children,
  rail = true,
  onNavigate,
  navLabel,
  collapsible = "icon",
  side = "start",
  surface: surfaceProp,
  className,
  classNames,
  ...props
}: AppSidebarProps) {
  const { t, dir } = useOnu()
  const layout = useAppLayout()
  const surface = surfaceProp ?? (layout?.variant === "flat" ? "sidebar" : "shell")
  const shell = surface === "shell"
  const { isMobile, setOpenMobile, state } = useSidebar()
  const allGroups = React.useMemo<NavGroup[]>(() => groups ?? [{ items: items ?? [] }], [groups, items])
  const flat = React.useMemo(() => allGroups.flatMap((g) => g.items), [allGroups])
  const activeHref = React.useMemo(() => resolveActiveHref(flat, currentHref, match), [flat, currentHref, match])

  const logicalSide = side === "end" || side === "right" ? "end" : "start"
  const ctx: Ctx = {
    shell,
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
    <Sidebar collapsible={collapsible} side={side} surface={surface} className={className} {...props}>
      {header || action ? (
        <SidebarHeader
          className={cn(shell && "gap-4 px-3 pt-4 pb-2 group-data-[collapsible=icon]:px-2", classNames?.header)}
        >
          {header}
          {action ? (
            <div
              data-slot="app-sidebar-action"
              className={cn(
                // The big call to action: a full-width 44px button (Proton's "New message").
                "[&>[data-slot=button]]:h-11 [&>[data-slot=button]]:font-semibold grid [&>*]:w-full [&>[data-slot=button]]:rounded-lg [&>[data-slot=button]]:text-[0.9375rem]",
                // Collapsed to icons: a 32px icon button, the label kept for screen readers by font-size 0.
                "group-data-[collapsible=icon]:[&>[data-slot=button]]:size-8 group-data-[collapsible=icon]:[&>[data-slot=button]]:min-w-0 group-data-[collapsible=icon]:[&>[data-slot=button]]:gap-0 group-data-[collapsible=icon]:[&>[data-slot=button]]:p-0 group-data-[collapsible=icon]:[&>[data-slot=button]]:text-[0px]",
                classNames?.action,
              )}
            >
              {action}
            </div>
          ) : null}
        </SidebarHeader>
      ) : null}
      <SidebarContent className={cn(shell && "px-1.5 group-data-[collapsible=icon]:px-0", classNames?.content)}>
        <nav aria-label={navLabel ?? t("layout.mainNavigation")} className="flex flex-col">
          {allGroups.map((group, gi) => (
            <SidebarGroup key={group.id ?? gi} className={classNames?.group}>
              {group.label ? (
                <SidebarGroupLabel
                  className={cn(
                    shell && "px-3 font-semibold text-[0.8125rem] text-muted-foreground",
                    classNames?.groupLabel,
                  )}
                >
                  {group.label}
                </SidebarGroupLabel>
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
      {footer ? <SidebarFooter className={cn(shell && "px-3 pb-3", classNames?.footer)}>{footer}</SidebarFooter> : null}
      {rail ? <SidebarRail /> : null}
    </Sidebar>
  )
}
