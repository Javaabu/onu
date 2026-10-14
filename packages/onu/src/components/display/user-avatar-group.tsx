"use client"

import * as React from "react"

import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover"
import { UserAvatar, type UserAvatarProps } from "./user-avatar"
import { registerEnglish } from "../../i18n/english"
import { display as en_display } from "../../locales/en/display"

registerEnglish({ display: en_display })

export interface AvatarGroupUser {
  id?: string | number
  name: string
  src?: string | null
  status?: UserAvatarProps["status"]
}

type Size = NonNullable<UserAvatarProps["size"]>

const OVERLAP: Record<Size, string> = {
  xs: "-space-x-1",
  sm: "-space-x-1.5",
  md: "-space-x-2",
  lg: "-space-x-2.5",
  xl: "-space-x-3",
}

const COUNT_SIZES: Record<Size, string> = {
  xs: "size-6 text-[0.625rem]",
  sm: "size-8 text-xs",
  md: "size-10 text-xs",
  lg: "size-12 text-sm",
  xl: "size-16 text-base",
}

export interface UserAvatarGroupProps extends Omit<React.ComponentProps<"div">, "children"> {
  users: AvatarGroupUser[]
  /** How many avatars to show before "+N". Default 4. */
  max?: number
  size?: Size
  shape?: UserAvatarProps["shape"]
  /** Render the overflow list yourself (default: names with avatars). */
  renderOverflow?: (hidden: AvatarGroupUser[]) => React.ReactNode
  classNames?: { avatar?: string; count?: string; popover?: string }
}

/**
 * Overlapping avatars with a "+N" button for the rest. The button opens a list
 * of the hidden people (tap or keyboard; nothing depends on hover).
 */
export function UserAvatarGroup({
  users,
  max = 4,
  size = "md",
  shape,
  renderOverflow,
  className,
  classNames,
  ...props
}: UserAvatarGroupProps) {
  const { t } = useTranslation()
  const limit = users.length > max ? Math.max(max - 1, 1) : max
  const visible = users.slice(0, limit)
  const hidden = users.slice(limit)

  return (
    <div
      role="group"
      aria-label={t("display.avatarGroup", { count: users.length })}
      data-slot="avatar-group"
      className={cn("flex items-center", OVERLAP[size], className)}
      {...props}
    >
      {visible.map((user, i) => (
        // Earlier avatars sit on top so their presence dots stay visible.
        <span key={user.id ?? i} className="relative inline-flex" style={{ zIndex: visible.length - i }}>
          <UserAvatar
            name={user.name}
            src={user.src}
            status={user.status}
            size={size}
            shape={shape}
            className={cn("[&_[data-slot=avatar]]:ring-2 [&_[data-slot=avatar]]:ring-background", classNames?.avatar)}
          />
        </span>
      ))}
      {hidden.length > 0 ? (
        <Popover>
          <PopoverTrigger
            data-slot="avatar-group-count"
            aria-label={t("display.avatarGroupMore", { count: hidden.length })}
            className={cn(
              "font-medium touch:after:-inset-1 relative inline-flex shrink-0 items-center justify-center bg-muted text-muted-foreground tabular-nums ring-2 ring-background outline-none hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50 touch:after:absolute",
              shape === "square" ? "rounded-lg" : "rounded-full",
              COUNT_SIZES[size],
              classNames?.count,
            )}
          >
            <span dir="ltr">+{hidden.length}</span>
          </PopoverTrigger>
          <PopoverContent className={cn("w-60 p-2", classNames?.popover)}>
            {renderOverflow ? (
              renderOverflow(hidden)
            ) : (
              <ul className="gap-1 max-h-64 grid overflow-y-auto">
                {hidden.map((user, i) => (
                  <li key={user.id ?? i} className="gap-2 px-1 py-1 text-sm flex items-center">
                    <UserAvatar name={user.name} src={user.src} size="xs" shape={shape} decorative />
                    <span className="truncate">{user.name}</span>
                  </li>
                ))}
              </ul>
            )}
          </PopoverContent>
        </Popover>
      ) : null}
    </div>
  )
}
