import { SPACING_STEPS, spacingName } from "../../shared/tokens.mjs"
import { styleName, type FontSet, type Script, type Size, type TextStyles, type Weight } from "./typography"
import type { VariableRegistry } from "./variables"

/** Plugin data keys the kit stores on its nodes. */
export const KEY = {
  id: "onu.id",
  text: "onu.prop.characters",
  visible: "onu.prop.visible",
  swap: "onu.prop.swap",
} as const

export type Variant = Record<string, string>
export type Dir = "ltr" | "rtl"

export type PropDef =
  | { type: "TEXT"; default: string; description?: string }
  | { type: "BOOLEAN"; default: boolean; description?: string }
  | { type: "INSTANCE_SWAP"; default: string; description?: string }

export interface Kit {
  vars: VariableRegistry
  fonts: FontSet
  styles: TextStyles
  /** Icon components by Lucide name. */
  icons: Map<string, ComponentNode>
  /** Built component sets / components by kit name. */
  components: Map<string, ComponentSetNode | ComponentNode>
  /** Promises (text style assignment) to await after a build pass. */
  pending: Promise<unknown>[]
  log: (message: string) => void
}

export type Color = string

const DIRECTIONAL: Record<string, string> = {
  "chevron-left": "chevron-right",
  "chevron-right": "chevron-left",
  "chevrons-left": "chevrons-right",
  "chevrons-right": "chevrons-left",
  "arrow-up-right": "arrow-up-left",
}

export function variable(kit: Kit, name: string): Variable {
  const v = kit.vars.byName.get(name)
  if (!v) throw new Error(`Missing variable ${name}`)
  return v
}

/** Short colour names: "primary" → brand/primary, "border" → semantic/border, "primary-5" → brand/primary-5. */
export function colorVar(kit: Kit, color: Color): Variable {
  if (color.includes("/")) return variable(kit, color)
  if (color === "primary" || color.startsWith("primary-")) return variable(kit, `brand/${color}`)
  return variable(kit, `semantic/${color}`)
}

export function paint(kit: Kit, color: Color, opacity = 1): SolidPaint {
  const base: SolidPaint = { type: "SOLID", color: { r: 0, g: 0, b: 0 }, opacity }
  return figma.variables.setBoundVariableForPaint(base, "color", colorVar(kit, color))
}

/** Binds a numeric field to spacing/<step> when the step is in the scale, else sets the raw default-density value. */
function setSpacing(kit: Kit, node: SceneNode, field: VariableBindableNodeField, step: number) {
  const n = node as FrameNode
  const px = step * 4
  ;(n as unknown as Record<string, number>)[field] = px
  if (SPACING_STEPS.includes(step)) n.setBoundVariable(field, variable(kit, spacingName(step)))
}

export type Radius = "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "4xl" | "full"

export interface BoxOptions {
  /** Auto-layout direction (default horizontal). */
  dir?: "H" | "V"
  /** Gap, in Tailwind spacing steps (bound to the density variables). */
  gap?: number
  /** Padding in spacing steps: all sides, x, y, or start/end/top/bottom (start/end follow the text direction). */
  p?: number
  px?: number
  py?: number
  ps?: number
  pe?: number
  pt?: number
  pb?: number
  /** Height / width in spacing steps (bound) or pixels (h/w in px with hPx/wPx). */
  h?: number
  w?: number
  hPx?: number
  wPx?: number
  minW?: number
  fill?: Color
  fillOpacity?: number
  stroke?: Color
  strokeOpacity?: number
  strokeWidth?: number
  /** Only these sides get a stroke. */
  sides?: Array<"top" | "bottom" | "start" | "end">
  dashed?: boolean
  radius?: Radius
  align?: "start" | "center" | "end" | "between"
  cross?: "start" | "center" | "end" | "baseline"
  /** Stretch to the parent's width/height (auto-layout FILL). */
  grow?: boolean
  fillW?: boolean
  fillH?: boolean
  opacity?: number
  shadow?: "popup" | "sm" | "focus" | "focus-destructive"
  clip?: boolean
  wrap?: boolean
}

const pendingSizing = new WeakMap<SceneNode, { fillW?: boolean; fillH?: boolean; grow?: boolean }>()

/** Draws Onu components with the kit's variables, text styles and icons, in one text direction. */
export class Builder {
  constructor(
    readonly kit: Kit,
    readonly dir: Dir = "ltr",
  ) {}

  get rtl() {
    return this.dir === "rtl"
  }

  /** Applies auto layout, padding, fills, strokes and radius to a frame or component. */
  style<T extends FrameNode | ComponentNode | InstanceNode>(node: T, o: BoxOptions = {}): T {
    const kit = this.kit
    if (node.type !== "INSTANCE") {
      node.layoutMode = o.dir === "V" ? "VERTICAL" : "HORIZONTAL"
      // Wrapping only applies to horizontal auto layout.
      if (o.dir !== "V") node.layoutWrap = o.wrap ? "WRAP" : "NO_WRAP"
      node.primaryAxisSizingMode = "AUTO"
      node.counterAxisSizingMode = "AUTO"
      node.itemSpacing = 0
      node.paddingLeft = node.paddingRight = node.paddingTop = node.paddingBottom = 0
      node.primaryAxisAlignItems =
        o.align === "center" ? "CENTER" : o.align === "end" ? "MAX" : o.align === "between" ? "SPACE_BETWEEN" : "MIN"
      node.counterAxisAlignItems =
        o.cross === "center" ? "CENTER" : o.cross === "end" ? "MAX" : o.cross === "baseline" ? "BASELINE" : "MIN"
      node.clipsContent = o.clip ?? false
      node.fills = []
      node.strokes = []
      node.effects = []
      if (o.gap !== undefined) setSpacing(kit, node, "itemSpacing", o.gap)
      const start = o.ps ?? o.px ?? o.p
      const end = o.pe ?? o.px ?? o.p
      const top = o.pt ?? o.py ?? o.p
      const bottom = o.pb ?? o.py ?? o.p
      if (start !== undefined) setSpacing(kit, node, this.rtl ? "paddingRight" : "paddingLeft", start)
      if (end !== undefined) setSpacing(kit, node, this.rtl ? "paddingLeft" : "paddingRight", end)
      if (top !== undefined) setSpacing(kit, node, "paddingTop", top)
      if (bottom !== undefined) setSpacing(kit, node, "paddingBottom", bottom)
    }
    if (o.fill) node.fills = [paint(kit, o.fill, o.fillOpacity ?? 1)]
    if (o.stroke) {
      node.strokes = [paint(kit, o.stroke, o.strokeOpacity ?? 1)]
      node.strokeAlign = "INSIDE"
      const w = o.strokeWidth ?? 1
      if (o.sides) {
        const has = (s: "top" | "bottom" | "start" | "end") => (o.sides!.includes(s) ? w : 0)
        node.strokeTopWeight = has("top")
        node.strokeBottomWeight = has("bottom")
        node.strokeLeftWeight = this.rtl ? has("end") : has("start")
        node.strokeRightWeight = this.rtl ? has("start") : has("end")
      } else node.strokeWeight = w
      node.dashPattern = o.dashed ? [4, 3] : []
    }
    if (o.radius) this.radius(node, o.radius)
    if (o.h !== undefined) {
      node.resize(node.width, o.h * 4)
      if (node.type !== "INSTANCE") node.layoutSizingVertical = "FIXED"
      if (SPACING_STEPS.includes(o.h)) node.setBoundVariable("height", variable(kit, spacingName(o.h)))
    }
    if (o.hPx !== undefined) {
      node.resize(node.width, o.hPx)
      if (node.type !== "INSTANCE") node.layoutSizingVertical = "FIXED"
    }
    if (o.w !== undefined) {
      node.resize(o.w * 4, node.height)
      if (node.type !== "INSTANCE") node.layoutSizingHorizontal = "FIXED"
      if (SPACING_STEPS.includes(o.w)) node.setBoundVariable("width", variable(kit, spacingName(o.w)))
    }
    if (o.wPx !== undefined) {
      node.resize(o.wPx, node.height)
      if (node.type !== "INSTANCE") node.layoutSizingHorizontal = "FIXED"
    }
    if (o.minW !== undefined) node.minWidth = o.minW
    if (o.opacity !== undefined) node.opacity = o.opacity
    if (o.shadow) node.effects = this.shadow(o.shadow)
    if (o.fillW || o.fillH || o.grow) pendingSizing.set(node, { fillW: o.fillW, fillH: o.fillH, grow: o.grow })
    return node
  }

  radius(node: FrameNode | ComponentNode | InstanceNode | RectangleNode, r: Radius) {
    if (r === "none") {
      node.cornerRadius = 0
      return
    }
    if (r === "full") {
      node.cornerRadius = 9999
      return
    }
    const v = variable(this.kit, `radius/${r}`)
    const value = v.valuesByMode[Object.keys(v.valuesByMode)[0]!]
    node.cornerRadius = typeof value === "number" ? value : 6
    for (const corner of ["topLeftRadius", "topRightRadius", "bottomLeftRadius", "bottomRightRadius"] as const)
      node.setBoundVariable(corner, v)
  }

  shadow(kind: NonNullable<BoxOptions["shadow"]>): Effect[] {
    const drop = (y: number, blur: number, spread: number, a: number): DropShadowEffect => ({
      type: "DROP_SHADOW",
      color: { r: 0, g: 0, b: 0, a },
      offset: { x: 0, y },
      radius: blur,
      spread,
      visible: true,
      blendMode: "NORMAL",
    })
    if (kind === "popup") return [drop(6, 16, 0, 0.08), drop(3, 6, -4, 0.12), drop(9, 28, 8, 0.05)]
    if (kind === "sm") return [drop(1, 2, 0, 0.05)]
    // Focus ring: ring-3 in the ring colour at 50% (Tailwind focus-visible:ring-3 ring-ring/50).
    const ring = kind === "focus-destructive" ? "destructive" : "primary"
    const v = colorVar(this.kit, ring)
    const effect: DropShadowEffect = { ...drop(0, 0, 3, 0.2), color: { r: 0, g: 0, b: 0, a: 0.2 } }
    return [figma.variables.setBoundVariableForEffect(effect, "color", v)]
  }

  /** A new auto-layout frame. */
  frame(name: string, o: BoxOptions = {}, children: SceneNode[] = []): FrameNode {
    const f = figma.createFrame()
    f.name = name
    this.style(f, o)
    this.add(f, children)
    return f
  }

  /** A horizontal row whose children run right-to-left in RTL. */
  row(name: string, o: BoxOptions = {}, children: SceneNode[] = []): FrameNode {
    return this.frame(name, { ...o, dir: "H" }, children)
  }

  col(name: string, o: BoxOptions = {}, children: SceneNode[] = []): FrameNode {
    return this.frame(name, { ...o, dir: "V" }, children)
  }

  /** Appends children (reversed in RTL for horizontal layouts) and applies their FILL sizing. */
  add(parent: FrameNode | ComponentNode, children: SceneNode[]) {
    const ordered = this.rtl && parent.layoutMode === "HORIZONTAL" ? [...children].reverse() : children
    for (const child of ordered) {
      parent.appendChild(child)
      const sizing = pendingSizing.get(child)
      if (!sizing) continue
      const c = child as FrameNode
      const horizontal = parent.layoutMode === "HORIZONTAL"
      if (sizing.fillW) c.layoutSizingHorizontal = "FILL"
      if (sizing.fillH) c.layoutSizingVertical = "FILL"
      if (sizing.grow) {
        if (horizontal) c.layoutSizingHorizontal = "FILL"
        else c.layoutSizingVertical = "FILL"
      }
      pendingSizing.delete(child)
    }
    return parent
  }

  /** Text in an Onu text style (Thaana styles in RTL). `prop` exposes it as a TEXT component property. */
  text(
    characters: string,
    o: {
      size?: Size
      weight?: Weight
      color?: Color
      opacity?: number
      prop?: string
      name?: string
      fillW?: boolean
      script?: Script
      align?: "start" | "center" | "end"
      underline?: boolean
      visibleProp?: string
    } = {},
  ): TextNode {
    const kit = this.kit
    const script: Script = o.script ?? (this.rtl ? "Thaana" : "UI")
    const size = o.size ?? "sm"
    const weight = o.weight ?? "Regular"
    const style = kit.styles.get(styleName(script, size, weight))
    const t = figma.createText()
    t.name = o.name ?? o.prop ?? characters.slice(0, 24)
    const fonts = script === "Thaana" ? kit.fonts.thaana : script === "Mono" ? kit.fonts.mono : kit.fonts.ui
    t.fontName = fonts[weight]
    t.characters = characters
    if (style) {
      t.fontSize = style.fontSize
      t.lineHeight = style.lineHeight
      kit.pending.push(t.setTextStyleIdAsync(style.id))
    }
    t.fills = [paint(kit, o.color ?? "foreground", o.opacity ?? 1)]
    if (o.underline) t.textDecoration = "UNDERLINE"
    const align = o.align ?? "start"
    // Start/end follow the text direction.
    t.textAlignHorizontal = align === "center" ? "CENTER" : (align === "end") !== this.rtl ? "RIGHT" : "LEFT"
    t.textAutoResize = o.fillW ? "HEIGHT" : "WIDTH_AND_HEIGHT"
    if (o.fillW) pendingSizing.set(t, { fillW: true })
    // A TEXT property has one value for every variant, so only LTR layers use it; RTL
    // variants keep their Dhivehi sample copy and are edited directly.
    if (o.prop && !this.rtl) t.setPluginData(KEY.text, o.prop)
    if (o.visibleProp) t.setPluginData(KEY.visible, o.visibleProp)
    return t
  }

  /**
   * A Lucide icon instance, `size` px square, stroked in `color`. `prop` exposes it as
   * an INSTANCE_SWAP property; `visibleProp` ties its visibility to a BOOLEAN property.
   * Directional icons (chevrons) mirror in RTL.
   */
  icon(
    name: string,
    o: { size?: number; color?: Color; prop?: string; visibleProp?: string; visible?: boolean; layer?: string } = {},
  ): InstanceNode {
    const glyph = this.rtl && DIRECTIONAL[name] && this.kit.icons.has(DIRECTIONAL[name]!) ? DIRECTIONAL[name]! : name
    const component = this.kit.icons.get(glyph) ?? this.kit.icons.get("circle-question-mark")
    if (!component) throw new Error(`Missing icon ${name}`)
    const instance = component.createInstance()
    instance.name = o.layer ?? o.prop ?? "icon"
    const size = o.size ?? 16
    instance.rescale(size / 24)
    this.recolor(instance, o.color ?? "foreground")
    if (o.prop) instance.setPluginData(KEY.swap, o.prop)
    if (o.visibleProp) instance.setPluginData(KEY.visible, o.visibleProp)
    if (o.visible === false) instance.visible = false
    return instance
  }

  recolor(instance: InstanceNode, color: Color) {
    const p = paint(this.kit, color)
    for (const node of instance.findAll((n) => n.type === "VECTOR" || n.type === "ELLIPSE" || n.type === "RECTANGLE"))
      (node as VectorNode).strokes = [p]
  }

  rect(name: string, o: { w: number; h: number; fill?: Color; fillOpacity?: number; radius?: Radius; stroke?: Color }) {
    const r = figma.createRectangle()
    r.name = name
    r.resize(o.w, o.h)
    r.fills = o.fill ? [paint(this.kit, o.fill, o.fillOpacity ?? 1)] : []
    if (o.stroke) {
      r.strokes = [paint(this.kit, o.stroke)]
      r.strokeAlign = "INSIDE"
    }
    if (o.radius) this.radius(r, o.radius)
    return r
  }

  ellipse(name: string, o: { size: number; fill?: Color; stroke?: Color; strokeWidth?: number; arc?: boolean }) {
    const e = figma.createEllipse()
    e.name = name
    e.resize(o.size, o.size)
    e.fills = o.fill ? [paint(this.kit, o.fill)] : []
    if (o.stroke) {
      e.strokes = [paint(this.kit, o.stroke)]
      e.strokeWeight = o.strokeWidth ?? 1
      e.strokeAlign = "INSIDE"
    }
    if (o.arc) e.arcData = { startingAngle: 0, endingAngle: Math.PI * 1.5, innerRadius: 0.78 }
    return e
  }

  /** Marks a node's visibility as driven by a BOOLEAN component property. */
  toggled<T extends SceneNode>(node: T, prop: string, visible?: boolean): T {
    node.setPluginData(KEY.visible, prop)
    if (visible !== undefined) node.visible = visible
    return node
  }

  paint(color: Color, opacity = 1): SolidPaint {
    return paint(this.kit, color, opacity)
  }

  /** Component id of a Lucide icon, for INSTANCE_SWAP property values. */
  iconId(name: string): string {
    return (this.kit.icons.get(name) ?? [...this.kit.icons.values()][0]!).id
  }

  /** An instance of a kit component (set) with variant values and component properties. */
  instance(name: string, props: Record<string, string | boolean> = {}): InstanceNode {
    const instance = createInstance(this.kit, name, { dir: this.dir, ...props })
    instance.name = name
    // RTL variants do not use TEXT properties (see text()); set their layers directly.
    if (this.rtl)
      for (const [prop, value] of Object.entries(props)) {
        if (typeof value !== "string") continue
        const layer = instance.findOne((n) => n.type === "TEXT" && n.name === prop)
        if (layer && layer.type === "TEXT") layer.characters = value
      }
    return instance
  }
}

/** Finds the variant in a set that matches `props` best and instantiates it with the remaining properties. */
export function createInstance(kit: Kit, name: string, props: Record<string, string | boolean> = {}) {
  const node = kit.components.get(name)
  if (!node) throw new Error(`Component ${name} has not been built yet`)
  let component: ComponentNode
  if (node.type === "COMPONENT_SET") {
    const variantNames = Object.keys(node.componentPropertyDefinitions).filter(
      (k) => node.componentPropertyDefinitions[k]!.type === "VARIANT",
    )
    const wanted = Object.fromEntries(
      Object.entries(props).filter(([k, v]) => variantNames.includes(k) && typeof v === "string"),
    ) as Record<string, string>
    const children = node.children as ComponentNode[]
    const score = (c: ComponentNode) => {
      const values = parseVariantName(c.name)
      // The text direction outweighs any other single property.
      return Object.entries(wanted).reduce((s, [k, v]) => s + (values[k] === v ? (k === "dir" ? 2 : 1) : 0), 0)
    }
    component = children.reduce((best, c) => (score(c) > score(best) ? c : best), children[0]!)
  } else component = node
  const instance = component.createInstance()
  const others: Record<string, string | boolean> = {}
  const defs = instance.componentProperties
  for (const [prop, value] of Object.entries(props)) {
    const key = Object.keys(defs).find((k) => k === prop || k.split("#")[0] === prop)
    if (key && defs[key]!.type !== "VARIANT") others[key] = value
  }
  if (Object.keys(others).length) instance.setProperties(others)
  return instance
}

export function parseVariantName(name: string): Variant {
  return Object.fromEntries(
    name
      .split(",")
      .map((part) => part.split("=").map((s) => s.trim()))
      .filter((kv) => kv.length === 2) as [string, string][],
  )
}

export const variantName = (v: Variant) =>
  Object.entries(v)
    .map(([k, value]) => `${k}=${value}`)
    .join(", ")
