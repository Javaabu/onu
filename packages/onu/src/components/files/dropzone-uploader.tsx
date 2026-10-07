"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { useDropzone } from "react-dropzone"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { Button } from "../../ui/button"
import { useFormField, useFormFieldControl } from "../form/form-field"
import { FileRow } from "./_file-row"
import { fileKey, validateFiles, type FileRejection, type FileValidationOptions } from "./file-utils"
import { defaultUploadValue } from "./instant-file-upload"
import { UploadProgress } from "./upload-progress"
import { useRejectionMessage, useUploadQueue, type UploadItem, type UploadSource } from "./use-files"

export const dropzoneVariants = cva(
  "gap-2 relative flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-input bg-muted/30 text-center text-muted-foreground transition-colors data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 data-[drag-active]:border-primary data-[drag-active]:bg-primary-subtle data-[drag-active]:text-primary-subtle-foreground data-[invalid]:border-destructive",
  {
    variants: {
      size: {
        sm: "p-4 text-xs",
        default: "p-6 text-sm",
        lg: "p-10 text-sm",
      },
    },
    defaultVariants: { size: "default" },
  },
)

export interface DropzoneUploaderProps<R = unknown>
  extends UploadSource<R>, FileValidationOptions, VariantProps<typeof dropzoneVariants> {
  /** Allow several files. Default `true`. */
  multiple?: boolean
  disabled?: boolean
  /** Called with every accepted batch of files (dropped, picked or pasted). */
  onFilesAdded?: (files: File[]) => void
  /** Called with files that failed validation. */
  onReject?: (rejections: FileRejection[]) => void
  /** Without `upload`/`url`: called with the selected files whenever they change. */
  onChange?: (files: File[]) => void
  onUploaded?: (item: UploadItem<R>) => void
  onError?: (item: UploadItem<R>, error: unknown) => void
  onItemsChange?: (items: UploadItem<R>[]) => void
  /** Also accept files pasted anywhere on the page (not only while the drop zone has focus). */
  pasteFromDocument?: boolean
  /** Main text. Default "Drag and drop files here". */
  title?: React.ReactNode
  /** Secondary text, e.g. accepted types and limits. */
  description?: React.ReactNode
  /** Icon element. Default: upload icon. */
  icon?: React.ReactNode
  /** Show the file / progress list. Default `true`. */
  showList?: boolean
  /** Hidden inputs for uploaded ids (see InstantFileUpload). Defaults to the FormField's name. */
  name?: string
  getValue?: (response: R) => string | number | null | undefined
  id?: string
  "aria-describedby"?: string
  "aria-invalid"?: boolean
  className?: string
  classNames?: {
    zone?: string
    icon?: string
    title?: string
    description?: string
    button?: string
    list?: string
    errors?: string
  }
  ref?: React.Ref<HTMLDivElement>
}

/**
 * A drop zone (react-dropzone) with a "Browse files" button for keyboard and touch users,
 * paste-from-clipboard, validation messages, and an upload progress list when given an
 * `upload` function or `url`.
 */
export function DropzoneUploader<R = unknown>({
  upload,
  url,
  uploadOptions,
  accept,
  maxSize,
  minSize,
  maxFiles,
  multiple = true,
  disabled: disabledProp,
  onFilesAdded,
  onReject,
  onChange,
  onUploaded,
  onError,
  onItemsChange,
  pasteFromDocument = false,
  title,
  description,
  icon,
  showList = true,
  name,
  getValue,
  size,
  className,
  classNames,
  ref,
  ...aria
}: DropzoneUploaderProps<R>) {
  const { t } = useTranslation()
  const field = useFormField()
  // The visible "Browse" button carries the field wiring (not `name`/`required`, which a button can't use).
  const wired: Record<string, unknown> = useFormFieldControl<Record<string, unknown>>({
    ...aria,
    disabled: disabledProp,
  })
  const control = {
    id: wired.id as string | undefined,
    "aria-describedby": wired["aria-describedby"] as string | undefined,
    "aria-invalid": wired["aria-invalid"] as boolean | undefined,
    disabled: wired.disabled as boolean | undefined,
  }
  const disabled = !!control.disabled
  const queue = useUploadQueue<R>({ upload, url, uploadOptions, onUploaded, onError, onItemsChange })
  const uploads = queue.canUpload
  const [files, setFiles] = React.useState<File[]>([])
  const [rejections, setRejections] = React.useState<FileRejection[]>([])
  const options = { accept, maxSize, minSize, maxFiles }
  const message = useRejectionMessage(options)
  const errorsId = React.useId()
  const hiddenName = name ?? field?.name

  const count = uploads
    ? queue.items.filter((i) => i.status !== "cancelled" && i.status !== "error").length
    : files.length

  const handleFiles = (incoming: readonly File[]) => {
    if (disabled || !incoming.length) return
    const list = multiple ? incoming : incoming.slice(0, 1)
    const known = new Set(files.map(fileKey))
    const fresh = uploads ? list : list.filter((f) => !known.has(fileKey(f)))
    const { accepted, rejected } = validateFiles(fresh, options, multiple ? count : 0)
    setRejections(rejected)
    if (rejected.length) onReject?.(rejected)
    if (!accepted.length) return
    onFilesAdded?.(accepted)
    if (uploads) queue.add(accepted)
    else {
      const next = multiple ? [...files, ...accepted] : accepted
      setFiles(next)
      onChange?.(next)
    }
  }

  const { getRootProps, getInputProps, isDragActive, open, rootRef } = useDropzone({
    onDrop: (accepted) => handleFiles(accepted),
    multiple,
    disabled,
    noKeyboard: true,
    noClick: false,
    useFsAccessApi: false,
  })

  // react-dropzone handles pastes inside the zone; this catches pastes anywhere else on the page.
  const onPasteEvent = React.useEffectEvent((event: ClipboardEvent) => {
    if (rootRef.current?.contains(event.target as Node | null)) return
    const pasted = Array.from(event.clipboardData?.files ?? [])
    if (pasted.length) {
      event.preventDefault()
      handleFiles(pasted)
    }
  })

  React.useEffect(() => {
    if (!pasteFromDocument) return
    const handler = (e: ClipboardEvent) => onPasteEvent(e)
    document.addEventListener("paste", handler)
    return () => document.removeEventListener("paste", handler)
  }, [pasteFromDocument])

  const removeFile = (index: number) => {
    const next = files.filter((_, i) => i !== index)
    setFiles(next)
    onChange?.(next)
  }

  const describedBy = [control["aria-describedby"], rejections.length ? errorsId : null].filter(Boolean).join(" ")

  return (
    <div data-slot="dropzone-uploader" ref={ref} className={cn("gap-3 grid w-full", className)}>
      <div
        {...getRootProps()}
        data-slot="dropzone"
        data-drag-active={isDragActive || undefined}
        data-disabled={disabled || undefined}
        data-invalid={control["aria-invalid"] || undefined}
        className={cn(dropzoneVariants({ size }), !disabled && "cursor-pointer", classNames?.zone)}
      >
        <input {...getInputProps()} accept={accept} />
        <span className={cn("p-3 shadow-xs rounded-full bg-background text-foreground", classNames?.icon)}>
          {icon ?? <Icon name="upload" size="lg" />}
        </span>
        <p className={cn("font-medium text-foreground", classNames?.title)}>
          {isDragActive ? t("file.dropToUpload") : (title ?? t("file.dropzoneTitle"))}
        </p>
        <p className={cn("text-xs", classNames?.description)}>{description ?? t("file.dropzoneHint")}</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn("mt-1", classNames?.button)}
          {...control}
          aria-describedby={describedBy || undefined}
          onClick={(e) => {
            e.stopPropagation()
            open()
          }}
        >
          <Icon name="folder" data-icon="inline-start" />
          {multiple ? t("file.browseFiles") : t("file.browseFile")}
        </Button>
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

      {showList && uploads ? (
        <UploadProgress
          items={queue.items}
          onCancel={queue.cancel}
          onRetry={queue.retry}
          onRemove={queue.remove}
          announcement={queue.announcement}
          className={classNames?.list}
        />
      ) : null}
      {showList && !uploads && files.length ? (
        <ul aria-label={t("file.selectedFiles")} className={cn("gap-2 grid", classNames?.list)}>
          {files.map((file, index) => (
            <FileRow
              key={fileKey(file)}
              name={file.name}
              size={file.size}
              file={file}
              actions={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={t("file.removeFile", { name: file.name })}
                  onClick={() => removeFile(index)}
                >
                  <Icon name="close" />
                </Button>
              }
            />
          ))}
        </ul>
      ) : null}
      {hiddenName && uploads
        ? queue.items
            .filter((i) => i.status === "success")
            .map((item) => {
              const value = getValue ? getValue(item.response as R) : defaultUploadValue(item.response)
              return value === null || value === undefined ? null : (
                <input
                  key={item.id}
                  type="hidden"
                  name={multiple ? `${hiddenName}[]` : hiddenName}
                  value={String(value)}
                />
              )
            })
        : null}
    </div>
  )
}
