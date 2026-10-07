"use client"

import * as React from "react"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar"
import { Button } from "../../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu"
import { getInitials } from "../display/user-avatar"
import { NavIcon, NavLink } from "./_nav"

export interface UserProfileMenuItem {
  label: React.ReactNode
  icon?: string | React.ReactNode
  href?: string
  onSelect?: (event: Event) => void
  variant?: "default" | "destructive"
}

export interface UserProfileProps {
  name: string
  /** Role, email or other secondary line. */
  subtitle?: React.ReactNode
  avatarSrc?: string
  /** Initials when there is no image. Derived from `name` by default. */
  initials?: string
  /** Link for the built-in Profile item. */
  profileHref?: string
  /** Link for the built-in Settings item. */
  settingsHref?: string
  /** Adds a Sign out item. */
  onSignOut?: () => void
  /** Extra menu items between Settings and Sign out. */
  items?: UserProfileMenuItem[]
  /** Avatar only (headers, collapsed sidebars). */
  compact?: boolean
  /** Menu placement. */
  side?: "top" | "bottom"
  align?: "start" | "end"
  className?: string
  classNames?: { trigger?: string; avatar?: string; name?: string; subtitle?: string; content?: string }
}

/**
 * The signed-in user's avatar, name and role, opening a menu with Profile,
 * Settings, custom items and Sign out. Use it in a header (`compact`) or the
 * sidebar footer.
 */
export function UserProfile({
  name,
  subtitle,
  avatarSrc,
  initials,
  profileHref,
  settingsHref,
  onSignOut,
  items,
  compact = false,
  side = "bottom",
  align = "end",
  className,
  classNames,
}: UserProfileProps) {
  const { t } = useTranslation()

  const avatar = (
    <Avatar className={cn(compact ? "size-8" : "size-8 rounded-lg after:rounded-lg", classNames?.avatar)}>
      {avatarSrc ? <AvatarImage src={avatarSrc} alt="" /> : null}
      <AvatarFallback className={cn(!compact && "rounded-lg", "text-xs font-medium")}>
        {initials ?? getInitials(name)}
      </AvatarFallback>
    </Avatar>
  )

  const entries: UserProfileMenuItem[] = [
    ...(profileHref ? [{ label: t("layout.profile"), icon: "user", href: profileHref }] : []),
    ...(settingsHref ? [{ label: t("layout.settings"), icon: "settings", href: settingsHref }] : []),
    ...(items ?? []),
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          data-slot="user-profile"
          aria-label={t("layout.accountMenu", { name })}
          className={cn(
            compact
              ? "size-9 p-0 touch:size-11 rounded-full"
              : "gap-2 min-h-12 px-2 py-1.5 h-auto w-full justify-start text-start",
            classNames?.trigger,
            className,
          )}
        >
          {avatar}
          {!compact ? (
            <>
              <span className="min-w-0 leading-tight grid flex-1">
                <span className={cn("text-sm font-medium truncate", classNames?.name)}>{name}</span>
                {subtitle ? (
                  <span className={cn("text-xs font-normal truncate text-muted-foreground", classNames?.subtitle)}>
                    {subtitle}
                  </span>
                ) : null}
              </span>
              <Icon name="chevrons-up-down" className="size-4 ms-auto text-muted-foreground" />
            </>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side={side}
        align={align}
        className={cn("min-w-56 w-(--radix-dropdown-menu-trigger-width)", classNames?.content)}
      >
        <DropdownMenuLabel className="gap-2 py-1.5 font-normal flex items-center">
          {avatar}
          <span className="min-w-0 leading-tight grid flex-1">
            <span className="text-sm font-medium truncate text-foreground">{name}</span>
            {subtitle ? <span className="text-xs truncate text-muted-foreground">{subtitle}</span> : null}
          </span>
        </DropdownMenuLabel>
        {entries.length ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {entries.map((entry, i) =>
                entry.href ? (
                  <DropdownMenuItem
                    key={i}
                    asChild
                    variant={entry.variant}
                    onSelect={entry.onSelect}
                    className="touch:min-h-11"
                  >
                    <NavLink href={entry.href}>
                      <NavIcon icon={entry.icon} />
                      {entry.label}
                    </NavLink>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    key={i}
                    variant={entry.variant}
                    onSelect={entry.onSelect}
                    className="touch:min-h-11"
                  >
                    <NavIcon icon={entry.icon} />
                    {entry.label}
                  </DropdownMenuItem>
                ),
              )}
            </DropdownMenuGroup>
          </>
        ) : null}
        {onSignOut ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => onSignOut()} className="touch:min-h-11">
              <Icon name="log-out" />
              {t("layout.signOut")}
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
