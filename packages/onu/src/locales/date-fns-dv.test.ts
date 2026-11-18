import { format, parse } from "date-fns"
import { describe, expect, it } from "vitest"

import { dv } from "./date-fns-dv"

describe("Dhivehi date-fns locale", () => {
  it("labels flexible day periods by the half of the day they fall in", () => {
    const at = (hour: number) => new Date(2026, 2, 12, hour, 0)
    expect(format(at(0), "b", { locale: dv })).toBe("މކ") // midnight
    expect(format(at(2), "B", { locale: dv })).toBe("މކ") // night
    expect(format(at(9), "B", { locale: dv })).toBe("މކ") // morning
    expect(format(at(12), "b", { locale: dv })).toBe("މފ") // noon
    expect(format(at(14), "B", { locale: dv })).toBe("މފ") // afternoon
    expect(format(at(19), "BBBB", { locale: dv })).toBe("މެންދުރުފަހު") // evening
    expect(format(at(9), "a", { locale: dv })).toBe("މކ")
    expect(format(at(21), "a", { locale: dv })).toBe("މފ")
  })

  it("parses full, short and narrow weekday names", () => {
    const ref = new Date(2026, 2, 12)
    const day = (text: string, pattern: string) => parse(text, pattern, ref, { locale: dv }).getDay()
    expect(day("އާދިއްތަ", "EEEE")).toBe(0)
    expect(day("އާދި", "EEE")).toBe(0)
    expect(day("އަން", "EEE")).toBe(2)
    expect(day("ބުރާ", "EEE")).toBe(4)
    expect(day("ބު", "EEEEE")).toBe(3)
    expect(day("ބުރ", "EEEEE")).toBe(4)
    for (const pattern of ["EEEE", "EEE", "EEEEE"]) {
      for (let d = 0; d < 7; d++) {
        const date = new Date(2026, 2, 8 + d)
        expect(day(format(date, pattern, { locale: dv }), pattern)).toBe(d)
      }
    }
  })
})
