"use client"

import * as React from "react"
import { format as formatDate, isSameDay, startOfDay, subDays } from "date-fns"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { Button } from "../../ui/button"
import { toDate, useNow, type DateInput } from "./_utils"
import { RelativeDate } from "./relative-date"
import { UserAvatar } from "./user-avatar"
import { registerEnglish } from "../../i18n/english"
import { display as en_display } from "../../locales/en/display"

registerEnglish({ display: en_display })

export interface ActivityItem {
  id: string | number
  /** Who did it. Omit for system events. */
  actor?: { name: string; avatar?: string | null } | null
  /** What happened, e.g. "approved the application". Rendered after the actor's name. */
  action: React.ReactNode
  timestamp: DateInput
  /** Semantic icon name or node shown instead of the avatar (system events). */
  icon?: string | React.ReactNode
  /** Extra detail under the action (a comment excerpt, changed fields). */
  detail?: React.ReactNode
}

export interface ActivityGroup {
  key: string
  date: Date
  items: ActivityItem[]
}

/** Groups items by calendar day, newest day first, keeping item order within a day. */
export function groupActivityByDay(items: ActivityItem[]): ActivityGroup[] {
  const groups: ActivityGroup[] = []
  for (const item of items) {
    const date = toDate(item.timestamp)
    if (!date) continue
    const day = startOfDay(date)
    let group = groups.find((g) => isSameDay(g.date, day))
    if (!group) {
      group = { key: day.toISOString(), date: day, items: [] }
      groups.push(group)
    }
    group.items.push(item)
  }
  return groups.sort((a, b) => b.date.getTime() - a.date.getTime())
}

export interface ActivityFeedProps extends Omit<React.ComponentProps<"section">, "title"> {
  items: ActivityItem[]
  /** Show a "Load more" button. */
  hasMore?: boolean
  onLoadMore?: () => void | Promise<unknown>
  /** Shows a spinner on "Load more". Set automatically while `onLoadMore`'s promise runs. */
  loadingMore?: boolean
  /** Group under day headings (Today, Yesterday, 3 October 2026). Default `true`. */
  groupByDay?: boolean
  /** date-fns format for day headings. Default `"PPP"`. */
  dayFormat?: string
  /** Heading; pass `null` to hide it. */
  title?: React.ReactNode
  emptyText?: React.ReactNode
  /** Reference time (tests, SSR). */
  now?: DateInput
  classNames?: { group?: string; heading?: string; item?: string; loadMore?: string }
}

/**
 * A log of who did what and when, grouped by day, with actor avatars, relative
 * timestamps and "Load more".
 */
export function ActivityFeed({
  items,
  hasMore = false,
  onLoadMore,
  loadingMore,
  groupByDay = true,
  dayFormat = "PPP",
  title,
  emptyText,
  now,
  className,
  classNames,
  ...props
}: ActivityFeedProps) {
  const { t, locale } = useTranslation()
  const headingId = React.useId()
  const [pending, setPending] = React.useState(false)
  const busy = loadingMore ?? pending
  const live = useNow(now ? null : 60_000)
  const reference = toDate(now) ?? new Date(live)
  const groups = groupByDay ? groupActivityByDay(items) : [{ key: "all", date: reference, items }]

  const dayLabel = (date: Date) => {
    if (isSameDay(date, reference)) return t("display.today")
    if (isSameDay(date, subDays(reference, 1))) return t("display.yesterday")
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

  return (
    <section
      data-slot="activity-feed"
      aria-labelledby={title === null ? undefined : headingId}
      aria-label={title === null ? t("display.activity") : undefined}
      aria-busy={busy || undefined}
      className={cn("gap-4 grid", className)}
      {...props}
    >
      {title === null ? null : (
        <h2 id={headingId} className="text-base font-medium">
          {title ?? t("display.activity")}
        </h2>
      )}
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyText ?? t("display.noActivity")}</p>
      ) : (
        groups.map((group) => (
          <div key={group.key} data-slot="activity-group" className={cn("gap-2 grid", classNames?.group)}>
            {groupByDay ? (
              <h3
                className={cn("text-xs font-medium tracking-wide text-muted-foreground uppercase", classNames?.heading)}
              >
                {dayLabel(group.date)}
              </h3>
            ) : null}
            <ol className="grid">
              {group.items.map((item, i) => (
                <li
                  key={item.id}
                  data-slot="activity-item"
                  className={cn("gap-3 pb-4 relative flex items-start", classNames?.item)}
                >
                  {i < group.items.length - 1 ? (
                    <span
                      aria-hidden
                      className="start-3.5 top-8 bottom-0 absolute w-px -translate-x-1/2 bg-border rtl:translate-x-1/2"
                    />
                  ) : null}
                  {item.icon ? (
                    <span className="size-7 flex shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                      {typeof item.icon === "string" ? <Icon name={item.icon} className="size-3.5" /> : item.icon}
                    </span>
                  ) : (
                    <UserAvatar
                      name={item.actor?.name}
                      src={item.actor?.avatar}
                      size="xs"
                      decorative
                      className="mt-0.5 [&_[data-slot=avatar]]:size-7"
                    />
                  )}
                  <div className="min-w-0 text-sm flex-1">
                    <p className="text-pretty">
                      {item.actor ? <span className="font-medium">{item.actor.name} </span> : null}
                      <span className="text-muted-foreground">{item.action}</span>
                    </p>
                    {item.detail ? <div className="mt-1 text-sm text-muted-foreground">{item.detail}</div> : null}
                    <RelativeDate value={item.timestamp} now={now} className="text-xs text-muted-foreground" />
                  </div>
                </li>
              ))}
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
          {t("display.loadMore")}
        </Button>
      ) : null}
    </section>
  )
}
