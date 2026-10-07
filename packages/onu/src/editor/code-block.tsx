"use client"

import * as React from "react"

import { Icon } from "../icons/icon"
import { cn } from "../lib/utils"
import { useTranslation } from "../providers/onu-provider"
import { Button } from "../ui/button"
import {
  DEFAULT_CODE_THEMES,
  LANGUAGE_NAMES,
  normalizeLanguage,
  useHighlightedCode,
  type CodeThemes,
  type HighlightToken,
} from "./_highlight"

export interface CodeBlockProps extends Omit<React.ComponentProps<"figure">, "children" | "title"> {
  /** The code to show. */
  code: string
  /** Shiki language id (`ts`, `php`, `bash`, …). Omit for plain text. */
  language?: string | null
  /** A file name or caption shown in the header instead of the language. */
  title?: React.ReactNode
  /** Show line numbers. */
  lineNumbers?: boolean
  /** Number of the first line. Default `1`. */
  startLine?: number
  /** Line numbers (as displayed) to highlight. */
  highlightLines?: number[]
  /** Show the copy button. Default `true`. */
  copyable?: boolean
  /** Wrap long lines instead of scrolling. */
  wrap?: boolean
  /** Hide the header (language label and copy button). */
  hideHeader?: boolean
  /** Shiki themes for light and dark mode. Default GitHub light/dark. */
  themes?: CodeThemes
  classNames?: { header?: string; pre?: string; line?: string; lineNumber?: string; copy?: string }
}

// Shiki's font style bit flags.
const ITALIC = 1
const BOLD = 2
const UNDERLINE = 4

function Token({ token }: { token: HighlightToken }) {
  const fs = token.fontStyle ?? 0
  return (
    <span
      style={token.style}
      className={cn(
        "text-(--shiki-light) dark:text-(--shiki-dark)",
        fs & ITALIC && "italic",
        fs & BOLD && "font-semibold",
        fs & UNDERLINE && "underline",
      )}
    >
      {token.content}
    </span>
  )
}

/**
 * Read-only code with Shiki syntax highlighting (loaded lazily), a language
 * label, a copy button and optional line numbers. Code is always laid out
 * left-to-right, even on RTL pages, and follows light/dark mode.
 */
export function CodeBlock({
  code,
  language,
  title,
  lineNumbers = false,
  startLine = 1,
  highlightLines,
  copyable = true,
  wrap = false,
  hideHeader = false,
  themes = DEFAULT_CODE_THEMES,
  className,
  classNames,
  ...props
}: CodeBlockProps) {
  const { t } = useTranslation()
  const lang = normalizeLanguage(language)
  const tokens = useHighlightedCode(code, lang, themes)
  const [copied, setCopied] = React.useState(false)
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  React.useEffect(() => () => clearTimeout(timer.current ?? undefined), [])

  const text = code.replace(/\n$/, "")
  const lines: HighlightToken[][] = tokens ?? text.split("\n").map((content) => [{ content }])
  const label = lang ? (LANGUAGE_NAMES[lang] ?? lang) : t("editor.plainText")
  const highlighted = new Set(highlightLines)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      clearTimeout(timer.current ?? undefined)
      timer.current = setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <figure
      data-slot="code-block"
      data-language={lang ?? "text"}
      data-highlighted={tokens ? "" : undefined}
      className={cn("group/code my-4 text-sm overflow-hidden rounded-lg border border-border bg-muted/50", className)}
      {...props}
    >
      {hideHeader ? null : (
        <figcaption
          className={cn(
            "gap-2 px-3 py-1.5 min-h-9 text-xs flex items-center justify-between border-b border-border text-muted-foreground",
            classNames?.header,
          )}
        >
          <span className="font-medium truncate" dir="auto">
            {title ?? label}
          </span>
          {copyable ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-label={t("editor.copyCode")}
              title={t("editor.copyCode")}
              onClick={() => void copy()}
              className={cn("touch:size-11", classNames?.copy)}
            >
              <Icon name={copied ? "check" : "copy"} />
            </Button>
          ) : null}
        </figcaption>
      )}
      {/* Code reads left-to-right in every locale (R11.7); the region is focusable so it can scroll by keyboard. */}
      <pre
        dir="ltr"
        role="region"
        aria-label={typeof title === "string" ? title : label}
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex={0}
        className={cn(
          "py-3 leading-relaxed text-start font-mono text-[0.8125rem] text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
          wrap ? "break-words whitespace-pre-wrap" : "overflow-x-auto",
          classNames?.pre,
        )}
      >
        <code className={cn("grid min-w-max", wrap && "min-w-0")}>
          {lines.map((line, index) => {
            const number = startLine + index
            return (
              <span
                key={index}
                data-line={number}
                data-highlighted={highlighted.has(number) || undefined}
                className={cn("px-4 flex data-highlighted:bg-primary/10", classNames?.line)}
              >
                {lineNumbers ? (
                  <span
                    aria-hidden="true"
                    className={cn(
                      "me-4 inline-block w-[3ch] shrink-0 text-end text-muted-foreground tabular-nums select-none",
                      classNames?.lineNumber,
                    )}
                  >
                    {number}
                  </span>
                ) : null}
                <span className="min-w-0 flex-1">
                  {line.length && line.some((tk) => tk.content) ? (
                    line.map((token, i) => <Token key={i} token={token} />)
                  ) : (
                    <>{"\n"}</>
                  )}
                </span>
              </span>
            )
          })}
        </code>
      </pre>
      <span className="sr-only" aria-live="polite">
        {copied ? t("editor.codeCopied") : ""}
      </span>
    </figure>
  )
}
