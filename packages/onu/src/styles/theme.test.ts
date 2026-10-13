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

  it("is off by default (plain Ant greys)", () => {
    expect(tokens).toMatch(/:root \{[^}]*--onu-tint: 0%;/)
  })

  it("has an attribute to opt out", () => {
    expect(theme).toMatch(/\[data-onu-tint="none"\] \{\s*--onu-tint: 0%;/)
  })
})

describe("ProtonAnt tokens", () => {
  const darkTokens = tokens.slice(tokens.indexOf(":root.dark"))
  const names = [
    "shell",
    "shell-foreground",
    "shell-border",
    "shell-field",
    "shell-hover",
    "shell-active",
    "layout",
    ...["blue", "cyan", "green", "red", "gold"].flatMap((c) => [
      `preset-${c}`,
      `preset-${c}-border`,
      `preset-${c}-foreground`,
    ]),
  ]

  it.each(names)("defines --onu-%s for light and dark and maps it to a theme variable", (name) => {
    expect(tokens).toContain(`--onu-${name}: oklch(`)
    expect(darkTokens).toContain(`--onu-${name}: oklch(`)
    expect(theme).toContain(`--${name}: var(--onu-${name});`)
  })

  it("derives Ant's colour steps 1–8 from primary", () => {
    for (let step = 1; step <= 8; step++) expect(theme).toMatch(new RegExp(`--primary-${step}: `))
    expect(theme).toContain("--primary-subtle: var(--primary-1);")
  })

  it("uses 14px text, a 6px radius and the brand purple by default", () => {
    expect(tokens).toContain("--onu-font-size: 0.875rem;")
    expect(tokens).toContain("--onu-radius: 0.375rem;")
    expect(tokens).toContain("--onu-primary: oklch(0.562 0.251 283.7);")
  })
})
