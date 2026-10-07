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

type Shiki = typeof import("shiki")
let shikiPromise: Promise<Shiki> | null = null

/** Loads Shiki on first use, so it never weighs on pages without code (R2.5). */
export function loadShiki(): Promise<Shiki> {
  shikiPromise ??= import("shiki")
  return shikiPromise
}

const ALIASES: Record<string, string> = { sh: "bash", shell: "bash", zsh: "bash", yml: "yaml", md: "markdown" }

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
  const shiki = await loadShiki()
  if (!(lang in shiki.bundledLanguages)) return null
  const { tokens } = await shiki.codeToTokens(code, {
    lang: lang as keyof typeof shiki.bundledLanguages,
    themes: { light: themes.light, dark: themes.dark },
    defaultColor: false,
  })
  return tokens.map((line) =>
    line.map((token) => ({
      content: token.content,
      style: token.htmlStyle as Record<string, string> | undefined,
      fontStyle: token.fontStyle,
    })),
  )
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
