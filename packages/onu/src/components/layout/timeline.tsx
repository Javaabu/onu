"use client"

import * as React from "react"
import { cva } from "class-variance-authority"
import { format as formatDate, formatDistance } from "date-fns"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { NavIcon } from "./_nav"

export type TimelineStatus = "default" | "success" | "error" | "warning" | "info" | "pending" | "current"

export interface TimelineItem {
  id?: string
  title: React.ReactNode
  description?: React.ReactNode
  /** When it happened. Formatted with the active locale. */
  time?: Date | string | number
  status?: TimelineStatus
  /** Semantic icon name or node; defaults to an icon for the status. */
  icon?: string | React.ReactNode
  /** Extra content under the description (attachments, a quote, buttons). */
  content?: React.ReactNode
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

export interface TimelineProps extends Omit<React.ComponentProps<"ol">, "children"> {
  items: TimelineItem[]
  /** `absolute` (date-fns pattern, default `PPp`) or `relative` ("3 days ago"). */
  timeFormat?: "absolute" | "relative"
  /** date-fns pattern for absolute times. */
  datePattern?: string
  /** Reference time for relative times (tests, SSR). */
  now?: Date
  size?: "sm" | "default"
  classNames?: { item?: string; marker?: string; title?: string; time?: string; description?: string }
}

/**
 * A vertical timeline (status tracker, activity history). Each entry has a status
 * marker with an icon and colour (and a screen-reader status, R14.6), a title,
 * a localised time and details. The line sits on the inline start, so it
 * mirrors in RTL.
 */
export function Timeline({
  items,
  timeFormat = "absolute",
  datePattern = "PPp",
  now,
  size = "default",
  className,
  classNames,
  "aria-label": ariaLabel,
  ...props
}: TimelineProps) {
  const { t, locale } = useTranslation()

  return (
    <ol
      data-slot="timeline"
      aria-label={ariaLabel ?? t("layout.timeline")}
      className={cn("flex flex-col", className)}
      {...props}
    >
      {items.map((item, i) => {
        const status = item.status ?? "default"
        const icon = item.icon ?? STATUS_ICONS[status]
        const statusKey = STATUS_KEYS[status]
        const date = item.time !== undefined ? (item.time instanceof Date ? item.time : new Date(item.time)) : undefined
        const last = i === items.length - 1
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
            <div className={cn("gap-1 min-w-0 flex flex-1 flex-col", !last && "pb-6", size === "sm" ? "pt-0" : "pt-1")}>
              <div className="gap-x-3 gap-y-0.5 flex flex-wrap items-baseline justify-between">
                <p className={cn("text-sm font-medium", classNames?.title)}>
                  {item.title}
                  {statusKey ? <span className="sr-only"> ({t(statusKey)})</span> : null}
                </p>
                {date ? (
                  <time
                    dateTime={date.toISOString()}
                    className={cn("text-xs text-muted-foreground tabular-nums", classNames?.time)}
                  >
                    {timeFormat === "relative"
                      ? formatDistance(date, now ?? new Date(), { addSuffix: true, locale: locale.dateFns })
                      : formatDate(date, datePattern, { locale: locale.dateFns })}
                  </time>
                ) : null}
              </div>
              {item.description ? (
                <p className={cn("text-sm text-muted-foreground", classNames?.description)}>{item.description}</p>
              ) : null}
              {item.content ? <div className="mt-1">{item.content}</div> : null}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
