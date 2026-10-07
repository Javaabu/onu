import {
  endOfDay,
  endOfMonth,
  endOfYear,
  format as formatFns,
  isValid,
  parse,
  startOfDay,
  startOfMonth,
  startOfYear,
} from "date-fns"
import type { Locale } from "date-fns"

/** A time of day, independent of any date. */
export interface TimeValue {
  hours: number
  minutes: number
}

/** A date range. Either end may be `null` for an open-ended range. */
export interface DateRangeValue {
  from: Date | null
  to: Date | null
}

/** The default display format: day/month/year, as used in the Maldives. */
export const DEFAULT_DATE_FORMAT = "dd/MM/yyyy"

/** `HH:mm` (24-hour) or `h:mm a` (12-hour). */
export function defaultTimeFormat(hourCycle: 12 | 24) {
  return hourCycle === 24 ? "HH:mm" : "h:mm a"
}

export function formatDate(date: Date, pattern: string, locale: Locale) {
  return formatFns(date, pattern, { locale })
}

/** `yyyy-MM-dd`, the format HTML date inputs and Laravel's `date` rule accept. */
export function toISODate(date: Date) {
  return formatFns(date, "yyyy-MM-dd")
}

/** Local ISO date-time without a time zone: `yyyy-MM-ddTHH:mm:ss`. */
export function toISODateTime(date: Date) {
  return formatFns(date, "yyyy-MM-dd'T'HH:mm:ss")
}

/** `HH:mm`. */
export function toISOTime(date: Date) {
  return formatFns(date, "HH:mm")
}

/** Parses `yyyy-MM-dd` (or a full ISO string) into a local `Date`. Returns `null` when invalid. */
export function parseISODate(value: string | null | undefined): Date | null {
  if (!value) return null
  const date = value.length <= 10 ? parse(value, "yyyy-MM-dd", new Date()) : new Date(value)
  return isValid(date) ? date : null
}

export function getTimeValue(date: Date): TimeValue {
  return { hours: date.getHours(), minutes: date.getMinutes() }
}

/** A copy of `date` with its time set to `time` (seconds cleared). */
export function withTime(date: Date, time: TimeValue | null, endOfMinute = false) {
  const next = new Date(date)
  next.setHours(time?.hours ?? 0, time?.minutes ?? 0, endOfMinute ? 59 : 0, endOfMinute ? 999 : 0)
  return next
}

export type Granularity = "day" | "month" | "year"

const startOf = { day: startOfDay, month: startOfMonth, year: startOfYear }
const endOf = { day: endOfDay, month: endOfMonth, year: endOfYear }

/** True when the whole day / month / year containing `date` falls outside `[min, max]`. */
export function isOutOfRange(date: Date, min: Date | undefined, max: Date | undefined, unit: Granularity = "day") {
  if (min && endOf[unit](date) < startOfDay(min)) return true
  if (max && startOf[unit](date) > endOfDay(max)) return true
  return false
}

/** Start of the 12-year block containing `year` (2026 → 2016, so the block is 2016–2027). */
export function yearBlockStart(year: number) {
  return Math.floor(year / 12) * 12
}

/** Start of the 144-year span shown in the decades view, centred on `year`'s block. */
export function decadeSpanStart(year: number) {
  return yearBlockStart(year) - 72
}

/** Wraps `value` into `[0, size)`. */
export function wrap(value: number, size: number) {
  return ((value % size) + size) % size
}

/** Two-digit padding for times. */
export function pad2(value: number) {
  return String(value).padStart(2, "0")
}
