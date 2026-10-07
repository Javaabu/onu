import { describe, expect, it } from "vitest"

import {
  decadeSpanStart,
  isOutOfRange,
  parseISODate,
  toISODate,
  toISODateTime,
  toISOTime,
  withTime,
  wrap,
  yearBlockStart,
} from "./_utils"

describe("date utils", () => {
  it("formats and parses ISO values", () => {
    const d = new Date(2026, 2, 5, 9, 7, 30)
    expect(toISODate(d)).toBe("2026-03-05")
    expect(toISODateTime(d)).toBe("2026-03-05T09:07:30")
    expect(toISOTime(d)).toBe("09:07")
    expect(parseISODate("2026-03-05")).toEqual(new Date(2026, 2, 5))
    expect(parseISODate("2026-03-05T09:07:30")).toEqual(new Date(2026, 2, 5, 9, 7, 30))
    expect(parseISODate("")).toBeNull()
    expect(parseISODate(null)).toBeNull()
    expect(parseISODate("not a date")).toBeNull()
  })

  it("sets times, optionally to the end of the minute", () => {
    expect(withTime(new Date(2026, 0, 1), { hours: 23, minutes: 59 }, true)).toEqual(
      new Date(2026, 0, 1, 23, 59, 59, 999),
    )
    expect(withTime(new Date(2026, 0, 1, 5), null)).toEqual(new Date(2026, 0, 1))
  })

  it("checks ranges by day, month and year", () => {
    const min = new Date(2026, 2, 10)
    const max = new Date(2026, 5, 20)
    expect(isOutOfRange(new Date(2026, 2, 9), min, max)).toBe(true)
    expect(isOutOfRange(new Date(2026, 2, 1), min, max, "month")).toBe(false)
    expect(isOutOfRange(new Date(2026, 1, 1), min, max, "month")).toBe(true)
    expect(isOutOfRange(new Date(2026, 6, 1), min, max, "month")).toBe(true)
    expect(isOutOfRange(new Date(2027, 0, 1), min, max, "year")).toBe(true)
    expect(isOutOfRange(new Date(2026, 0, 1), undefined, undefined, "year")).toBe(false)
  })

  it("works out year blocks and wraps values", () => {
    expect(yearBlockStart(2026)).toBe(2016)
    expect(decadeSpanStart(2026)).toBe(1944)
    expect(wrap(-1, 24)).toBe(23)
    expect(wrap(60, 60)).toBe(0)
  })
})
