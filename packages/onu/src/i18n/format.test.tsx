import * as React from "react"
import { renderHook } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { dv } from "../locales/dv"
import { OnuProvider } from "../providers/onu-provider"
import * as root from "../index"
import { useFormatCurrency, useFormatDate, useFormatNumber } from "./format"

function wrapper(locale: "en" | "dv") {
  return ({ children }: { children: React.ReactNode }) => (
    <OnuProvider locale={locale === "dv" ? dv : locale}>{children}</OnuProvider>
  )
}

function hooks(locale: "en" | "dv") {
  return renderHook(() => ({ date: useFormatDate(), number: useFormatNumber(), currency: useFormatCurrency() }), {
    wrapper: wrapper(locale),
  }).result.current
}

describe("format hooks", () => {
  it("are exported from the package root", () => {
    expect(root.useFormatDate).toBe(useFormatDate)
    expect(root.useFormatNumber).toBe(useFormatNumber)
    expect(root.useFormatCurrency).toBe(useFormatCurrency)
  })

  it("formats dates in English with a default and a custom pattern", () => {
    const { date } = hooks("en")
    expect(date(new Date(2026, 2, 12))).toBe("Mar 12, 2026")
    expect(date("2026-03-12", "d MMMM yyyy")).toBe("12 March 2026")
    expect(date(new Date(2026, 2, 12, 9, 30).getTime(), "EEEE p")).toBe("Thursday 9:30 AM")
    expect(date("not a date")).toBe("")
    expect(date(null)).toBe("")
    expect(date(undefined)).toBe("")
  })

  it("formats dates with Dhivehi month and weekday names", () => {
    const { date } = hooks("dv")
    const march = date("2026-03-12", "MMMM")
    expect(march).toMatch(/[ހ-޿]/)
    expect(march).not.toBe("March")
    expect(date("2026-03-12", "EEEE")).toMatch(/[ހ-޿]/)
    // Western digits (R12.6).
    expect(date("2026-03-12", "d yyyy")).toBe("12 2026")
  })

  it("formats numbers and MVR amounts for the locale", () => {
    const en = hooks("en")
    expect(en.number(1234.5)).toBe("1,234.5")
    expect(en.number(0.256, { style: "percent" })).toBe("26%")
    expect(en.number(Number.NaN)).toBe("")
    expect(en.currency(1250)).toBe("MVR ⁨1,250.00⁩")
    expect(en.currency(1250, { decimals: 0 })).toBe("MVR ⁨1,250⁩")
    expect(en.currency(1200, { compact: true })).toBe("MVR ⁨1.2K⁩")
    expect(en.currency(null)).toBe("")
    const dv = hooks("dv")
    expect(dv.number(1234.5)).toBe("1,234.5")
    expect(dv.currency(1250)).toBe("ރ. ⁨1,250.00⁩")
  })
})
