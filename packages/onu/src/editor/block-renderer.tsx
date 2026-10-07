"use client"

import * as React from "react"
import type { Extensions, JSONContent } from "@tiptap/core"
import type { Mark as PMMark, Node as PMNode } from "@tiptap/pm/model"
import { renderToReactElement } from "@tiptap/static-renderer/pm/react"

import { Icon } from "../icons/icon"
import { cn } from "../lib/utils"
import { useTranslation } from "../providers/onu-provider"
import { proseVariants } from "./_prose"
import { CALLOUT_VARIANTS, createSchemaExtensions, isSafeImageUrl, isSafeUrl, toEmbedUrl } from "./_schema"
import { parseJsonContent } from "./_value"
import { CodeBlock, type CodeBlockProps } from "./code-block"
import { VideoEmbed } from "../components/files/video-embed"

type NodeRenderer = (props: { node: PMNode; children?: React.ReactNode }) => React.ReactNode
type MarkRenderer = (props: { mark: PMMark; children?: React.ReactNode }) => React.ReactNode

export interface BlockRendererProps extends Omit<React.ComponentProps<"div">, "children" | "content"> {
  /** Block editor (or WYSIWYG) content as Tiptap JSON, or a JSON string. */
  content: JSONContent | string | null | undefined
  /** Prose size. */
  size?: "sm" | "default" | "lg"
  /** Override how node types render, e.g. `{ image: ({ node }) => <MyImage … /> }`. */
  nodes?: Record<string, NodeRenderer>
  /** Override how mark types render. */
  marks?: Record<string, MarkRenderer>
  /** Extra Tiptap extensions for custom node types (same ones the editor uses). */
  extensions?: Extensions
  /** Props for every code block (line numbers, themes, …). */
  codeBlock?: Omit<CodeBlockProps, "code" | "language">
  /** Shown when there is no content. */
  empty?: React.ReactNode
}

const CALLOUT_ICONS: Record<string, string> = { info: "info", success: "success", warning: "warning", error: "error" }

/**
 * Renders block editor JSON to React without loading the editor (Tiptap's
 * static renderer, sharing the editors' node definitions). Safe by default:
 * no raw HTML is injected, unsafe links and image sources are dropped, and only
 * YouTube/Vimeo are embedded. Every block keeps `dir="auto"`; lists and quotes get the direction of their first strong character.
 */
export function BlockRenderer({
  content,
  size,
  nodes,
  marks,
  extensions,
  codeBlock,
  empty = null,
  className,
  ...props
}: BlockRendererProps) {
  const { t } = useTranslation()
  const doc = parseJsonContent(content)

  const rendered = React.useMemo(() => {
    if (!doc) return null
    const nodeMapping: Record<string, NodeRenderer> = {
      codeBlock: ({ node }) => (
        <CodeBlock code={node.textContent} language={node.attrs.language as string | null} {...codeBlock} />
      ),
      image: ({ node }) => {
        const src = node.attrs.src as string | null
        if (!isSafeImageUrl(src)) return null
        return (
          <img
            src={src}
            alt={(node.attrs.alt as string | null) ?? ""}
            title={(node.attrs.title as string | null) ?? undefined}
            loading="lazy"
            decoding="async"
          />
        )
      },
      embed: ({ node }) => {
        const src = node.attrs.src as string | null
        const title = (node.attrs.title as string | null) || t("editor.embeddedContent")
        const url = toEmbedUrl(src)
        if (!url) {
          return isSafeUrl(src) ? (
            <p data-type="embed">
              <a href={src} rel="noopener noreferrer nofollow">
                {title === t("editor.embeddedContent") ? src : title}
              </a>
            </p>
          ) : null
        }
        // Click-to-load: nothing is fetched from YouTube/Vimeo until the reader presses play.
        return (
          <div data-type="embed" data-src={src ?? undefined}>
            <VideoEmbed url={src ?? undefined} title={title} />
          </div>
        )
      },
      callout: ({ node, children }) => {
        const variant = (CALLOUT_VARIANTS as readonly string[]).includes(node.attrs.variant as string)
          ? (node.attrs.variant as string)
          : "info"
        return (
          <div
            data-type="callout"
            data-variant={variant}
            role="note"
            dir={(node.attrs.dir as string | null) ?? "auto"}
            className="gap-3 flex items-start"
          >
            <Icon name={CALLOUT_ICONS[variant]!} className="mt-1.5 size-4 shrink-0" />
            <div className="min-w-0 flex-1">{children}</div>
          </div>
        )
      },
      ...nodes,
    }
    const markMapping: Record<string, MarkRenderer> = {
      link: ({ mark, children }) => {
        const href = mark.attrs.href as string | null
        if (!isSafeUrl(href)) return <>{children}</>
        const blank = mark.attrs.target === "_blank"
        return (
          <a href={href} target={blank ? "_blank" : undefined} rel="noopener noreferrer nofollow">
            {children}
          </a>
        )
      },
      ...marks,
    }
    try {
      return renderToReactElement({
        content: doc,
        extensions: [...createSchemaExtensions({ headingLevels: [1, 2, 3, 4, 5, 6] }), ...(extensions ?? [])],
        options: { nodeMapping, markMapping },
      })
    } catch {
      // Content that doesn't fit the schema renders nothing rather than crashing the page.
      return null
    }
    // `doc` is derived from `content`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, nodes, marks, extensions, codeBlock, t])

  const isEmpty = !doc || !doc.content?.length
  return (
    <div data-slot="block-renderer" className={cn(proseVariants({ size }), className)} {...props}>
      {isEmpty ? empty : rendered}
    </div>
  )
}
