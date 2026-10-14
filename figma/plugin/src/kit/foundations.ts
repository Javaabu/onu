import { rgbaToHex } from "../../../shared/tokens.mjs"
import { Builder, KEY, variable, type Kit } from "../core"
import { LUCIDE } from "../icons.generated"
import { SCALE, styleName, type Size } from "../typography"

/** Finds a frame by name on a page (or creates it) and empties it for a rebuild. */
export function docFrame(page: PageNode, name: string): FrameNode {
  let frame = page.children.find((n): n is FrameNode => n.type === "FRAME" && n.name === name)
  if (frame) for (const child of [...frame.children]) child.remove()
  else {
    frame = figma.createFrame()
    page.appendChild(frame)
    frame.name = name
  }
  return frame
}

/**
 * One component per Lucide icon ("Icon/<name>") in an "Icons" frame on the
 * Foundations page. The kit's INSTANCE_SWAP properties offer these.
 */
export function ensureIcons(kit: Kit, page: PageNode) {
  let frame = page.children.find((n): n is FrameNode => n.type === "FRAME" && n.name === "Icons")
  if (!frame) {
    frame = figma.createFrame()
    page.appendChild(frame)
    frame.name = "Icons"
  }
  const b = new Builder(kit)
  b.style(frame, { gap: 4, p: 6, wrap: true, radius: "xl", fill: "card", stroke: "border" })
  frame.counterAxisSpacing = 16
  frame.primaryAxisSizingMode = "FIXED"
  frame.resize(1200, frame.height)
  frame.layoutSizingVertical = "HUG"

  const stroke = b.paint("foreground")
  for (const [name, svg] of Object.entries(LUCIDE)) {
    const componentName = `Icon/${name}`
    let component = frame.children.find(
      (n): n is ComponentNode =>
        n.type === "COMPONENT" && (n.name === componentName || n.getPluginData(KEY.id) === componentName),
    )
    if (component) for (const child of [...component.children]) child.remove()
    else {
      component = figma.createComponent()
      frame.appendChild(component)
    }
    component.name = componentName
    component.setPluginData(KEY.id, componentName)
    component.layoutMode = "NONE"
    component.resize(24, 24)
    component.fills = []
    component.clipsContent = false
    component.description = `Lucide "${name}". In React: <Icon name="…" /> or an icon prop (startIcon="${name}").`
    const drawn = figma.createNodeFromSvg(svg)
    for (const child of [...drawn.children]) {
      component.appendChild(child)
      if ("constraints" in child) child.constraints = { horizontal: "SCALE", vertical: "SCALE" }
      if ("strokes" in child) (child as VectorNode).strokes = [stroke]
    }
    drawn.remove()
    kit.icons.set(name, component)
  }
  return frame
}

/** Colour swatches, type specimens, spacing and radius scales. */
export async function foundationsDocs(kit: Kit, page: PageNode): Promise<SceneNode[]> {
  const b = new Builder(kit)
  const colors = docFrame(page, "Colors")
  b.style(colors, { dir: "V", gap: 6, p: 8, radius: "xl", fill: "card", stroke: "border" })
  const groups = new Map<string, Variable[]>()
  for (const [name, v] of kit.vars.byName) {
    if (v.resolvedType !== "COLOR") continue
    const group = name.startsWith("brand/")
      ? "Brand"
      : name.includes("preset-")
        ? "Preset"
        : name.includes("chart-")
          ? "Chart"
          : name.includes("sidebar") || name.includes("shell")
            ? "Shell"
            : "Semantic"
    groups.set(group, [...(groups.get(group) ?? []), v])
  }
  const lightMode = kit.vars.modes.get("Onu / Color")?.get("Light") ?? ""
  for (const [group, vars] of groups) {
    const grid = b.row(group, { gap: 4, wrap: true, wPx: 1200 })
    grid.counterAxisSpacing = 16
    for (const v of vars) {
      const value = v.valuesByMode[lightMode]
      const hex = value && typeof value === "object" && "r" in value ? rgbaToHex(value) : ""
      const swatch = b.frame("swatch", {
        hPx: 56,
        wPx: 132,
        radius: "lg",
        fill: v.name.replace(/^semantic\//, ""),
        stroke: "border",
      })
      b.add(grid, [
        b.col(v.name, { gap: 1, wPx: 132 }, [
          swatch,
          b.text(v.name.split("/").pop()!, { size: "xs", weight: "Medium", fillW: true }),
          b.text(hex, { size: "xs", color: "muted-foreground", script: "Mono", fillW: true }),
        ]),
      ])
    }
    b.add(colors, [b.text(group, { size: "lg", weight: "Semibold" }), grid])
  }

  const type = docFrame(page, "Typography")
  b.style(type, { dir: "V", gap: 4, p: 8, radius: "xl", fill: "card", stroke: "border" })
  for (const size of Object.keys(SCALE) as Size[]) {
    const s = SCALE[size]
    b.add(type, [
      b.row(size, { gap: 6, cross: "baseline" }, [
        b.text(`${styleName("UI", size, "Regular")} · ${s.size}/${s.lineHeight}`, {
          size: "xs",
          color: "muted-foreground",
          script: "Mono",
        }),
        b.text("Onu admin panel", { size, script: "UI" }),
        b.text("ދިވެހި ބަސް", { size, script: "Thaana" }),
      ]),
    ])
  }
  b.add(type, [
    b.row("mono", { gap: 6 }, [
      b.text("Mono/sm", { size: "xs", color: "muted-foreground", script: "Mono" }),
      b.text("const onu = createTranslator(dv)", { script: "Mono" }),
    ]),
  ])
  for (const note of kit.fonts.notes) b.add(type, [b.text(note, { size: "xs", color: "warning" })])

  const spacing = docFrame(page, "Spacing & radius")
  b.style(spacing, { dir: "V", gap: 3, p: 8, radius: "xl", fill: "card", stroke: "border" })
  b.add(spacing, [
    b.text("Spacing (Onu / Density: switch the mode to Compact, Comfortable or Touch)", { weight: "Semibold" }),
  ])
  for (const step of [1, 2, 3, 4, 6, 8, 12, 16]) {
    const bar = b.rect(`spacing/${step}`, { w: step * 4, h: 12, fill: "primary-3", radius: "sm" })
    bar.setBoundVariable("width", variable(kit, `spacing/${step}`))
    b.add(spacing, [
      b.row(`spacing-${step}`, { gap: 3, cross: "center" }, [
        b.text(`spacing/${step}`, { size: "xs", script: "Mono", color: "muted-foreground" }),
        bar,
      ]),
    ])
  }
  const radii = b.row("radius", { gap: 4, pt: 4 })
  for (const r of ["sm", "md", "lg", "xl", "2xl", "4xl"] as const) {
    b.add(radii, [
      b.col(r, { gap: 1, cross: "center" }, [
        b.frame(`radius/${r}`, { hPx: 48, wPx: 48, radius: r, fill: "primary-1", stroke: "primary-3" }),
        b.text(`radius/${r}`, { size: "xs", script: "Mono", color: "muted-foreground" }),
      ]),
    ])
  }
  b.add(spacing, [radii])
  await Promise.all(kit.pending.splice(0))
  return [colors, type, spacing]
}

/** The cover page frame. */
export async function cover(kit: Kit, page: PageNode, version: string) {
  const b = new Builder(kit)
  const frame = docFrame(page, "Cover")
  b.style(frame, { dir: "V", wPx: 1440, hPx: 960, p: 24, gap: 6, align: "end", fill: "primary" })
  b.add(frame, [
    b.text("Onu", { size: "4xl", weight: "Bold", color: "primary-foreground", script: "UI" }),
    b.text("Javaabu's React UI kit: shadcn/ui based, RTL and Dhivehi first.", {
      size: "2xl",
      color: "primary-foreground",
      script: "UI",
    }),
    b.text("ދިވެހި ބަހާއި ކަނާތުން ވާތަށް ލިޔުމަށް ތައްޔާރުކޮށްފައި", {
      size: "2xl",
      color: "primary-foreground",
      script: "Thaana",
    }),
    b.text(`@javaabu/onu ${version} · generated from tokens.json by the Onu kit plugin`, {
      color: "primary-foreground",
      opacity: 0.8,
      script: "Mono",
    }),
  ])
  await Promise.all(kit.pending.splice(0))
  try {
    await figma.setFileThumbnailNodeAsync(frame)
  } catch {
    // Not fatal: the thumbnail can be set by hand.
  }
  return frame
}
