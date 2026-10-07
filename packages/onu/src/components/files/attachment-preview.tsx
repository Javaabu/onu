"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { Button } from "../../ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../ui/dialog"
import { FileIcon } from "./file-icon"
import { getExtension, getFileKind } from "./file-utils"
import { useFormatFileSize } from "./use-files"

export const attachmentPreviewVariants = cva("group/attachment border border-border bg-card text-card-foreground", {
  variants: {
    variant: {
      row: "gap-3 p-2 flex items-center rounded-lg",
      card: "max-w-60 flex w-full flex-col overflow-hidden rounded-xl",
    },
  },
  defaultVariants: { variant: "row" },
})

export interface AttachmentPreviewProps
  extends Omit<React.ComponentProps<"div">, "children">, VariantProps<typeof attachmentPreviewVariants> {
  /** File name shown to the user. */
  name: string
  /** Where the file can be opened. */
  url?: string
  /** Download URL, if different from `url`. */
  downloadUrl?: string
  size?: number
  /** MIME type; the extension of `name`/`url` is used when missing. */
  type?: string
  /** Thumbnail for images and videos. Images use `url` when omitted. */
  thumbnailUrl?: string
  /** Alt text for the thumbnail. Defaults to the name. */
  alt?: string
  /** Show the preview button for images and PDFs. Default `true`. */
  preview?: boolean
  /** Show a remove button. */
  onRemove?: () => void
  /** Extra actions at the end. */
  actions?: React.ReactNode
  classNames?: { thumbnail?: string; name?: string; meta?: string; actions?: string; dialog?: string }
}

/**
 * A file attachment: thumbnail or type icon, name and size, with open, download and
 * remove actions. Images and PDFs can be previewed in a dialog.
 */
export function AttachmentPreview({
  name,
  url,
  downloadUrl,
  size,
  type,
  thumbnailUrl,
  alt,
  preview = true,
  onRemove,
  actions,
  variant,
  className,
  classNames,
  ...props
}: AttachmentPreviewProps) {
  const { t } = useTranslation()
  const format = useFormatFileSize()
  const [open, setOpen] = React.useState(false)
  const previewRef = React.useRef<HTMLButtonElement>(null)
  const kind = getFileKind({ type, name: url && !getExtension(name) ? url : name })
  const thumb = thumbnailUrl ?? (kind === "image" ? url : undefined)
  const canPreview = preview && !!url && (kind === "image" || kind === "pdf")
  const ext = getExtension(name) || getExtension(url ?? "")
  const card = variant === "card"
  const download = downloadUrl ?? url

  const meta = [ext ? ext.toUpperCase() : null, typeof size === "number" ? format(size) : null].filter(Boolean)

  return (
    <div
      data-slot="attachment-preview"
      data-kind={kind}
      className={cn(attachmentPreviewVariants({ variant }), className)}
      {...props}
    >
      {thumb ? (
        <img
          src={thumb}
          alt={alt ?? name}
          loading="lazy"
          decoding="async"
          className={cn(
            "bg-muted object-cover",
            card ? "aspect-video w-full" : "size-10 shrink-0 rounded-md",
            classNames?.thumbnail,
          )}
        />
      ) : card ? (
        <div className={cn("aspect-video flex w-full items-center justify-center bg-muted/50", classNames?.thumbnail)}>
          <FileIcon kind={kind} size="lg" />
        </div>
      ) : (
        <FileIcon kind={kind} className={classNames?.thumbnail} />
      )}
      <div className={cn("min-w-0 gap-2 flex flex-1 items-center", card && "p-3")}>
        <div className="min-w-0 gap-0.5 flex flex-1 flex-col">
          <span title={name} className={cn("text-sm font-medium truncate", classNames?.name)}>
            <bdi>{name}</bdi>
          </span>
          {meta.length ? (
            <span className={cn("text-xs text-muted-foreground tabular-nums", classNames?.meta)}>
              {meta.join(" · ")}
            </span>
          ) : null}
        </div>
        <div className={cn("gap-0.5 flex shrink-0 items-center", classNames?.actions)}>
          {canPreview ? (
            <Button
              ref={previewRef}
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-haspopup="dialog"
              aria-label={t("file.previewFile", { name })}
              onClick={() => setOpen(true)}
            >
              <Icon name="eye" />
            </Button>
          ) : url ? (
            <Button asChild variant="ghost" size="icon-sm">
              <a href={url} target="_blank" rel="noreferrer" aria-label={t("file.openFile", { name })}>
                <Icon name="external-link" />
              </a>
            </Button>
          ) : null}
          {download ? (
            <Button asChild variant="ghost" size="icon-sm">
              <a href={download} download={name} aria-label={t("file.downloadFile", { name })}>
                <Icon name="download" />
              </a>
            </Button>
          ) : null}
          {actions}
          {onRemove ? (
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
        </div>
      </div>

      {canPreview ? (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent
            showCloseButton={false}
            onCloseAutoFocus={(e) => {
              e.preventDefault()
              previewRef.current?.focus()
            }}
            className={cn("sm:max-w-3xl max-h-[calc(100dvh-2rem)] grid-rows-[auto_minmax(0,1fr)]", classNames?.dialog)}
          >
            <DialogHeader className="gap-2 flex-row items-center">
              <DialogTitle className="min-w-0 leading-normal flex-1 truncate">
                <bdi>{name}</bdi>
              </DialogTitle>
              <DialogDescription className="sr-only">{t("file.previewOf", { name })}</DialogDescription>
              {download ? (
                <Button asChild variant="outline" size="sm">
                  <a href={download} download={name}>
                    <Icon name="download" data-icon="inline-start" />
                    {t("file.download")}
                  </a>
                </Button>
              ) : null}
              <DialogClose asChild>
                <Button variant="ghost" size="icon-sm" aria-label={t("common.close")}>
                  <Icon name="close" />
                </Button>
              </DialogClose>
            </DialogHeader>
            {kind === "image" ? (
              <img src={url} alt={alt ?? name} className="max-h-[75dvh] w-full rounded-md object-contain" />
            ) : (
              <iframe src={url} title={name} className="h-[75dvh] w-full rounded-md border border-border" />
            )}
          </DialogContent>
        </Dialog>
      ) : null}
    </div>
  )
}
