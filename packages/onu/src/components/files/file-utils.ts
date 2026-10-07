import type { SemanticIconName } from "../../icons/types"

/** Broad file categories used for icons, previews and filters. */
export type FileKind =
  "image" | "video" | "audio" | "pdf" | "document" | "spreadsheet" | "presentation" | "archive" | "text" | "other"

const EXTENSION_KINDS: Record<string, FileKind> = {
  jpg: "image",
  jpeg: "image",
  png: "image",
  gif: "image",
  webp: "image",
  avif: "image",
  svg: "image",
  bmp: "image",
  heic: "image",
  mp4: "video",
  webm: "video",
  mov: "video",
  m4v: "video",
  mkv: "video",
  mp3: "audio",
  wav: "audio",
  ogg: "audio",
  m4a: "audio",
  aac: "audio",
  flac: "audio",
  pdf: "pdf",
  doc: "document",
  docx: "document",
  odt: "document",
  rtf: "document",
  pages: "document",
  xls: "spreadsheet",
  xlsx: "spreadsheet",
  ods: "spreadsheet",
  csv: "spreadsheet",
  numbers: "spreadsheet",
  ppt: "presentation",
  pptx: "presentation",
  odp: "presentation",
  key: "presentation",
  zip: "archive",
  rar: "archive",
  "7z": "archive",
  tar: "archive",
  gz: "archive",
  txt: "text",
  md: "text",
  json: "text",
  xml: "text",
}

/** Lower-case extension of a file name or URL, without the dot (`"report.PDF?x=1"` → `"pdf"`). */
export function getExtension(name: string): string {
  const clean = name.split(/[?#]/)[0] ?? ""
  const base = clean.slice(clean.lastIndexOf("/") + 1)
  const dot = base.lastIndexOf(".")
  return dot > 0 ? base.slice(dot + 1).toLowerCase() : ""
}

/** Works out a file's kind from its MIME type and/or name. */
export function getFileKind(input: { type?: string | null; name?: string | null } | string): FileKind {
  const { type, name } = typeof input === "string" ? { type: input.includes("/") ? input : "", name: input } : input
  const mime = (type ?? "").toLowerCase()
  if (mime.startsWith("image/")) return "image"
  if (mime.startsWith("video/")) return "video"
  if (mime.startsWith("audio/")) return "audio"
  if (mime === "application/pdf") return "pdf"
  if (/zip|rar|7z|tar|gzip/.test(mime)) return "archive"
  if (/spreadsheet|excel|csv/.test(mime)) return "spreadsheet"
  if (/presentation|powerpoint/.test(mime)) return "presentation"
  if (/word|opendocument\.text|rtf/.test(mime)) return "document"
  const ext = name ? getExtension(name) : ""
  if (ext && EXTENSION_KINDS[ext]) return EXTENSION_KINDS[ext]
  if (mime.startsWith("text/")) return "text"
  return "other"
}

/** Semantic icon for each file kind. */
export const FILE_KIND_ICONS: Record<FileKind, SemanticIconName> = {
  image: "file-image",
  video: "file-video",
  audio: "file-audio",
  pdf: "file-text",
  document: "file-text",
  spreadsheet: "file-spreadsheet",
  presentation: "file",
  archive: "file-archive",
  text: "file-text",
  other: "file",
}

const UNITS = ["B", "KB", "MB", "GB", "TB"] as const
export type FileSizeUnit = (typeof UNITS)[number]

/**
 * Splits a byte count into a value and unit (`1536` → `{ value: 1.5, unit: "KB" }`).
 * Uses binary multiples (1 KB = 1024 bytes), as operating systems show them.
 */
export function splitFileSize(bytes: number): { value: number; unit: FileSizeUnit } {
  let value = Math.max(0, bytes)
  let i = 0
  while (value >= 1024 && i < UNITS.length - 1) {
    value /= 1024
    i++
  }
  return { value, unit: UNITS[i]! }
}

/**
 * Formats a byte count with the given number locale, e.g. `formatFileSize(1536)` → `"1.5 KB"`.
 * Components use `useFormatFileSize()` so the active locale applies.
 */
export function formatFileSize(bytes: number, numberLocale = "en", unitLabels?: Partial<Record<FileSizeUnit, string>>) {
  const { value, unit } = splitFileSize(bytes)
  const formatted = new Intl.NumberFormat(numberLocale, {
    maximumFractionDigits: unit === "B" || value >= 100 ? 0 : 1,
  }).format(value)
  return `${formatted} ${unitLabels?.[unit] ?? unit}`
}

/**
 * Whether a file matches an `accept` string (`"image/*,.pdf,application/zip"`), like the browser
 * does for `<input type="file" accept>`. An empty accept matches everything.
 */
export function matchesAccept(file: { name: string; type: string }, accept?: string | null): boolean {
  if (!accept) return true
  const tokens = accept
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)
  if (!tokens.length) return true
  const mime = (file.type || "").toLowerCase()
  const name = file.name.toLowerCase()
  return tokens.some((token) => {
    if (token.startsWith(".")) return name.endsWith(token)
    if (token.endsWith("/*")) return mime.startsWith(token.slice(0, -1))
    return mime === token
  })
}

export type FileRejectionCode = "file-too-large" | "file-too-small" | "file-invalid-type" | "too-many-files"

export interface FileRejection {
  file: File
  code: FileRejectionCode
}

export interface FileValidationOptions {
  /** Accepted types, as for `<input accept>`. */
  accept?: string
  /** Largest allowed size in bytes. */
  maxSize?: number
  /** Smallest allowed size in bytes. */
  minSize?: number
  /** Most files allowed in total. */
  maxFiles?: number
}

/** Checks one file against `accept`, `maxSize` and `minSize`. Returns the first problem, or `null`. */
export function validateFile(
  file: File,
  { accept, maxSize, minSize }: FileValidationOptions,
): FileRejectionCode | null {
  if (!matchesAccept(file, accept)) return "file-invalid-type"
  if (maxSize !== undefined && file.size > maxSize) return "file-too-large"
  if (minSize !== undefined && file.size < minSize) return "file-too-small"
  return null
}

/**
 * Splits picked files into accepted and rejected ones. `existing` is how many files are
 * already selected, so `maxFiles` applies to the total.
 */
export function validateFiles(
  files: readonly File[],
  options: FileValidationOptions,
  existing = 0,
): { accepted: File[]; rejected: FileRejection[] } {
  const accepted: File[] = []
  const rejected: FileRejection[] = []
  for (const file of files) {
    const code = validateFile(file, options)
    if (code) rejected.push({ file, code })
    else if (options.maxFiles !== undefined && existing + accepted.length >= options.maxFiles)
      rejected.push({ file, code: "too-many-files" })
    else accepted.push(file)
  }
  return { accepted, rejected }
}

/** A stable key for a picked file, used to drop duplicates. */
export function fileKey(file: File) {
  return `${file.name}:${file.size}:${file.lastModified}`
}

/** Sets an `<input type="file">`'s files so a plain form submit sends them. No-op where unsupported. */
export function syncInputFiles(input: HTMLInputElement | null, files: readonly File[]) {
  if (!input || typeof DataTransfer === "undefined") return
  try {
    const dt = new DataTransfer()
    for (const file of files) dt.items.add(file)
    input.files = dt.files
  } catch {
    // Some browsers do not allow assigning `files`; the JS value is still correct.
  }
}

// ---------------------------------------------------------------------------
// Uploading
// ---------------------------------------------------------------------------

export interface UploadContext {
  /** Report progress from 0 to 100. */
  onProgress: (percent: number) => void
  /** Aborted when the user cancels or the component unmounts. */
  signal: AbortSignal
}

/** Uploads one file and resolves with the server's response. Reject to show an error. */
export type UploadFn<R = unknown> = (file: File, context: UploadContext) => Promise<R>

/** Error thrown by `xhrUpload` for non-2xx responses. Carries Laravel's `message` and `errors`. */
export class UploadError extends Error {
  status: number
  errors: Record<string, string[]>
  response: unknown
  constructor(message: string, status: number, response?: unknown, errors: Record<string, string[]> = {}) {
    super(message)
    this.name = "UploadError"
    this.status = status
    this.response = response
    this.errors = errors
  }
}

export interface XhrUploadOptions {
  /** Endpoint the file is posted to. */
  url: string
  /** HTTP method. Default `POST`. */
  method?: string
  /** Form field name for the file. Default `file`. */
  fieldName?: string
  /** Extra headers, e.g. `{ "X-CSRF-TOKEN": token }` (R16.6: CSRF is the app's concern). */
  headers?: Record<string, string>
  /** Extra form fields sent with the file. */
  data?: Record<string, string | Blob>
  /** Send cookies cross-origin. */
  withCredentials?: boolean
}

function parseBody(xhr: XMLHttpRequest): unknown {
  const text = xhr.responseText
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

/**
 * The first error message in a Laravel JSON error response
 * (`{ message, errors: { file: ["…"] } }`), preferring the file field's own errors.
 */
export function laravelErrorMessage(body: unknown, fieldName = "file"): string | undefined {
  if (!body || typeof body !== "object") return undefined
  const { message, errors } = body as { message?: unknown; errors?: Record<string, unknown> }
  if (errors && typeof errors === "object") {
    const own = errors[fieldName]
    const first = Array.isArray(own) ? own[0] : Object.values(errors).flat()[0]
    if (typeof first === "string") return first
  }
  return typeof message === "string" && message ? message : undefined
}

/**
 * Uploads a file with `XMLHttpRequest` (the only browser API that reports upload progress).
 * Sends `Accept: application/json` and `X-Requested-With: XMLHttpRequest` so Laravel replies
 * with JSON, resolves with the parsed body, and rejects with an `UploadError` on failure.
 */
export function xhrUpload(
  file: File,
  { onProgress, signal }: UploadContext,
  { url, method = "POST", fieldName = "file", headers, data, withCredentials }: XhrUploadOptions,
): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open(method, url)
    xhr.withCredentials = !!withCredentials
    const allHeaders = { Accept: "application/json", "X-Requested-With": "XMLHttpRequest", ...headers }
    for (const [key, value] of Object.entries(allHeaders)) xhr.setRequestHeader(key, value)

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && e.total > 0) onProgress(Math.round((e.loaded / e.total) * 100))
    }
    xhr.onload = () => {
      const body = parseBody(xhr)
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(100)
        resolve(body)
      } else {
        const errors = (body as { errors?: Record<string, string[]> } | null)?.errors ?? {}
        reject(new UploadError(laravelErrorMessage(body, fieldName) ?? xhr.statusText, xhr.status, body, errors))
      }
    }
    xhr.onerror = () => reject(new UploadError("", 0))
    xhr.onabort = () => reject(new DOMException("Aborted", "AbortError"))

    if (signal.aborted) {
      reject(new DOMException("Aborted", "AbortError"))
      return
    }
    signal.addEventListener("abort", () => xhr.abort(), { once: true })

    const form = new FormData()
    form.append(fieldName, file, file.name)
    for (const [key, value] of Object.entries(data ?? {})) form.append(key, value)
    xhr.send(form)
  })
}

/** Builds an `UploadFn` that posts to a URL with `xhrUpload`. */
export function createXhrUploader(options: XhrUploadOptions): UploadFn {
  return (file, context) => xhrUpload(file, context, options)
}

/** True for errors caused by aborting (cancel). */
export function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError"
}
