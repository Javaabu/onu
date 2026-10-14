/**
 * A small in-memory stand-in for the Figma Plugin API: enough of it for the Onu kit
 * generator, with the checks Figma itself makes where they catch real mistakes
 * (fonts loaded before editing text, FILL only inside auto layout, component
 * property references pointing at the containing component, variant lookups).
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

let nextId = 1
const newId = () => `${nextId++}:1`

type Defs = Record<string, { type: string; defaultValue: any; variantOptions?: string[]; preferredValues?: any[] }>

export class FakeNode {
  [key: string]: any
  id = newId()
  name = ""
  children: FakeNode[] = []
  parent: FakeNode | null = null
  visible = true
  layoutMode = "NONE"
  width = 100
  height = 100
  x = 0
  y = 0
  boundVariables: Record<string, any> = {}
  description = ""
  mainComponent: FakeNode | null = null
  overrides: Record<string, any> = {}
  private data = new Map<string, string>()
  private refs: Record<string, string> | null = null
  private defs: Defs = {}
  private sizingH = "FIXED"
  private sizingV = "FIXED"
  private chars = ""
  fontName: FontName = { family: "Inter", style: "Regular" }

  constructor(
    public type: string,
    private api: FakeFigma,
  ) {
    api.all.add(this)
  }

  get removed() {
    return !this.api.all.has(this)
  }

  setPluginData(key: string, value: string) {
    this.data.set(key, value)
  }
  getPluginData(key: string) {
    return this.data.get(key) ?? ""
  }

  appendChild(child: FakeNode) {
    this.insertChild(this.children.length, child)
  }
  insertChild(index: number, child: FakeNode) {
    if (this.type === "INSTANCE" || this.insideInstance()) throw new Error("Cannot add children to an instance")
    if (child.parent) child.parent.children.splice(child.parent.children.indexOf(child), 1)
    child.parent = this
    this.children.splice(Math.min(index, this.children.length), 0, child)
  }
  remove() {
    if (this.parent) this.parent.children.splice(this.parent.children.indexOf(this), 1)
    this.parent = null
    const drop = (n: FakeNode) => {
      this.api.all.delete(n)
      n.children.forEach(drop)
    }
    drop(this)
  }
  insideInstance(): boolean {
    let p = this.parent
    while (p) {
      if (p.type === "INSTANCE") return true
      p = p.parent
    }
    return false
  }
  findAll(fn: (n: FakeNode) => boolean = () => true): FakeNode[] {
    const out: FakeNode[] = []
    const walk = (n: FakeNode) =>
      n.children.forEach((c) => {
        if (fn(c)) out.push(c)
        walk(c)
      })
    walk(this)
    return out
  }
  findOne(fn: (n: FakeNode) => boolean) {
    return this.findAll(fn)[0] ?? null
  }
  findChild(fn: (n: FakeNode) => boolean) {
    return this.children.find(fn) ?? null
  }
  async loadAsync() {}

  resize(w: number, h: number) {
    this.width = w
    this.height = h
  }
  rescale(scale: number) {
    this.width *= scale
    this.height *= scale
  }
  setBoundVariable(field: string, variable: any) {
    if (variable === null) delete this.boundVariables[field]
    else this.boundVariables[field] = { type: "VARIABLE_ALIAS", id: variable.id }
  }
  setExplicitVariableModeForCollection(collection: any, modeId: string) {
    this.explicitVariableModes = { ...(this.explicitVariableModes ?? {}), [collection.id]: modeId }
  }

  // Auto-layout sizing: FILL needs an auto-layout parent, HUG an auto-layout frame or text.
  get layoutSizingHorizontal() {
    return this.sizingH
  }
  set layoutSizingHorizontal(value: string) {
    this.checkSizing(value)
    this.sizingH = value
  }
  get layoutSizingVertical() {
    return this.sizingV
  }
  set layoutSizingVertical(value: string) {
    this.checkSizing(value)
    this.sizingV = value
  }
  private checkSizing(value: string) {
    if (value === "FILL" && (!this.parent || !this.parent.layoutMode || this.parent.layoutMode === "NONE"))
      throw new Error(`FILL on "${this.name}" outside auto layout`)
    if (value === "HUG" && this.type !== "TEXT" && this.layoutMode === "NONE")
      throw new Error(`HUG on "${this.name}" without auto layout`)
  }

  // Text: like Figma, characters can only change once the node's font is loaded.
  get characters() {
    return this.chars
  }
  set characters(value: string) {
    if (this.type !== "TEXT") throw new Error("characters on a non-text node")
    if (!this.api.loaded.has(`${this.fontName.family}/${this.fontName.style}`))
      throw new Error(`Font ${this.fontName.family} ${this.fontName.style} not loaded`)
    this.chars = value
  }
  async setTextStyleIdAsync(id: string) {
    if (!this.api.styles.some((s) => s.id === id)) throw new Error(`Unknown text style ${id}`)
    this.textStyleId = id
  }

  // Component properties.
  get componentPropertyDefinitions(): Defs {
    if (this.type === "COMPONENT" && this.parent?.type === "COMPONENT_SET")
      throw new Error("Read componentPropertyDefinitions on the component set")
    const defs: Defs = { ...this.defs }
    if (this.type === "COMPONENT_SET") {
      const options: Record<string, string[]> = {}
      for (const c of this.children)
        for (const part of c.name.split(",")) {
          const [k, v] = part.split("=").map((s) => s.trim())
          if (!k || v === undefined) continue
          options[k] = options[k] ?? []
          if (!options[k]!.includes(v)) options[k]!.push(v)
        }
      for (const [k, values] of Object.entries(options))
        defs[k] = { type: "VARIANT", defaultValue: values[0], variantOptions: values }
    }
    return defs
  }
  addComponentProperty(name: string, type: string, defaultValue: any, options?: any) {
    if (this.type !== "COMPONENT" && this.type !== "COMPONENT_SET") throw new Error("Not a component")
    if (Object.keys(this.defs).some((k) => k.split("#")[0] === name)) throw new Error(`Duplicate property ${name}`)
    if (type === "INSTANCE_SWAP" && !this.api.byId(defaultValue)) throw new Error("Swap default must be a component id")
    const key = `${name}#${nextId++}:0`
    this.defs[key] = { type, defaultValue, preferredValues: options?.preferredValues }
    return key
  }
  editComponentProperty(key: string, value: { defaultValue?: any; preferredValues?: any[] }) {
    if (!this.defs[key]) throw new Error(`No property ${key}`)
    this.defs[key] = { ...this.defs[key]!, ...value }
    return key
  }
  deleteComponentProperty(key: string) {
    if (!this.defs[key]) throw new Error(`No property ${key}`)
    delete this.defs[key]
  }
  get componentPropertyReferences() {
    return this.refs
  }
  set componentPropertyReferences(refs: Record<string, string> | null) {
    if (this.insideInstance()) throw new Error("Cannot reference properties inside an instance")
    let owner = this.parent
    while (owner && owner.type !== "COMPONENT") owner = owner.parent
    if (!owner) throw new Error("Property reference outside a component")
    const defs = owner.parent?.type === "COMPONENT_SET" ? owner.parent.componentPropertyDefinitions : owner.defs
    for (const [field, key] of Object.entries(refs ?? {})) {
      const def = defs[key]
      if (!def) throw new Error(`Unknown property ${key} on ${owner.name}`)
      if (field === "characters" && (this.type !== "TEXT" || def.type !== "TEXT")) throw new Error("Bad TEXT reference")
      if (field === "visible" && def.type !== "BOOLEAN") throw new Error("Bad BOOLEAN reference")
      if (field === "mainComponent" && (this.type !== "INSTANCE" || def.type !== "INSTANCE_SWAP"))
        throw new Error("Bad INSTANCE_SWAP reference")
    }
    this.refs = refs
  }

  createInstance(): FakeNode {
    if (this.type !== "COMPONENT") throw new Error("createInstance on a non-component")
    const instance = new FakeNode("INSTANCE", this.api)
    instance.name = this.parent?.type === "COMPONENT_SET" ? this.parent.name : this.name
    instance.mainComponent = this
    instance.width = this.width
    instance.height = this.height
    instance.layoutMode = this.layoutMode
    for (const child of this.children) instance.children.push(cloneInto(child, instance, this.api))
    this.api.page().appendChild(instance)
    return instance
  }
  get componentProperties(): Record<string, { type: string; value: any }> {
    const main = this.mainComponent!
    const set = main.parent?.type === "COMPONENT_SET" ? main.parent : null
    const defs = set ? set.componentPropertyDefinitions : main.componentPropertyDefinitions
    const variant = Object.fromEntries(main.name.split(",").map((p) => p.split("=").map((s) => s.trim())))
    return Object.fromEntries(
      Object.entries(defs).map(([k, d]) => [
        k,
        { type: d.type, value: d.type === "VARIANT" ? variant[k] : (this.overrides[k] ?? d.defaultValue) },
      ]),
    )
  }
  setProperties(props: Record<string, any>) {
    const current = this.componentProperties
    const variantChange: Record<string, string> = {}
    for (const [k, v] of Object.entries(props)) {
      const def = current[k]
      if (!def) throw new Error(`Instance of ${this.name} has no property ${k}`)
      if (def.type === "VARIANT") variantChange[k] = v
      else {
        if (def.type === "BOOLEAN" && typeof v !== "boolean") throw new Error(`${k} expects a boolean`)
        if (def.type === "TEXT" && typeof v !== "string") throw new Error(`${k} expects a string`)
        if (def.type === "INSTANCE_SWAP" && !this.api.byId(v)) throw new Error(`${k} expects a component id`)
        this.overrides[k] = v
      }
    }
    if (Object.keys(variantChange).length) {
      const set = this.mainComponent!.parent!
      const wanted = Object.fromEntries(
        Object.entries(current)
          .filter(([, d]) => d.type === "VARIANT")
          .map(([k, d]) => [k, variantChange[k] ?? d.value]),
      )
      const match = set.children.find((c) => {
        const v = Object.fromEntries(c.name.split(",").map((p) => p.split("=").map((s) => s.trim())))
        return Object.entries(wanted).every(([k, value]) => v[k] === value)
      })
      if (!match) throw new Error(`No variant ${JSON.stringify(wanted)} in ${set.name}`)
      this.mainComponent = match
    }
  }
}

function cloneInto(node: FakeNode, parent: FakeNode, api: FakeFigma): FakeNode {
  const copy = new FakeNode(node.type, api)
  copy.name = node.name
  copy.parent = parent
  copy.layoutMode = node.layoutMode
  copy.mainComponent = node.mainComponent
  copy.fontName = node.fontName
  if (node.type === "TEXT") copy.characters = node.characters
  for (const child of node.children) copy.children.push(cloneInto(child, copy, api))
  return copy
}

export class FakeFigma {
  all = new Set<FakeNode>()
  loaded = new Set<string>()
  styles: any[] = []
  collections: any[] = []
  variablesList: any[] = []
  fonts: Font[]
  root: FakeNode
  currentPage: FakeNode
  fileKey: string | undefined = undefined
  mixed = Symbol("mixed")

  constructor(fonts: Array<[string, string]>) {
    this.fonts = fonts.map(([family, style]) => ({ fontName: { family, style } }))
    this.root = new FakeNode("DOCUMENT", this)
    this.root.name = "Claudius"
    const first = new FakeNode("PAGE", this)
    first.name = "Page 1"
    this.root.appendChild(first)
    this.currentPage = first
  }

  page() {
    return this.currentPage
  }
  byId(id: string) {
    return [...this.all].find((n) => n.id === id) ?? null
  }
  private create(type: string) {
    const node = new FakeNode(type, this)
    this.currentPage.appendChild(node)
    return node
  }

  createPage() {
    const page = new FakeNode("PAGE", this)
    this.root.appendChild(page)
    return page
  }
  createFrame() {
    return this.create("FRAME")
  }
  createComponent() {
    return this.create("COMPONENT")
  }
  createText() {
    return this.create("TEXT")
  }
  createRectangle() {
    return this.create("RECTANGLE")
  }
  createEllipse() {
    return this.create("ELLIPSE")
  }
  createVector() {
    return this.create("VECTOR")
  }
  createNodeFromSvg(svg: string) {
    if (!svg.startsWith("<svg")) throw new Error("Not an SVG")
    const frame = this.create("FRAME")
    const paths = svg.match(/<(path|circle|rect|line|polyline|ellipse)\b/g) ?? []
    for (const _ of paths) frame.appendChild(new FakeNode("VECTOR", this))
    return frame
  }
  combineAsVariants(nodes: FakeNode[], parent: FakeNode) {
    if (!nodes.length || nodes.some((n) => n.type !== "COMPONENT"))
      throw new Error("combineAsVariants needs components")
    const set = new FakeNode("COMPONENT_SET", this)
    parent.appendChild(set)
    for (const n of nodes) set.appendChild(n)
    return set
  }

  async listAvailableFontsAsync() {
    return this.fonts
  }
  async loadFontAsync(font: FontName) {
    if (!this.fonts.some((f) => f.fontName.family === font.family && f.fontName.style === font.style))
      throw new Error(`Font not available: ${font.family} ${font.style}`)
    this.loaded.add(`${font.family}/${font.style}`)
  }
  async getLocalTextStylesAsync() {
    return [...this.styles]
  }
  createTextStyle() {
    const style = { id: `S:${nextId++}`, name: "", type: "TEXT" }
    this.styles.push(style)
    return style
  }
  async setFileThumbnailNodeAsync() {}
  notify() {}
  closePlugin() {}

  /** Messages the plugin posted to its UI. */
  posted: any[] = []
  ui = {
    postMessage: (message: any) => this.posted.push(message),
    onmessage: null as null | ((message: any) => Promise<void> | void),
  }
  showUI() {}

  variables = {
    getLocalVariableCollectionsAsync: async () => [...this.collections],
    getLocalVariablesAsync: async () => [...this.variablesList],
    createVariableCollection: (name: string) => {
      const id = `VariableCollectionId:${nextId++}`
      const modeId = `${nextId++}:0`
      const collection: any = {
        id,
        name,
        modes: [{ modeId, name: "Mode 1" }],
        defaultModeId: modeId,
        variableIds: [] as string[],
        addMode: (modeName: string) => {
          const m = `${nextId++}:0`
          collection.modes.push({ modeId: m, name: modeName })
          return m
        },
        renameMode: (m: string, modeName: string) => {
          collection.modes.find((x: any) => x.modeId === m).name = modeName
        },
      }
      this.collections.push(collection)
      return collection
    },
    createVariable: (name: string, collection: any, resolvedType: string) => {
      if (typeof collection === "string") throw new Error("Pass the collection object (dynamic-page)")
      if (/[.{}]/.test(name)) throw new Error(`Invalid variable name ${name}`)
      if (this.variablesList.some((v) => v.name === name && v.variableCollectionId === collection.id))
        throw new Error(`Duplicate variable ${name}`)
      const variable: any = {
        id: `VariableID:${nextId++}`,
        name,
        resolvedType,
        variableCollectionId: collection.id,
        valuesByMode: {} as Record<string, unknown>,
        codeSyntax: {} as Record<string, string>,
        description: "",
        scopes: [],
        setValueForMode: (modeId: string, value: unknown) => {
          if (!collection.modes.some((m: any) => m.modeId === modeId)) throw new Error("Unknown mode")
          if (resolvedType === "FLOAT" && typeof value !== "number") throw new Error(`${name} expects a number`)
          if (resolvedType === "COLOR" && typeof value !== "object") throw new Error(`${name} expects a colour`)
          variable.valuesByMode[modeId] = value
        },
        setVariableCodeSyntax: (platform: string, value: string) => {
          variable.codeSyntax[platform] = value
        },
        remove: () => {
          this.variablesList.splice(this.variablesList.indexOf(variable), 1)
        },
      }
      collection.variableIds.push(variable.id)
      this.variablesList.push(variable)
      return variable
    },
    setBoundVariableForPaint: (p: any, field: string, variable: any) => ({
      ...p,
      boundVariables: { [field]: { type: "VARIABLE_ALIAS", id: variable.id } },
    }),
    setBoundVariableForEffect: (e: any, field: string, variable: any) => ({
      ...e,
      boundVariables: { [field]: { type: "VARIABLE_ALIAS", id: variable.id } },
    }),
  }
}

/** Installs a fresh fake `figma` global. */
export function installFigma(fonts: Array<[string, string]>) {
  const api = new FakeFigma(fonts)
  ;(globalThis as any).figma = api
  return api
}
