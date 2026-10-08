import {
  cellToDisplayText,
  formatGeneratedAt,
  resolveExportContext,
  resolveRows,
  type ExportColumn,
  type ExportLocaleOptions,
} from "./columns"

export interface PrintDocumentOptions extends ExportLocaleOptions {
  /** Heading and document title (the browser's suggested PDF file name). */
  title?: string
  /** A line under the title describing what was exported, e.g. "Status: Approved · 312 applications". */
  scope?: string
  /** "Generated …" time. Default now. */
  generatedAt?: Date
  /** Page orientation. Default `landscape` for more than five columns, else `portrait`. */
  orientation?: "portrait" | "landscape"
  /** CSS `font-family`. Default: the page's `--onu-font-sans` (or `--onu-font-thaana` for Dhivehi). */
  fontFamily?: string
  /** Extra CSS, e.g. `@font-face` rules. `exportPdf` passes the page's font faces. */
  css?: string
  /** Base URL for relative font URLs. `exportPdf` passes `document.baseURI`. */
  baseUrl?: string
}

export interface ExportPdfOptions<T> extends PrintDocumentOptions {
  rows: readonly T[]
  columns: readonly ExportColumn<T>[]
  /** Used as the document title when `title` is not given (browsers suggest it as the PDF name). */
  filename?: string
}

const DEFAULT_FONT =
  '"Inter Variable", "MV Waheed", Faruma, "Noto Sans Thaana Variable", ui-sans-serif, system-ui, sans-serif'
const DEFAULT_THAANA_FONT = '"MV Waheed", Faruma, "Noto Sans Thaana Variable", "Inter Variable", sans-serif'

const HTML_ESCAPES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }

/** Escapes text for HTML content and attribute values. */
export function escapeHtml(text: string) {
  return text.replace(/[&<>"']/g, (c) => HTML_ESCAPES[c] as string)
}

/** Keeps CSS inside its `<style>` element and a font-family value inside its declaration. */
function safeCss(css: string) {
  return css.replace(/</g, "\\3c ")
}
function safeFontFamily(value: string) {
  return value.replace(/[<>{};\\]/g, "").trim()
}

/**
 * Builds a print-ready HTML document for a table of rows: title, scope line,
 * generated date, and a table whose header row repeats on every printed page.
 * Every value is HTML-escaped. Set `dir`/`locale` for Dhivehi; Thaana uses the
 * Onu font stack (MV Waheed, Faruma, Noto Sans Thaana).
 */
export function buildPrintDocument<T>(
  rows: readonly T[],
  columns: readonly ExportColumn<T>[],
  options: PrintDocumentOptions = {},
) {
  const ctx = resolveExportContext(options)
  const { t, locale, dir } = ctx
  const dv = locale.code === "dv"
  const title = options.title ?? t("listing.export")
  const orientation = options.orientation ?? (columns.length > 5 ? "landscape" : "portrait")
  const font = safeFontFamily(options.fontFamily ?? "") || (dv ? DEFAULT_THAANA_FONT : DEFAULT_FONT)
  const resolved = resolveRows(rows, columns)

  // Numeric columns align to the inline end with tabular figures.
  const numeric = columns.map((column, i) => {
    if (column.type) return column.type === "number" || column.type === "currency"
    const first = resolved.find((r) => r[i]?.cell.type !== "empty")?.[i]
    return first?.cell.type === "number" || first?.cell.type === "currency"
  })

  const head = columns
    .map((c, i) => `<th scope="col"${numeric[i] ? ' class="num"' : ""}>${escapeHtml(c.header)}</th>`)
    .join("")
  const body = resolved
    .map(
      (cells) =>
        `<tr>${cells
          .map(({ cell, formatted }, i) => {
            const text = formatted ?? cellToDisplayText(cell, ctx)
            return numeric[i] ? `<td class="num">${escapeHtml(text)}</td>` : `<td><bdi>${escapeHtml(text)}</bdi></td>`
          })
          .join("")}</tr>`,
    )
    .join("\n")

  const meta = [
    t("listing.exportGenerated", { date: formatGeneratedAt(options.generatedAt ?? new Date(), ctx) }),
    t("listing.exportRowCount", { count: rows.length }),
  ].join(" · ")

  return `<!doctype html>
<html lang="${escapeHtml(locale.code)}" dir="${dir}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${options.baseUrl ? `<base href="${escapeHtml(options.baseUrl)}">` : ""}
<title>${escapeHtml(title)}</title>
<style>
${options.css ? safeCss(options.css) : ""}
@page {
  size: A4 ${orientation};
  margin: 12mm 10mm 14mm;
  /* LRI … PDI keep "2 / 3" in reading order on Dhivehi pages. */
  @bottom-center { content: "\\2066 " counter(page) " / " counter(pages) "\\2069 "; font-size: 8pt; color: GrayText; }
}
:root { color-scheme: light; }
* { box-sizing: border-box; }
html { font-family: ${font}; font-size: 9pt; line-height: ${dv ? 1.75 : 1.45}; color: CanvasText; background: Canvas; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { margin: 0; }
header { margin-block-end: 5mm; }
h1 { margin: 0 0 1.5mm; font-size: 15pt; font-weight: 600; line-height: 1.3; }
.scope, .meta { margin: 0; font-size: 8.5pt; color: GrayText; }
table { inline-size: 100%; border-collapse: collapse; }
thead { display: table-header-group; }
tr { break-inside: avoid; page-break-inside: avoid; }
th, td { padding: 1.6mm 2mm; text-align: start; vertical-align: top; border-block-end: 0.5pt solid color-mix(in srgb, CanvasText 18%, Canvas); overflow-wrap: anywhere; }
th { font-weight: 600; background: color-mix(in srgb, CanvasText 7%, Canvas); border-block-end: 1pt solid color-mix(in srgb, CanvasText 45%, Canvas); }
tbody tr:nth-child(even) td { background: color-mix(in srgb, CanvasText 3%, Canvas); }
.num { text-align: end; font-variant-numeric: tabular-nums; white-space: nowrap; }
.empty { padding: 6mm 0; text-align: center; color: GrayText; }
</style>
</head>
<body>
<header>
<h1 dir="auto">${escapeHtml(title)}</h1>
${options.scope ? `<p class="scope" dir="auto">${escapeHtml(options.scope)}</p>` : ""}
<p class="meta">${escapeHtml(meta)}</p>
</header>
<table>
<thead><tr>${head}</tr></thead>
<tbody>
${body}
</tbody>
</table>
${rows.length ? "" : `<p class="empty">${escapeHtml(t("common.noResults"))}</p>`}
</body>
</html>
`
}

/**
 * The page's `@font-face` rules, with relative URLs made absolute, so the print
 * document renders with the same fonts (MV Waheed for Thaana). Stylesheets the
 * page cannot read (cross-origin) are skipped.
 */
export function collectFontFaces(doc: Document = document) {
  const out: string[] = []
  for (const sheet of Array.from(doc.styleSheets)) {
    let rules: CSSRuleList
    try {
      rules = sheet.cssRules
    } catch {
      continue
    }
    const base = sheet.href ?? doc.baseURI
    for (const rule of Array.from(rules)) {
      if (!/^@font-face/i.test(rule.cssText)) continue
      out.push(
        rule.cssText.replace(/url\((['"]?)([^'")]+)\1\)/g, (match, quote: string, url: string) => {
          try {
            return `url(${quote}${new URL(url, base).href}${quote})`
          } catch {
            return match
          }
        }),
      )
    }
  }
  return out.join("\n")
}

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

export interface PrintHtmlOptions {
  /** Longest wait for fonts before printing anyway. Default 3000 ms. */
  fontTimeout?: number
  /** Remove the frame after this long even if `afterprint` never fires. Default 60 000 ms. */
  cleanupTimeout?: number
}

/**
 * Writes a document into a hidden iframe, waits for its fonts, and opens the
 * browser's print dialog, where the user can save it as a PDF. Resolves once
 * the dialog has been opened; the frame is removed after printing.
 */
export async function printHtml(html: string, { fontTimeout = 3000, cleanupTimeout = 60_000 }: PrintHtmlOptions = {}) {
  const iframe = document.createElement("iframe")
  iframe.setAttribute("aria-hidden", "true")
  iframe.tabIndex = -1
  iframe.dataset.slot = "export-print-frame"
  Object.assign(iframe.style, {
    position: "fixed",
    insetBlockEnd: "0",
    insetInlineEnd: "0",
    inlineSize: "0",
    blockSize: "0",
    border: "0",
    opacity: "0",
    pointerEvents: "none",
  })
  document.body.appendChild(iframe)
  const win = iframe.contentWindow
  const doc = iframe.contentDocument
  if (!win || !doc) {
    iframe.remove()
    throw new Error("Could not open a print frame.")
  }
  doc.open()
  doc.write(html)
  doc.close()

  // Lay out first so the fonts the table needs start loading, then wait for them.
  void doc.body?.offsetHeight
  const fonts = (doc as Document & { fonts?: FontFaceSet }).fonts
  if (fonts) await Promise.race([fonts.ready.then(() => undefined), wait(fontTimeout)])

  let removed = false
  const cleanup = () => {
    if (removed) return
    removed = true
    iframe.remove()
  }
  win.addEventListener("afterprint", () => setTimeout(cleanup, 0), { once: true })
  setTimeout(cleanup, cleanupTimeout)
  win.focus()
  win.print()
}

function cssVariable(name: string) {
  try {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  } catch {
    return ""
  }
}

/**
 * Opens the print dialog with a styled, paginated table of the rows; the user
 * picks "Save as PDF". Uses the page's Onu fonts, so Thaana renders correctly.
 */
export async function exportPdf<T>({ rows, columns, filename, title, ...options }: ExportPdfOptions<T>) {
  const ctx = resolveExportContext(options)
  const fontFamily =
    options.fontFamily ?? cssVariable(ctx.locale.code === "dv" ? "--onu-font-thaana" : "--onu-font-sans")
  const html = buildPrintDocument(rows, columns, {
    ...options,
    title: title ?? filename?.replace(/\.pdf$/i, ""),
    fontFamily: fontFamily || undefined,
    css: [collectFontFaces(), options.css].filter(Boolean).join("\n"),
    baseUrl: options.baseUrl ?? document.baseURI,
  })
  await printHtml(html)
}
