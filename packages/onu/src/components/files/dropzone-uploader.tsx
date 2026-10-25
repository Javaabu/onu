"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { useDropzone } from "react-dropzone"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { Button } from "../../ui/button"
import { useFormField, useFormFieldControl } from "../form/form-field"
import { useMergedRef } from "../inputs/text-input"
import { FileRow } from "./_file-row"
import { useControllable } from "./_use-controllable"
import type { ExistingAttachment } from "./additional-files-upload"
import { FileInput, type FileInputProps } from "./file-input"
import { fileKey, validateFiles, type FileRejection, type FileValidationOptions } from "./file-utils"
import { UploadProgress } from "./upload-progress"
import { useRejectionMessage, useUploadQueue, type UploadItem, type UploadSource } from "./use-files"
import { registerEnglish } from "../../i18n/english"
import { file as en_file } from "../../locales/en/file"

registerEnglish({ file: en_file })

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

/** A file already stored on the server: shown on an edit page, or a finished upload. */
export interface UploadedFile<R = unknown> extends ExistingAttachment {
  /** The local file, when it was uploaded from this page (used for the thumbnail). */
  file?: File
  /** What the uploader resolved with. */
  response?: R
}

/** One entry of a `DropzoneUploader` value: a picked `File`, or a file already on the server. */
export type DropzoneFile<R = unknown> = File | UploadedFile<R>

const isLocalFile = (entry: DropzoneFile<unknown>): entry is File =>
  typeof File !== "undefined" && entry instanceof File

const NO_ENTRIES: DropzoneFile<never>[] = []
const NO_FILES: File[] = []

/** Reads an id from common response shapes: `{ id }`, `{ data: { id } }`, `{ uuid }`. */
export function defaultUploadValue(response: unknown): string | undefined {
  if (response === null || response === undefined) return undefined
  if (typeof response === "string" || typeof response === "number") return String(response)
  if (typeof response !== "object") return undefined
  const r = response as { id?: unknown; uuid?: unknown; data?: unknown }
  const id = r.id ?? r.uuid
  if (typeof id === "string" || typeof id === "number") return String(id)
  return r.data !== undefined ? defaultUploadValue(r.data) : undefined
}

/** `FileInput` props that `appearance="input"` passes to the trigger (`aria-label`, `buttonLabel`, …). */
export type DropzoneInputProps = Omit<
  FileInputProps,
  | "value"
  | "defaultValue"
  | "onChange"
  | "onReject"
  | "accept"
  | "maxSize"
  | "minSize"
  | "maxFiles"
  | "multiple"
  | "append"
  | "showList"
  | "summary"
  | "name"
  | "disabled"
  | "size"
  | "className"
  | "classNames"
  | "ref"
>

export interface DropzoneUploaderProps<R = unknown>
  extends UploadSource<R>, FileValidationOptions, VariantProps<typeof dropzoneVariants> {
  /**
   * `"dropzone"` (default): a drop area with a "Browse files" button. `"input"`: a compact
   * `FileInput` trigger instead, with the same value, uploads, lists and hidden inputs.
   */
  appearance?: "dropzone" | "input"
  /** With `appearance="input"`: props for the `FileInput` trigger, e.g. `aria-label`, `buttonLabel`, `placeholder`. */
  inputProps?: DropzoneInputProps
  /** Ref to the `<input type="file">`. */
  inputRef?: React.Ref<HTMLInputElement>
  /** Allow several files. Default `true`. */
  multiple?: boolean
  disabled?: boolean
  /** Called with every accepted batch of files (dropped, picked or pasted). */
  onFilesAdded?: (files: File[]) => void
  /** Called with files that failed validation. */
  onReject?: (rejections: FileRejection[]) => void
  /** Without `upload`/`url`: called with the selected files whenever they change. */
  onChange?: (files: File[]) => void
  /**
   * The files the field holds (controlled): already-uploaded files (`{ id, name, size?, type?,
   * url?, thumbnailUrl? }`, e.g. on an edit page) and, without an uploader, picked `File`s.
   * With an uploader, finished uploads are added as `{ id, name, … , response }`.
   */
  value?: DropzoneFile<R>[]
  /** Initial files (uncontrolled), e.g. a record's saved attachments. */
  defaultValue?: DropzoneFile<R>[]
  /** Called with the new list when files are added, finish uploading or are removed. */
  onValueChange?: (value: DropzoneFile<R>[]) => void
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
  /**
   * Name for hidden inputs holding each stored file's id (existing files and finished uploads),
   * so a plain form submit sends them (`name[]` when `multiple`). Defaults to the FormField's name.
   */
  name?: string
  /** Gets the id from an upload response. Default: `id`, `uuid` or `data.id`. */
  getValue?: (response: R) => string | number | null | undefined
  id?: string
  "aria-describedby"?: string
  "aria-invalid"?: boolean
  className?: string
  classNames?: {
    /** The drop area, or the `FileInput` root with `appearance="input"`. */
    zone?: string
    /** `appearance="input"`: the bordered trigger. */
    trigger?: string
    /** `appearance="input"`: the text next to the button. */
    summary?: string
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
 * `upload` function or `url`. With `appearance="input"` the zone is a compact `FileInput`.
 */
export function DropzoneUploader<R = unknown>({
  appearance = "dropzone",
  inputProps,
  inputRef,
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
  value,
  defaultValue,
  onValueChange,
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
  const compact = appearance === "input"
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
  const [entries, setEntriesState] = useControllable<DropzoneFile<R>[]>(
    value,
    defaultValue ?? (NO_ENTRIES as DropzoneFile<R>[]),
    onValueChange,
  )
  // Latest list for upload callbacks; updated as soon as it changes so two uploads finishing together both land.
  const entriesRef = React.useRef(entries)
  React.useLayoutEffect(() => {
    entriesRef.current = entries
  }, [entries])
  // Upload queue id → value id of the entry it became.
  const [linked, setLinked] = React.useState<Record<string, string>>({})
  const browseRef = React.useRef<HTMLButtonElement>(null)
  const pickerRef = React.useRef<HTMLInputElement>(null)
  const pickerMerged = useMergedRef(pickerRef, inputRef)
  const [announcement, setAnnouncement] = React.useState("")

  const handleUploaded = (item: UploadItem<R>) => {
    onUploaded?.(item)
    const id = getValue ? getValue(item.response as R) : defaultUploadValue(item.response)
    if (id === null || id === undefined) return
    const entry: UploadedFile<R> = {
      id,
      name: item.file.name,
      size: item.file.size,
      type: item.file.type || undefined,
      file: item.file,
      response: item.response,
    }
    setLinked((map) => ({ ...map, [item.id]: String(id) }))
    setEntries(multiple ? [...entriesRef.current, entry] : [entry])
  }

  const queue = useUploadQueue<R>({ upload, url, uploadOptions, onUploaded: handleUploaded, onError, onItemsChange })
  const uploads = queue.canUpload
  const [rejections, setRejections] = React.useState<FileRejection[]>([])
  const options = { accept, maxSize, minSize, maxFiles }
  const message = useRejectionMessage(options)
  const errorsId = React.useId()
  const hiddenName = name ?? field?.name

  const files = entries.filter(isLocalFile)
  const stored = entries.filter((e): e is UploadedFile<R> => !isLocalFile(e))
  const storedIds = new Set(stored.map((e) => String(e.id)))
  // Finished uploads that are in the value are shown by the upload list, not again as stored rows.
  const shownByQueue = new Set(
    queue.items.filter((i) => i.status === "success" && linked[i.id] !== undefined).map((i) => linked[i.id] as string),
  )
  const storedRows = uploads ? stored.filter((e) => !shownByQueue.has(String(e.id))) : []

  // A finished upload removed from the value (by the parent, or replaced in single mode) leaves the list too.
  const { items: queueItems, remove: removeQueued } = queue
  React.useEffect(() => {
    for (const item of queueItems) {
      const key = linked[item.id]
      if (key !== undefined && !storedIds.has(key)) removeQueued(item.id)
    }
  })

  const count = uploads
    ? stored.length +
      queueItems.filter(
        (i) =>
          i.status === "queued" || i.status === "uploading" || (i.status === "success" && linked[i.id] === undefined),
      ).length
    : entries.length

  function setEntries(next: DropzoneFile<R>[]) {
    entriesRef.current = next
    setEntriesState(next)
    if (!uploads) onChange?.(next.filter(isLocalFile))
  }

  /** Adds files that passed validation: uploads them, or adds them to the value. */
  const addFiles = (accepted: File[]) => {
    if (disabled || !accepted.length) return
    onFilesAdded?.(accepted)
    if (uploads) queue.add(accepted)
    else setEntries(multiple ? [...entries, ...accepted] : accepted.slice(0, 1))
  }

  const handleFiles = (incoming: readonly File[]) => {
    if (disabled || !incoming.length) return
    const list = multiple ? incoming : incoming.slice(0, 1)
    const known = new Set(files.map(fileKey))
    const fresh = uploads ? list : list.filter((f) => !known.has(fileKey(f)))
    const { accepted, rejected } = validateFiles(fresh, options, multiple ? count : 0)
    setRejections(rejected)
    if (rejected.length) onReject?.(rejected)
    addFiles(accepted)
  }

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    open,
    rootRef,
    inputRef: zoneInputRef,
  } = useDropzone({
    onDrop: (accepted) => handleFiles(accepted),
    multiple,
    disabled,
    noKeyboard: true,
    noClick: false,
    useFsAccessApi: false,
    // The compact input takes drops natively; react-dropzone would cancel them at the document.
    preventDropOnDocument: !compact,
  })
  const zoneInputMerged = useMergedRef(zoneInputRef, inputRef)

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

  const refocus = () => (compact ? pickerRef : browseRef).current?.focus()

  const removeEntry = (entry: DropzoneFile<R>) => {
    setEntries(entries.filter((e) => e !== entry))
    setAnnouncement(t("file.removedFile", { name: entry.name }))
    refocus()
  }

  const removeUpload = (queueId: string) => {
    const key = linked[queueId]
    queue.remove(queueId)
    if (key !== undefined) setEntries(entriesRef.current.filter((e) => isLocalFile(e) || String(e.id) !== key))
    const item = queueItems.find((i) => i.id === queueId)
    if (item) setAnnouncement(t("file.removedFile", { name: item.file.name }))
    refocus()
  }

  const entryRow = (entry: DropzoneFile<R>, index: number) => {
    const local = isLocalFile(entry)
    const remote = local ? undefined : entry
    return (
      <FileRow
        key={local ? `file-${fileKey(entry)}` : `stored-${String(entry.id)}-${index}`}
        data-stored={local ? undefined : true}
        name={entry.name}
        size={entry.size}
        type={entry.type || undefined}
        file={local ? entry : remote?.file}
        thumbnailUrl={remote?.thumbnailUrl}
        actions={
          <>
            {remote?.url ? (
              <Button asChild variant="ghost" size="icon-sm">
                <a
                  href={remote.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={t("file.openFile", { name: entry.name })}
                >
                  <Icon name="external-link" />
                </a>
              </Button>
            ) : null}
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={disabled}
              aria-label={t("file.removeFile", { name: entry.name })}
              onClick={() => removeEntry(entry)}
            >
              <Icon name="close" />
            </Button>
          </>
        }
      />
    )
  }

  // The text next to the compact trigger's button.
  const compactSummary = () => {
    if (!uploads) {
      if (!entries.length) return undefined
      return entries.length === 1 ? entries[0]!.name : t("file.filesSelected", { count: entries.length })
    }
    const uploading = queueItems.filter((i) => i.status === "uploading").length
    const done = storedRows.length + queueItems.filter((i) => i.status === "success").length
    if (uploading) return t("file.uploadingCount", { count: uploading })
    return done ? t("file.uploadedCount", { count: done }) : undefined
  }

  const describedBy = [control["aria-describedby"], rejections.length ? errorsId : null].filter(Boolean).join(" ")

  const zone = compact ? (
    <FileInput
      {...inputProps}
      {...aria}
      ref={pickerMerged}
      // Uploads are submitted as ids in hidden inputs, not as files.
      name=""
      aria-describedby={
        [aria["aria-describedby"] ?? inputProps?.["aria-describedby"], rejections.length ? errorsId : null]
          .filter(Boolean)
          .join(" ") || undefined
      }
      disabled={disabledProp}
      size={size}
      accept={accept}
      maxSize={maxSize}
      minSize={minSize}
      maxFiles={maxFiles}
      multiple={multiple}
      // Without an uploader the input holds the picked files, so each pick adds to them (duplicates skipped).
      append={!uploads && multiple}
      value={uploads ? NO_FILES : files}
      countOffset={(inputProps?.countOffset ?? 0) + (multiple ? (uploads ? count : stored.length) : 0)}
      onChange={(next) => addFiles(uploads ? next : next.filter((f) => !files.includes(f)))}
      onReject={onReject}
      // Single upload mode takes one file at a time: remove it (or let it fail) to pick another.
      pickDisabled={
        inputProps?.pickDisabled ||
        (uploads && !multiple && queueItems.some((i) => i.status !== "cancelled" && i.status !== "error"))
      }
      showList={false}
      summary={compactSummary()}
      classNames={{
        root: classNames?.zone,
        trigger: classNames?.trigger,
        button: classNames?.button,
        summary: classNames?.summary,
        errors: classNames?.errors,
      }}
    />
  ) : (
    <div
      {...getRootProps()}
      data-slot="dropzone"
      data-drag-active={isDragActive || undefined}
      data-disabled={disabled || undefined}
      data-invalid={control["aria-invalid"] || undefined}
      className={cn(dropzoneVariants({ size }), !disabled && "cursor-pointer", classNames?.zone)}
    >
      <input {...getInputProps()} ref={zoneInputMerged} accept={accept} />
      <span className={cn("p-3 shadow-xs rounded-full bg-background text-foreground", classNames?.icon)}>
        {icon ?? <Icon name="upload" size="lg" />}
      </span>
      <p className={cn("font-medium text-foreground", classNames?.title)}>
        {isDragActive ? t("file.dropToUpload") : (title ?? t("file.dropzoneTitle"))}
      </p>
      <p className={cn("text-xs", classNames?.description)}>{description ?? t("file.dropzoneHint")}</p>
      <Button
        ref={browseRef}
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
  )

  return (
    <div
      data-slot={compact ? "instant-file-upload" : "dropzone-uploader"}
      ref={ref}
      className={cn(compact ? "gap-2" : "gap-3", "min-w-0 grid w-full grid-cols-1", className)}
    >
      {zone}

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

      {showList && storedRows.length ? (
        <ul
          data-slot="dropzone-stored"
          aria-label={t("file.attachments")}
          className={cn("gap-2 grid grid-cols-1", classNames?.list)}
        >
          {storedRows.map(entryRow)}
        </ul>
      ) : null}
      {showList && uploads ? (
        <UploadProgress
          items={queueItems.filter((i) => {
            const key = linked[i.id]
            return key === undefined || storedIds.has(key)
          })}
          onCancel={queue.cancel}
          onRetry={queue.retry}
          onRemove={removeUpload}
          announcement={queue.announcement}
          className={cn("grid-cols-1", classNames?.list)}
        />
      ) : null}
      {showList && !uploads && entries.length ? (
        <ul aria-label={t("file.selectedFiles")} className={cn("gap-2 grid grid-cols-1", classNames?.list)}>
          {entries.map(entryRow)}
        </ul>
      ) : null}
      <div role="status" aria-live="polite" className="sr-only">
        {announcement}
      </div>
      {hiddenName
        ? stored.map((entry, index) => (
            <input
              key={`${String(entry.id)}-${index}`}
              type="hidden"
              name={multiple ? `${hiddenName}[]` : hiddenName}
              value={String(entry.id)}
            />
          ))
        : null}
    </div>
  )
}
