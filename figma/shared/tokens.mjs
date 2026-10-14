/**
 * Shared by figma/sync-variables.mjs (REST API) and the "Onu kit" plugin
 * (figma/plugin): colour conversion and the variable collections built from
 * tokens.json, so both paths create the same names, values and code syntax.
 * Types: tokens.d.mts.
 */

const clamp01 = (x) => Math.min(1, Math.max(0, x))

/** Parses `oklch(L C H [/ A])` or `#rgb[a]` / `#rrggbb[aa]` into OKLab + alpha. */
export function parseColor(value) {
  const str = String(value).trim()
  const m = /^oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+)(%?))?\s*\)$/.exec(str)
  if (m) {
    const L = Number(m[1]) / (m[2] ? 100 : 1)
    const C = Number(m[3])
    const H = (Number(m[4]) * Math.PI) / 180
    const alpha = m[5] === undefined ? 1 : Number(m[5]) / (m[6] ? 100 : 1)
    return { L, a: C * Math.cos(H), b: C * Math.sin(H), alpha }
  }
  const hex = /^#([\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/i.exec(str)
  if (hex) {
    let h = hex[1]
    if (h.length <= 4) h = [...h].map((c) => c + c).join("")
    const n = (i) => parseInt(h.slice(i, i + 2), 16) / 255
    return srgbToOklab({ r: n(0), g: n(2), b: n(4), a: h.length === 8 ? n(6) : 1 })
  }
  throw new Error(`Unsupported colour: ${value}`)
}

const toLinear = (x) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4)
const toGamma = (x) => (x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055)

/** sRGB (0–1) → OKLab. */
export function srgbToOklab({ r, g, b, a = 1 }) {
  const [lr, lg, lb] = [r, g, b].map(toLinear)
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb)
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb)
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb)
  return {
    L: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    a: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    b: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
    alpha: a,
  }
}

/** OKLab → Figma RGBA (0–1, clipped to sRGB). */
export function oklabToRgba({ L, a, b, alpha = 1 }) {
  const l_ = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m_ = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s_ = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
  const lin = [
    4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
    -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
    -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_,
  ]
  const [r, g, bl] = lin.map((x) => clamp01(toGamma(x)))
  return { r, g, b: bl, a: alpha }
}

/** oklch(L C H [/ A]) (or a hex colour) → Figma RGBA (0–1). */
export function oklchToRgba(value) {
  return oklabToRgba(parseColor(value))
}

/** CSS `color-mix(in oklab, x p%, y)`. */
export function mixOklab(x, y, p) {
  const q = 1 - p
  return { L: x.L * p + y.L * q, a: x.a * p + y.a * q, b: x.b * p + y.b * q, alpha: x.alpha * p + y.alpha * q }
}

/** Figma RGBA → `#rrggbb`. */
export function rgbaToHex({ r, g, b }) {
  return `#${[r, g, b]
    .map((x) =>
      Math.round(clamp01(x) * 255)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`
}

const BLACK = { L: 0, a: 0, b: 0, alpha: 1 }
const WHITE = { L: 1, a: 0, b: 0, alpha: 1 }

/**
 * The primary steps theme.css derives from the brand colour (color-mix in oklab),
 * for one mode. Figma variables cannot mix colours, so the plugin stores the
 * results; re-run the plugin after changing the brand colour.
 */
export function primaryScale(primaryValue, backgroundValue, mode) {
  const brand = parseColor(primaryValue)
  const bg = parseColor(backgroundValue)
  const dark = mode === "Dark"
  // Dark: oklch(from primary max(l, 0.72) c h).
  const p = dark ? { ...brand, L: Math.max(brand.L, 0.72) } : brand
  const fg = p.L < 0.68 ? parseColor("oklch(0.985 0 0)") : BLACK
  const steps = dark
    ? [mixOklab(p, bg, 0.16), mixOklab(p, bg, 0.26), mixOklab(p, bg, 0.42), mixOklab(p, bg, 0.6), mixOklab(p, bg, 0.8)]
    : [mixOklab(p, bg, 0.1), mixOklab(p, bg, 0.22), mixOklab(p, bg, 0.4), mixOklab(p, bg, 0.6), mixOklab(p, bg, 0.8)]
  const seven = dark ? mixOklab(p, WHITE, 0.8) : mixOklab(p, BLACK, 0.86)
  const eight = dark ? mixOklab(p, WHITE, 0.62) : mixOklab(p, BLACK, 0.7)
  return {
    primary: p,
    "primary-foreground": fg,
    "primary-hover": dark ? mixOklab(p, WHITE, 0.9) : mixOklab(p, BLACK, 0.9),
    "primary-active": dark ? mixOklab(p, WHITE, 0.82) : seven,
    "primary-1": steps[0],
    "primary-2": steps[1],
    "primary-3": steps[2],
    "primary-4": steps[3],
    "primary-5": steps[4],
    "primary-6": p,
    "primary-7": seven,
    "primary-8": eight,
  }
}

const rem = (v) => Number(String(v).replace("rem", "")) * 16
const px = (v) => (String(v).endsWith("rem") ? rem(v) : Number(String(v).replace("px", "")))

/** Tailwind spacing steps the kit binds paddings, gaps and heights to (× the density unit). */
export const SPACING_STEPS = [0.5, 1, 1.5, 2, 2.5, 2.75, 3, 3.5, 3.75, 4, 5, 6, 7, 8, 9, 10, 11, 12, 16]
/** Figma variable names cannot contain ".", so 3.75 becomes "spacing/3_75". */
export const spacingName = (step) => `spacing/${String(step).replace(".", "_")}`

/** Tailwind radius scale relative to --radius (tailwind.css). */
export const RADIUS_SCALE = { sm: 0.6667, md: 0.8, lg: 1, xl: 1.3333, "2xl": 1.8, "3xl": 2.2, "4xl": 2.6 }

export const DENSITY_MODES = ["Default", "Compact", "Comfortable", "Touch"]

/**
 * The variable collections built from tokens.json:
 *   - "Onu / Color"   Light, Dark: brand/primary (+ derived brand/primary-* steps) and semantic/*
 *   - "Onu / Density" Default, Compact, Comfortable, Touch: spacing/unit and spacing/<step>
 *   - "Onu / Shape"   Default: radius/*, size/*
 * `options.primary` overrides the brand colour (oklch() or hex).
 */
export function buildCollections(tokens, options = {}) {
  const primary = options.primary || tokens.brand.primary.$value
  const light = primaryScale(primary, tokens.color.light.background.$value, "Light")
  const dark = primaryScale(primary, tokens.color.dark.background.$value, "Dark")

  const color = { name: "Onu / Color", modes: ["Light", "Dark"], variables: [] }
  color.variables.push({
    name: "brand/primary",
    type: "COLOR",
    values: { Light: oklabToRgba(light.primary), Dark: oklabToRgba(dark.primary) },
    codeSyntax: { WEB: "var(--onu-primary)" },
    description: tokens.brand.primary.$description,
  })
  for (const key of Object.keys(light)) {
    if (key === "primary") continue
    color.variables.push({
      name: `brand/${key}`,
      type: "COLOR",
      values: { Light: oklabToRgba(light[key]), Dark: oklabToRgba(dark[key]) },
      codeSyntax: { WEB: `var(--${key})` },
      description: "Derived from brand/primary as in theme.css (re-run the Onu kit plugin after changing the brand).",
    })
  }
  for (const name of Object.keys(tokens.color.light)) {
    const t = tokens.color.light[name]
    color.variables.push({
      name: `semantic/${name}`,
      type: "COLOR",
      values: { Light: oklchToRgba(t.$value), Dark: oklchToRgba(tokens.color.dark[name].$value) },
      codeSyntax: { WEB: `var(--${name})` },
      description: t.$description,
    })
  }

  const density = { name: "Onu / Density", modes: DENSITY_MODES, variables: [] }
  const unit = Object.fromEntries(DENSITY_MODES.map((mode) => [mode, rem(tokens.density[mode.toLowerCase()].$value)]))
  density.variables.push({
    name: "spacing/unit",
    type: "FLOAT",
    values: unit,
    codeSyntax: { WEB: "var(--spacing)" },
    description: "Spacing unit (Tailwind --spacing): Compact, Default, Comfortable, Touch.",
  })
  for (const step of SPACING_STEPS) {
    density.variables.push({
      name: spacingName(step),
      type: "FLOAT",
      values: Object.fromEntries(DENSITY_MODES.map((mode) => [mode, Math.round(unit[mode] * step * 100) / 100])),
      codeSyntax: { WEB: `calc(var(--spacing) * ${step})` },
    })
  }

  const shape = { name: "Onu / Shape", modes: ["Default"], variables: [] }
  const radius = rem(tokens.radius.base.$value)
  shape.variables.push({
    name: "radius/base",
    type: "FLOAT",
    values: { Default: radius },
    codeSyntax: { WEB: "var(--onu-radius)" },
    description: tokens.radius.base.$description,
  })
  for (const [name, factor] of Object.entries(RADIUS_SCALE)) {
    shape.variables.push({
      name: `radius/${name}`,
      type: "FLOAT",
      values: { Default: Math.round(radius * factor * 100) / 100 },
      codeSyntax: { WEB: `var(--radius-${name})` },
    })
  }
  for (const [name, t] of Object.entries(tokens.size)) {
    shape.variables.push({
      name: `size/${name}`,
      type: "FLOAT",
      values: { Default: px(t.$value) },
      codeSyntax: { WEB: `var(--onu-${name})` },
      description: t.$description,
    })
  }

  return [color, density, shape]
}
