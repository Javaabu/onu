import {
  cellToPlainText,
  resolveExportContext,
  resolveRows,
  withExtension,
  type ExportCell,
  type ExportColumn,
  type ExportContext,
  type ExportLocaleOptions,
} from "./columns"
import { downloadBlob } from "./download"
import type { SheetData } from "write-excel-file/browser"
import { registerEnglish } from "../i18n/english"
import { common as en_common } from "../locales/en/common"

registerEnglish({ common: en_common })

/** A cell as `write-excel-file` takes it. */
export interface ExcelCell {
  value: string | number | boolean | Date
  type?: StringConstructor | NumberConstructor | BooleanConstructor | DateConstructor
  format?: string
  fontWeight?: "bold"
}

export interface ExcelSheet {
  data: (ExcelCell | null)[][]
  options: {
    sheet: string
    columns: { width: number }[]
    stickyRowsCount: number
    rightToLeft: boolean
  }
}

export interface ExcelOptions extends ExportLocaleOptions {
  /** Worksheet name (31 characters at most). Default "Sheet1". */
  sheetName?: string
  /** Default font for the workbook, e.g. `"Faruma"`. */
  fontFamily?: string
}

export interface ExportExcelOptions<T> extends ExcelOptions {
  rows: readonly T[]
  columns: readonly ExportColumn<T>[]
  /** File name; `.xlsx` is added when missing. Default `export.xlsx`. */
  filename?: string
}

/** Excel's number format for the locale's currency text, e.g. `"MVR "#,##0.00`. */
function currencyFormat(ctx: ExportContext, decimals: number) {
  const template = ctx.t("common.currency")
  const at = template.indexOf("{amount}")
  const number = decimals > 0 ? `#,##0.${"0".repeat(decimals)}` : "#,##0"
  if (at < 0) return number
  const quote = (text: string) => (text ? `"${text.replace(/"/g, "")}"` : "")
  return `${quote(template.slice(0, at))}${number}${quote(template.slice(at + "{amount}".length))}`
}

function toExcelCell(cell: ExportCell, formatted: string | undefined, ctx: ExportContext): ExcelCell | null {
  switch (cell.type) {
    case "number":
      return {
        value: cell.value,
        type: Number,
        ...(cell.decimals === undefined
          ? {}
          : { format: cell.decimals > 0 ? `#,##0.${"0".repeat(cell.decimals)}` : "#,##0" }),
      }
    case "currency":
      return { value: cell.value, type: Number, format: currencyFormat(ctx, cell.decimals ?? 2) }
    case "date":
      return { value: cell.value, type: Date, format: "yyyy-mm-dd" }
    case "datetime":
      return { value: cell.value, type: Date, format: "yyyy-mm-dd hh:mm" }
    case "empty":
      return formatted ? { value: formatted, type: String } : null
    default:
      // Text cells are written as shared strings, so a leading "=" is never run as a formula.
      return { value: formatted ?? cellToPlainText(cell, ctx), type: String }
  }
}

/** Removes characters Excel does not allow in sheet names and keeps 31 characters. */
export function excelSheetName(name: string | undefined) {
  const clean = (name ?? "").replace(/[[\]:*?/\\]/g, " ").trim()
  return Array.from(clean || "Sheet1")
    .slice(0, 31)
    .join("")
}

/**
 * Builds the worksheet for `write-excel-file`: a bold, frozen header row, then
 * one row per record. Numbers and currency stay numeric (with a number format),
 * dates are real dates, and the sheet reads right to left when `dir` is `rtl`.
 */
export function buildExcelSheet<T>(
  rows: readonly T[],
  columns: readonly ExportColumn<T>[],
  options: ExcelOptions = {},
): ExcelSheet {
  const ctx = resolveExportContext(options)
  const body = resolveRows(rows, columns).map((cells) =>
    cells.map(({ cell, formatted }) => toExcelCell(cell, formatted, ctx)),
  )
  const widths = columns.map((column, i) => {
    if (column.width) return column.width
    const longest = Math.max(
      column.header.length,
      ...body.slice(0, 200).map((row) => {
        const value = row[i]?.value
        return value instanceof Date ? 16 : value === null || value === undefined ? 0 : String(value).length + 2
      }),
    )
    return Math.min(60, Math.max(8, longest + 2))
  })
  return {
    data: [columns.map((c) => ({ value: c.header, type: String, fontWeight: "bold" as const })), ...body],
    options: {
      sheet: excelSheetName(options.sheetName),
      columns: widths.map((width) => ({ width })),
      stickyRowsCount: 1,
      rightToLeft: ctx.dir === "rtl",
    },
  }
}

/** Builds the `.xlsx` file as a Blob. Loads the optional `write-excel-file` peer on first use. */
export async function toExcelBlob<T>(
  rows: readonly T[],
  columns: readonly ExportColumn<T>[],
  options: ExcelOptions = {},
) {
  const { data, options: sheetOptions } = buildExcelSheet(rows, columns, options)
  let writeExcelFile: typeof import("write-excel-file/browser").default
  try {
    writeExcelFile = (await import("write-excel-file/browser")).default
  } catch (error) {
    throw new Error(
      'Excel export needs the "write-excel-file" package. Install it with `npm install write-excel-file`.',
      { cause: error },
    )
  }
  return writeExcelFile(
    data as unknown as SheetData,
    sheetOptions,
    options.fontFamily ? { fontFamily: options.fontFamily } : undefined,
  ).toBlob()
}

/** Builds an `.xlsx` file and saves it. */
export async function exportExcel<T>({ rows, columns, filename, ...options }: ExportExcelOptions<T>) {
  const blob = await toExcelBlob(rows, columns, options)
  downloadBlob(blob, withExtension(filename, "xlsx"))
}
