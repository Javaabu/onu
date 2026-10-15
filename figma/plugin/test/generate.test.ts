import { readFileSync } from "node:fs"
import path from "node:path"
import { beforeAll, describe, expect, it } from "vitest"
import tokens from "../../../tokens.json"
import type { DesignTokens } from "../../shared/tokens.mjs"
import { KIT, generateKit, type GenerateResult } from "../src/generate"
import { installFigma, type FakeFigma, type FakeNode } from "./figma-mock"

const FONTS: Array<[string, string]> = [
  ["Inter", "Regular"],
  ["Inter", "Medium"],
  ["Inter", "Semi Bold"],
  ["Inter", "Bold"],
  // No Faruma or MV Faseyha: the Thaana styles must fall back to Noto Sans Thaana.
  ["Noto Sans Thaana", "Regular"],
  ["Noto Sans Thaana", "Bold"],
  ["JetBrains Mono", "Regular"],
  ["JetBrains Mono", "Medium"],
  ["JetBrains Mono", "Bold"],
]

const repo = path.resolve(import.meta.dirname, "../../..")

/** Keys of a `name: { … }` block in a cva() call, e.g. the `variant` values of buttonVariants. */
function cvaKeys(file: string, block: string): string[] {
  const source = readFileSync(path.join(repo, file), "utf8")
  const start = source.indexOf(`${block}: {`)
  if (start < 0) throw new Error(`${block} not found in ${file}`)
  const indent = /\n( *)[^\n]*$/.exec(source.slice(0, start))![1]!.length
  const lines = source.slice(start).split("\n").slice(1)
  const keys: string[] = []
  for (const line of lines) {
    const own = /^( *)(?:"([^"]+)"|([\w-]+)):/.exec(line)
    if (/^ *},?$/.test(line) && line.indexOf("}") <= indent) break
    if (own && own[1]!.length === indent + 2) keys.push((own[2] ?? own[3])!)
  }
  return keys
}

type Snapshot = {
  collections: number
  variables: number
  styles: number
  pages: string[]
  sets: Record<string, string>
  variants: number
  nodes: number
}

function snapshot(api: FakeFigma): Snapshot {
  const nodes = [...api.all]
  return {
    collections: api.collections.length,
    variables: api.variablesList.length,
    styles: api.styles.length,
    pages: api.root.children.map((p) => p.name),
    sets: Object.fromEntries(nodes.filter((n) => n.type === "COMPONENT_SET").map((n) => [n.name, n.id])),
    variants: nodes.filter((n) => n.type === "COMPONENT" && n.parent?.type === "COMPONENT_SET").length,
    nodes: nodes.length,
  }
}

const setNamed = (api: FakeFigma, name: string) =>
  [...api.all].find((n) => n.type === "COMPONENT_SET" && n.name === name) as FakeNode

/** Property names (without Figma's #id suffix) → type. */
const propNames = (node: FakeNode) =>
  Object.fromEntries(Object.entries(node.componentPropertyDefinitions).map(([k, d]) => [k.split("#")[0], d.type]))

describe("Onu kit generator", () => {
  let api: FakeFigma
  let first: GenerateResult
  let firstSnapshot: Snapshot

  beforeAll(async () => {
    api = installFigma(FONTS)
    first = await generateKit(tokens as unknown as DesignTokens, { version: "0.0.0" })
    firstSnapshot = snapshot(api)
  })

  it("creates the three variable collections with their modes", () => {
    const byName = Object.fromEntries(
      api.collections.map((c) => [c.name, c.modes.map((m: { name: string }) => m.name)]),
    )
    expect(byName).toEqual({
      "Onu / Color": ["Light", "Dark"],
      "Onu / Density": ["Default", "Compact", "Comfortable", "Touch"],
      "Onu / Shape": ["Default"],
    })
  })

  it("creates the same variable names and code syntax as sync-variables.mjs", () => {
    const names = api.variablesList.map((v) => v.name)
    for (const name of Object.keys(tokens.color.light)) expect(names).toContain(`semantic/${name}`)
    for (const name of [
      "brand/primary",
      "brand/primary-5",
      "spacing/unit",
      "spacing/3_75",
      "radius/base",
      "size/label-width",
      "size/touch-target",
    ])
      expect(names).toContain(name)
    const primary = api.variablesList.find((v) => v.name === "brand/primary")
    expect(primary.codeSyntax.WEB).toBe("var(--onu-primary)")
    const unit = api.variablesList.find((v) => v.name === "spacing/unit")
    expect(Object.values(unit.valuesByMode)).toEqual([4, 3.6, 4.48, 5.52])
  })

  it("creates text styles for Inter, the Thaana fallback and JetBrains Mono", () => {
    const names = api.styles.map((s) => s.name)
    expect(names).toContain("UI/sm/Regular")
    expect(names).toContain("Thaana/sm/Regular")
    expect(names).toContain("Mono/sm")
    const body = api.styles.find((s) => s.name === "UI/sm/Regular")
    expect(body.fontSize).toBe(14)
    expect(body.lineHeight).toEqual({ unit: "PIXELS", value: 22 })
    expect(api.styles.find((s) => s.name === "Thaana/sm/Regular").fontName.family).toBe("Noto Sans Thaana")
    expect(first.notes.join(" ")).toMatch(/Faruma is not available, using Noto Sans Thaana/)
  })

  it("lays the kit out on a cover, per-category pages and a samples page", () => {
    expect(firstSnapshot.pages).toEqual([
      "Page 1",
      "Cover",
      "Foundations",
      "Inputs",
      "Display",
      "Navigation",
      "Overlays",
      "Data",
      "Samples",
    ])
    const page = (name: string) => api.root.children.find((p) => p.name === name)!
    expect(page("Inputs").children.map((n) => n.name)).toEqual(
      expect.arrayContaining([
        "Button",
        "IconButton",
        "TextInput",
        "Textarea",
        "Select",
        "Checkbox",
        "Radio",
        "Switch",
      ]),
    )
    expect(page("Samples").children.map((n) => n.name)).toEqual([
      "Admin dashboard",
      "Admin dashboard (Dark)",
      "Application form",
      "Application form (RTL)",
    ])
  })

  it("builds every component set the issue asks for", () => {
    for (const name of [
      "Button",
      "IconButton",
      "Badge",
      "Tag",
      "StatusBadge",
      "TextInput",
      "Textarea",
      "Select",
      "Checkbox",
      "Radio",
      "Switch",
      "Alert",
      "Card",
      "Avatar",
      "Tabs",
      "Breadcrumbs",
      "Pagination",
      "Tooltip",
      "Dialog",
      "Toast",
      "Table / Row",
      "DataTable",
      "AppSidebar / Item",
      "AppSidebar",
      "AppHeader",
      "StatTile",
    ])
      expect(firstSnapshot.sets[name], name).toBeDefined()
  })

  it("names Button properties after the React props and cva variants", () => {
    const button = setNamed(api, "Button")
    expect(propNames(button)).toEqual({
      variant: "VARIANT",
      size: "VARIANT",
      state: "VARIANT",
      dir: "VARIANT",
      children: "TEXT",
      loading: "BOOLEAN",
      startIcon: "BOOLEAN",
      "startIcon glyph": "INSTANCE_SWAP",
      endIcon: "BOOLEAN",
      "endIcon glyph": "INSTANCE_SWAP",
    })
    const defs = button.componentPropertyDefinitions
    const reactVariants = [...cvaKeys("packages/onu/src/ui/button.tsx", "variant"), "success", "warning"]
    expect(defs.variant!.variantOptions!.sort()).toEqual(reactVariants.sort())
    const reactSizes = cvaKeys("packages/onu/src/ui/button.tsx", "size")
    expect(defs.size!.variantOptions!.sort()).toEqual(reactSizes.filter((s) => !s.startsWith("icon")).sort())
    const iconSizes = setNamed(api, "IconButton").componentPropertyDefinitions.size!.variantOptions!
    expect(iconSizes.sort()).toEqual(reactSizes.filter((s) => s.startsWith("icon")).sort())
  })

  it("matches the variant values of Badge, Tag, StatusBadge, Alert and Avatar", () => {
    const options = (set: string, prop: string) =>
      setNamed(api, set).componentPropertyDefinitions[prop]!.variantOptions!.sort()
    expect(options("Badge", "variant")).toEqual(cvaKeys("packages/onu/src/ui/badge.tsx", "variant").sort())
    expect(options("Tag", "variant")).toEqual(cvaKeys("packages/onu/src/components/display/tag.tsx", "variant").sort())
    expect(options("Tag", "size")).toEqual(cvaKeys("packages/onu/src/components/display/tag.tsx", "size").sort())
    expect(options("StatusBadge", "status")).toEqual(
      cvaKeys("packages/onu/src/components/display/status-badge.tsx", "tone").sort(),
    )
    expect(options("Alert", "variant")).toEqual(
      cvaKeys("packages/onu/src/components/display/callout.tsx", "variant").sort(),
    )
    expect(options("Avatar", "size")).toEqual(
      cvaKeys("packages/onu/src/components/display/user-avatar.tsx", "size").sort(),
    )
    expect(options("Card", "variant")).toEqual(cvaKeys("packages/onu/src/components/layout/card.tsx", "variant").sort())
  })

  it("has LTR and RTL variants and binds text properties only in LTR", () => {
    const input = setNamed(api, "TextInput")
    expect(input.componentPropertyDefinitions.dir!.variantOptions).toEqual(["ltr", "rtl"])
    expect(input.componentPropertyDefinitions.state!.variantOptions).toEqual([
      "default",
      "hover",
      "focus",
      "error",
      "disabled",
    ])
    expect(propNames(input)).toMatchObject({ label: "TEXT", help: "TEXT", error: "TEXT", required: "BOOLEAN" })
    const rtl = input.children.find((c) => c.name === "state=default, dir=rtl")!
    const label = rtl.findOne((n) => n.type === "TEXT" && n.name === "label")!
    expect(label.componentPropertyReferences).toBeNull()
    expect(label.fontName.family).toBe("Noto Sans Thaana")
    const ltr = input.children.find((c) => c.name === "state=default, dir=ltr")!
    expect(ltr.findOne((n) => n.type === "TEXT" && n.name === "label")!.componentPropertyReferences).toHaveProperty(
      "characters",
    )
  })

  it("binds fills and spacing to the variables", () => {
    const button = setNamed(api, "Button").children[0]!
    expect(button.fills[0].boundVariables.color.id).toBe(api.variablesList.find((v) => v.name === "brand/primary").id)
    expect(button.boundVariables.height.id).toBe(api.variablesList.find((v) => v.name === "spacing/8").id)
    expect(button.boundVariables.paddingLeft.id).toBe(api.variablesList.find((v) => v.name === "spacing/3_75").id)
  })

  it("returns node ids for components.json keys", () => {
    const components = JSON.parse(readFileSync(path.join(repo, "figma/components.json"), "utf8"))
    for (const def of KIT) if (def.key) expect(components[def.key], def.key).toBeDefined()
    expect(first.nodeIds["form-scaffolding/button"]).toBe(firstSnapshot.sets.Button)
    expect(first.figmaUrls["form-scaffolding/button"]).toMatch(
      /^https:\/\/www\.figma\.com\/design\/koHmHh7QJWX8BPN6KusMg9\/Onu_Claude\?node-id=\d+-\d+$/,
    )
  })

  it("is idempotent: a second run updates in place", async () => {
    const second = await generateKit(tokens as unknown as DesignTokens, { version: "0.0.0" })
    const again = snapshot(api)
    expect(again.collections).toBe(firstSnapshot.collections)
    expect(again.variables).toBe(firstSnapshot.variables)
    expect(again.styles).toBe(firstSnapshot.styles)
    expect(again.pages).toEqual(firstSnapshot.pages)
    expect(again.sets).toEqual(firstSnapshot.sets)
    expect(again.variants).toBe(firstSnapshot.variants)
    expect(again.nodes).toBe(firstSnapshot.nodes)
    expect(second.nodeIds).toEqual(first.nodeIds)
    expect(second.stats.variablesCreated).toBe(0)
    // No duplicated component properties either.
    expect(Object.keys(setNamed(api, "Button").componentPropertyDefinitions)).toHaveLength(10)
  })
})
