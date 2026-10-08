"use client"

import * as React from "react"

import type { ExportFormat } from "../components/listing/export-menu"
import { useOnu } from "../providers/onu-provider"
import type { ExportColumn, ExportLocaleOptions } from "./columns"
import { exportCsv, type CsvOptions } from "./csv"
import { exportExcel, type ExcelOptions } from "./excel"
import { exportPdf, type PrintDocumentOptions } from "./pdf"

export interface ExportRowsOptions<T>
  extends
    ExportLocaleOptions,
    Pick<CsvOptions, "delimiter" | "bom">,
    Pick<ExcelOptions, "sheetName" | "fontFamily">,
    Pick<PrintDocumentOptions, "scope" | "orientation" | "generatedAt"> {
  /** `csv`, `excel` or `pdf` — the formats `ExportMenu` offers. */
  format: ExportFormat
  rows: readonly T[]
  columns: readonly ExportColumn<T>[]
  /** File name without extension, e.g. `applications-2026-10-07`. Default `export`. */
  filename?: string
  /** PDF heading; also the Excel sheet name when `sheetName` is not given. */
  title?: string
}

/**
 * Builds a CSV, Excel or PDF file from rows in the browser and saves it (PDF
 * opens the print dialog, where the user picks "Save as PDF"). Fits
 * `ExportMenu`'s `onExport`:
 *
 * ```tsx
 * <ListingPage onExport={(format) => exportRows({ format, rows, columns, filename: "users" })} />
 * ```
 */
export async function exportRows<T>({ format, title, sheetName, ...options }: ExportRowsOptions<T>): Promise<void> {
  switch (format) {
    case "csv":
      return exportCsv(options)
    case "excel":
    case "xlsx":
      return exportExcel({ ...options, sheetName: sheetName ?? title })
    case "pdf":
      return exportPdf({ ...options, title })
    default:
      throw new Error(`exportRows: unsupported format "${format}". Use csv, excel or pdf.`)
  }
}

/**
 * `exportRows` bound to the OnuProvider's locale and direction, so Dhivehi
 * pages export right-to-left sheets and Dhivehi dates without extra options.
 */
export function useExportRows() {
  const { locale, dir } = useOnu()
  return React.useCallback(
    <T>(options: ExportRowsOptions<T>) => exportRows<T>({ locale, dir, ...options }),
    [locale, dir],
  )
}
