import { CalendarDate, GregorianCalendar, IslamicUmalquraCalendar, toCalendar } from "@internationalized/date"

const hijriCalendar = new IslamicUmalquraCalendar()
const gregorian = new GregorianCalendar()

/** A date in the Umm al-Qura Hijri calendar. `month` is 1–12. */
export interface HijriParts {
  year: number
  month: number
  day: number
}

/** Gregorian `Date` → Hijri (Umm al-Qura) year, month and day. */
export function toHijri(date: Date): HijriParts {
  const h = toCalendar(new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate()), hijriCalendar)
  return { year: h.year, month: h.month, day: h.day }
}

/** Hijri year, month and day → Gregorian `Date` (local midnight). Out-of-range days are clamped. */
export function fromHijri({ year, month, day }: HijriParts): Date {
  const first = new CalendarDate(hijriCalendar, year, month, 1)
  const clamped = Math.min(Math.max(day, 1), hijriCalendar.getDaysInMonth(first))
  const g = toCalendar(first.set({ day: clamped }), gregorian)
  return new Date(g.year, g.month - 1, g.day)
}

export function hijriDaysInMonth(year: number, month: number) {
  return hijriCalendar.getDaysInMonth(new CalendarDate(hijriCalendar, year, month, 1))
}

/** Adds Hijri months, keeping the day where possible. */
export function addHijriMonths(parts: HijriParts, months: number): HijriParts {
  const d = new CalendarDate(hijriCalendar, parts.year, parts.month, 1).add({ months })
  return { year: d.year, month: d.month, day: Math.min(parts.day, hijriDaysInMonth(d.year, d.month)) }
}
