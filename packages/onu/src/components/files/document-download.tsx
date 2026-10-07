"use client"

import * as React from "react"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { Button } from "../../ui/button"
import { FileIcon } from "./file-icon"
import { getExtension, getFileKind } from "./file-utils"
import { useFormatFileSize } from "./use-files"

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

export interface DocumentDownloadProps extends Omit<React.ComponentProps<"div">, "title"> {
  /** Document title. */
  title: React.ReactNode
  /** Plain-text title for accessible names (defaults to `title` when it is a string). */
  titleText?: string
  description?: React.ReactNode
  /** Download URL (single version). */
  href?: string
  /** File name to save as. */
  fileName?: string
  size?: number
  /** MIME type; the extension of `href`/`fileName` is used when missing. */
  type?: string
  /** Language versions, e.g. English and Dhivehi. Each gets its own download button. */
  versions?: DocumentVersion[]
  /** Extra details (date, reference number, …). */
  meta?: React.ReactNode
  classNames?: { icon?: string; title?: string; description?: string; meta?: string; actions?: string }
}

/** A downloadable document card: type, size and a download link, with optional language versions. */
export function DocumentDownload({
  title,
  titleText,
  description,
  href,
  fileName,
  size,
  type,
  versions,
  meta,
  className,
  classNames,
  ...props
}: DocumentDownloadProps) {
  const { t } = useTranslation()
  const format = useFormatFileSize()
  const titleId = React.useId()
  const label = titleText ?? (typeof title === "string" ? title : "")
  const source = fileName ?? href ?? versions?.[0]?.href ?? ""
  const docType = type ?? versions?.[0]?.type
  const kind = getFileKind({ type: docType, name: source })
  const ext = getExtension(source)
  const details = [ext ? ext.toUpperCase() : null, typeof size === "number" ? format(size) : null].filter(Boolean)

  return (
    <div
      data-slot="document-download"
      role="group"
      aria-labelledby={titleId}
      className={cn(
        "gap-3 p-4 @container/doc flex flex-col rounded-xl border border-border bg-card text-card-foreground",
        className,
      )}
      {...props}
    >
      <div className="gap-3 flex items-start">
        <FileIcon kind={kind} size="lg" className={classNames?.icon} />
        <div className="min-w-0 gap-1 flex flex-1 flex-col">
          <span id={titleId} dir="auto" className={cn("font-medium leading-snug", classNames?.title)}>
            {title}
          </span>
          {description ? (
            <span dir="auto" className={cn("text-sm text-muted-foreground", classNames?.description)}>
              {description}
            </span>
          ) : null}
          {details.length || meta ? (
            <span className={cn("gap-x-2 text-xs flex flex-wrap text-muted-foreground tabular-nums", classNames?.meta)}>
              {details.length ? <span>{details.join(" · ")}</span> : null}
              {meta}
            </span>
          ) : null}
        </div>
      </div>
      <div className={cn("gap-2 flex flex-wrap", classNames?.actions)}>
        {versions?.length ? (
          versions.map((version) => {
            const language = version.label ?? LANGUAGE_NAMES[version.lang] ?? version.lang
            return (
              <Button key={version.lang} asChild variant="outline" size="sm" className="@sm/doc:flex-none flex-1">
                <a
                  href={version.href}
                  hrefLang={version.lang}
                  download
                  aria-label={t("file.downloadIn", { name: label, language })}
                >
                  <Icon name="download" data-icon="inline-start" />
                  <span lang={version.lang}>{language}</span>
                  {typeof version.size === "number" ? (
                    <span className="text-muted-foreground tabular-nums">{format(version.size)}</span>
                  ) : null}
                </a>
              </Button>
            )
          })
        ) : href ? (
          <Button asChild size="sm" className="@sm/doc:flex-none flex-1">
            <a href={href} download={fileName ?? true} aria-label={t("file.downloadFile", { name: label })}>
              <Icon name="download" data-icon="inline-start" />
              {t("file.download")}
            </a>
          </Button>
        ) : null}
      </div>
    </div>
  )
}
