"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { Button } from "../../ui/button"
import { useFormFieldControl } from "../form/form-field"
import { useMergedRef } from "../inputs/text-input"
import { FileRow } from "./_file-row"
import { useControllable } from "./_use-controllable"
import { fileKey, syncInputFiles, validateFiles, type FileRejection, type FileValidationOptions } from "./file-utils"
import { useFormatFileSize, useRejectionMessage } from "./use-files"
import { registerEnglish } from "../../i18n/english"
import { file as en_file } from "../../locales/en/file"

registerEnglish({ file: en_file })

export const fileInputVariants = cva(
  "group/file-input min-w-0 text-sm touch:min-h-11 relative flex w-full items-center rounded-lg border border-input bg-transparent transition-colors has-[input:disabled]:cursor-not-allowed has-[input:disabled]:opacity-50 has-[input:focus-visible]:border-ring has-[input:focus-visible]:ring-3 has-[input:focus-visible]:ring-ring/50 has-[input[aria-invalid=true]]:border-destructive has-[input[aria-invalid=true]]:ring-destructive/20 dark:bg-input/30",
  {
    variants: {
      size: {
        sm: "h-7 gap-2 pe-2 text-xs",
        default: "h-8 gap-2 pe-2.5",
        lg: "h-10 gap-3 pe-3",
      },
    },
    defaultVariants: { size: "default" },
  },
)

export interface FileInputProps
  extends
    Omit<React.ComponentProps<"input">, "type" | "value" | "defaultValue" | "onChange" | "size">,
    VariantProps<typeof fileInputVariants> {
  /** Selected files (controlled). */
  value?: File[]
  /** Initially selected files (uncontrolled). */
  defaultValue?: File[]
  /** Called with the full list of selected files after a pick or a removal. */
  onChange?: (files: File[]) => void
  /** Called with files that failed validation. Messages are shown under the input too. */
  onReject?: (rejections: FileRejection[]) => void
  /** Largest allowed file size in bytes. */
  maxSize?: number
  /** Smallest allowed file size in bytes. */
  minSize?: number
  /** Most files allowed in total. */
  maxFiles?: number
  /**
   * Add picked files to the selection instead of replacing it (duplicates are
   * skipped). Implies `multiple`. Picking stops once `maxFiles` is reached.
   */
  append?: boolean
  /** Show the limits under the input (`Up to 5 files · 10 MB each`) and, with `maxFiles`, a live count. */
  showLimits?: boolean
  /** Show the selected files with remove buttons. Default `true`. */
  showList?: boolean
  /** Button text. Defaults to "Choose file" / "Choose files". */
  buttonLabel?: React.ReactNode
  /** Text shown when nothing is selected. */
  placeholder?: string
  /** Replace the summary text next to the button. */
  summary?: React.ReactNode
  /** Stop picking more files but keep the remove buttons working (e.g. when a limit is reached). */
  pickDisabled?: boolean
  /** Files already counted towards `maxFiles` outside this input (e.g. saved attachments). */
  countOffset?: number
  classNames?: {
    root?: string
    trigger?: string
    button?: string
    summary?: string
    list?: string
    item?: string
    errors?: string
    limits?: string
  }
}

/**
 * A styled native file input: the real `<input type="file">` covers the trigger, so
 * clicking, tapping, keyboard (Enter/Space) and dropping files onto it all work natively.
 * Validates type and size, lists the selection and keeps the input's `files` in sync
 * for plain form submits.
 */
export function FileInput({
  value,
  defaultValue,
  onChange,
  onReject,
  accept,
  maxSize,
  minSize,
  maxFiles,
  multiple: multipleProp,
  append = false,
  showLimits = false,
  showList = true,
  buttonLabel,
  placeholder,
  summary,
  pickDisabled = false,
  countOffset = 0,
  size,
  className,
  classNames,
  ref,
  ...props
}: FileInputProps) {
  const { t } = useTranslation()
  const format = useFormatFileSize()
  const local = React.useRef<HTMLInputElement>(null)
  const merged = useMergedRef(local, ref)
  const multiple = multipleProp || append
  const [files, setFiles] = useControllable<File[]>(value, defaultValue ?? [], onChange)
  const [rejections, setRejections] = React.useState<FileRejection[]>([])
  const full = append && maxFiles !== undefined && files.length + countOffset >= maxFiles
  const options: FileValidationOptions = { accept, maxSize, minSize, maxFiles }
  const message = useRejectionMessage(options)
  const statusId = React.useId()
  const errorsId = React.useId()
  const control = useFormFieldControl({
    ...props,
    "aria-describedby": [props["aria-describedby"], statusId, rejections.length ? errorsId : null]
      .filter(Boolean)
      .join(" "),
  })

  React.useEffect(() => {
    syncInputFiles(local.current, files)
  }, [files])

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(event.target.files ?? [])
    if (!picked.length) {
      // Cancelled picker: keep the current selection on the input.
      syncInputFiles(local.current, files)
      return
    }
    const base = append ? files : []
    const known = new Set(base.map(fileKey))
    const fresh = picked.filter((f) => !known.has(fileKey(f)))
    const { accepted, rejected } = validateFiles(fresh, options, base.length + countOffset)
    setRejections(rejected)
    if (rejected.length) onReject?.(rejected)
    if (accepted.length) setFiles(multiple ? [...base, ...accepted] : accepted.slice(0, 1))
    else syncInputFiles(local.current, files)
  }

  const removeAt = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
    setRejections([])
    local.current?.focus()
  }

  const statusText =
    summary ??
    (files.length === 0
      ? (placeholder ?? (multiple ? t("file.noFilesChosen") : t("file.noFileChosen")))
      : files.length === 1
        ? files[0]!.name
        : t("file.filesSelected", { count: files.length }))

  const limits = [
    maxFiles !== undefined ? t("file.limitFiles", { count: maxFiles }) : null,
    maxSize !== undefined ? t("file.limitSize", { size: format(maxSize) }) : null,
  ]
    .filter(Boolean)
    .join(" · ")

  return (
    <div data-slot="file-input" className={cn("gap-2 flex w-full flex-col", classNames?.root, className)}>
      <div className={cn(fileInputVariants({ size }), classNames?.trigger)}>
        <input
          ref={merged}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          className="inset-0 absolute z-10 size-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
          {...control}
          disabled={control.disabled || pickDisabled || full || undefined}
        />
        <span
          aria-hidden
          className={cn(
            "gap-1.5 px-2.5 font-medium flex h-full shrink-0 items-center rounded-s-[inherit] border-e border-input bg-muted text-foreground group-hover/file-input:bg-accent",
            classNames?.button,
          )}
        >
          <Icon name="upload" size="sm" />
          {buttonLabel ?? (multiple ? t("file.chooseFiles") : t("file.chooseFile"))}
        </span>
        <span
          id={statusId}
          dir="auto"
          className={cn("min-w-0 truncate", !files.length && "text-muted-foreground", classNames?.summary)}
        >
          <bdi>{statusText}</bdi>
        </span>
      </div>

      <div id={errorsId} aria-live="polite" className={cn(!rejections.length && "sr-only")}>
        {rejections.length ? (
          <ul className={cn("gap-1 text-sm grid text-destructive", classNames?.errors)}>
            {rejections.map((r, i) => (
              <li key={i} className="gap-1.5 flex items-start">
                <Icon name="error" size="sm" className="mt-0.5 shrink-0" />
                <span dir="auto">{message(r)}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {showList && files.length > 0 ? (
        <ul aria-label={t("file.selectedFiles")} className={cn("gap-2 grid", classNames?.list)}>
          {files.map((file, index) => (
            <FileRow
              key={fileKey(file)}
              name={file.name}
              size={file.size}
              file={file}
              className={classNames?.item}
              actions={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={t("file.removeFile", { name: file.name })}
                  disabled={!!control.disabled}
                  onClick={() => removeAt(index)}
                >
                  <Icon name="close" />
                </Button>
              }
            />
          ))}
        </ul>
      ) : null}

      {showLimits && (limits || maxFiles !== undefined) ? (
        <p className={cn("gap-2 text-xs flex flex-wrap justify-between text-muted-foreground", classNames?.limits)}>
          <span>{limits}</span>
          {maxFiles !== undefined ? (
            <span aria-live="polite" className="tabular-nums">
              {t("file.countOfMax", { count: files.length + countOffset, max: maxFiles })}
            </span>
          ) : null}
        </p>
      ) : null}
    </div>
  )
}

export interface MultipleFileInputProps extends Omit<FileInputProps, "multiple" | "append" | "showLimits"> {
  /** Show a hint with the limits (`Up to 5 files, 10 MB each`). Default `true`. */
  showLimits?: boolean
}

/** `FileInput` with `append` and `showLimits`: picks several files, adding to the selection each time. */
export function MultipleFileInput({ showLimits = true, ...props }: MultipleFileInputProps) {
  return <FileInput {...props} append showLimits={showLimits} />
}
