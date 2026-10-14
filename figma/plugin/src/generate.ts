import type { DesignTokens } from "../../shared/tokens.mjs"
import { ensureComponentSet, type KitComponent, type PageName } from "./components"
import type { Kit } from "./core"
import { DATA } from "./kit/data"
import { DISPLAY } from "./kit/display"
import { cover, ensureIcons, foundationsDocs } from "./kit/foundations"
import { INPUTS } from "./kit/inputs"
import { NAVIGATION } from "./kit/navigation"
import { OVERLAYS } from "./kit/overlays"
import { samples } from "./kit/samples"
import { ensureTextStyles, loadFonts } from "./typography"
import { ensureVariables } from "./variables"

/** The Onu Figma file ("Claudius"). figma.fileKey is used when the plugin can read it. */
export const DEFAULT_FILE_KEY = "hilfEQCV33vZNet92CWRJp"
export const DEFAULT_FILE_NAME = "Claudius"

export const PAGES = ["Cover", "Foundations", "Inputs", "Display", "Navigation", "Overlays", "Data", "Samples"] as const

/** Every kit component, in build order (later ones use instances of earlier ones). */
export const KIT: KitComponent[] = [...INPUTS, ...DISPLAY, ...NAVIGATION, ...OVERLAYS, ...DATA]

export interface GenerateOptions {
  /** Brand colour override (oklch() or hex); defaults to tokens.json brand.primary. */
  primary?: string
  /** Build the sample frames (default true). */
  samples?: boolean
  /** The Onu package version shown on the cover. */
  version?: string
}

export interface GenerateResult {
  fileKey: string
  /** components.json key → node id. */
  nodeIds: Record<string, string>
  /** components.json key → Figma URL (for `figmaUrl`). */
  figmaUrls: Record<string, string>
  /** Kit component name → node id (every set, including helper sets without a components.json key). */
  components: Record<string, string>
  stats: {
    variablesCreated: number
    variablesUpdated: number
    textStyles: number
    componentSets: number
    variants: number
  }
  notes: string[]
}

export function nodeUrl(fileKey: string, nodeId: string, fileName = DEFAULT_FILE_NAME) {
  return `https://www.figma.com/design/${fileKey}/${encodeURIComponent(fileName)}?node-id=${nodeId.replace(/:/g, "-")}`
}

async function ensurePage(name: string): Promise<PageNode> {
  let page = figma.root.children.find((p) => p.name === name)
  if (!page) {
    page = figma.createPage()
    page.name = name
  }
  await page.loadAsync()
  return page
}

/** Stacks a page's top-level nodes in one column. */
function stack(nodes: SceneNode[], gap = 96) {
  let y = 0
  for (const node of nodes) {
    node.x = 0
    node.y = y
    y += node.height + gap
  }
}

/**
 * Generates (or updates) the Onu kit in the current file: variables, text styles,
 * icons, component sets on per-category pages, a cover and sample frames. Safe to
 * re-run: everything is matched by name and updated in place.
 */
export async function generateKit(
  tokens: DesignTokens,
  options: GenerateOptions = {},
  log: (message: string) => void = () => {},
): Promise<GenerateResult> {
  log("Variables…")
  const vars = await ensureVariables(tokens, { primary: options.primary })
  log(`Variables: ${vars.created} created, ${vars.updated} updated.`)

  log("Fonts and text styles…")
  const fonts = await loadFonts()
  const styles = await ensureTextStyles(fonts)
  fonts.notes.forEach(log)

  const kit: Kit = { vars, fonts, styles, icons: new Map(), components: new Map(), pending: [], log }
  const pages = new Map<string, PageNode>()
  for (const name of PAGES) pages.set(name, await ensurePage(name))

  log("Icons and foundations…")
  const foundations = pages.get("Foundations")!
  const icons = ensureIcons(kit, foundations)
  const docs = await foundationsDocs(kit, foundations)
  stack([...docs, icons])
  await cover(kit, pages.get("Cover")!, options.version ?? "")

  let variants = 0
  const byPage = new Map<PageName, ComponentSetNode[]>()
  for (const def of KIT) {
    log(`${def.page} / ${def.name}…`)
    const set = await ensureComponentSet(kit, pages.get(def.page)!, def)
    variants += set.children.length
    byPage.set(def.page, [...(byPage.get(def.page) ?? []), set])
  }
  for (const sets of byPage.values()) stack(sets)

  if (options.samples !== false) {
    log("Sample frames…")
    const frames = await samples(kit, pages.get("Samples")!)
    let x = 0
    for (const frame of frames) {
      frame.x = x
      frame.y = 0
      x += frame.width + 160
    }
  }

  const fileKey = figma.fileKey ?? DEFAULT_FILE_KEY
  const nodeIds: Record<string, string> = {}
  const figmaUrls: Record<string, string> = {}
  const components: Record<string, string> = {}
  for (const def of KIT) {
    const node = kit.components.get(def.name)!
    components[def.name] = node.id
    if (def.key) {
      nodeIds[def.key] = node.id
      figmaUrls[def.key] = nodeUrl(fileKey, node.id, figma.root.name || DEFAULT_FILE_NAME)
    }
  }
  log("Done.")
  return {
    fileKey,
    nodeIds,
    figmaUrls,
    components,
    stats: {
      variablesCreated: vars.created,
      variablesUpdated: vars.updated,
      textStyles: styles.size,
      componentSets: KIT.length,
      variants,
    },
    notes: fonts.notes,
  }
}
