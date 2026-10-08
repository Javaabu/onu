import { describe, expect, it } from "vitest"

import { FALLBACK_COMMENT, kebab, readLucideMap, replaceIcons } from "../scripts/shadcn-icons.mjs"

const PLACEHOLDER_IMPORT = 'import { IconPlaceholder } from "@/app/(create)/components/icon-placeholder"'

describe("sync-shadcn icon transform", () => {
  it("reads the default Lucide set", () => {
    const map = readLucideMap()
    expect(map.loading).toBe("Loader2Icon")
    expect(map.close).toBe("XIcon")
    expect(map["chevron-down"]).toBe("ChevronDownIcon")
  })

  it("turns literal placeholders into Icon with a fallback glyph and imports it", () => {
    const input = [
      '"use client"',
      "",
      'import * as React from "react"',
      PLACEHOLDER_IMPORT,
      "",
      "export const A = () => (",
      "  <>",
      '    <IconPlaceholder lucide="XIcon" tabler="IconX" hugeicons="Cancel01Icon" className="size-4" />',
      '    <IconPlaceholder lucide="CheckIcon" />',
      '    <IconPlaceholder lucide="XIcon" phosphor="XIcon" />',
      "  </>",
      ")",
    ].join("\n")
    const out = replaceIcons(input)
    expect(out).toContain('<Icon name="close" fallback={XIcon} className="size-4" />')
    expect(out).toContain('<Icon name="check" fallback={CheckIcon} />')
    expect(out).toContain(
      `${FALLBACK_COMMENT}\nimport { CheckIcon, XIcon } from "lucide-react"\nimport { Icon } from "../icons/icon"`,
    )
    expect(out).not.toContain("IconPlaceholder")
    expect(out).not.toContain("tabler=")
  })

  it("uses the default set's glyph so the icon matches with and without OnuProvider", () => {
    const out = replaceIcons(`${PLACEHOLDER_IMPORT}\n<IconPlaceholder lucide="LoaderIcon" />`)
    expect(out).toContain('<Icon name="loading" fallback={Loader2Icon} />')
    expect(out).toContain('import { Loader2Icon } from "lucide-react"')
  })

  it("keeps the shadcn glyph for names outside the default set", () => {
    const out = replaceIcons(`${PLACEHOLDER_IMPORT}\n<IconPlaceholder lucide="SparklesIcon" />`, {})
    expect(out).toContain('<Icon name="sparkles" fallback={SparklesIcon} />')
    expect(kebab("ArrowUpRightIcon")).toBe("arrow-up-right")
  })

  it("merges glyphs into an existing lucide-react import", () => {
    const input = [
      'import { StarIcon } from "lucide-react"',
      PLACEHOLDER_IMPORT,
      '<IconPlaceholder lucide="CheckIcon" />',
    ].join("\n")
    const out = replaceIcons(input)
    expect(out.match(/from "lucide-react"/g)).toHaveLength(1)
    expect(out).toContain(`${FALLBACK_COMMENT}\nimport { CheckIcon, StarIcon } from "lucide-react"\n`)
    expect(out).toContain('import { Icon } from "../icons/icon"')
  })

  it("leaves dynamic placeholders without a fallback", () => {
    const out = replaceIcons(`${PLACEHOLDER_IMPORT}\n<IconPlaceholder lucide={icon} className="x" />`)
    expect(out).toContain('<Icon name={icon} className="x" />')
    expect(out).not.toContain("lucide-react")
    expect(out).not.toContain(FALLBACK_COMMENT)
  })

  it("drops the placeholder import when a file has no placeholders", () => {
    expect(replaceIcons(`${PLACEHOLDER_IMPORT}\nexport const x = 1`)).toBe("export const x = 1")
  })
})
