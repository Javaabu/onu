"use client"

import * as React from "react"
import { formatDistance } from "date-fns"

import { useIsMobile } from "../../hooks/use-mobile"
import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { Button } from "../../ui/button"
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "../../ui/drawer"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "../../ui/empty"
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover"
import { NavIcon, NavLink, formatCount } from "./_nav"

export interface NotificationItem {
  id: string
  title: React.ReactNode
  description?: React.ReactNode
  /** When it happened; shown as relative time in the active locale. */
  time?: Date | string | number
  read?: boolean
  href?: string
  /** Semantic icon name or node (e.g. an avatar). */
  icon?: string | React.ReactNode
  /** Tints the icon. */
  variant?: "default" | "success" | "warning" | "error" | "info"
}

export interface NotificationCenterProps {
  notifications: NotificationItem[]
  onMarkRead?: (id: string) => void
  onMarkAllRead?: () => void
  /** Called when a notification is clicked (after navigation for links). */
  onItemClick?: (item: NotificationItem) => void
  /** Link to the full notifications page. */
  viewAllHref?: string
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Custom empty state. */
  empty?: React.ReactNode
  /** On phones the list opens in a bottom sheet (default) or the popover. */
  mobile?: "sheet" | "popover"
  /** Mark notifications read when clicked. */
  markReadOnClick?: boolean
  /** Reference time for relative times (tests, SSR). */
  now?: Date
  className?: string
  classNames?: { trigger?: string; count?: string; content?: string; list?: string; item?: string }
}

const VARIANT_CLASSES: Record<NonNullable<NotificationItem["variant"]>, string> = {
  default: "bg-muted text-muted-foreground",
  success: "bg-success/10 text-success",
  warning: "bg-warning/15 text-warning",
  error: "bg-destructive/10 text-destructive",
  info: "bg-info/10 text-info",
}

function toDate(value: Date | string | number) {
  return value instanceof Date ? value : new Date(value)
}

/**
 * A bell button with the unread count that opens the notification list: a
 * popover on desktop and a bottom sheet on phones. Items can be marked read one
 * by one or all at once; new unread items are announced in a live region.
 */
export function NotificationCenter({
  notifications,
  onMarkRead,
  onMarkAllRead,
  onItemClick,
  viewAllHref,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  empty,
  mobile = "sheet",
  markReadOnClick = true,
  now,
  className,
  classNames,
}: NotificationCenterProps) {
  const { t, locale } = useTranslation()
  const isMobile = useIsMobile()
  const [inner, setInner] = React.useState(defaultOpen)
  const open = openProp ?? inner
  const setOpen = (next: boolean) => {
    if (openProp === undefined) setInner(next)
    onOpenChange?.(next)
  }

  const unread = notifications.filter((n) => !n.read)
  const unreadKey = unread.map((n) => n.id).join("|")

  // Announce newly arrived unread notifications (adjusting state while rendering,
  // so no effect is needed).
  const [seen, setSeen] = React.useState(unreadKey)
  const [announcement, setAnnouncement] = React.useState("")
  if (seen !== unreadKey) {
    const before = new Set(seen ? seen.split("|") : [])
    const fresh = unread.filter((n) => !before.has(n.id)).length
    setSeen(unreadKey)
    if (fresh > 0) setAnnouncement(t("layout.newNotifications", { count: fresh }))
  }

  const titleId = React.useId()
  const count = unread.length
  const triggerLabel = t("layout.notificationsWithCount", { count })

  const trigger = (
    <Button
      variant="ghost"
      size="icon"
      aria-label={triggerLabel}
      data-slot="notification-center-trigger"
      className={cn("touch:size-11 relative", classNames?.trigger, className)}
    >
      <Icon name="bell" />
      {count > 0 ? (
        <span
          aria-hidden="true"
          data-slot="notification-center-count"
          className={cn(
            "-top-0.5 -end-0.5 h-4 min-w-4 px-1 font-semibold leading-4 absolute rounded-full bg-destructive text-[0.625rem] text-destructive-foreground tabular-nums ring-2 ring-background",
            classNames?.count,
          )}
        >
          {formatCount(count, locale.numberLocale)}
        </span>
      ) : null}
    </Button>
  )

  const list =
    notifications.length === 0 ? (
      (empty ?? (
        <Empty className="py-10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Icon name="bell" />
            </EmptyMedia>
            <EmptyTitle>{t("layout.noNotifications")}</EmptyTitle>
            <EmptyDescription>{t("layout.noNotificationsDescription")}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ))
    ) : (
      <ul
        data-slot="notification-center-list"
        aria-labelledby={titleId}
        className={cn("max-h-[min(28rem,60vh)] divide-y overflow-y-auto overscroll-contain", classNames?.list)}
      >
        {notifications.map((item) => {
          const time = item.time !== undefined ? toDate(item.time) : undefined
          const handleClick = () => {
            if (markReadOnClick && !item.read) onMarkRead?.(item.id)
            onItemClick?.(item)
            if (item.href) setOpen(false)
          }
          const body = (
            <>
              <span
                className={cn(
                  "mt-0.5 size-8 [&_svg]:size-4 flex shrink-0 items-center justify-center rounded-full",
                  VARIANT_CLASSES[item.variant ?? "default"],
                )}
              >
                <NavIcon icon={item.icon ?? "bell"} />
              </span>
              <span className="gap-0.5 min-w-0 flex flex-1 flex-col text-start">
                <span className={cn("text-sm", !item.read && "font-semibold")}>{item.title}</span>
                {item.description ? (
                  <span className="text-xs line-clamp-2 text-muted-foreground">{item.description}</span>
                ) : null}
                {time ? (
                  <time dateTime={time.toISOString()} className="text-xs text-muted-foreground">
                    {formatDistance(time, now ?? new Date(), { addSuffix: true, locale: locale.dateFns })}
                  </time>
                ) : null}
              </span>
              {!item.read ? <span className="sr-only">{t("layout.unread")}</span> : null}
            </>
          )
          const rowClass =
            "gap-3 px-3 py-3 flex w-full min-w-0 items-start outline-none transition-colors hover:bg-muted/60 focus-visible:bg-muted focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-ring/50"
          return (
            <li
              key={item.id}
              data-slot="notification-center-item"
              data-read={item.read ? "true" : "false"}
              className={cn("relative flex items-start", !item.read && "bg-primary/5", classNames?.item)}
            >
              {item.href ? (
                <NavLink href={item.href} onClick={handleClick} className={rowClass}>
                  {body}
                </NavLink>
              ) : (
                <button type="button" onClick={handleClick} className={rowClass}>
                  {body}
                </button>
              )}
              {!item.read && onMarkRead ? (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={t("layout.markRead")}
                  title={t("layout.markRead")}
                  onClick={() => onMarkRead(item.id)}
                  className="mt-2.5 me-2 touch:size-11 shrink-0"
                >
                  <span aria-hidden="true" className="size-2 rounded-full bg-primary" />
                </Button>
              ) : null}
            </li>
          )
        })}
      </ul>
    )

  const header = (
    <div className="gap-2 px-3 py-2 flex items-center justify-between border-b">
      <span id={titleId} className="text-sm font-semibold">
        {t("layout.notifications")}
      </span>
      {onMarkAllRead && count > 0 ? (
        <Button variant="ghost" size="sm" onClick={onMarkAllRead} className="touch:min-h-11">
          <Icon name="check" />
          {t("layout.markAllRead")}
        </Button>
      ) : null}
    </div>
  )

  const footer = viewAllHref ? (
    <div className="p-1 border-t">
      <Button asChild variant="ghost" className="touch:min-h-11 w-full">
        <NavLink href={viewAllHref} onClick={() => setOpen(false)}>
          {t("layout.viewAll")}
        </NavLink>
      </Button>
    </div>
  ) : null

  const live = (
    <span role="status" aria-live="polite" className="sr-only">
      {announcement}
    </span>
  )

  if (isMobile && mobile === "sheet") {
    return (
      <>
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerTrigger asChild>{trigger}</DrawerTrigger>
          <DrawerContent className={cn("pb-[env(safe-area-inset-bottom)]", classNames?.content)}>
            <DrawerHeader className="sr-only">
              <DrawerTitle>{t("layout.notifications")}</DrawerTitle>
              <DrawerDescription>{triggerLabel}</DrawerDescription>
            </DrawerHeader>
            {header}
            {list}
            {footer}
          </DrawerContent>
        </Drawer>
        {live}
      </>
    )
  }

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>{trigger}</PopoverTrigger>
        <PopoverContent
          align="end"
          aria-labelledby={titleId}
          className={cn("gap-0 p-0 w-[min(24rem,calc(100vw-2rem))] overflow-hidden", classNames?.content)}
        >
          {header}
          {list}
          {footer}
        </PopoverContent>
      </Popover>
      {live}
    </>
  )
}
