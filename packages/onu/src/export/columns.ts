import { format as formatDateFns, isValid, parseISO } from "date-fns"

import { createTranslator } from "../i18n/translate"
import type { OnuLocale, Translate } from "../i18n/types"
import { en, locales } from "../locales"

/**
 * How a column's values are written. `number` and `currency` stay numeric in
 * Excel, `date` and `datetime` become real dates there.
 */
export type ExportColumnType = "text" | "number" | "currency" | "date" | "datetime" | "boolean"

export interface ExportColumn<T> {
  /** Header cell text. */
  header: string
  /**
   * Where the value comes from: a property name (dotted paths such as
   * `"owner.name"` work) or a function of the row.
   */
  accessor: string | ((row: T, index: number) => unknown)
  /**
   * Value type. Without it each value is typed by what it is
   * (number → number, `Date` → date, boolean → yes/no, anything else → text).
   */
  type?: ExportColumnType
  /**
   * Text to show for a value (CSV and PDF; Excel too for text columns).
   * Number, currency and date columns stay numeric/dates in Excel.
   */
  format?: (value: unknown, row: T) => string
  /** Decimal places for `currency` (default 2) and `number` (default: as is). */
  decimals?: number
  /** Excel column width in characters. */
  width?: number
}

export type ExportLocale = OnuLocale | keyof typeof locales

/** Locale-dependent options shared by every format. */
export interface ExportLocaleOptions {
  /** Locale for dates, numbers and built-in text: an Onu locale or `"en"` / `"dv"`. Default `"en"`. */
  locale?: ExportLocale
  /** Text direction. Defaults to the locale's (`rtl` for Dhivehi). */
  dir?: "ltr" | "rtl"
}

export interface ExportContext {
  locale: OnuLocale
  dir: "ltr" | "rtl"
  t: Translate
}

export function resolveExportContext({ locale = "en", dir }: ExportLocaleOptions = {}): ExportContext {
  const resolved = typeof locale === "string" ? (locales[locale] ?? en) : locale
  return { locale: resolved, dir: dir ?? resolved.dir, t: createTranslator(resolved, en) }
}

/** Reads `accessor` from a row. */
export function getExportValue<T>(row: T, column: ExportColumn<T>, index: number): unknown {
  if (typeof column.accessor === "function") return column.accessor(row, index)
  let value: unknown = row
  for (const key of column.accessor.split(".")) {
    if (value === null || value === undefined) return undefined
    value = (value as Record<string, unknown>)[key]
  }
  return value
}

function toDate(value: unknown): Date | null {
  if (value instanceof Date) return isValid(value) ? value : null
  if (typeof value === "number") return new Date(value)
  if (typeof value === "string" && value) {
    const parsed = parseISO(value)
    return isValid(parsed) ? parsed : null
  }
  return null
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

/** A value resolved to one of the export types. */
export type ExportCell =
  | { type: "empty" }
  | { type: "text"; value: string }
  | { type: "number" | "currency"; value: number; decimals?: number }
  | { type: "date" | "datetime"; value: Date }
  | { type: "boolean"; value: boolean }

function inferType(value: unknown): ExportColumnType {
  if (typeof value === "number") return "number"
  if (typeof value === "boolean") return "boolean"
  if (value instanceof Date) return "date"
  return "text"
}

/** Resolves a raw value to a typed cell. Values that do not fit the column type become text. */
export function toExportCell(value: unknown, type?: ExportColumnType, decimals?: number): ExportCell {
  if (value === null || value === undefined || value === "") return { type: "empty" }
  if (value instanceof Date && !isValid(value)) return { type: "empty" }
  const kind = type ?? inferType(value)
  switch (kind) {
    case "number":
    case "currency": {
      const number = toNumber(value)
      if (number !== null)
        return { type: kind, value: number, decimals: decimals ?? (kind === "currency" ? 2 : undefined) }
      break
    }
    case "date":
    case "datetime": {
      const date = toDate(value)
      if (date) return { type: kind, value: date }
      break
    }
    case "boolean":
      return { type: "boolean", value: Boolean(value) }
  }
  return { type: "text", value: value instanceof Date ? value.toISOString() : String(value) }
}

const pad = (n: number) => String(n).padStart(2, "0")

/** Machine-friendly text (CSV): plain numbers, ISO dates. */
export function cellToPlainText(cell: ExportCell, ctx: ExportContext): string {
  switch (cell.type) {
    case "empty":
      return ""
    case "text":
      return cell.value
    case "number":
    case "currency":
      return cell.decimals === undefined ? String(cell.value) : cell.value.toFixed(cell.decimals)
    case "date":
    case "datetime": {
      const d = cell.value
      const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
      return cell.type === "date" ? date : `${date} ${pad(d.getHours())}:${pad(d.getMinutes())}`
    }
    case "boolean":
      return ctx.t(cell.value ? "common.yes" : "common.no")
  }
}

/** Reader-friendly text (PDF): locale number, currency and date formats. */
export function cellToDisplayText(cell: ExportCell, ctx: ExportContext): string {
  const { locale, t } = ctx
  switch (cell.type) {
    case "number":
      return new Intl.NumberFormat(
        locale.numberLocale,
        cell.decimals === undefined
          ? {}
          : { minimumFractionDigits: cell.decimals, maximumFractionDigits: cell.decimals },
      ).format(cell.value)
    case "currency": {
      const amount = new Intl.NumberFormat(locale.numberLocale, {
        minimumFractionDigits: cell.decimals,
        maximumFractionDigits: cell.decimals,
      }).format(cell.value)
      // Unicode isolates keep the amount in order next to Thaana text.
      return t("common.currency", { amount: `⁨${amount}⁩` })
    }
    case "date":
    case "datetime":
      return formatDateFns(cell.value, cell.type === "date" ? "PP" : "PP p", {
        locale: locale.dateFns,
        weekStartsOn: locale.weekStartsOn,
      })
    default:
      return cellToPlainText(cell, ctx)
  }
}

/** Formats a date for "Generated …" lines. */
export function formatGeneratedAt(date: Date, ctx: ExportContext) {
  return formatDateFns(date, "PP p", { locale: ctx.locale.dateFns, weekStartsOn: ctx.locale.weekStartsOn })
}

/** One row of resolved cells plus the custom text from `format`, when given. */
export interface ResolvedExportCell {
  cell: ExportCell
  /** Output of the column's `format`, if any. */
  formatted?: string
}

export function resolveRows<T>(rows: readonly T[], columns: readonly ExportColumn<T>[]): ResolvedExportCell[][] {
  return rows.map((row, index) =>
    columns.map((column) => {
      const value = getExportValue(row, column, index)
      const cell = toExportCell(value, column.type, column.decimals)
      return column.format ? { cell, formatted: column.format(value, row) } : { cell }
    }),
  )
}

/** Adds the extension unless the name already has it; strips characters file systems reject. */
export function withExtension(filename: string | undefined, extension: string) {
  const printable = Array.from(filename ?? "", (c) => (c.charCodeAt(0) < 32 ? "-" : c)).join("")
  const base = printable.replace(/[\\/:*?"<>|]+/g, "-").trim() || "export"
  return base.toLowerCase().endsWith(`.${extension}`) ? base : `${base}.${extension}`
}
