"use client"

import * as React from "react"
import { cva } from "class-variance-authority"
import { format as formatDate, isSameDay, startOfDay, subDays } from "date-fns"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { Button } from "../../ui/button"
import { toDate, useNow, type DateInput } from "../display/_utils"
import { RelativeDate } from "../display/relative-date"
import { UserAvatar } from "../display/user-avatar"
import { NavIcon } from "./_nav"
import { registerEnglish } from "../../i18n/english"
import { layout as en_layout } from "../../locales/en/layout"

registerEnglish({ layout: en_layout })

export type TimelineStatus = "default" | "success" | "error" | "warning" | "info" | "pending" | "current"

export interface TimelineItem {
  id?: string | number
  /** What happened. With an `actor`, it follows their name ("approved the application"). */
  title: React.ReactNode
  description?: React.ReactNode
  /** When it happened. Formatted with the active locale. */
  time?: Date | string | number
  status?: TimelineStatus
  /** Semantic icon name or node; defaults to an icon for the status. */
  icon?: string | React.ReactNode
  /** Who did it: their avatar is the marker (unless `icon` is set) and their name starts the title. */
  actor?: { name: string; avatar?: string | null } | null
  /** Extra content under the description (attachments, a quote, buttons). */
  content?: React.ReactNode
}

export interface TimelineGroup {
  key: string
  /** Start of the day. */
  date: Date
  items: TimelineItem[]
}

/**
 * Groups items by calendar day, in the order the days first appear, keeping
 * item order within a day. Items without a valid `time` are left out.
 */
export function groupTimelineByDay(items: TimelineItem[]): TimelineGroup[] {
  const groups: TimelineGroup[] = []
  for (const item of items) {
    const date = toDate(item.time)
    if (!date) continue
    const day = startOfDay(date)
    let group = groups.find((g) => isSameDay(g.date, day))
    if (!group) {
      group = { key: day.toISOString(), date: day, items: [] }
      groups.push(group)
    }
    group.items.push(item)
  }
  return groups
}

export const timelineMarkerVariants = cva(
  "[&_svg]:size-3.5 relative z-10 flex shrink-0 items-center justify-center rounded-full ring-4 ring-background",
  {
    variants: {
      status: {
        default: "bg-muted text-muted-foreground",
        success: "bg-success text-success-foreground",
        error: "bg-destructive text-destructive-foreground",
        warning: "bg-warning text-warning-foreground",
        info: "bg-info text-info-foreground",
        pending: "border-2 border-dashed border-border bg-background text-muted-foreground",
        current: "bg-primary text-primary-foreground",
      },
      size: {
        sm: "size-5",
        default: "size-7",
      },
    },
    defaultVariants: { status: "default", size: "default" },
  },
)

const STATUS_ICONS: Record<TimelineStatus, string | null> = {
  default: null,
  success: "check",
  error: "close",
  warning: "warning",
  info: "info",
  pending: "clock",
  current: "dot",
}

const STATUS_KEYS: Record<TimelineStatus, string | null> = {
  default: null,
  success: "layout.statusSuccess",
  error: "layout.statusError",
  warning: "layout.statusWarning",
  info: "layout.statusInfo",
  pending: "layout.statusPending",
  current: "layout.statusCurrent",
}

export interface TimelineProps extends Omit<React.HTMLAttributes<HTMLElement>, "children" | "title"> {
  items: TimelineItem[]
  /** `absolute` (date-fns pattern, default `PPp`) or `relative` ("3 days ago", exact time on hover and focus). */
  timeFormat?: "absolute" | "relative"
  /** date-fns pattern for absolute times. */
  datePattern?: string
  /** Reference time for relative times and day headings (tests, SSR). Default: now, kept up to date. */
  now?: DateInput
  size?: "sm" | "default"
  /** Group entries under day headings (Today, Yesterday, 3 October 2026). */
  groupByDay?: boolean
  /** date-fns format for day headings older than yesterday. Default `"PPP"`. */
  dayFormat?: string
  /** A heading (`h2`) above the entries; the timeline is named after it. */
  title?: React.ReactNode
  /** Shown when there are no items. Default "No activity yet". */
  emptyText?: React.ReactNode
  /** Show a "Load more" button after the entries. */
  hasMore?: boolean
  onLoadMore?: () => void | Promise<unknown>
  /** Shows a spinner on "Load more". Set automatically while `onLoadMore`'s promise runs. */
  loadingMore?: boolean
  classNames?: {
    item?: string
    marker?: string
    title?: string
    time?: string
    description?: string
    group?: string
    heading?: string
    empty?: string
    loadMore?: string
  }
  ref?: React.Ref<HTMLElement>
}

/**
 * A vertical timeline: status trackers, activity histories and who-did-what
 * feeds. Each entry has a status marker with an icon and colour (and a
 * screen-reader status, R14.6) or the actor's avatar, a title, a localised
 * time and details. Entries can be grouped by day, with "Load more". The line
 * sits on the inline start, so it mirrors in RTL.
 */
export function Timeline({
  items,
  timeFormat = "absolute",
  datePattern = "PPp",
  now,
  size = "default",
  groupByDay = false,
  dayFormat = "PPP",
  title,
  emptyText,
  hasMore = false,
  onLoadMore,
  loadingMore,
  className,
  classNames,
  "aria-label": ariaLabel,
  ref,
  ...props
}: TimelineProps) {
  const { t, locale } = useTranslation()
  const id = React.useId()
  const [pending, setPending] = React.useState(false)
  const busy = loadingMore ?? pending
  const live = useNow(groupByDay && !now ? 60_000 : null)
  const reference = toDate(now) ?? new Date(live)
  const label = ariaLabel ?? t("layout.timeline")

  const dayLabel = (date: Date) => {
    if (isSameDay(date, reference)) return t("layout.today")
    if (isSameDay(date, subDays(reference, 1))) return t("layout.yesterday")
    return formatDate(date, dayFormat, { locale: locale.dateFns })
  }

  const loadMore = async () => {
    if (!onLoadMore) return
    setPending(true)
    try {
      await onLoadMore()
    } finally {
      setPending(false)
    }
  }

  const renderEntries = (entries: TimelineItem[]) =>
    entries.map((item, i) => {
      const status = item.status ?? "default"
      const icon = item.icon ?? STATUS_ICONS[status]
      const statusKey = STATUS_KEYS[status]
      const date = toDate(item.time) ?? undefined
      const last = i === entries.length - 1
      const showAvatar = !!item.actor && !item.icon
      return (
        <li
          key={item.id ?? i}
          data-slot="timeline-item"
          data-status={status}
          aria-current={status === "current" ? "step" : undefined}
          className={cn("gap-3 relative flex", classNames?.item)}
        >
          {!last ? (
            <span
              aria-hidden="true"
              className={cn(
                "top-0 bottom-0 absolute w-px bg-border",
                size === "sm" ? "start-2.5 translate-y-5" : "start-3.5 translate-y-7",
                "ltr:-translate-x-1/2 rtl:translate-x-1/2",
              )}
            />
          ) : null}
          {showAvatar ? (
            <span
              aria-hidden="true"
              data-slot="timeline-marker"
              className={cn(
                "relative z-10 shrink-0 rounded-full ring-4 ring-background",
                size === "sm" ? "size-5" : "size-7",
                classNames?.marker,
              )}
            >
              <UserAvatar
                name={item.actor!.name}
                src={item.actor!.avatar}
                size="xs"
                decorative
                className="size-full [&_[data-slot=avatar]]:size-full"
              />
            </span>
          ) : (
            <span
              aria-hidden="true"
              data-slot="timeline-marker"
              className={cn(timelineMarkerVariants({ status, size }), classNames?.marker)}
            >
              {icon === "dot" ? (
                <span className="size-2 rounded-full bg-current" />
              ) : icon ? (
                <NavIcon icon={icon} />
              ) : (
                <Icon name="dot" className="size-2" />
              )}
            </span>
          )}
          <div className={cn("gap-1 min-w-0 flex flex-1 flex-col", !last && "pb-6", size === "sm" ? "pt-0" : "pt-1")}>
            <div className="gap-x-3 gap-y-0.5 flex flex-wrap items-baseline justify-between">
              <p className={cn("text-sm font-medium text-pretty", classNames?.title)}>
                {item.actor ? (
                  <>
                    {item.actor.name} <span className="font-normal text-muted-foreground">{item.title}</span>
                  </>
                ) : (
                  item.title
                )}
                {statusKey ? <span className="sr-only"> ({t(statusKey)})</span> : null}
              </p>
              {date ? (
                timeFormat === "relative" ? (
                  <RelativeDate
                    value={date}
                    now={now}
                    className={cn("text-xs text-muted-foreground tabular-nums", classNames?.time)}
                  />
                ) : (
                  <time
                    dateTime={date.toISOString()}
                    className={cn("text-xs text-muted-foreground tabular-nums", classNames?.time)}
                  >
                    {formatDate(date, datePattern, { locale: locale.dateFns })}
                  </time>
                )
              ) : null}
            </div>
            {item.description ? (
              <div className={cn("text-sm text-muted-foreground", classNames?.description)}>{item.description}</div>
            ) : null}
            {item.content ? <div className="mt-1">{item.content}</div> : null}
          </div>
        </li>
      )
    })

  const hasTitle = title !== undefined && title !== null
  const sectioned = hasTitle || groupByDay || hasMore || items.length === 0

  if (!sectioned) {
    return (
      <ol
        ref={ref as React.Ref<HTMLOListElement>}
        data-slot="timeline"
        aria-label={label}
        className={cn("flex flex-col", className)}
        {...props}
      >
        {renderEntries(items)}
      </ol>
    )
  }

  const groups = groupByDay ? groupTimelineByDay(items) : [{ key: "all", date: reference, items }]

  return (
    <section
      ref={ref}
      data-slot="timeline"
      aria-labelledby={hasTitle ? `${id}-title` : undefined}
      aria-label={hasTitle ? undefined : label}
      aria-busy={busy || undefined}
      className={cn("gap-4 grid", className)}
      {...props}
    >
      {hasTitle ? (
        <h2 id={`${id}-title`} className="text-base font-medium">
          {title}
        </h2>
      ) : null}
      {items.length === 0 ? (
        <p data-slot="timeline-empty" className={cn("text-sm text-muted-foreground", classNames?.empty)}>
          {emptyText ?? t("layout.noActivity")}
        </p>
      ) : (
        groups.map((group, g) => (
          <div key={group.key} data-slot="timeline-group" className={cn("gap-3 grid", classNames?.group)}>
            {groupByDay ? (
              <h3
                id={`${id}-day-${g}`}
                className={cn("text-xs font-medium tracking-wide text-muted-foreground uppercase", classNames?.heading)}
              >
                {dayLabel(group.date)}
              </h3>
            ) : null}
            <ol aria-labelledby={groupByDay ? `${id}-day-${g}` : undefined} className="flex flex-col">
              {renderEntries(group.items)}
            </ol>
          </div>
        ))
      )}
      {hasMore ? (
        <Button
          type="button"
          variant="outline"
          className={cn("touch:h-11 justify-self-center", classNames?.loadMore)}
          disabled={busy}
          onClick={() => void loadMore()}
        >
          {busy ? <Icon name="loading" data-icon="inline-start" className="animate-spin" /> : null}
          {t("layout.loadMore")}
        </Button>
      ) : null}
    </section>
  )
}
