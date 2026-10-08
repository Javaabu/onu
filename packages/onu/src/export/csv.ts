import {
  cellToPlainText,
  resolveExportContext,
  resolveRows,
  withExtension,
  type ExportColumn,
  type ExportLocaleOptions,
} from "./columns"
import { downloadBlob } from "./download"

export interface CsvOptions extends ExportLocaleOptions {
  /** Field separator. Default `,`. */
  delimiter?: string
  /** Start with a UTF-8 byte order mark so Excel reads Dhivehi correctly. Default `true`. */
  bom?: boolean
  /** Line ending. Default `\r\n` (RFC 4180). */
  newline?: "\r\n" | "\n"
}

export interface ExportCsvOptions<T> extends CsvOptions {
  rows: readonly T[]
  columns: readonly ExportColumn<T>[]
  /** File name; `.csv` is added when missing. Default `export.csv`. */
  filename?: string
}

const FORMULA_START = /^[=+\-@\t\r]/

/**
 * Guards a text cell against spreadsheet formula injection (CSV injection):
 * a value starting with `=`, `+`, `-`, `@`, tab or carriage return gets a
 * leading `'` so spreadsheet apps show it as text.
 */
export function escapeCsvFormula(value: string) {
  return FORMULA_START.test(value) ? `'${value}` : value
}

/** Quotes a field when it holds the delimiter, a quote or a line break (RFC 4180). */
export function quoteCsvField(value: string, delimiter = ",") {
  return value.includes(delimiter) || /["\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
}

/**
 * Builds CSV text: a header row, then one line per row. Numbers are written
 * plainly (`1250.5`), dates as ISO (`2026-03-12`). Text cells — including
 * `format` output — are guarded against formula injection.
 */
export function toCsv<T>(rows: readonly T[], columns: readonly ExportColumn<T>[], options: CsvOptions = {}) {
  const { delimiter = ",", bom = true, newline = "\r\n" } = options
  const ctx = resolveExportContext(options)
  const field = (text: string) => quoteCsvField(text, delimiter)
  const lines = [columns.map((c) => field(escapeCsvFormula(c.header))).join(delimiter)]
  for (const cells of resolveRows(rows, columns)) {
    lines.push(
      cells
        .map(({ cell, formatted }) => {
          if (formatted !== undefined) return field(escapeCsvFormula(formatted))
          const text = cellToPlainText(cell, ctx)
          // Real numbers and dates cannot carry a formula; only guard text.
          return field(cell.type === "text" || cell.type === "boolean" ? escapeCsvFormula(text) : text)
        })
        .join(delimiter),
    )
  }
  return (bom ? "﻿" : "") + lines.join(newline) + newline
}

/** Builds a CSV file and saves it. */
export function exportCsv<T>({ rows, columns, filename, ...options }: ExportCsvOptions<T>) {
  const blob = new Blob([toCsv(rows, columns, options)], { type: "text/csv;charset=utf-8" })
  downloadBlob(blob, withExtension(filename, "csv"))
}
