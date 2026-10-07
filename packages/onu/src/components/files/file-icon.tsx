"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { FILE_KIND_ICONS, getFileKind, type FileKind } from "./file-utils"

export const fileIconVariants = cva(
  "flex shrink-0 items-center justify-center rounded-md [&_svg]:pointer-events-none",
  {
    variants: {
      kind: {
        image: "bg-chart-2/15 text-chart-2",
        video: "bg-chart-4/15 text-chart-4",
        audio: "bg-chart-5/15 text-chart-5",
        pdf: "bg-destructive/10 text-destructive",
        document: "bg-info/15 text-info",
        spreadsheet: "bg-success/15 text-success",
        presentation: "bg-warning/15 text-warning",
        archive: "bg-muted text-muted-foreground",
        text: "bg-muted text-muted-foreground",
        other: "bg-muted text-muted-foreground",
      },
      size: {
        sm: "size-8 [&_svg]:size-4",
        default: "size-10 [&_svg]:size-5",
        lg: "size-12 [&_svg]:size-6",
      },
    },
    defaultVariants: { kind: "other", size: "default" },
  },
)

export interface FileIconProps
  extends Omit<React.ComponentProps<"span">, "children">, Pick<VariantProps<typeof fileIconVariants>, "size"> {
  /** MIME type, e.g. `application/pdf`. */
  type?: string | null
  /** File name or URL; its extension is used when `type` is missing. */
  name?: string | null
  /** Force a kind instead of detecting it. */
  kind?: FileKind
  /** Accessible label. Without it the icon is decorative. */
  label?: string
}

/** A coloured icon for a file's type (image, PDF, spreadsheet, …), following the configured icon set. */
export function FileIcon({ type, name, kind: kindProp, size, label, className, ...props }: FileIconProps) {
  const kind = kindProp ?? getFileKind({ type, name })
  return (
    <span data-slot="file-icon" data-kind={kind} className={cn(fileIconVariants({ kind, size }), className)} {...props}>
      <Icon name={FILE_KIND_ICONS[kind]} label={label} />
    </span>
  )
}
