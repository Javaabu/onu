/**
 * Fonts and text styles. Onu's type scale (tokens.json, tailwind.css): 14px body
 * text with a 22px line height (Ant Design), Tailwind sizes elsewhere, headings on
 * Ant's 38/30/24/20/16 steps. Dhivehi (Thaana) text uses a 1.75 line height.
 */

export type Size = "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl"
export type Weight = "Regular" | "Medium" | "Semibold" | "Bold"
export type Script = "UI" | "Thaana" | "Mono"

export const SCALE: Record<Size, { size: number; lineHeight: number; css: string }> = {
  xs: { size: 12, lineHeight: 20, css: "text-xs" },
  sm: { size: 14, lineHeight: 22, css: "text-sm (body)" },
  base: { size: 16, lineHeight: 24, css: "text-base" },
  lg: { size: 18, lineHeight: 28, css: "text-lg" },
  xl: { size: 20, lineHeight: 28, css: "text-xl (h4)" },
  "2xl": { size: 24, lineHeight: 32, css: "text-2xl (h3)" },
  "3xl": { size: 30, lineHeight: 38, css: "text-3xl (h2)" },
  "4xl": { size: 38, lineHeight: 46, css: "text-4xl (h1)" },
}
const WEIGHTS: Weight[] = ["Regular", "Medium", "Semibold", "Bold"]
const MONO_SIZES: Size[] = ["xs", "sm", "base"]

/** The font family and style chosen for each script and weight. */
export interface FontSet {
  ui: Record<Weight, FontName>
  thaana: Record<Weight, FontName>
  mono: Record<Weight, FontName>
  /** Human-readable notes on fallbacks, shown in the plugin UI. */
  notes: string[]
}

const STYLE_ALIASES: Record<Weight, string[]> = {
  Regular: ["Regular", "Book", "Normal"],
  Medium: ["Medium", "Regular"],
  Semibold: ["Semi Bold", "SemiBold", "Semibold", "Bold", "Medium", "Regular"],
  Bold: ["Bold", "Semi Bold", "SemiBold", "Regular"],
}

async function tryLoad(font: FontName) {
  try {
    await figma.loadFontAsync(font)
    return true
  } catch {
    return false
  }
}

/**
 * Picks the first available family from each list (Figma's font list plus a
 * defensive figma.loadFontAsync), so a missing Faruma / MV Faseyha falls back to
 * Noto Sans Thaana and then Inter instead of failing. As in Onu's CSS, Dhivehi
 * text uses Faruma and semibold/bold Dhivehi (headings) uses MV Faseyha
 * (`--onu-font-thaana-bold`), since both have a single weight.
 */
export async function loadFonts(): Promise<FontSet> {
  let available: Font[] = []
  try {
    available = await figma.listAvailableFontsAsync()
  } catch {
    available = []
  }
  const notes: string[] = []
  const stylesOf = (family: string) =>
    new Set(available.filter((f) => f.fontName.family === family).map((f) => f.fontName.style))

  async function pick(families: string[], label: string): Promise<Record<Weight, FontName>> {
    for (const family of families) {
      const styles = stylesOf(family)
      // If Figma did not list fonts (or lists none for this family), still try Regular.
      const candidates = (w: Weight) => STYLE_ALIASES[w].filter((s) => styles.size === 0 || styles.has(s))
      const result = {} as Record<Weight, FontName>
      let ok = true
      for (const weight of WEIGHTS) {
        let chosen: FontName | null = null
        for (const style of candidates(weight)) {
          const font = { family, style }
          if (await tryLoad(font)) {
            chosen = font
            break
          }
        }
        if (!chosen) {
          ok = false
          break
        }
        result[weight] = chosen
      }
      if (ok) {
        if (family !== families[0]) notes.push(`${label}: ${families[0]} is not available, using ${family}.`)
        return result
      }
    }
    throw new Error(`${label}: none of ${families.join(", ")} could be loaded.`)
  }

  const ui = await pick(["Inter", "Roboto"], "UI font")
  const text = await pick(["Faruma", "MV Faseyha", "Noto Sans Thaana", "Inter"], "Thaana font")
  const headings = await pick(["MV Faseyha", "Faruma", "Noto Sans Thaana", "Inter"], "Thaana heading font")
  const thaana = { ...text, Semibold: headings.Semibold, Bold: headings.Bold }
  const mono = await pick(["JetBrains Mono", "Roboto Mono", "Inter"], "Mono font")
  return { ui, thaana, mono, notes }
}

export type TextStyles = Map<string, TextStyle>

export const styleName = (script: Script, size: Size, weight: Weight) =>
  script === "Mono" ? `Mono/${size}` : `${script}/${size}/${weight}`

/** Creates or updates the Onu text styles by name. */
export async function ensureTextStyles(fonts: FontSet): Promise<TextStyles> {
  const existing = await figma.getLocalTextStylesAsync()
  const styles: TextStyles = new Map()
  const upsert = (name: string, font: FontName, size: number, lineHeight: number, description: string) => {
    let style = existing.find((s) => s.name === name)
    if (!style) style = figma.createTextStyle()
    style.name = name
    style.fontName = font
    style.fontSize = size
    style.lineHeight = { unit: "PIXELS", value: lineHeight }
    style.letterSpacing = { unit: "PIXELS", value: 0 }
    style.description = description
    styles.set(name, style)
  }
  for (const [size, s] of Object.entries(SCALE) as [Size, (typeof SCALE)[Size]][]) {
    for (const weight of WEIGHTS) {
      upsert(
        styleName("UI", size, weight),
        fonts.ui[weight],
        s.size,
        s.lineHeight,
        `Inter, ${s.css}: ${s.size}/${s.lineHeight}`,
      )
      const thaanaLine = Math.round(s.size * 1.75)
      upsert(
        styleName("Thaana", size, weight),
        fonts.thaana[weight],
        s.size,
        thaanaLine,
        `${fonts.thaana[weight].family} (Dhivehi), ${s.css}: ${s.size}/${thaanaLine} (line height 1.75)`,
      )
    }
  }
  for (const size of MONO_SIZES) {
    const s = SCALE[size]
    upsert(styleName("Mono", size, "Regular"), fonts.mono.Regular, s.size, s.lineHeight, `JetBrains Mono, ${s.css}`)
  }
  return styles
}
