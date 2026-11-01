import { describe, expect, it } from "vitest"

import { radixSide } from "./_side"

describe("radixSide", () => {
  it.each([
    ["start", "ltr", "left"],
    ["end", "ltr", "right"],
    ["start", "rtl", "right"],
    ["end", "rtl", "left"],
    ["top", "rtl", "top"],
    ["bottom", "ltr", "bottom"],
    [undefined, "rtl", undefined],
  ] as const)("%s in %s → %s", (side, dir, expected) => {
    expect(radixSide(side, dir)).toBe(expected)
  })
})
