"use client"

import * as React from "react"

import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { useControllable } from "./_use-controllable"
import { FileInput, type FileInputProps } from "./file-input"
import { useFormatFileSize } from "./use-files"

export interface MultipleFileInputProps extends Omit<FileInputProps, "multiple" | "append"> {
  /** Show a hint with the limits (`Up to 5 files, 10 MB each`). Default `true`. */
  showLimits?: boolean
}

/**
 * Picks several files, adding to the selection each time (duplicates are skipped),
 * with a per-file remove button, `maxFiles` and a live count.
 */
export function MultipleFileInput({
  value,
  defaultValue,
  onChange,
  maxFiles,
  maxSize,
  showLimits = true,
  className,
  classNames,
  ...props
}: MultipleFileInputProps) {
  const { t } = useTranslation()
  const format = useFormatFileSize()
  const [files, setFiles] = useControllable<File[]>(value, defaultValue ?? [], onChange)
  const full = maxFiles !== undefined && files.length >= maxFiles

  const limits = [
    maxFiles !== undefined ? t("file.limitFiles", { count: maxFiles }) : null,
    maxSize !== undefined ? t("file.limitSize", { size: format(maxSize) }) : null,
  ]
    .filter(Boolean)
    .join(" · ")

  return (
    <div data-slot="multiple-file-input" className={cn("gap-1.5 grid w-full", className)}>
      <FileInput
        {...props}
        append
        value={files}
        onChange={setFiles}
        maxFiles={maxFiles}
        maxSize={maxSize}
        pickDisabled={full}
        classNames={classNames}
      />
      {showLimits && (limits || maxFiles !== undefined) ? (
        <p className="gap-2 text-xs flex flex-wrap justify-between text-muted-foreground">
          <span>{limits}</span>
          {maxFiles !== undefined ? (
            <span aria-live="polite" className="tabular-nums">
              {t("file.countOfMax", { count: files.length, max: maxFiles })}
            </span>
          ) : null}
        </p>
      ) : null}
    </div>
  )
}
