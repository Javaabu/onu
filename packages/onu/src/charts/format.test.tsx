import { renderHook } from "@testing-library/react"
import * as React from "react"
import { describe, expect, it } from "vitest"

import { OnuProvider } from "../providers/onu-provider"
import {
  aggregate,
  axisFormat,
  computeDelta,
  deltaSentiment,
  formatMVR,
  formatNumber,
  formatValue,
  useChartFormat,
} from "./format"

const strip = (s: string) => s.replace(/[⁨⁩]/g, "")

describe("formatValue", () => {
  it("formats presets", () => {
    expect(formatValue(1234.567)).toBe("1,234.57")
    expect(formatValue(1234.567, "integer")).toBe("1,235")
    expect(formatValue(1234567, "compact")).toBe("1.2M")
    expect(formatValue(0.256, "percent")).toBe("25.6%")
    expect(formatValue(1250, "currency")).toBe("MVR 1,250.00")
  })

  it("accepts Intl options and functions", () => {
    expect(formatValue(3.14159, { maximumFractionDigits: 1 })).toBe("3.1")
    expect(formatValue(5, (v) => `${v} tonnes`)).toBe("5 tonnes")
  })

  it("returns an empty string for missing values", () => {
    expect(formatValue(null)).toBe("")
    expect(formatValue(undefined)).toBe("")
    expect(formatValue(Number.NaN)).toBe("")
  })

  it("uses the given number locale", () => {
    expect(formatNumber(1234.5, "de")).toBe("1.234,5")
  })
})

describe("formatMVR", () => {
  it("formats Rufiyaa with decimals or compact", () => {
    expect(formatMVR(1250)).toBe("MVR 1,250.00")
    expect(formatMVR(1250, "en", { decimals: 0 })).toBe("MVR 1,250")
    expect(formatMVR(4200000, "en", { compact: true })).toBe("MVR 4.2M")
  })
})

describe("axisFormat", () => {
  it("shortens plain numbers and keeps others", () => {
    expect(axisFormat("number")).toBe("compact")
    expect(axisFormat("integer")).toBe("compact")
    expect(axisFormat("percent")).toBe("percent")
    expect(axisFormat()).toBe("compact")
  })
})

describe("computeDelta", () => {
  it("computes change, ratio and direction", () => {
    expect(computeDelta(110, 100)).toEqual({ change: 10, ratio: 0.1, direction: "up" })
    expect(computeDelta(90, 100)).toEqual({ change: -10, ratio: -0.1, direction: "down" })
    expect(computeDelta(100, 100).direction).toBe("flat")
  })

  it("returns a null ratio when the previous value is 0", () => {
    expect(computeDelta(5, 0)).toEqual({ change: 5, ratio: null, direction: "up" })
  })

  it("uses the magnitude of a negative previous value", () => {
    expect(computeDelta(-50, -100).ratio).toBe(0.5)
  })
})

describe("deltaSentiment", () => {
  it("maps direction to sentiment", () => {
    expect(deltaSentiment("up")).toBe("positive")
    expect(deltaSentiment("down")).toBe("negative")
    expect(deltaSentiment("up", false)).toBe("negative")
    expect(deltaSentiment("down", false)).toBe("positive")
    expect(deltaSentiment("flat")).toBe("neutral")
  })
})

describe("aggregate", () => {
  it("sums, averages and takes the last value, skipping gaps", () => {
    const values = [1, null, 3, undefined, 5]
    expect(aggregate(values)).toBe(9)
    expect(aggregate(values, "average")).toBe(3)
    expect(aggregate(values, "last")).toBe(5)
    expect(aggregate([])).toBe(0)
  })
})

describe("useChartFormat", () => {
  const wrapper =
    (locale: "en" | "dv") =>
    ({ children }: { children: React.ReactNode }) => <OnuProvider locale={locale}>{children}</OnuProvider>

  it("formats with the active locale in English", () => {
    const { result } = renderHook(() => useChartFormat("currency"), { wrapper: wrapper("en") })
    expect(strip(result.current.value(1250))).toBe("MVR 1,250.00")
    expect(strip(result.current.axis(4200000))).toBe("MVR 4.2M")
    expect(result.current.percent(0.125)).toBe("12.5%")
    expect(result.current.with(1500, "compact")).toBe("1.5K")
    expect(result.current.numberLocale).toBe("en")
  })

  it("uses Dhivehi currency wording with Western digits", () => {
    const { result } = renderHook(() => useChartFormat("currency"), { wrapper: wrapper("dv") })
    expect(strip(result.current.value(1250))).toBe("ރ. 1,250.00")
  })

  it("shortens axis ticks for plain numbers", () => {
    const { result } = renderHook(() => useChartFormat(), { wrapper: wrapper("en") })
    expect(result.current.axis(12000)).toBe("12K")
    expect(result.current.value(12000)).toBe("12,000")
  })
})
