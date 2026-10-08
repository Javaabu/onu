import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const read = (file: string) => readFileSync(path.resolve(__dirname, file), "utf8")
const tokens = read("tokens.css")
const theme = read("theme.css")

const neutrals = [...new Set([...tokens.matchAll(/--onu-neutral-([a-z-]+):/g)].map((m) => m[1]!))]
// Whitespace-insensitive view of theme.css, so Prettier's line wrapping does not matter.
const flat = theme.replace(/\s+/g, " ").replace(/\( /g, "(").replace(/ \)/g, ")")
const block = (selector: string) => {
  const start = theme.indexOf(`${selector} {\n  --tint-`)
  return theme.slice(start, theme.indexOf("}", start))
}

describe("brand tint", () => {
  it("tints the shadcn neutrals", () => {
    expect(neutrals).toEqual(
      expect.arrayContaining(["accent", "accent-foreground", "secondary", "muted", "border", "input", "sidebar"]),
    )
    // The tinted tokens are left unset, so a project's --onu-<name> replaces the tinted value.
    for (const name of neutrals) expect(tokens).not.toMatch(new RegExp(`--onu-${name}:`))
  })

  it.each(neutrals)("derives --%s from primary, overridable and scaled by --onu-tint", (name) => {
    expect(flat).toContain(`--${name}: var(--onu-${name}, color-mix(`)
    expect(flat).toContain(
      `color-mix(in oklab, var(--primary) var(--tint-${name}), var(--onu-neutral-${name})) var(--onu-tint, 100%)`,
    )
    expect(block(":root")).toMatch(new RegExp(`--tint-${name}: \\d+%;`))
    expect(block('[data-theme="dark"]')).toMatch(new RegExp(`--tint-${name}: \\d+%;`))
  })

  it("has an attribute to opt out", () => {
    expect(theme).toMatch(/\[data-onu-tint="none"\] \{\s*--onu-tint: 0%;/)
  })
})
