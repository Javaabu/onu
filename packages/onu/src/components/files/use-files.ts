"use client"

import * as React from "react"

import { useTranslation } from "../../providers/onu-provider"
import {
  createXhrUploader,
  formatFileSize,
  isAbortError,
  UploadError,
  type FileRejection,
  type FileSizeUnit,
  type FileValidationOptions,
  type UploadFn,
  type XhrUploadOptions,
} from "./file-utils"
import { registerEnglish } from "../../i18n/english"
import { file as en_file } from "../../locales/en/file"

registerEnglish({ file: en_file })

/** Formats byte counts with the active locale's number format and unit labels. */
export function useFormatFileSize() {
  const { t, locale } = useTranslation()
  return React.useCallback(
    (bytes: number) => {
      const units: Record<FileSizeUnit, string> = {
        B: t("file.unitB"),
        KB: t("file.unitKB"),
        MB: t("file.unitMB"),
        GB: t("file.unitGB"),
        TB: t("file.unitTB"),
      }
      return formatFileSize(bytes, locale.numberLocale, units)
    },
    [t, locale.numberLocale],
  )
}

/** Turns a `FileRejection` into a translated message. */
export function useRejectionMessage(options: FileValidationOptions) {
  const { t } = useTranslation()
  const format = useFormatFileSize()
  const { accept, maxSize, minSize, maxFiles } = options
  return React.useCallback(
    ({ file, code }: FileRejection) => {
      switch (code) {
        case "file-too-large":
          return t("file.errorTooLarge", { name: file.name, max: format(maxSize ?? 0) })
        case "file-too-small":
          return t("file.errorTooSmall", { name: file.name, min: format(minSize ?? 0) })
        case "file-invalid-type":
          return t("file.errorType", { name: file.name, accept: accept ?? "" })
        case "too-many-files":
          return t("file.errorTooMany", { name: file.name, count: maxFiles ?? 0 })
      }
    },
    [t, format, accept, maxSize, minSize, maxFiles],
  )
}

// ---------------------------------------------------------------------------
// Object URLs, shared and revoked once nothing uses them (StrictMode-safe).
// ---------------------------------------------------------------------------

const objectUrls = new Map<Blob, { url: string; count: number }>()

function peekObjectUrl(blob: Blob) {
  let entry = objectUrls.get(blob)
  if (!entry) {
    entry = { url: URL.createObjectURL(blob), count: 0 }
    objectUrls.set(blob, entry)
  }
  return entry.url
}

/** An object URL for a File/Blob (e.g. an image preview). Revoked when no longer used. */
export function useObjectUrl(blob: Blob | null | undefined): string | undefined {
  const supported = typeof URL !== "undefined" && typeof URL.createObjectURL === "function"
  const url = React.useMemo(() => (blob && supported ? peekObjectUrl(blob) : undefined), [blob, supported])
  React.useEffect(() => {
    if (!blob || !supported) return
    const entry = objectUrls.get(blob)
    if (!entry) return
    entry.count++
    return () => {
      entry.count--
      setTimeout(() => {
        if (entry.count <= 0 && objectUrls.get(blob) === entry) {
          URL.revokeObjectURL(entry.url)
          objectUrls.delete(blob)
        }
      }, 0)
    }
  }, [blob, supported])
  return url
}

// ---------------------------------------------------------------------------
// Upload queue
// ---------------------------------------------------------------------------

export type UploadStatus = "queued" | "uploading" | "success" | "error" | "cancelled"

export interface UploadItem<R = unknown> {
  id: string
  file: File
  status: UploadStatus
  /** 0–100. */
  progress: number
  /** Translated error message when `status` is `error`. */
  error?: string
  /** What the uploader resolved with (e.g. the server's JSON). */
  response?: R
}

export interface UploadSource<R = unknown> {
  /** Your own uploader: `(file, { onProgress, signal }) => Promise<response>`. */
  upload?: UploadFn<R>
  /** Or a URL for the built-in XHR uploader. */
  url?: string
  /** Options for the built-in uploader: `headers` (e.g. CSRF token), `fieldName`, `data`, `method`, `withCredentials`. */
  uploadOptions?: Omit<XhrUploadOptions, "url">
}

export interface UseUploadQueueOptions<R = unknown> extends UploadSource<R> {
  /** Called when a file finishes uploading. */
  onUploaded?: (item: UploadItem<R>) => void
  /** Called when an upload fails (not when it is cancelled). */
  onError?: (item: UploadItem<R>, error: unknown) => void
  /** Called whenever the list changes. */
  onItemsChange?: (items: UploadItem<R>[]) => void
}

let nextId = 0

/**
 * Uploads files as soon as they are added, tracking progress per file with cancel, retry
 * and remove. Used by `DropzoneUploader`; usable on its own.
 */
export function useUploadQueue<R = unknown>(options: UseUploadQueueOptions<R>) {
  const { upload, url, uploadOptions, onUploaded, onError, onItemsChange } = options
  const { t } = useTranslation()
  const [items, setItems] = React.useState<UploadItem<R>[]>([])
  const [announcement, setAnnouncement] = React.useState("")
  const controllers = React.useRef(new Map<string, AbortController>())
  const itemsRef = React.useRef(items)

  const uploader = React.useMemo<UploadFn<R> | undefined>(
    () => upload ?? (url ? (createXhrUploader({ url, ...uploadOptions }) as UploadFn<R>) : undefined),
    [upload, url, uploadOptions],
  )

  const changed = React.useEffectEvent((next: UploadItem<R>[]) => onItemsChange?.(next))
  // Latest callbacks for async upload results (updated after render, read later in promise callbacks).
  const callbacks = React.useRef({ onUploaded, onError })
  React.useLayoutEffect(() => {
    callbacks.current = { onUploaded, onError }
  })

  React.useEffect(() => {
    if (itemsRef.current === items) return
    itemsRef.current = items
    changed(items)
  }, [items])

  React.useEffect(() => {
    const map = controllers.current
    return () => {
      for (const controller of map.values()) controller.abort()
      map.clear()
    }
  }, [])

  const update = React.useCallback((id: string, patch: Partial<UploadItem<R>>) => {
    setItems((list) => list.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }, [])

  const start = React.useCallback(
    (id: string, file: File) => {
      if (!uploader) return
      const controller = new AbortController()
      controllers.current.set(id, controller)
      update(id, { status: "uploading", progress: 0, error: undefined })
      setAnnouncement(t("file.uploadingFile", { name: file.name }))
      uploader(file, {
        signal: controller.signal,
        onProgress: (progress) => update(id, { progress: Math.max(0, Math.min(100, progress)) }),
      }).then(
        (response) => {
          controllers.current.delete(id)
          const patch = { status: "success", progress: 100, response } as const
          update(id, patch)
          setAnnouncement(t("file.uploadedFile", { name: file.name }))
          callbacks.current.onUploaded?.({ id, file, ...patch })
        },
        (error: unknown) => {
          controllers.current.delete(id)
          if (isAbortError(error) || controller.signal.aborted) {
            update(id, { status: "cancelled" })
            setAnnouncement(t("file.cancelledFile", { name: file.name }))
            return
          }
          const message =
            error instanceof UploadError || error instanceof Error ? error.message || t("file.uploadFailed") : ""
          const patch = { status: "error", error: message || t("file.uploadFailed") } as const
          update(id, patch)
          setAnnouncement(t("file.failedFile", { name: file.name, error: patch.error }))
          callbacks.current.onError?.({ id, file, progress: 0, ...patch }, error)
        },
      )
    },
    [uploader, update, t],
  )

  const add = React.useCallback(
    (files: readonly File[]) => {
      const added = files.map<UploadItem<R>>((file) => ({
        id: `upload-${++nextId}`,
        file,
        status: "queued",
        progress: 0,
      }))
      setItems((list) => [...list, ...added])
      for (const item of added) start(item.id, item.file)
      return added
    },
    [start],
  )

  const cancel = React.useCallback((id: string) => controllers.current.get(id)?.abort(), [])

  const retry = React.useCallback(
    (id: string) => {
      const item = items.find((i) => i.id === id)
      if (item) start(id, item.file)
    },
    [items, start],
  )

  const remove = React.useCallback((id: string) => {
    controllers.current.get(id)?.abort()
    setItems((list) => list.filter((item) => item.id !== id))
  }, [])

  const clear = React.useCallback(() => {
    for (const controller of controllers.current.values()) controller.abort()
    setItems([])
  }, [])

  return { items, add, cancel, retry, remove, clear, announcement, canUpload: !!uploader }
}
