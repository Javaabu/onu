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
import { registerEnglish } from "../../i18n/english"
import { common as en_common } from "../../locales/en/common"
import { file as en_file } from "../../locales/en/file"

registerEnglish({ common: en_common, file: en_file })

export const attachmentPreviewVariants = cva("group/attachment border border-border bg-card text-card-foreground", {
  variants: {
    variant: {
      row: "gap-3 p-2 flex items-center rounded-lg",
      card: "max-w-60 flex w-full flex-col overflow-hidden rounded-xl",
    },
  },
  defaultVariants: { variant: "row" },
})

/** Native names for built-in languages, shown in their own script. */
const LANGUAGE_NAMES: Record<string, string> = { en: "English", dv: "ދިވެހި" }

export interface DocumentVersion {
  /** BCP 47 language code, e.g. `en` or `dv`. */
  lang: string
  href: string
  /** Button text. Defaults to the language's native name. */
  label?: string
  size?: number
  type?: string
}

export interface AttachmentPreviewProps
  extends Omit<React.ComponentProps<"div">, "children">, VariantProps<typeof attachmentPreviewVariants> {
  /** File name shown to the user. */
  name: string
  /** A line under the name, e.g. the publisher or what the document is for. */
  description?: React.ReactNode
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
  /** Extra details after the type and size, e.g. an upload date or uploader. */
  meta?: React.ReactNode
  /** Language versions, e.g. English and Dhivehi. Each gets its own download button under the file. */
  versions?: DocumentVersion[]
  classNames?: {
    thumbnail?: string
    name?: string
    description?: string
    meta?: string
    actions?: string
    versions?: string
    dialog?: string
  }
}

/**
 * A file attachment: thumbnail or type icon, name and size, with open, download and
 * remove actions. Images and PDFs can be previewed in a dialog. With `versions`,
 * each language version of a document gets its own download button.
 */
export function AttachmentPreview({
  name,
  description,
  url,
  downloadUrl,
  size,
  type,
  thumbnailUrl,
  alt,
  preview = true,
  onRemove,
  actions,
  meta: extraMeta,
  versions,
  variant,
  className,
  classNames,
  ...props
}: AttachmentPreviewProps) {
  const { t } = useTranslation()
  const format = useFormatFileSize()
  const [open, setOpen] = React.useState(false)
  const previewRef = React.useRef<HTMLButtonElement>(null)
  const nameId = React.useId()
  const hasVersions = !!versions?.length
  // Without a URL, a language version tells the file type.
  const source = url ?? versions?.[0]?.href
  const kind = getFileKind({ type: type ?? versions?.[0]?.type, name: source && !getExtension(name) ? source : name })
  const thumb = thumbnailUrl ?? (kind === "image" ? url : undefined)
  const canPreview = preview && !!url && (kind === "image" || kind === "pdf")
  const ext = getExtension(name) || getExtension(source ?? "")
  const card = variant === "card"
  const download = downloadUrl ?? url

  const meta = [ext ? ext.toUpperCase() : null, typeof size === "number" ? format(size) : null].filter(Boolean)

  return (
    <div
      data-slot="attachment-preview"
      data-kind={kind}
      role={hasVersions ? "group" : undefined}
      aria-labelledby={hasVersions ? nameId : undefined}
      className={cn(attachmentPreviewVariants({ variant }), hasVersions && !card && "flex-wrap", className)}
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
          <span
            id={nameId}
            dir="auto"
            title={name}
            className={cn("text-sm font-medium max-w-full self-start truncate", classNames?.name)}
          >
            <bdi>{name}</bdi>
          </span>
          {description ? (
            <span className={cn("text-xs text-muted-foreground", classNames?.description)}>
              <bdi>{description}</bdi>
            </span>
          ) : null}
          {meta.length || extraMeta ? (
            <span className={cn("gap-x-1 text-xs flex flex-wrap text-muted-foreground tabular-nums", classNames?.meta)}>
              {meta.map((part, i) => (
                <React.Fragment key={i}>
                  {i ? <span aria-hidden="true">·</span> : null}
                  <span dir="ltr">{part}</span>
                </React.Fragment>
              ))}
              {meta.length && extraMeta ? <span aria-hidden="true">·</span> : null}
              {extraMeta}
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

      {versions?.length ? (
        <div
          data-slot="attachment-versions"
          className={cn("gap-2 flex flex-wrap", card ? "px-3 pb-3" : "basis-full", classNames?.versions)}
        >
          {versions.map((version) => {
            const language = version.label ?? LANGUAGE_NAMES[version.lang] ?? version.lang
            return (
              <Button key={version.lang} asChild variant="outline" size="sm">
                <a
                  href={version.href}
                  hrefLang={version.lang}
                  download
                  aria-label={t("file.downloadIn", { name, language })}
                >
                  <Icon name="download" data-icon="inline-start" />
                  <span lang={version.lang}>{language}</span>
                  {typeof version.size === "number" ? (
                    <span dir="ltr" className="text-muted-foreground tabular-nums">
                      {format(version.size)}
                    </span>
                  ) : null}
                </a>
              </Button>
            )
          })}
        </div>
      ) : null}

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
              <DialogTitle className="min-w-0 leading-normal flex-1">
                <span dir="auto" className="block w-fit max-w-full truncate">
                  {name}
                </span>
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
