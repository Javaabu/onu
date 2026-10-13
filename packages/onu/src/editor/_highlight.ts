"use client"

import * as React from "react"

/** A highlighted token: text plus the CSS variables Shiki assigns for the light and dark themes. */
export interface HighlightToken {
  content: string
  style?: Record<string, string>
  fontStyle?: number
}

export interface CodeThemes {
  light: string
  dark: string
}

export const DEFAULT_CODE_THEMES: CodeThemes = { light: "github-light", dark: "github-dark" }

type Loader = () => Promise<unknown>

/**
 * Grammars loaded on demand. Only these are bundled (each in its own chunk), instead of
 * Shiki's ~300-language full bundle; add more with `registerCodeLanguage`.
 */
const LANGUAGE_LOADERS: Record<string, Loader> = {
  bash: () => import("shiki/langs/bash.mjs"),
  blade: () => import("shiki/langs/blade.mjs"),
  css: () => import("shiki/langs/css.mjs"),
  dart: () => import("shiki/langs/dart.mjs"),
  diff: () => import("shiki/langs/diff.mjs"),
  html: () => import("shiki/langs/html.mjs"),
  javascript: () => import("shiki/langs/javascript.mjs"),
  json: () => import("shiki/langs/json.mjs"),
  jsx: () => import("shiki/langs/jsx.mjs"),
  markdown: () => import("shiki/langs/markdown.mjs"),
  php: () => import("shiki/langs/php.mjs"),
  python: () => import("shiki/langs/python.mjs"),
  sql: () => import("shiki/langs/sql.mjs"),
  tsx: () => import("shiki/langs/tsx.mjs"),
  typescript: () => import("shiki/langs/typescript.mjs"),
  vue: () => import("shiki/langs/vue.mjs"),
  xml: () => import("shiki/langs/xml.mjs"),
  yaml: () => import("shiki/langs/yaml.mjs"),
}

const THEME_LOADERS: Record<string, Loader> = {
  "github-light": () => import("shiki/themes/github-light.mjs"),
  "github-dark": () => import("shiki/themes/github-dark.mjs"),
}

/**
 * Makes another Shiki grammar available to `CodeBlock` and the editors, e.g.
 * `registerCodeLanguage("rust", () => import("shiki/langs/rust.mjs"))`.
 */
export function registerCodeLanguage(id: string, loader: Loader) {
  LANGUAGE_LOADERS[id.toLowerCase()] = loader
}

/** Makes another Shiki theme available by name, e.g. `registerCodeTheme("nord", () => import("shiki/themes/nord.mjs"))`. */
export function registerCodeTheme(name: string, loader: Loader) {
  THEME_LOADERS[name] = loader
}

type Highlighter = Awaited<ReturnType<typeof import("shiki/core").createHighlighterCore>>
let highlighterPromise: Promise<Highlighter> | null = null

/** Loads Shiki's core and JavaScript regex engine on first use, so pages without code never pay for it (R2.5). */
export function loadShiki(): Promise<Highlighter> {
  highlighterPromise ??= Promise.all([import("shiki/core"), import("shiki/engine/javascript")]).then(([core, engine]) =>
    core.createHighlighterCore({ engine: engine.createJavaScriptRegexEngine({ forgiving: true }) }),
  )
  return highlighterPromise
}

async function ensureLoaded(highlighter: Highlighter, lang: string, themes: CodeThemes) {
  const langs = highlighter.getLoadedLanguages()
  if (!langs.includes(lang)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await highlighter.loadLanguage((await LANGUAGE_LOADERS[lang]!()) as any)
  }
  const loaded = highlighter.getLoadedThemes()
  for (const name of [themes.light, themes.dark]) {
    if (!loaded.includes(name) && THEME_LOADERS[name]) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await highlighter.loadTheme((await THEME_LOADERS[name]!()) as any)
    }
  }
}

const ALIASES: Record<string, string> = {
  sh: "bash",
  shell: "bash",
  zsh: "bash",
  yml: "yaml",
  md: "markdown",
  ts: "typescript",
  js: "javascript",
  mjs: "javascript",
  cjs: "javascript",
  py: "python",
  htm: "html",
  svg: "xml",
}

/** Display names for common languages; anything else shows its id. */
export const LANGUAGE_NAMES: Record<string, string> = {
  bash: "Bash",
  css: "CSS",
  html: "HTML",
  javascript: "JavaScript",
  js: "JavaScript",
  json: "JSON",
  jsx: "JSX",
  markdown: "Markdown",
  php: "PHP",
  python: "Python",
  sql: "SQL",
  ts: "TypeScript",
  tsx: "TSX",
  typescript: "TypeScript",
  vue: "Vue",
  yaml: "YAML",
  blade: "Blade",
  dart: "Dart",
}

export function normalizeLanguage(language: string | null | undefined): string | null {
  if (!language) return null
  const id = language.toLowerCase().replace(/^language-/, "")
  return ALIASES[id] ?? id
}

/** Highlights code with Shiki. Resolves to `null` for plain text or an unknown language. */
export async function highlightCode(
  code: string,
  language: string | null | undefined,
  themes: CodeThemes = DEFAULT_CODE_THEMES,
): Promise<HighlightToken[][] | null> {
  const lang = normalizeLanguage(language)
  if (!lang || lang === "text" || lang === "plaintext") return null
  if (!LANGUAGE_LOADERS[lang]) return null
  const highlighter = await loadShiki()
  // Unknown theme names fall back to the defaults rather than failing.
  const use: CodeThemes = {
    light: THEME_LOADERS[themes.light] ? themes.light : DEFAULT_CODE_THEMES.light,
    dark: THEME_LOADERS[themes.dark] ? themes.dark : DEFAULT_CODE_THEMES.dark,
  }
  await ensureLoaded(highlighter, lang, use)
  const { tokens } = highlighter.codeToTokens(code, {
    lang,
    themes: { light: use.light, dark: use.dark },
    defaultColor: false,
  })
  return tokens.map((line) =>
    line.map((token) => ({
      content: token.content,
      style: readableStyle(token.htmlStyle as Record<string, string> | undefined),
      fontStyle: token.fontStyle,
    })),
  )
}

// WCAG 1.4.3 AA for code-sized text.
const MIN_CONTRAST = 4.5

/**
 * The surfaces code is checked against: a little darker (light mode) or lighter
 * (dark mode) than the muted code background with a `primary/10` highlighted
 * line on top, so tokens stay readable on plain and highlighted lines alike.
 */
export const CODE_CONTRAST_SURFACES = { light: "#e0e0e0", dark: "#2e2e2e" } as const

type Rgb = [number, number, number]

function parseHex(color: string): Rgb | null {
  const hex = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.exec(color.trim())?.[1]
  if (!hex) return null
  const full = hex.length <= 4 ? [...hex].map((c) => c + c).join("") : hex
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255) as Rgb
}

function toHex(rgb: Rgb): string {
  return `#${rgb
    .map((v) =>
      Math.round(v * 255)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`
}

function luminance([r, g, b]: Rgb): number {
  const lin = (v: number) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

/** WCAG contrast ratio between two sRGB colours. */
export function contrastRatio(a: string, b: string): number {
  const ca = parseHex(a)
  const cb = parseHex(b)
  if (!ca || !cb) return 1
  const la = luminance(ca)
  const lb = luminance(cb)
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

const readableCache = new Map<string, string>()

/**
 * Returns `color` (a hex colour from a Shiki theme), darkened for light mode or
 * lightened for dark mode just enough to reach 4.5:1 against the code surface.
 * Colours that already pass, and anything that is not a hex colour, are kept.
 */
export function readableTokenColor(color: string, mode: "light" | "dark"): string {
  const key = `${mode}\u0000${color}`
  const cached = readableCache.get(key)
  if (cached) return cached
  const surface = CODE_CONTRAST_SURFACES[mode]
  const rgb = parseHex(color)
  let result = color
  // Translucent theme colours are left alone: their contrast depends on what is behind them.
  if (rgb && color.length !== 5 && color.length !== 9 && contrastRatio(color, surface) < MIN_CONTRAST) {
    const target = mode === "light" ? 0 : 1
    const mix = (t: number) => toHex(rgb.map((v) => v + (target - v) * t) as Rgb)
    // Smallest step towards black (light) or white (dark) that passes, keeping the hue.
    let lo = 0
    let hi = 1
    for (let i = 0; i < 16; i++) {
      const mid = (lo + hi) / 2
      if (contrastRatio(mix(mid), surface) >= MIN_CONTRAST) hi = mid
      else lo = mid
    }
    result = mix(hi)
  }
  readableCache.set(key, result)
  return result
}

function readableStyle(style: Record<string, string> | undefined): Record<string, string> | undefined {
  if (!style) return style
  const out: Record<string, string> = { ...style }
  if (out["--shiki-light"]) out["--shiki-light"] = readableTokenColor(out["--shiki-light"], "light")
  if (out["--shiki-dark"]) out["--shiki-dark"] = readableTokenColor(out["--shiki-dark"], "dark")
  return out
}

/** Highlights code after mount; `null` until ready (and for plain text). */
export function useHighlightedCode(code: string, language: string | null | undefined, themes: CodeThemes) {
  const [result, setResult] = React.useState<{ key: string; tokens: HighlightToken[][] | null } | null>(null)
  const key = `${language}\u0000${themes.light}\u0000${themes.dark}\u0000${code}`
  React.useEffect(() => {
    let cancelled = false
    highlightCode(code, language, themes).then(
      (tokens) => {
        if (!cancelled) setResult({ key, tokens })
      },
      () => {
        if (!cancelled) setResult({ key, tokens: null })
      },
    )
    return () => {
      cancelled = true
    }
    // `key` covers code, language and themes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
  return result?.key === key ? result.tokens : null
}
