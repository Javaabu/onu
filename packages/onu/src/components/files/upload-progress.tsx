"use client"

import * as React from "react"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { Button } from "../../ui/button"
import { Progress as ProgressPrimitive } from "radix-ui"
import { FileRow } from "./_file-row"
import type { UploadItem, UploadStatus } from "./use-files"

export interface UploadProgressItemProps extends Omit<React.ComponentProps<"li">, "children"> {
  name: string
  size?: number
  type?: string
  /** Local file, for an image thumbnail. */
  file?: File
  /** 0–100. */
  progress: number
  status: UploadStatus
  /** Error message shown when `status` is `error`. */
  error?: string
  onCancel?: () => void
  onRetry?: () => void
  onRemove?: () => void
  classNames?: { progress?: string; status?: string; actions?: string }
}

/** One upload: name, size, progress bar, status, and cancel / retry / remove buttons. */
export function UploadProgressItem({
  name,
  size,
  type,
  file,
  progress,
  status,
  error,
  onCancel,
  onRetry,
  onRemove,
  className,
  classNames,
  ...props
}: UploadProgressItemProps) {
  const { t } = useTranslation()
  const busy = status === "uploading" || status === "queued"

  const statusContent: Record<UploadStatus, React.ReactNode> = {
    queued: t("file.statusQueued"),
    uploading: <span className="tabular-nums">{t("file.statusUploading", { progress })}</span>,
    success: (
      <span className="gap-1 inline-flex items-center text-success">
        <Icon name="success" size="xs" />
        {t("file.statusUploaded")}
      </span>
    ),
    error: (
      <span className="gap-1 inline-flex items-center text-destructive">
        <Icon name="error" size="xs" className="shrink-0" />
        <span dir="auto">{error || t("file.uploadFailed")}</span>
      </span>
    ),
    cancelled: t("file.statusCancelled"),
  }

  return (
    <FileRow
      name={name}
      size={size}
      type={type}
      file={file}
      data-status={status}
      className={cn(status === "error" && "border-destructive/50", className)}
      classNames={{ actions: classNames?.actions }}
      meta={<span className={classNames?.status}>{statusContent[status]}</span>}
      actions={
        <>
          {busy && onCancel ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={t("file.cancelUpload", { name })}
              onClick={onCancel}
            >
              <Icon name="close" />
            </Button>
          ) : null}
          {(status === "error" || status === "cancelled") && onRetry ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={t("file.retryUpload", { name })}
              onClick={onRetry}
            >
              <Icon name="refresh" />
            </Button>
          ) : null}
          {!busy && onRemove ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={t("file.removeFile", { name })}
              onClick={onRemove}
            >
              <Icon name="trash" />
            </Button>
          ) : null}
        </>
      }
      {...props}
    >
      {busy ? (
        // Radix Progress directly: it exposes aria-valuenow, and the bar fills from the inline start (RTL too).
        <ProgressPrimitive.Root
          value={status === "queued" ? null : progress}
          aria-label={t("file.uploadProgressLabel", { name })}
          data-slot="upload-progress-bar"
          className={cn("mt-1 h-1 relative w-full overflow-hidden rounded-full bg-muted", classNames?.progress)}
        >
          <ProgressPrimitive.Indicator
            className="inset-y-0 start-0 absolute bg-primary transition-[width] duration-200"
            style={{ width: `${status === "queued" ? 0 : progress}%` }}
          />
        </ProgressPrimitive.Root>
      ) : null}
    </FileRow>
  )
}

export interface UploadProgressProps extends Omit<React.ComponentProps<"ul">, "children"> {
  items: readonly UploadItem[]
  onCancel?: (id: string) => void
  onRetry?: (id: string) => void
  onRemove?: (id: string) => void
  /** Text for the screen-reader live region, e.g. `useUploadQueue().announcement`. */
  announcement?: string
  classNames?: { item?: string; progress?: string; status?: string; actions?: string }
}

/** A list of uploads with per-file progress. Pair it with `useUploadQueue`. */
export function UploadProgress({
  items,
  onCancel,
  onRetry,
  onRemove,
  announcement,
  className,
  classNames,
  ...props
}: UploadProgressProps) {
  const { t } = useTranslation()
  return (
    <>
      {items.length ? (
        <ul
          data-slot="upload-progress"
          aria-label={t("file.uploads")}
          className={cn("gap-2 grid", className)}
          {...props}
        >
          {items.map((item) => (
            <UploadProgressItem
              key={item.id}
              name={item.file.name}
              size={item.file.size}
              type={item.file.type}
              file={item.file}
              progress={item.progress}
              status={item.status}
              error={item.error}
              onCancel={onCancel ? () => onCancel(item.id) : undefined}
              onRetry={onRetry ? () => onRetry(item.id) : undefined}
              onRemove={onRemove ? () => onRemove(item.id) : undefined}
              className={classNames?.item}
              classNames={classNames}
            />
          ))}
        </ul>
      ) : null}
      {announcement !== undefined ? (
        <div role="status" aria-live="polite" className="sr-only">
          {announcement}
        </div>
      ) : null}
    </>
  )
}
