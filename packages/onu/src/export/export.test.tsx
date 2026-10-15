import * as React from "react"
import { renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { dv } from "../locales/dv"
import { OnuProvider } from "../providers/onu-provider"
import {
  buildExcelSheet,
  buildPrintDocument,
  cellToDisplayText,
  collectFontFaces,
  escapeCsvFormula,
  escapeHtml,
  excelSheetName,
  exportCsv,
  exportExcel,
  exportPdf,
  exportRows,
  getExportValue,
  printHtml,
  quoteCsvField,
  resolveExportContext,
  toCsv,
  toExcelBlob,
  toExportCell,
  useExportRows,
  withExtension,
  type ExportColumn,
} from "./index"

const writeExcelFile = vi.fn()
vi.mock("write-excel-file/browser", () => ({ default: (...args: unknown[]) => writeExcelFile(...args) }))

interface Payment {
  id: number
  name: string
  nameDv: string
  island: { name: string }
  amount: number
  paid: boolean
  date: string
  note: string | null
}

const rows: Payment[] = [
  {
    id: 1,
    name: "Aishath Shiuna",
    nameDv: "އައިޝަތު ޝިއުނާ",
    island: { name: "Male'" },
    amount: 1250.5,
    paid: true,
    date: "2026-03-12",
    note: 'Said "hi", then left',
  },
  {
    id: 2,
    name: '=HYPERLINK("http://evil")',
    nameDv: "<script>alert(1)</script>",
    island: { name: "Hithadhoo" },
    amount: -40,
    paid: false,
    date: "2026-10-07T09:30:00",
    note: "line 1\nline 2",
  },
]

const columns: ExportColumn<Payment>[] = [
  { header: "Name", accessor: "name" },
  { header: "ނަން", accessor: (r) => r.nameDv },
  { header: "Island", accessor: "island.name" },
  { header: "Amount", accessor: "amount", type: "currency" },
  { header: "Paid", accessor: "paid" },
  { header: "Date", accessor: "date", type: "date" },
  { header: "Note", accessor: "note" },
]

// Captures files saved through the temporary download link.
function captureDownloads() {
  const saved: { name: string; blob: Blob }[] = []
  const blobs = new Map<string, Blob>()
  let n = 0
  vi.spyOn(URL, "createObjectURL").mockImplementation((blob) => {
    const url = `blob:test/${++n}`
    blobs.set(url, blob as Blob)
    return url
  })
  vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined)
  vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) {
    saved.push({ name: this.download, blob: blobs.get(this.href)! })
  })
  return saved
}

beforeEach(() => {
  writeExcelFile.mockReset()
  writeExcelFile.mockImplementation(() => ({ toBlob: () => Promise.resolve(new Blob(["xlsx"])) }))
})
afterEach(() => {
  vi.restoreAllMocks()
  vi.useRealTimers()
})

describe("columns", () => {
  it("reads keys, dotted paths and functions", () => {
    expect(getExportValue(rows[0]!, columns[2]!, 0)).toBe("Male'")
    expect(getExportValue(rows[0]!, columns[1]!, 0)).toBe("އައިޝަތު ޝިއުނާ")
    expect(getExportValue({ a: null }, { header: "x", accessor: "a.b" }, 0)).toBeUndefined()
  })

  it("types values and falls back to text when they do not fit", () => {
    expect(toExportCell(null, "number")).toEqual({ type: "empty" })
    expect(toExportCell("12.5", "number")).toEqual({ type: "number", value: 12.5, decimals: undefined })
    expect(toExportCell("abc", "number")).toEqual({ type: "text", value: "abc" })
    expect(toExportCell(Number.NaN, "number")).toEqual({ type: "text", value: "NaN" })
    expect(toExportCell(5, "currency")).toEqual({ type: "currency", value: 5, decimals: 2 })
    expect(toExportCell("not a date", "date")).toEqual({ type: "text", value: "not a date" })
    expect(toExportCell(new Date("x"), "date")).toEqual({ type: "empty" })
    expect(toExportCell(new Date("x"))).toEqual({ type: "empty" })
    expect(toExportCell(new Date(Date.UTC(2026, 0, 1)), "text")).toEqual({
      type: "text",
      value: "2026-01-01T00:00:00.000Z",
    })
    expect(toExportCell(0, "date")).toMatchObject({ type: "date" })
    expect(toExportCell(1, "boolean")).toEqual({ type: "boolean", value: true })
    expect(toExportCell(new Date(2026, 0, 1))).toMatchObject({ type: "date" })
    expect(toExportCell(3)).toMatchObject({ type: "number" })
  })

  it("formats display text in the locale", () => {
    const en = resolveExportContext()
    const dv = resolveExportContext({ locale: "dv" })
    expect(dv.dir).toBe("rtl")
    expect(resolveExportContext({ locale: "dv", dir: "ltr" }).dir).toBe("ltr")
    expect(cellToDisplayText({ type: "number", value: 1234.5 }, en)).toBe("1,234.5")
    expect(cellToDisplayText({ type: "number", value: 2, decimals: 1 }, en)).toBe("2.0")
    expect(cellToDisplayText({ type: "currency", value: 1250, decimals: 2 }, en)).toBe("MVR ⁨1,250.00⁩")
    expect(cellToDisplayText({ type: "currency", value: 1250, decimals: 2 }, dv)).toBe("ރ. ⁨1,250.00⁩")
    expect(cellToDisplayText({ type: "date", value: new Date(2026, 2, 12) }, en)).toBe("Mar 12, 2026")
    expect(cellToDisplayText({ type: "date", value: new Date(2026, 2, 12) }, dv)).toContain("މާޗު")
    expect(cellToDisplayText({ type: "datetime", value: new Date(2026, 2, 12, 9, 30) }, en)).toContain("9:30")
    expect(cellToDisplayText({ type: "boolean", value: false }, dv)).toBe("ނޫން")
  })

  it("adds extensions and cleans file names", () => {
    expect(withExtension(undefined, "csv")).toBe("export.csv")
    expect(withExtension("users", "csv")).toBe("users.csv")
    expect(withExtension("users.CSV", "csv")).toBe("users.CSV")
    expect(withExtension("a/b:c", "xlsx")).toBe("a-b-c.xlsx")
    expect(withExtension("a\nb", "csv")).toBe("a-b.csv")
    expect(withExtension("ފައިލް", "pdf")).toBe("ފައިލް.pdf")
  })
})

describe("CSV", () => {
  it("starts with a UTF-8 BOM, quotes per RFC 4180 and keeps Dhivehi", () => {
    const csv = toCsv(rows, columns)
    expect(csv.startsWith("﻿")).toBe(true)
    const lines = csv.slice(1).split("\r\n")
    expect(lines[0]).toBe("Name,ނަން,Island,Amount,Paid,Date,Note")
    expect(lines[1]).toBe('Aishath Shiuna,އައިޝަތު ޝިއުނާ,Male\',1250.50,Yes,2026-03-12,"Said ""hi"", then left"')
    expect(csv.endsWith("\r\n")).toBe(true)
  })

  it("guards text against formula injection but keeps real negative numbers", () => {
    const csv = toCsv(rows, columns, { bom: false, newline: "\n" })
    const second = csv.split("\n").slice(2).join("\n")
    expect(second.startsWith(`"'=HYPERLINK(""http://evil"")"`)).toBe(true)
    expect(second).toContain(",-40.00,")
    expect(second).toContain('"line 1\nline 2"')
    for (const start of ["=", "+", "-", "@", "\t", "\r"]) expect(escapeCsvFormula(`${start}1`)).toBe(`'${start}1`)
    expect(escapeCsvFormula("ok")).toBe("ok")
    expect(toCsv([{ v: "-5" }], [{ header: "V", accessor: "v" }], { bom: false })).toBe("V\r\n'-5\r\n")
    expect(toCsv([{ v: "@x" }], [{ header: "=H", accessor: "v", format: (v) => `${String(v)}` }], { bom: false })).toBe(
      "'=H\r\n'@x\r\n",
    )
  })

  it("supports a delimiter, datetimes, empty cells and the Dhivehi locale", () => {
    const csv = toCsv(
      [{ at: new Date(2026, 9, 7, 9, 5), ok: true, n: null as number | null, x: 3 }],
      [
        { header: "At", accessor: "at", type: "datetime" },
        { header: "OK", accessor: "ok" },
        { header: "N", accessor: "n" },
        { header: "X", accessor: "x", decimals: 1, type: "number" },
      ],
      { delimiter: ";", bom: false, locale: "dv" },
    )
    expect(csv).toBe("At;OK;N;X\r\n2026-10-07 09:05;އާން;;3.0\r\n")
    expect(quoteCsvField("a;b", ";")).toBe('"a;b"')
  })

  it("saves a .csv file", async () => {
    const saved = captureDownloads()
    exportCsv({ rows, columns, filename: "payments" })
    expect(saved).toHaveLength(1)
    expect(saved[0]!.name).toBe("payments.csv")
    expect(saved[0]!.blob.type).toBe("text/csv;charset=utf-8")
    // The BOM survives as bytes EF BB BF.
    const bytes = new Uint8Array(await saved[0]!.blob.arrayBuffer())
    expect(Array.from(bytes.slice(0, 3))).toEqual([0xef, 0xbb, 0xbf])
  })
})

describe("Excel", () => {
  it("builds typed cells with a bold frozen header", () => {
    const sheet = buildExcelSheet(rows, columns, { sheetName: "Payments" })
    expect(sheet.data[0]).toEqual(columns.map((c) => ({ value: c.header, type: String, fontWeight: "bold" })))
    const [name, nameDv, island, amount, paid, date, note] = sheet.data[1]!
    expect(name).toEqual({ value: "Aishath Shiuna", type: String })
    expect(nameDv).toEqual({ value: "އައިޝަތު ޝިއުނާ", type: String })
    expect(island).toEqual({ value: "Male'", type: String })
    expect(amount).toEqual({ value: 1250.5, type: Number, format: '"MVR "#,##0.00' })
    expect(paid).toEqual({ value: "Yes", type: String })
    expect(date).toMatchObject({ type: Date, format: "yyyy-mm-dd" })
    expect((date as { value: Date }).value.getDate()).toBe(12)
    expect(note).toEqual({ value: 'Said "hi", then left', type: String })
    // Text stays text: no formula is created from a "=" value.
    expect(sheet.data[2]![0]).toEqual({ value: '=HYPERLINK("http://evil")', type: String })
    expect(sheet.options).toMatchObject({ sheet: "Payments", stickyRowsCount: 1, rightToLeft: false })
    expect(sheet.options.columns).toHaveLength(columns.length)
    expect(sheet.options.columns.every((c) => c.width >= 8 && c.width <= 60)).toBe(true)
  })

  it("reads right to left in Dhivehi with the Rufiyaa format", () => {
    const sheet = buildExcelSheet(
      [{ a: 5, n: 2, m: 3, d: "2026-01-01T10:00:00", e: null, f: "x" }],
      [
        { header: "A", accessor: "a", type: "currency", decimals: 0 },
        { header: "N", accessor: "n", type: "number", decimals: 2 },
        { header: "M", accessor: "m", type: "number", decimals: 0, width: 5 },
        { header: "D", accessor: "d", type: "datetime" },
        { header: "E", accessor: "e" },
        { header: "E2", accessor: "e", format: () => "—" },
        { header: "F", accessor: "f", format: (v) => `#${String(v)}` },
      ],
      { locale: "dv" },
    )
    expect(sheet.options.rightToLeft).toBe(true)
    expect(sheet.options.sheet).toBe("Sheet1")
    expect(sheet.options.columns[2]).toEqual({ width: 5 })
    expect(sheet.data[1]).toEqual([
      { value: 5, type: Number, format: '"ރ. "#,##0' },
      { value: 2, type: Number, format: "#,##0.00" },
      { value: 3, type: Number, format: "#,##0" },
      { value: expect.any(Date), type: Date, format: "yyyy-mm-dd hh:mm" },
      null,
      { value: "—", type: String },
      { value: "#x", type: String },
    ])
  })

  it("cleans sheet names", () => {
    expect(excelSheetName("a/b [c]: d?")).toBe("a b  c   d")
    expect(excelSheetName("x".repeat(40))).toHaveLength(31)
    expect(excelSheetName("  ")).toBe("Sheet1")
  })

  it("writes the workbook with write-excel-file and saves an .xlsx file", async () => {
    const saved = captureDownloads()
    await exportExcel({ rows, columns, filename: "payments", locale: "dv", fontFamily: "Faruma" })
    expect(writeExcelFile).toHaveBeenCalledTimes(1)
    const [data, options, global] = writeExcelFile.mock.calls[0] as [unknown[][], { rightToLeft: boolean }, unknown]
    expect(data).toHaveLength(3)
    expect(options.rightToLeft).toBe(true)
    expect(global).toEqual({ fontFamily: "Faruma" })
    expect(saved[0]!.name).toBe("payments.xlsx")
    await toExcelBlob(rows, columns)
    expect(writeExcelFile.mock.calls[1]![2]).toBeUndefined()
  })
})

describe("PDF (print document)", () => {
  it("builds an escaped, paginated table document", () => {
    const html = buildPrintDocument(rows, columns, {
      title: "Payments <2026>",
      scope: "Status: Paid & pending",
      generatedAt: new Date(2026, 9, 7, 9, 30),
    })
    const doc = new DOMParser().parseFromString(html, "text/html")
    expect(doc.documentElement.getAttribute("dir")).toBe("ltr")
    expect(doc.documentElement.getAttribute("lang")).toBe("en")
    expect(doc.title).toBe("Payments <2026>")
    expect(doc.querySelector("h1")?.textContent).toBe("Payments <2026>")
    expect(doc.querySelector(".scope")?.textContent).toBe("Status: Paid & pending")
    expect(doc.querySelector(".meta")?.textContent).toBe("Generated Oct 7, 2026 9:30 AM · 2 rows")
    expect(Array.from(doc.querySelectorAll("thead th")).map((th) => th.textContent)).toEqual(
      columns.map((c) => c.header),
    )
    expect(doc.querySelectorAll("tbody tr")).toHaveLength(2)
    // Cell values are text, never markup.
    expect(doc.querySelector("script")).toBeNull()
    expect(doc.querySelectorAll("tbody tr")[1]!.children[1]!.textContent).toBe("<script>alert(1)</script>")
    const amount = doc.querySelectorAll("tbody tr")[0]!.children[3]!
    expect(amount.className).toBe("num")
    expect(amount.textContent).toBe("MVR ⁨1,250.50⁩")
    expect(doc.querySelector("thead th:nth-child(4)")?.className).toBe("num")
    expect(doc.querySelector("tbody td")?.firstElementChild?.tagName).toBe("BDI")
    // The header row repeats on every page; seven columns print landscape.
    expect(html).toContain("thead { display: table-header-group; }")
    expect(html).toContain("size: A4 landscape")
    expect(doc.querySelector(".empty")).toBeNull()
  })

  it("prints right to left in Dhivehi with the Thaana font", () => {
    const html = buildPrintDocument(rows.slice(0, 1), columns.slice(0, 2), {
      locale: "dv",
      generatedAt: new Date(2026, 2, 12, 9, 0),
    })
    const doc = new DOMParser().parseFromString(html, "text/html")
    expect(doc.documentElement.getAttribute("dir")).toBe("rtl")
    expect(doc.documentElement.getAttribute("lang")).toBe("dv")
    expect(doc.querySelector("h1")?.textContent).toBe("އެކްސްޕޯޓްކުރޭ")
    expect(doc.querySelector(".meta")?.textContent).toContain("ތައްޔާރުކުރީ")
    expect(doc.querySelector(".meta")?.textContent).toContain("1 ރޯ")
    expect(html).toContain("font-family: Faruma")
    expect(html).toContain("size: A4 portrait")
  })

  it("infers numeric columns, shows an empty state and keeps CSS inside its element", () => {
    const html = buildPrintDocument([], [{ header: "N", accessor: "n" }], {
      css: "@font-face { font-family: X; } </style><script>alert(1)</script>",
      fontFamily: "Faruma; } body { color: red",
      orientation: "landscape",
      baseUrl: 'https://x.test/"a',
    })
    const doc = new DOMParser().parseFromString(html, "text/html")
    expect(doc.querySelector("script")).toBeNull()
    expect(doc.querySelector(".empty")?.textContent).toBe("No results")
    expect(doc.querySelector("base")?.getAttribute("href")).toBe('https://x.test/"a')
    expect(html).toContain("font-family: Faruma  body  color: red;")
    const numeric = buildPrintDocument([{ n: null }, { n: 4 }], [{ header: "N", accessor: "n" }])
    expect(numeric).toContain('<th scope="col" class="num">N</th>')
    expect(numeric).toContain('<td class="num">4</td>')
    expect(escapeHtml(`<a href="x" title='y'>&</a>`)).toBe(
      "&lt;a href=&quot;x&quot; title=&#39;y&#39;&gt;&amp;&lt;/a&gt;",
    )
  })

  it("collects the page's font faces with absolute URLs", () => {
    const fake = {
      baseURI: "https://app.test/admin/",
      styleSheets: [
        {
          href: "https://cdn.test/css/app.css",
          cssRules: [
            {
              cssText: '@font-face { font-family: "MV Waheed"; src: url("../fonts/mv-waheed.woff2") format("woff2"); }',
            },
            { cssText: "body { color: red; }" },
          ],
        },
        {
          href: null,
          cssRules: [{ cssText: "@font-face { font-family: X; src: url(x.woff2), url(data:font/woff2;base64,AA); }" }],
        },
        {
          href: "https://other.test/a.css",
          get cssRules(): never {
            throw new DOMException("cross-origin", "SecurityError")
          },
        },
      ],
    } as unknown as Document
    const css = collectFontFaces(fake)
    expect(css).toContain('url("https://cdn.test/fonts/mv-waheed.woff2")')
    expect(css).toContain("url(https://app.test/admin/x.woff2)")
    expect(css).toContain("url(data:font/woff2;base64,AA)")
    expect(css).not.toContain("color: red")
    // Reads the real document without throwing.
    expect(typeof collectFontFaces()).toBe("string")
  })

  it("prints through a hidden frame and removes it afterwards", async () => {
    vi.useFakeTimers()
    const print = vi.fn()
    const append = document.body.appendChild.bind(document.body)
    vi.spyOn(document.body, "appendChild").mockImplementation(<T extends Node>(node: T) => {
      const result = append(node)
      if (node instanceof HTMLIFrameElement) node.contentWindow!.print = print
      return result
    })
    await printHtml("<!doctype html><html><body><p>ހެލޯ</p></body></html>", { cleanupTimeout: 5000 })
    const frame = document.querySelector<HTMLIFrameElement>("[data-slot=export-print-frame]")!
    expect(frame).toHaveAttribute("aria-hidden", "true")
    expect(frame.tabIndex).toBe(-1)
    expect(frame.contentDocument?.body.textContent).toBe("ހެލޯ")
    expect(print).toHaveBeenCalledTimes(1)
    frame.contentWindow!.dispatchEvent(new Event("afterprint"))
    vi.advanceTimersByTime(0)
    expect(document.querySelector("[data-slot=export-print-frame]")).toBeNull()
    vi.advanceTimersByTime(5000)

    // Without afterprint the frame is removed after the timeout.
    await printHtml("<p>x</p>", { cleanupTimeout: 5000 })
    expect(document.querySelector("[data-slot=export-print-frame]")).not.toBeNull()
    vi.advanceTimersByTime(5000)
    expect(document.querySelector("[data-slot=export-print-frame]")).toBeNull()
  })

  it("waits for fonts before printing", async () => {
    const print = vi.fn()
    let releaseFonts: () => void = () => undefined
    const ready = new Promise<void>((resolve) => (releaseFonts = resolve))
    const append = document.body.appendChild.bind(document.body)
    vi.spyOn(document.body, "appendChild").mockImplementation(<T extends Node>(node: T) => {
      const result = append(node)
      if (node instanceof HTMLIFrameElement) {
        node.contentWindow!.print = print
        Object.defineProperty(node.contentDocument!, "fonts", { value: { ready } })
      }
      return result
    })
    const done = printHtml("<p>x</p>")
    await Promise.resolve()
    expect(print).not.toHaveBeenCalled()
    releaseFonts()
    await done
    expect(print).toHaveBeenCalledTimes(1)
    document.querySelector("[data-slot=export-print-frame]")?.remove()
  })

  it("exportPdf uses the page's font and the file name as the title", async () => {
    const print = vi.fn()
    let html = ""
    const append = document.body.appendChild.bind(document.body)
    vi.spyOn(document.body, "appendChild").mockImplementation(<T extends Node>(node: T) => {
      const result = append(node)
      if (node instanceof HTMLIFrameElement)
        node.contentWindow!.print = () => {
          html = node.contentDocument!.documentElement.outerHTML
          print()
        }
      return result
    })
    document.documentElement.style.setProperty("--onu-font-sans", '"Test Sans", sans-serif')
    await exportPdf({ rows, columns, filename: "payments.pdf" })
    document.documentElement.style.removeProperty("--onu-font-sans")
    expect(print).toHaveBeenCalled()
    expect(html).toContain("<title>payments</title>")
    expect(html).toContain('font-family: "Test Sans", sans-serif')
    expect(html).toContain(`<base href="${document.baseURI}">`)
    document.querySelector("[data-slot=export-print-frame]")?.remove()
  })
})

describe("exportRows", () => {
  it("dispatches by format", async () => {
    const saved = captureDownloads()
    await exportRows({ format: "csv", rows, columns, filename: "a" })
    await exportRows({ format: "excel", rows, columns, filename: "b", title: "Payments" })
    await exportRows({ format: "xlsx", rows, columns })
    expect(saved.map((s) => s.name)).toEqual(["a.csv", "b.xlsx", "export.xlsx"])
    expect(writeExcelFile.mock.calls[0]![1]).toMatchObject({ sheet: "Payments" })
    await expect(exportRows({ format: "json", rows, columns })).rejects.toThrow('unsupported format "json"')
  })

  it("routes pdf to the print dialog", async () => {
    const print = vi.fn()
    const append = document.body.appendChild.bind(document.body)
    vi.spyOn(document.body, "appendChild").mockImplementation(<T extends Node>(node: T) => {
      const result = append(node)
      if (node instanceof HTMLIFrameElement) node.contentWindow!.print = print
      return result
    })
    await exportRows({ format: "pdf", rows, columns, title: "Payments" })
    expect(print).toHaveBeenCalled()
    document.querySelector("[data-slot=export-print-frame]")?.remove()
  })

  it("useExportRows uses the provider's locale and direction", async () => {
    captureDownloads()
    const { result } = renderHook(() => useExportRows(), {
      wrapper: ({ children }) => (
        <OnuProvider locale={dv} syncDocument={false}>
          {children}
        </OnuProvider>
      ),
    })
    await result.current({ format: "excel", rows, columns })
    expect(writeExcelFile.mock.calls[0]![1]).toMatchObject({ rightToLeft: true })
    expect((writeExcelFile.mock.calls[0]![0] as { value: unknown }[][])[1]![4]).toEqual({ value: "އާން", type: String })
    await result.current({ format: "excel", rows, columns, dir: "ltr" })
    expect(writeExcelFile.mock.calls[1]![1]).toMatchObject({ rightToLeft: false })
  })
})

describe("missing write-excel-file", () => {
  it("explains how to install it", async () => {
    vi.resetModules()
    vi.doMock("write-excel-file/browser", () => {
      throw new Error("Cannot find module")
    })
    const { toExcelBlob: fresh } = await import("./excel")
    await expect(fresh(rows, columns)).rejects.toThrow("npm install write-excel-file")
    vi.doUnmock("write-excel-file/browser")
  })
})

// Keeps React in scope for the JSX wrapper above.
void React
