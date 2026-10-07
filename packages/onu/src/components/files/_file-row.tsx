"use client"

import * as React from "react"

import { cn } from "../../lib/utils"
import { FileIcon } from "./file-icon"
import { getFileKind } from "./file-utils"
import { useFormatFileSize, useObjectUrl } from "./use-files"

export interface FileRowProps extends Omit<React.ComponentProps<"li">, "children"> {
  name: string
  size?: number | null
  type?: string | null
  /** Local file, used for an image thumbnail. */
  file?: File | null
  /** Remote thumbnail URL. */
  thumbnailUrl?: string | null
  /** Extra text after the size. */
  meta?: React.ReactNode
  /** Buttons at the inline end. */
  actions?: React.ReactNode
  /** Content under the name (progress bar, fields, …). */
  children?: React.ReactNode
  /** Render the name with a strike-through (marked for removal). */
  struck?: boolean
  as?: "li" | "div"
  classNames?: { thumbnail?: string; name?: string; meta?: string; actions?: string; body?: string }
}

/** One file in a list: thumbnail or type icon, name, size, actions. Shared by the file components. */
export function FileRow({
  name,
  size,
  type,
  file,
  thumbnailUrl,
  meta,
  actions,
  children,
  struck,
  as = "li",
  className,
  classNames,
  ...props
}: FileRowProps) {
  const Comp = as as "li"
  const format = useFormatFileSize()
  const kind = getFileKind({ type: type ?? file?.type, name })
  const localUrl = useObjectUrl(kind === "image" && !thumbnailUrl ? file : null)
  const thumb = thumbnailUrl ?? localUrl
  const sizeText = typeof size === "number" ? format(size) : null

  return (
    <Comp
      data-slot="file-row"
      data-kind={kind}
      data-inactive={struck || undefined}
      className={cn("gap-3 p-2 flex items-start rounded-lg border border-border bg-card", className)}
      {...props}
    >
      {thumb ? (
        <img
          src={thumb}
          alt=""
          loading="lazy"
          decoding="async"
          className={cn("size-10 shrink-0 rounded-md bg-muted object-cover", classNames?.thumbnail)}
        />
      ) : (
        <FileIcon kind={kind} className={classNames?.thumbnail} />
      )}
      <div className={cn("min-w-0 gap-1 flex flex-1 flex-col", classNames?.body)}>
        <span
          dir="auto"
          title={name}
          className={cn(
            "text-sm font-medium truncate [text-align:match-parent]",
            struck && "text-muted-foreground line-through",
            classNames?.name,
          )}
        >
          <bdi>{name}</bdi>
        </span>
        {sizeText || meta ? (
          <span className={cn("gap-2 text-xs flex flex-wrap items-center text-muted-foreground", classNames?.meta)}>
            {sizeText ? <span dir="ltr" className="tabular-nums">
                {sizeText}
              </span> : null}
            {meta}
          </span>
        ) : null}
        {children}
      </div>
      {actions ? <div className={cn("gap-1 flex shrink-0 items-center", classNames?.actions)}>{actions}</div> : null}
    </Comp>
  )
}
