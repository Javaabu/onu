import { useOnu } from "@javaabu/onu"

import { useDv } from "../_shared/i18n"

/** A string in both languages. */
export interface L {
  en: string
  dv: string
}

/** Picks the active language from a bilingual value: `l(service.title)`. */
export function useL() {
  const dv = useDv()
  return (value: L) => (dv ? value.dv : value.en)
}

/** Formats an MVR amount with tabular digits: "MVR 1,250.00" / "ރ. 1,250.00". */
export function useMvr() {
  const dv = useDv()
  return (amount: number) =>
    `${dv ? "ރ." : "MVR"} ${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/** An illustrative scene as an SVG data URI (no network needed). Colours are picture content, not UI. */
export function scene(label: string, hue: number, w = 1200, h = 800) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="hsl(${hue} 70% 72%)"/>
      <stop offset="1" stop-color="hsl(${hue + 30} 80% 88%)"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#sky)"/>
  <circle cx="${w * 0.75}" cy="${h * 0.3}" r="${h * 0.1}" fill="hsl(45 100% 70%)"/>
  <path d="M0 ${h * 0.68} Q ${w * 0.25} ${h * 0.6} ${w * 0.5} ${h * 0.68} T ${w} ${h * 0.66} V ${h} H 0 Z" fill="hsl(190 70% 45%)"/>
  <path d="M0 ${h * 0.8} Q ${w * 0.3} ${h * 0.74} ${w * 0.6} ${h * 0.8} T ${w} ${h * 0.78} V ${h} H 0 Z" fill="hsl(45 60% 82%)"/>
  ${label ? `<text x="${w / 2}" y="${h * 0.93}" font-family="sans-serif" font-size="${h * 0.06}" text-anchor="middle" fill="hsl(200 40% 20%)">${label}</text>` : ""}
</svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

/** Fake latency for local "requests". */
export const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/** Parses "2026-10-05" as a local date (not UTC) and passes anything else to `Date`. */
export function toDate(input: string | Date) {
  if (input instanceof Date) return input
  return new Date(/^\d{4}-\d{2}-\d{2}$/.test(input) ? `${input}T00:00` : input)
}

/**
 * Date formatting in the active locale (Dhivehi month names come from the
 * locale's date-fns `localize`), without pulling date-fns into the examples app.
 */
export function useDates() {
  const { locale } = useOnu()
  const loc = locale.dateFns.localize
  const pad = (n: number) => String(n).padStart(2, "0")
  const month = (d: Date, width: "abbreviated" | "wide" = "wide") => loc.month(d.getMonth() as never, { width })
  const weekday = (d: Date) => loc.day(d.getDay() as never, { width: "wide" })
  const time = (input: string | Date) => {
    const d = toDate(input)
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`
  }
  const date = (input: string | Date, width: "abbreviated" | "wide" = "wide") => {
    const d = toDate(input)
    return `${d.getDate()} ${month(d, width)} ${d.getFullYear()}`
  }
  return {
    month,
    weekday,
    time,
    date,
    dateTime: (input: string | Date) => `${date(input, "abbreviated")}, ${time(input)}`,
    day: (input: string | Date) => toDate(input).getDate(),
    monthShort: (input: string | Date) => month(toDate(input), "abbreviated"),
  }
}
