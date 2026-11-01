import { describe, expect, it } from "vitest"

import { isSafeUrl, normalizeUrl } from "./url"

describe("normalizeUrl", () => {
  it("adds a protocol to a value without a scheme", () => {
    expect(normalizeUrl("  example.mv ")).toBe("https://example.mv")
    expect(normalizeUrl("x.mv", "http://")).toBe("http://x.mv")
  })

  it("keeps safe schemes and relative URLs", () => {
    expect(normalizeUrl("http://x.mv")).toBe("http://x.mv")
    expect(normalizeUrl("mailto:a@b.mv")).toBe("mailto:a@b.mv")
    expect(normalizeUrl("/page")).toBe("/page")
    expect(normalizeUrl("//cdn.mv/a")).toBe("//cdn.mv/a")
    expect(normalizeUrl("#top")).toBe("#top")
  })

  it("returns null when empty or unsafe", () => {
    expect(normalizeUrl("  ")).toBeNull()
    expect(normalizeUrl("javascript:alert(1)")).toBeNull()
  })
})

describe("isSafeUrl", () => {
  it("rejects schemes hidden by whitespace", () => {
    expect(isSafeUrl("java\nscript:alert(1)")).toBe(false)
    expect(isSafeUrl("https://x.mv")).toBe(true)
  })
})
