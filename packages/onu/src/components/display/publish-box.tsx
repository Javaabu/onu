"use client"

import * as React from "react"
import { format as formatDate } from "date-fns"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { Button } from "../../ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../../ui/card"
import { Input } from "../../ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
import { toDate, type DateInput } from "./_utils"
import { StatusBadge, type StatusMap } from "./status-badge"
import { AppLink } from "./_link"

export type PublishStatus = "draft" | "pending" | "scheduled" | "published" | (string & {})
export type PublishVisibility = "public" | "private" | (string & {})

export interface PublishOption {
  value: string
  label: React.ReactNode
}

export interface PublishBoxProps extends Omit<React.ComponentProps<"div">, "title"> {
  status: PublishStatus
  /** Lets the user change the status with a select. */
  onStatusChange?: (status: PublishStatus) => void
  statusOptions?: PublishOption[]
  /** Map statuses to badge tones and labels (merged with the defaults). */
  statusMap?: StatusMap
  visibility?: PublishVisibility
  onVisibilityChange?: (visibility: PublishVisibility) => void
  visibilityOptions?: PublishOption[]
  /** When it goes (or went) live. Empty means "Immediately". */
  publishAt?: DateInput
  /** Shows a date-time field for the publish date. */
  onPublishAtChange?: (date: Date | null) => void
  /** Replace the publish date field, e.g. with Onu's DateTimePicker. */
  renderDateInput?: (props: {
    id: string
    value: Date | null
    onChange: (date: Date | null) => void
  }) => React.ReactNode
  previewHref?: string
  onPreview?: () => void
  onSaveDraft?: () => void | Promise<unknown>
  onPublish?: () => void | Promise<unknown>
  /** Which action is running (set automatically while a returned promise is pending). */
  busy?: "draft" | "publish" | null
  disabled?: boolean
  title?: React.ReactNode
  /** Reference time for deciding "Schedule" vs "Publish". */
  now?: DateInput
  classNames?: { header?: string; content?: string; footer?: string; row?: string }
}

const DEFAULT_STATUS_MAP: StatusMap = {
  draft: { tone: "neutral" },
  pending: { tone: "warning" },
  scheduled: { tone: "info" },
  published: { tone: "success" },
}

const STATUS_LABELS: Record<string, string> = {
  draft: "display.statusDraft",
  pending: "display.statusPendingReview",
  scheduled: "display.statusScheduled",
  published: "display.statusPublished",
}

function toLocalInput(date: Date | null) {
  return date ? formatDate(date, "yyyy-MM-dd'T'HH:mm") : ""
}

/**
 * The "Publish" panel of a content editor: status, visibility and publish
 * date, with Preview, Save draft and Publish / Schedule / Update actions.
 * Fits a sidebar; buttons stack in narrow containers.
 */
export function PublishBox({
  status,
  onStatusChange,
  statusOptions,
  statusMap,
  visibility,
  onVisibilityChange,
  visibilityOptions,
  publishAt,
  onPublishAtChange,
  renderDateInput,
  previewHref,
  onPreview,
  onSaveDraft,
  onPublish,
  busy: busyProp,
  disabled = false,
  title,
  now,
  className,
  classNames,
  ...props
}: PublishBoxProps) {
  const { t, locale } = useTranslation()
  const id = React.useId()
  const [running, setRunning] = React.useState<"draft" | "publish" | null>(null)
  const busy = busyProp ?? running
  const date = toDate(publishAt)
  const [nowAtMount] = React.useState(() => Date.now())
  const reference = toDate(now)?.getTime() ?? nowAtMount

  const statusLabel = (value: string) => (STATUS_LABELS[value] ? t(STATUS_LABELS[value]) : value)
  const map: StatusMap = Object.fromEntries(
    Object.entries({ ...DEFAULT_STATUS_MAP, ...statusMap }).map(([key, def]) => [
      key,
      { ...def, label: def.label ?? statusLabel(key) },
    ]),
  )
  const statuses = statusOptions ?? ["draft", "pending", "published"].map((v) => ({ value: v, label: statusLabel(v) }))
  const visibilities = visibilityOptions ?? [
    { value: "public", label: t("display.visibilityPublic") },
    { value: "private", label: t("display.visibilityPrivate") },
  ]

  const published = status === "published"
  const future = !!date && date.getTime() > reference
  const primaryLabel = published ? t("display.update") : future ? t("display.schedule") : t("display.publish")

  const run = async (kind: "draft" | "publish", action?: () => void | Promise<unknown>) => {
    if (!action) return
    setRunning(kind)
    try {
      await action()
    } finally {
      setRunning(null)
    }
  }

  const row = (label: React.ReactNode, control: React.ReactNode, htmlFor?: string) => (
    <div className={cn("gap-x-3 gap-y-1 @xs:grid-cols-[7rem_minmax(0,1fr)] grid items-center", classNames?.row)}>
      {htmlFor ? (
        <label htmlFor={htmlFor} className="text-sm text-muted-foreground">
          {label}
        </label>
      ) : (
        <span className="text-sm text-muted-foreground">{label}</span>
      )}
      <div className="min-w-0">{control}</div>
    </div>
  )

  const optionLabel = (options: PublishOption[], value?: string) =>
    options.find((o) => o.value === value)?.label ?? value

  return (
    <Card
      data-slot="publish-box"
      aria-busy={busy ? true : undefined}
      className={cn("gap-4 @container", className)}
      {...props}
    >
      <CardHeader className={classNames?.header}>
        <CardTitle>{title ?? t("display.publish")}</CardTitle>
      </CardHeader>
      <CardContent className={cn("gap-3 grid", classNames?.content)}>
        {row(
          t("display.publishStatus"),
          onStatusChange ? (
            <Select value={status} onValueChange={onStatusChange} disabled={disabled}>
              <SelectTrigger id={`${id}-status`} className="touch:h-11 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <StatusBadge status={status} statusMap={map} />
          ),
          onStatusChange ? `${id}-status` : undefined,
        )}
        {visibility !== undefined
          ? row(
              t("display.publishVisibility"),
              onVisibilityChange ? (
                <Select value={visibility} onValueChange={onVisibilityChange} disabled={disabled}>
                  <SelectTrigger id={`${id}-visibility`} className="touch:h-11 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {visibilities.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <span className="gap-1.5 text-sm inline-flex items-center">
                  <Icon name={visibility === "private" ? "lock" : "globe"} className="size-4 text-muted-foreground" />
                  {optionLabel(visibilities, visibility)}
                </span>
              ),
              onVisibilityChange ? `${id}-visibility` : undefined,
            )
          : null}
        {row(
          t("display.publishDate"),
          onPublishAtChange ? (
            renderDateInput ? (
              renderDateInput({ id: `${id}-date`, value: date, onChange: onPublishAtChange })
            ) : (
              <Input
                id={`${id}-date`}
                type="datetime-local"
                dir="ltr"
                className="touch:h-11"
                disabled={disabled}
                value={toLocalInput(date)}
                onChange={(e) => onPublishAtChange(e.target.value ? new Date(e.target.value) : null)}
              />
            )
          ) : (
            <span className="text-sm">
              {date ? (
                <time dateTime={date.toISOString()}>{formatDate(date, "PPp", { locale: locale.dateFns })}</time>
              ) : (
                t("display.publishImmediately")
              )}
            </span>
          ),
          onPublishAtChange ? `${id}-date` : undefined,
        )}
      </CardContent>
      <CardFooter className={cn("gap-2 @xs:flex @xs:flex-wrap @xs:items-center grid", classNames?.footer)}>
        {previewHref ? (
          <Button asChild variant="ghost" className="touch:h-11">
            <AppLink href={previewHref} target="_blank" rel="noopener">
              <Icon name="eye" data-icon="inline-start" />
              {t("display.preview")}
            </AppLink>
          </Button>
        ) : onPreview ? (
          <Button type="button" variant="ghost" className="touch:h-11" onClick={onPreview} disabled={disabled}>
            <Icon name="eye" data-icon="inline-start" />
            {t("display.preview")}
          </Button>
        ) : null}
        {onSaveDraft && !published ? (
          <Button
            type="button"
            variant="outline"
            className="touch:h-11"
            disabled={disabled || !!busy}
            onClick={() => void run("draft", onSaveDraft)}
          >
            {busy === "draft" ? <Icon name="loading" data-icon="inline-start" className="animate-spin" /> : null}
            {t("display.saveDraft")}
          </Button>
        ) : null}
        {onPublish ? (
          <Button
            type="button"
            className="touch:h-11 @xs:ms-auto"
            disabled={disabled || !!busy}
            onClick={() => void run("publish", onPublish)}
          >
            {busy === "publish" ? <Icon name="loading" data-icon="inline-start" className="animate-spin" /> : null}
            {primaryLabel}
          </Button>
        ) : null}
      </CardFooter>
    </Card>
  )
}
