"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { Button, buttonVariants } from "../../ui/button"
import { useFormField, useFormFieldControl } from "../form/form-field"
import { useMergedRef } from "../inputs/text-input"
import { FileRow } from "./_file-row"
import { useControllable } from "./_use-controllable"
import type { ExistingAttachment } from "./additional-files-upload"
import { fileKey, syncInputFiles, validateFiles, type FileRejection, type FileValidationOptions } from "./file-utils"
import { UploadProgress } from "./upload-progress"
import { useFormatFileSize, useRejectionMessage, useUploadQueue, type UploadItem, type UploadSource } from "./use-files"
import { registerEnglish } from "../../i18n/english"
import { file as en_file } from "../../locales/en/file"

registerEnglish({ file: en_file })

export const fileInputVariants = cva(
  "group/file-input min-w-0 relative flex w-full transition-colors has-[input:disabled]:cursor-not-allowed has-[input:disabled]:opacity-50 has-[input:focus-visible]:border-ring has-[input:focus-visible]:ring-3 has-[input:focus-visible]:ring-ring/50 has-[input[aria-invalid=true]]:border-destructive has-[input[aria-invalid=true]]:ring-destructive/20 data-[drag-active]:border-primary",
  {
    variants: {
      appearance: {
        input: "text-sm touch:min-h-11 items-center rounded-lg border border-input bg-transparent dark:bg-input/30",
        dropzone:
          "gap-2 flex-col items-center justify-center rounded-xl border-2 border-dashed border-input bg-muted/30 text-center text-muted-foreground data-[drag-active]:bg-primary-subtle data-[drag-active]:text-primary-subtle-foreground",
      },
      size: { sm: "", default: "", lg: "" },
    },
    compoundVariants: [
      { appearance: "input", size: "sm", className: "h-7 gap-2 pe-2 text-xs" },
      { appearance: "input", size: "default", className: "h-8 gap-2 pe-2.5" },
      { appearance: "input", size: "lg", className: "h-10 gap-3 pe-3" },
      { appearance: "dropzone", size: "sm", className: "p-4 text-xs" },
      { appearance: "dropzone", size: "default", className: "p-6 text-sm" },
      { appearance: "dropzone", size: "lg", className: "p-10 text-sm" },
    ],
    defaultVariants: { appearance: "input", size: "default" },
  },
)

/** A file already stored on the server: shown on an edit page, or a finished upload. */
export interface UploadedFile<R = unknown> extends ExistingAttachment {
  /** The local file, when it was uploaded from this page (used for the thumbnail). */
  file?: File
  /** What the uploader resolved with. */
  response?: R
}

/** One entry of a `FileInput` value: a picked `File`, or a file already on the server. */
export type FileInputEntry<R = unknown> = File | UploadedFile<R>

const isLocalFile = (entry: FileInputEntry<unknown>): entry is File =>
  typeof File !== "undefined" && entry instanceof File

const NO_ENTRIES: FileInputEntry<never>[] = []
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

const hasFiles = (data: DataTransfer | null | undefined) => Array.from(data?.types ?? []).includes("Files")

export interface FileInputProps<R = unknown>
  extends
    Omit<React.ComponentProps<"input">, "type" | "value" | "defaultValue" | "onChange" | "onError" | "size" | "title">,
    Omit<VariantProps<typeof fileInputVariants>, "appearance">,
    UploadSource<R> {
  /**
   * `"input"` (default): a compact trigger with a button and a summary. `"dropzone"`: a large
   * drop area with a title, a hint and a "Browse files" button. Both take clicks, taps, the
   * keyboard, dropped files and pasted files, and share the value, uploads and lists.
   */
  appearance?: "input" | "dropzone"
  /**
   * The files the field holds (controlled): picked `File`s and files already on the server
   * (`{ id, name, size?, type?, url?, thumbnailUrl? }`, e.g. on an edit page). With an uploader,
   * finished uploads are added as `{ id, name, …, file, response }`.
   */
  value?: FileInputEntry<R>[]
  /** Initial files (uncontrolled), e.g. a record's saved attachments. */
  defaultValue?: FileInputEntry<R>[]
  /** Without an uploader: called with the picked `File`s whenever they change. */
  onChange?: (files: File[]) => void
  /** Called with the whole value when files are added, finish uploading or are removed. */
  onValueChange?: (value: FileInputEntry<R>[]) => void
  /** Called with every accepted batch of files (picked, dropped or pasted). */
  onFilesAdded?: (files: File[]) => void
  /** Called with files that failed validation. Messages are shown under the input too. */
  onReject?: (rejections: FileRejection[]) => void
  /** Largest allowed file size in bytes. */
  maxSize?: number
  /** Smallest allowed file size in bytes. */
  minSize?: number
  /** Most files allowed in total (files already in the value count). */
  maxFiles?: number
  /**
   * Add picked files to the selection instead of replacing it (duplicates are skipped). Implies
   * `multiple`. The drop zone and an uploader always add. Picking stops once `maxFiles` is reached.
   */
  append?: boolean
  /** Show the limits under the input (`Up to 5 files · 10 MB each`) and, with `maxFiles`, a live count. */
  showLimits?: boolean
  /** Show the files (and upload progress) with remove buttons. Default `true`. */
  showList?: boolean
  /** Button text. Defaults to "Choose file(s)", or "Browse file(s)" for the drop zone. */
  buttonLabel?: React.ReactNode
  /** `appearance="input"`: text shown when nothing is selected. */
  placeholder?: string
  /** `appearance="input"`: replace the summary text next to the button. */
  summary?: React.ReactNode
  /** `appearance="dropzone"`: main text. Default "Drag and drop files here". */
  title?: React.ReactNode
  /** `appearance="dropzone"`: secondary text, e.g. accepted types and limits. Linked to the input as its description. */
  description?: React.ReactNode
  /** `appearance="dropzone"`: icon element. Default: upload icon. */
  icon?: React.ReactNode
  /** Also accept files pasted anywhere on the page (not only while the field has focus). */
  pasteFromDocument?: boolean
  /** Stop picking more files but keep the remove buttons working (e.g. when a limit is reached). */
  pickDisabled?: boolean
  /** Files already counted towards `maxFiles` outside this input (e.g. saved attachments). */
  countOffset?: number
  /** With an uploader: gets the id from an upload response. Default: `id`, `uuid` or `data.id`. */
  getValue?: (response: R) => string | number | null | undefined
  onUploaded?: (item: UploadItem<R>) => void
  onError?: (item: UploadItem<R>, error: unknown) => void
  onItemsChange?: (items: UploadItem<R>[]) => void
  classNames?: {
    root?: string
    /** The bordered trigger, or the drop area. */
    trigger?: string
    button?: string
    /** `appearance="input"`: the text next to the button. */
    summary?: string
    /** `appearance="dropzone"`. */
    icon?: string
    /** `appearance="dropzone"`. */
    title?: string
    /** `appearance="dropzone"`. */
    description?: string
    list?: string
    item?: string
    errors?: string
    limits?: string
  }
}

/**
 * A file field built on a native `<input type="file">` that covers its trigger, so clicking,
 * tapping and the keyboard (Enter/Space) work natively. Takes dropped and pasted files, validates
 * type, size and count, lists the files with remove buttons, and keeps the input's `files` in sync
 * for plain form submits. With `upload` or `url` each file uploads as soon as it is added, with a
 * progress list, and finished uploads are submitted as ids in hidden inputs.
 * `appearance="dropzone"` shows a large drop area instead of the compact trigger.
 */
export function FileInput<R = unknown>({
  appearance = "input",
  value,
  defaultValue,
  onChange,
  onValueChange,
  onFilesAdded,
  onReject,
  upload,
  url,
  uploadOptions,
  getValue,
  onUploaded,
  onError,
  onItemsChange,
  accept,
  maxSize,
  minSize,
  maxFiles,
  multiple: multipleProp = false,
  append = false,
  showLimits = false,
  showList = true,
  buttonLabel,
  placeholder,
  summary,
  title,
  description,
  icon,
  pasteFromDocument = false,
  pickDisabled = false,
  countOffset = 0,
  size,
  className,
  classNames,
  ref,
  ...props
}: FileInputProps<R>) {
  const { t } = useTranslation()
  const format = useFormatFileSize()
  const field = useFormField()
  const dropzone = appearance === "dropzone"
  const multiple = multipleProp || append
  const local = React.useRef<HTMLInputElement>(null)
  const merged = useMergedRef(local, ref)
  const rootRef = React.useRef<HTMLDivElement>(null)
  const [entries, setEntriesState] = useControllable<FileInputEntry<R>[]>(
    value,
    defaultValue ?? (NO_ENTRIES as FileInputEntry<R>[]),
    onValueChange,
  )
  // Latest list for upload callbacks; updated as soon as it changes so two uploads finishing together both land.
  const entriesRef = React.useRef(entries)
  // Reset on every render, so a change the parent ignored does not linger.
  React.useLayoutEffect(() => {
    entriesRef.current = entries
  })
  // Upload queue id → value id of the entry it became.
  const [linked, setLinked] = React.useState<Record<string, string>>({})
  const [rejections, setRejections] = React.useState<FileRejection[]>([])
  const [announcement, setAnnouncement] = React.useState("")
  const [dragActive, setDragActive] = React.useState(false)
  // Focus moves back to the input after a removal, once it has re-rendered (it may have been disabled).
  const [focusRequest, setFocusRequest] = React.useState(0)
  const options: FileValidationOptions = { accept, maxSize, minSize, maxFiles }
  const message = useRejectionMessage(options)
  const statusId = React.useId()
  const descriptionId = React.useId()
  const buttonId = React.useId()
  const errorsId = React.useId()

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
  const { items: queueItems, remove: removeQueued } = queue
  // Whether a pick adds to the files (otherwise it replaces the picked files).
  const adds = multiple && (append || dropzone || uploads)

  const files = entries.filter(isLocalFile)
  const stored = entries.filter((e): e is UploadedFile<R> => !isLocalFile(e))
  const storedIds = new Set(stored.map((e) => String(e.id)))
  // Finished uploads that are in the value are shown by the upload list, not again as stored rows.
  const shownByQueue = new Set(
    queueItems.filter((i) => i.status === "success" && linked[i.id] !== undefined).map((i) => linked[i.id] as string),
  )
  const storedRows = uploads ? stored.filter((e) => !shownByQueue.has(String(e.id))) : []

  // A finished upload removed from the value (by the parent, or replaced in single mode) leaves the list too.
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
  const full = adds && maxFiles !== undefined && count + countOffset >= maxFiles

  const describedBy = [
    props["aria-describedby"],
    dropzone ? descriptionId : statusId,
    rejections.length ? errorsId : null,
  ]
    .filter(Boolean)
    .join(" ")
  const control = useFormFieldControl({ ...props, "aria-describedby": describedBy || undefined })
  const disabled = !!control.disabled
  const blocked = disabled || pickDisabled || full
  const name = control.name
  // Without a label from a FormField, an id (`<label for>`) or ARIA, the button text names the input.
  const labelled = !!(field || props.id || props["aria-label"] || props["aria-labelledby"])

  React.useEffect(() => {
    syncInputFiles(local.current, uploads ? NO_FILES : entries.filter(isLocalFile))
  }, [entries, uploads])

  React.useEffect(() => {
    if (focusRequest) local.current?.focus()
  }, [focusRequest])

  function setEntries(next: FileInputEntry<R>[]) {
    entriesRef.current = next
    setEntriesState(next)
    if (!uploads) onChange?.(next.filter(isLocalFile))
  }

  /** Adds files that passed validation: uploads them, or adds them to the value. */
  const addFiles = (accepted: File[]) => {
    onFilesAdded?.(accepted)
    if (uploads) {
      // Single mode: the new file replaces the one in progress (a finished one goes once this one is stored).
      if (!multiple) for (const item of queueItems) if (linked[item.id] === undefined) removeQueued(item.id)
      queue.add(accepted)
    } else setEntries(adds ? [...entries, ...accepted] : multiple ? [...stored, ...accepted] : accepted.slice(0, 1))
  }

  const handleFiles = (incoming: readonly File[]) => {
    if (blocked || !incoming.length) return
    const list = multiple ? incoming : incoming.slice(0, 1)
    const known = new Set((adds && !uploads ? files : NO_FILES).map(fileKey))
    const fresh = list.filter((f) => !known.has(fileKey(f)))
    const already = (adds ? count : multiple ? stored.length : 0) + countOffset
    const { accepted, rejected } = validateFiles(fresh, options, already)
    setRejections(rejected)
    if (rejected.length) onReject?.(rejected)
    if (accepted.length) addFiles(accepted)
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(Array.from(event.target.files ?? []))
    // The input mirrors the value (a cancelled picker or a rejected pick keeps what it held, an upload
    // leaves it empty); the effect above catches up once an accepted pick changes the value.
    syncInputFiles(local.current, uploads ? NO_FILES : files)
  }

  const handlePaste = (event: Pick<ClipboardEvent, "clipboardData" | "preventDefault">) => {
    const pasted = Array.from(event.clipboardData?.files ?? [])
    if (!pasted.length || blocked) return
    event.preventDefault()
    handleFiles(pasted)
  }

  // Files pasted anywhere else on the page.
  const onDocumentPaste = React.useEffectEvent((event: ClipboardEvent) => {
    if (!rootRef.current?.contains(event.target as Node | null)) handlePaste(event)
  })
  React.useEffect(() => {
    if (!pasteFromDocument) return
    const handler = (e: ClipboardEvent) => onDocumentPaste(e)
    document.addEventListener("paste", handler)
    return () => document.removeEventListener("paste", handler)
  }, [pasteFromDocument])

  // A file dropped just outside a drop zone must not replace the page (and the form) with the file.
  React.useEffect(() => {
    if (!dropzone) return
    const over = (e: DragEvent) => {
      if (hasFiles(e.dataTransfer)) e.preventDefault()
    }
    const drop = (e: DragEvent) => {
      const target = e.target as HTMLInputElement | null
      if (!(target?.tagName === "INPUT" && target.type === "file")) e.preventDefault()
    }
    document.addEventListener("dragover", over)
    document.addEventListener("drop", drop)
    return () => {
      document.removeEventListener("dragover", over)
      document.removeEventListener("drop", drop)
    }
  }, [dropzone])

  const onDragOver = (event: React.DragEvent) => {
    if (!hasFiles(event.dataTransfer)) return
    event.preventDefault()
    event.dataTransfer.dropEffect = blocked ? "none" : "copy"
    if (!blocked) setDragActive(true)
  }

  const refocus = () => setFocusRequest((n) => n + 1)

  const removeEntry = (entry: FileInputEntry<R>) => {
    setEntries(entriesRef.current.filter((e) => e !== entry))
    setRejections([])
    setAnnouncement(t("file.removedFile", { name: entry.name }))
    refocus()
  }

  const removeUpload = (queueId: string) => {
    const key = linked[queueId]
    removeQueued(queueId)
    if (key !== undefined) setEntries(entriesRef.current.filter((e) => isLocalFile(e) || String(e.id) !== key))
    const item = queueItems.find((i) => i.id === queueId)
    if (item) setAnnouncement(t("file.removedFile", { name: item.file.name }))
    setRejections([])
    refocus()
  }

  const entryRow = (entry: FileInputEntry<R>, index: number) => {
    const isLocal = isLocalFile(entry)
    const remote = isLocal ? undefined : entry
    return (
      <FileRow
        key={isLocal ? `file-${fileKey(entry)}` : `stored-${String(entry.id)}-${index}`}
        data-stored={isLocal ? undefined : true}
        name={entry.name}
        size={entry.size}
        type={entry.type || undefined}
        file={isLocal ? entry : remote?.file}
        thumbnailUrl={remote?.thumbnailUrl}
        className={classNames?.item}
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
  const computedSummary = (() => {
    if (!uploads) {
      if (!entries.length) return undefined
      return entries.length === 1 ? entries[0]!.name : t("file.filesSelected", { count: entries.length })
    }
    const uploading = queueItems.filter((i) => i.status === "uploading").length
    const done = storedRows.length + queueItems.filter((i) => i.status === "success").length
    if (uploading) return t("file.uploadingCount", { count: uploading })
    return done ? t("file.uploadedCount", { count: done }) : undefined
  })()
  const statusText =
    summary ?? computedSummary ?? placeholder ?? (multiple ? t("file.noFilesChosen") : t("file.noFileChosen"))
  const empty = summary === undefined && computedSummary === undefined

  const buttonText =
    buttonLabel ??
    (dropzone
      ? multiple
        ? t("file.browseFiles")
        : t("file.browseFile")
      : multiple
        ? t("file.chooseFiles")
        : t("file.chooseFile"))

  const limits = [
    maxFiles !== undefined ? t("file.limitFiles", { count: maxFiles }) : null,
    maxSize !== undefined ? t("file.limitSize", { size: format(maxSize) }) : null,
  ]
    .filter(Boolean)
    .join(" · ")

  return (
    <div
      ref={rootRef}
      data-slot="file-input"
      data-appearance={appearance}
      onPaste={(e) => handlePaste(e.nativeEvent)}
      className={cn("min-w-0 grid w-full grid-cols-1", dropzone ? "gap-3" : "gap-2", classNames?.root, className)}
    >
      <div
        data-slot="file-input-trigger"
        data-drag-active={dragActive || undefined}
        className={cn(fileInputVariants({ appearance, size }), classNames?.trigger)}
        onDragEnter={onDragOver}
        onDragOver={onDragOver}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDragActive(false)
        }}
        onDrop={(e) => {
          if (!hasFiles(e.dataTransfer)) return
          // Taken here rather than by the browser, so drops follow the same rules as picks.
          e.preventDefault()
          setDragActive(false)
          handleFiles(Array.from(e.dataTransfer.files))
        }}
      >
        <input
          ref={merged}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          className="inset-0 absolute z-10 size-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
          {...control}
          aria-labelledby={labelled ? props["aria-labelledby"] : buttonId}
          // With an uploader the form submits ids (hidden inputs below), not files.
          name={uploads ? undefined : name}
          // The input holds no files once they are uploaded or already stored.
          required={(control.required && !uploads && !stored.length) || undefined}
          disabled={blocked || undefined}
        />
        {dropzone ? (
          <>
            <span className={cn("p-3 shadow-xs rounded-full bg-background text-foreground", classNames?.icon)}>
              {icon ?? <Icon name="upload" size="lg" />}
            </span>
            <p className={cn("font-medium text-foreground", classNames?.title)}>
              {dragActive ? t("file.dropToUpload") : (title ?? t("file.dropzoneTitle"))}
            </p>
            <p id={descriptionId} className={cn("text-xs", classNames?.description)}>
              {description ?? t("file.dropzoneHint")}
            </p>
            <span
              id={buttonId}
              aria-hidden
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "mt-1 group-hover/file-input:bg-muted",
                classNames?.button,
              )}
            >
              <Icon name="folder" data-icon="inline-start" />
              {buttonText}
            </span>
          </>
        ) : (
          <>
            <span
              id={buttonId}
              aria-hidden
              className={cn(
                "gap-1.5 px-2.5 font-medium flex h-full shrink-0 items-center rounded-s-[inherit] border-e border-input bg-muted text-foreground group-hover/file-input:bg-accent",
                classNames?.button,
              )}
            >
              <Icon name="upload" size="sm" />
              {buttonText}
            </span>
            <span
              id={statusId}
              dir="auto"
              className={cn("min-w-0 truncate", empty && "text-muted-foreground", classNames?.summary)}
            >
              <bdi>{statusText}</bdi>
            </span>
          </>
        )}
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

      {showList && storedRows.length ? (
        <ul
          data-slot="file-input-stored"
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
          classNames={{ item: classNames?.item }}
        />
      ) : null}
      {showList && !uploads && entries.length ? (
        <ul aria-label={t("file.selectedFiles")} className={cn("gap-2 grid grid-cols-1", classNames?.list)}>
          {entries.map(entryRow)}
        </ul>
      ) : null}

      {showLimits && (limits || maxFiles !== undefined) ? (
        <p className={cn("gap-2 text-xs flex flex-wrap justify-between text-muted-foreground", classNames?.limits)}>
          <span>{limits}</span>
          {maxFiles !== undefined ? (
            <span aria-live="polite" className="tabular-nums">
              {t("file.countOfMax", { count: count + countOffset, max: maxFiles })}
            </span>
          ) : null}
        </p>
      ) : null}

      {showList ? (
        // Removals happen in the list.
        <div role="status" aria-live="polite" className="sr-only">
          {announcement}
        </div>
      ) : null}
      {name
        ? stored.map((entry, index) => (
            <input
              key={`${String(entry.id)}-${index}`}
              type="hidden"
              name={multiple ? `${name}[]` : name}
              value={String(entry.id)}
            />
          ))
        : null}
    </div>
  )
}
