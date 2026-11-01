import { describe, expect, it } from "vitest"

import { toArray } from "./utils"

describe("toArray", () => {
  it("wraps a single value and passes an array through", () => {
    const list = ["a", "b"]
    expect(toArray("a")).toEqual(["a"])
    expect(toArray(list)).toBe(list)
  })

  it("treats null, undefined and an empty string as no value", () => {
    expect(toArray(null)).toEqual([])
    expect(toArray(undefined)).toEqual([])
    expect(toArray("")).toEqual([])
  })
})
