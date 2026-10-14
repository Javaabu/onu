import { Builder, KEY, parseVariantName, variantName, type Dir, type Kit, type PropDef, type Variant } from "./core"

export type PageName = "Foundations" | "Inputs" | "Display" | "Navigation" | "Overlays" | "Data"

/** A kit component: a Figma component set mirroring one React component. */
export interface KitComponent {
  /** Figma name; also the key for instances (`builder.instance(name)`). */
  name: string
  page: PageName
  /** Key in figma/components.json this component maps to (for Code Connect). */
  key?: string
  /** React usage, shown as the component description in Figma. */
  description: string
  /** Variant properties: names and values exactly as the React props / cva variants. */
  variants: Record<string, string[]>
  /** Keeps a subset of the full variant grid (e.g. RTL only at the default size). */
  filter?: (v: Variant) => boolean
  /** TEXT / BOOLEAN / INSTANCE_SWAP properties (INSTANCE_SWAP defaults name a Lucide icon). */
  props?: Record<string, PropDef>
  /** Width of the set's wrapping grid. */
  width?: number
  /** Draws one variant into `root` (a cleared ComponentNode). */
  build: (root: ComponentNode, v: Variant, b: Builder) => void
}

export function combos(variants: Record<string, string[]>, filter?: (v: Variant) => boolean): Variant[] {
  let result: Variant[] = [{}]
  for (const [prop, values] of Object.entries(variants))
    result = result.flatMap((v) => values.map((value) => ({ ...v, [prop]: value })))
  return filter ? result.filter(filter) : result
}

const BINDABLE = new Set<string>([
  "height",
  "width",
  "itemSpacing",
  "paddingLeft",
  "paddingRight",
  "paddingTop",
  "paddingBottom",
  "topLeftRadius",
  "topRightRadius",
  "bottomLeftRadius",
  "bottomRightRadius",
  "minWidth",
  "maxWidth",
  "minHeight",
  "maxHeight",
  "counterAxisSpacing",
  "opacity",
])

/** Empties a component for a rebuild: children, and variable bindings from the previous run. */
function clear(node: ComponentNode) {
  for (const child of [...node.children]) child.remove()
  for (const field of Object.keys(node.boundVariables ?? {}))
    if (BINDABLE.has(field)) node.setBoundVariable(field as VariableBindableNodeField, null)
}

/** Layers of a component (not inside nested instances) that the kit marked for a component property. */
function markedLayers(root: BaseNode & ChildrenMixin): SceneNode[] {
  const found: SceneNode[] = []
  const visit = (node: SceneNode) => {
    if (node.getPluginData(KEY.text) || node.getPluginData(KEY.visible) || node.getPluginData(KEY.swap))
      found.push(node)
    if (node.type !== "INSTANCE" && "children" in node) node.children.forEach(visit)
  }
  root.children.forEach(visit)
  return found
}

/**
 * Creates or updates a component set on `page`. Existing sets and variants are
 * matched by plugin data / name and rebuilt in place, so node ids (and the
 * instances, Code Connect links and library references that use them) survive
 * re-runs.
 */
export async function ensureComponentSet(kit: Kit, page: PageNode, def: KitComponent): Promise<ComponentSetNode> {
  const wanted = combos(def.variants, def.filter)
  let set = page.children.find(
    (n): n is ComponentSetNode =>
      n.type === "COMPONENT_SET" && (n.getPluginData(KEY.id) === def.name || n.name === def.name),
  )
  const existing = new Map<string, ComponentNode>()
  if (set) for (const c of set.children) if (c.type === "COMPONENT") existing.set(normalise(c.name), c)

  const built: ComponentNode[] = []
  for (const v of wanted) {
    const name = variantName(v)
    let component = existing.get(normalise(name))
    if (component) {
      existing.delete(normalise(name))
      clear(component)
    } else {
      component = figma.createComponent()
      page.appendChild(component)
    }
    component.name = name
    const b = new Builder(kit, (v.dir as Dir | undefined) ?? "ltr")
    b.style(component)
    def.build(component, v, b)
    built.push(component)
  }
  await Promise.all(kit.pending.splice(0))

  if (!set) {
    set = figma.combineAsVariants(built, page)
  } else {
    for (const stale of existing.values()) stale.remove()
    built.forEach((c, i) => {
      if (c.parent !== set) set!.appendChild(c)
      set!.insertChild(i, c)
    })
  }
  set.name = def.name
  set.setPluginData(KEY.id, def.name)
  set.description = def.description
  layoutSet(set, def.width ?? 1200)
  bindProperties(kit, set, def.props ?? {})
  kit.components.set(def.name, set)
  return set
}

/** Variant names are compared without spaces and in property order. */
function normalise(name: string) {
  const v = parseVariantName(name)
  return Object.keys(v)
    .sort()
    .map((k) => `${k}=${v[k]}`)
    .join(",")
}

function layoutSet(set: ComponentSetNode, width: number) {
  set.layoutMode = "HORIZONTAL"
  set.layoutWrap = "WRAP"
  set.primaryAxisSizingMode = "FIXED"
  set.counterAxisSizingMode = "AUTO"
  set.itemSpacing = 24
  set.counterAxisSpacing = 24
  set.paddingLeft = set.paddingRight = set.paddingTop = set.paddingBottom = 32
  set.counterAxisAlignItems = "MIN"
  set.resize(width, Math.max(set.height, 100))
  set.fills = []
  set.strokes = [{ type: "SOLID", color: { r: 0.592, g: 0.278, b: 1 } }]
  set.strokeWeight = 1
  set.dashPattern = [10, 5]
  set.cornerRadius = 8
}

/**
 * Adds (or updates) the set's TEXT / BOOLEAN / INSTANCE_SWAP properties by name,
 * removes ones the kit no longer defines, and points the marked layers of every
 * variant at them.
 */
export function bindProperties(kit: Kit, node: ComponentSetNode | ComponentNode, props: Record<string, PropDef>) {
  const keyOf = (name: string) =>
    Object.keys(node.componentPropertyDefinitions).find(
      (k) => k.split("#")[0] === name && node.componentPropertyDefinitions[k]!.type !== "VARIANT",
    )
  const iconPreferred = [...kit.icons.values()].map((c) => ({ type: "COMPONENT" as const, key: c.key }))

  for (const k of Object.keys(node.componentPropertyDefinitions)) {
    const def = node.componentPropertyDefinitions[k]!
    const name = k.split("#")[0]!
    if (def.type === "VARIANT") continue
    if (!props[name] || props[name]!.type !== def.type) node.deleteComponentProperty(k)
  }

  const keys = new Map<string, string>()
  for (const [name, prop] of Object.entries(props)) {
    const value =
      prop.type === "INSTANCE_SWAP" ? (kit.icons.get(prop.default) ?? [...kit.icons.values()][0]!).id : prop.default
    const existing = keyOf(name)
    if (existing) {
      keys.set(
        name,
        node.editComponentProperty(existing, {
          defaultValue: value,
          ...(prop.type === "INSTANCE_SWAP" ? { preferredValues: iconPreferred } : {}),
        }),
      )
    } else {
      keys.set(
        name,
        node.addComponentProperty(
          name,
          prop.type,
          value,
          prop.type === "INSTANCE_SWAP" ? { preferredValues: iconPreferred } : undefined,
        ),
      )
    }
  }

  for (const n of markedLayers(node)) {
    const refs: { characters?: string; visible?: string; mainComponent?: string } = {}
    const text = keys.get(n.getPluginData(KEY.text))
    const visible = keys.get(n.getPluginData(KEY.visible))
    const swap = keys.get(n.getPluginData(KEY.swap))
    if (text && n.type === "TEXT") refs.characters = text
    if (visible) refs.visible = visible
    if (swap && n.type === "INSTANCE") refs.mainComponent = swap
    if (Object.keys(refs).length) n.componentPropertyReferences = refs
  }
}

/** Creates or updates a plain (non-variant) component by name. */
export async function ensureComponent(
  kit: Kit,
  parent: PageNode | FrameNode,
  name: string,
  draw: (root: ComponentNode, b: Builder) => void,
  options: { dir?: Dir; description?: string; props?: Record<string, PropDef> } = {},
): Promise<ComponentNode> {
  let component = parent.children.find(
    (n): n is ComponentNode => n.type === "COMPONENT" && (n.getPluginData(KEY.id) === name || n.name === name),
  )
  if (component) clear(component)
  else {
    component = figma.createComponent()
    parent.appendChild(component)
  }
  component.name = name
  const b = new Builder(kit, options.dir ?? "ltr")
  b.style(component)
  draw(component, b)
  await Promise.all(kit.pending.splice(0))
  component.setPluginData(KEY.id, name)
  if (options.description) component.description = options.description
  if (options.props) bindProperties(kit, component, options.props)
  return component
}
