import { afterEach, describe, expect, it, vi } from "vitest"

import {
  createXhrUploader,
  fileKey,
  formatFileSize,
  getExtension,
  getFileKind,
  isAbortError,
  laravelErrorMessage,
  matchesAccept,
  splitFileSize,
  syncInputFiles,
  UploadError,
  validateFile,
  validateFiles,
  xhrUpload,
} from "./file-utils"

const file = (name: string, size = 10, type = "") => new File([new Uint8Array(size)], name, { type })

describe("file helpers", () => {
  it("reads extensions from names and URLs", () => {
    expect(getExtension("Report.PDF")).toBe("pdf")
    expect(getExtension("https://x.mv/a/b/photo.jpeg?v=2#top")).toBe("jpeg")
    expect(getExtension("README")).toBe("")
    expect(getExtension(".env")).toBe("")
  })

  it.each([
    [{ type: "image/png" }, "image"],
    [{ type: "video/mp4" }, "video"],
    [{ type: "audio/mpeg" }, "audio"],
    [{ type: "application/pdf" }, "pdf"],
    [{ type: "application/zip" }, "archive"],
    [{ type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }, "spreadsheet"],
    [{ type: "application/vnd.ms-powerpoint" }, "presentation"],
    [{ type: "application/msword" }, "document"],
    [{ name: "budget.xlsx" }, "spreadsheet"],
    [{ name: "notes.md" }, "text"],
    [{ type: "text/x-custom", name: "x" }, "text"],
    [{ name: "mystery.bin" }, "other"],
    ["minutes.docx", "document"],
    ["image/webp", "image"],
  ] as const)("detects the kind of %o", (input, kind) => {
    expect(getFileKind(input)).toBe(kind)
  })

  it("formats sizes with binary units and the locale's number format", () => {
    expect(splitFileSize(1536)).toEqual({ value: 1.5, unit: "KB" })
    expect(formatFileSize(0)).toBe("0 B")
    expect(formatFileSize(512)).toBe("512 B")
    expect(formatFileSize(1536)).toBe("1.5 KB")
    expect(formatFileSize(250 * 1024 * 1024)).toBe("250 MB")
    expect(formatFileSize(5 * 1024 ** 5)).toBe("5,120 TB")
    expect(formatFileSize(1536, "de")).toBe("1,5 KB")
    expect(formatFileSize(-5)).toBe("0 B")
    expect(formatFileSize(2048, "en", { KB: "kB" })).toBe("2 kB")
  })

  it("matches accept strings like the browser", () => {
    expect(matchesAccept(file("a.png", 1, "image/png"), "image/*")).toBe(true)
    expect(matchesAccept(file("a.PDF", 1, ""), ".pdf, .docx")).toBe(true)
    expect(matchesAccept(file("a.zip", 1, "application/zip"), "application/zip")).toBe(true)
    expect(matchesAccept(file("a.txt", 1, "text/plain"), "image/*,.pdf")).toBe(false)
    expect(matchesAccept(file("a.txt"), "")).toBe(true)
    expect(matchesAccept(file("a.txt"), " , ")).toBe(true)
  })

  it("validates type, size and count", () => {
    expect(validateFile(file("a.txt", 5, "text/plain"), { accept: "image/*" })).toBe("file-invalid-type")
    expect(validateFile(file("a.png", 50, "image/png"), { maxSize: 10 })).toBe("file-too-large")
    expect(validateFile(file("a.png", 5, "image/png"), { minSize: 10 })).toBe("file-too-small")
    expect(validateFile(file("a.png", 5, "image/png"), {})).toBeNull()
    const files = [file("1.png"), file("2.png"), file("3.png", 999)]
    const { accepted, rejected } = validateFiles(files, { maxFiles: 2, maxSize: 100 }, 1)
    expect(accepted.map((f) => f.name)).toEqual(["1.png"])
    expect(rejected.map((r) => r.code)).toEqual(["too-many-files", "file-too-large"])
  })

  it("keys files and ignores DataTransfer where unsupported", () => {
    const f = file("a.png")
    expect(fileKey(f)).toBe(`a.png:10:${f.lastModified}`)
    expect(() => syncInputFiles(document.createElement("input"), [f])).not.toThrow()
    expect(() => syncInputFiles(null, [f])).not.toThrow()
  })

  it("syncs input files with DataTransfer when available", () => {
    const items: File[] = []
    class FakeDataTransfer {
      items = { add: (f: File) => items.push(f) }
      files = items as unknown as FileList
    }
    vi.stubGlobal("DataTransfer", FakeDataTransfer)
    const input = document.createElement("input")
    input.type = "file"
    const spy = vi.spyOn(input, "files", "set").mockImplementation(() => {
      throw new Error("read-only")
    })
    expect(() => syncInputFiles(input, [file("a.png")])).not.toThrow()
    expect(items).toHaveLength(1)
    spy.mockRestore()
    vi.unstubAllGlobals()
  })

  it("reads Laravel error messages", () => {
    expect(laravelErrorMessage({ message: "Invalid", errors: { file: ["Too big"] } })).toBe("Too big")
    expect(laravelErrorMessage({ message: "Invalid", errors: { other: ["Nope"] } }, "upload")).toBe("Nope")
    expect(laravelErrorMessage({ message: "Server error" })).toBe("Server error")
    expect(laravelErrorMessage({ message: "" })).toBeUndefined()
    expect(laravelErrorMessage("text")).toBeUndefined()
    expect(laravelErrorMessage(null)).toBeUndefined()
  })

  it("recognises abort errors", () => {
    expect(isAbortError(new DOMException("x", "AbortError"))).toBe(true)
    expect(isAbortError(new Error("x"))).toBe(false)
  })
})

// A minimal XMLHttpRequest stand-in.
class FakeXhr {
  static last: FakeXhr
  method = ""
  url = ""
  headers: Record<string, string> = {}
  withCredentials = false
  status = 0
  statusText = ""
  responseText = ""
  body: FormData | null = null
  upload: { onprogress: ((e: { lengthComputable: boolean; loaded: number; total: number }) => void) | null } = {
    onprogress: null,
  }
  onload: (() => void) | null = null
  onerror: (() => void) | null = null
  onabort: (() => void) | null = null
  aborted = false
  constructor() {
    FakeXhr.last = this
  }
  open(method: string, url: string) {
    this.method = method
    this.url = url
  }
  setRequestHeader(key: string, value: string) {
    this.headers[key] = value
  }
  send(body: FormData) {
    this.body = body
  }
  abort() {
    this.aborted = true
    this.onabort?.()
  }
  respond(status: number, body: string, statusText = "") {
    this.status = status
    this.responseText = body
    this.statusText = statusText
    this.onload?.()
  }
}

describe("xhrUpload", () => {
  afterEach(() => vi.unstubAllGlobals())

  it("posts the file with JSON headers, reports progress and resolves with the body", async () => {
    vi.stubGlobal("XMLHttpRequest", FakeXhr)
    const onProgress = vi.fn()
    const upload = createXhrUploader({
      url: "/uploads",
      fieldName: "attachment",
      headers: { "X-CSRF-TOKEN": "abc" },
      data: { collection: "documents" },
      withCredentials: true,
    })
    const promise = upload(file("a.pdf"), { onProgress, signal: new AbortController().signal })
    const xhr = FakeXhr.last
    expect(xhr.method).toBe("POST")
    expect(xhr.url).toBe("/uploads")
    expect(xhr.withCredentials).toBe(true)
    expect(xhr.headers).toMatchObject({
      Accept: "application/json",
      "X-Requested-With": "XMLHttpRequest",
      "X-CSRF-TOKEN": "abc",
    })
    expect(xhr.body?.get("attachment")).toBeInstanceOf(File)
    expect(xhr.body?.get("collection")).toBe("documents")
    xhr.upload.onprogress?.({ lengthComputable: true, loaded: 50, total: 100 })
    xhr.upload.onprogress?.({ lengthComputable: false, loaded: 0, total: 0 })
    expect(onProgress).toHaveBeenCalledWith(50)
    xhr.respond(201, JSON.stringify({ id: 7 }))
    await expect(promise).resolves.toEqual({ id: 7 })
    expect(onProgress).toHaveBeenLastCalledWith(100)
  })

  it("resolves with text or null bodies", async () => {
    vi.stubGlobal("XMLHttpRequest", FakeXhr)
    const signal = new AbortController().signal
    const a = xhrUpload(file("a"), { onProgress: vi.fn(), signal }, { url: "/u" })
    FakeXhr.last.respond(200, "ok")
    await expect(a).resolves.toBe("ok")
    const b = xhrUpload(file("a"), { onProgress: vi.fn(), signal }, { url: "/u" })
    FakeXhr.last.respond(204, "")
    await expect(b).resolves.toBeNull()
  })

  it("rejects with Laravel validation errors", async () => {
    vi.stubGlobal("XMLHttpRequest", FakeXhr)
    const promise = xhrUpload(file("a"), { onProgress: vi.fn(), signal: new AbortController().signal }, { url: "/u" })
    FakeXhr.last.respond(422, JSON.stringify({ message: "Invalid", errors: { file: ["The file is too big."] } }))
    const error = await promise.catch((e: unknown) => e)
    expect(error).toBeInstanceOf(UploadError)
    expect((error as UploadError).message).toBe("The file is too big.")
    expect((error as UploadError).status).toBe(422)
    expect((error as UploadError).errors).toEqual({ file: ["The file is too big."] })
  })

  it("falls back to the status text, and handles network errors", async () => {
    vi.stubGlobal("XMLHttpRequest", FakeXhr)
    const signal = new AbortController().signal
    const a = xhrUpload(file("a"), { onProgress: vi.fn(), signal }, { url: "/u" })
    FakeXhr.last.respond(500, "", "Server Error")
    await expect(a).rejects.toMatchObject({ message: "Server Error", status: 500, errors: {} })
    const b = xhrUpload(file("a"), { onProgress: vi.fn(), signal }, { url: "/u" })
    FakeXhr.last.onerror?.()
    await expect(b).rejects.toMatchObject({ status: 0 })
  })

  it("aborts with the signal", async () => {
    vi.stubGlobal("XMLHttpRequest", FakeXhr)
    const controller = new AbortController()
    const promise = xhrUpload(file("a"), { onProgress: vi.fn(), signal: controller.signal }, { url: "/u" })
    controller.abort()
    expect(FakeXhr.last.aborted).toBe(true)
    await expect(promise).rejects.toSatisfy(isAbortError)

    const already = new AbortController()
    already.abort()
    await expect(
      xhrUpload(file("a"), { onProgress: vi.fn(), signal: already.signal }, { url: "/u" }),
    ).rejects.toSatisfy(isAbortError)
  })
})
