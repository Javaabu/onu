import { Extension, mergeAttributes, Node, type AnyExtension, type Extensions } from "@tiptap/core"
import type { Node as PMNode } from "@tiptap/pm/model"
import { Plugin, PluginKey } from "@tiptap/pm/state"
import { Decoration, DecorationSet } from "@tiptap/pm/view"
import Image from "@tiptap/extension-image"
import { TableKit } from "@tiptap/extension-table"
import TextAlign from "@tiptap/extension-text-align"
import StarterKit from "@tiptap/starter-kit"

/*
 * Node and mark definitions shared by the WYSIWYG editor, the block editor and
 * the block renderer, so content written in one renders the same in the others.
 */

/** Alignments use logical start/center/end so they follow the text direction (R11.2). */
export const ALIGNMENTS = ["start", "center", "end"] as const
export type Alignment = (typeof ALIGNMENTS)[number]

export const CALLOUT_VARIANTS = ["info", "success", "warning", "error"] as const
export type CalloutVariant = (typeof CALLOUT_VARIANTS)[number]

const SAFE_PROTOCOLS = /^(https?:|mailto:|tel:)/i
const SAFE_IMAGE_DATA = /^data:image\/(png|jpe?g|gif|webp|avif);base64,/i

/**
 * True for links that are safe to render: http(s), mailto, tel and relative
 * URLs. `javascript:`, `data:`, `vbscript:` and other schemes are rejected.
 */
export function isSafeUrl(url: string | null | undefined): url is string {
  if (!url) return false
  // Browsers ignore control characters and whitespace inside a scheme.
  // eslint-disable-next-line no-control-regex
  const clean = url.trim().replace(/[\u0000-\u001F\u007F\s]/g, "")
  if (!clean) return false
  // With a scheme, only the allowed ones; without one, a relative URL (/path, #hash, ?query, page.html).
  return /^[a-z][a-z0-9+.-]*:/i.test(clean) ? SAFE_PROTOCOLS.test(clean) : true
}

/** Like {@link isSafeUrl}, but also allows `blob:` and raster `data:image` URLs for images. */
export function isSafeImageUrl(url: string | null | undefined): url is string {
  if (!url) return false
  const clean = url.trim()
  if (SAFE_IMAGE_DATA.test(clean) || /^blob:/i.test(clean)) return true
  return isSafeUrl(clean) && !/^(mailto|tel):/i.test(clean)
}

/** Normalises user input like `example.mv` to `https://example.mv`. Returns `null` when unsafe. */
export function normalizeUrl(input: string): string | null {
  const value = input.trim()
  if (!value) return null
  const withProtocol =
    /^[a-z][a-z0-9+.-]*:/i.test(value) || /^[/#?.]/.test(value) ? value : `https://${value.replace(/^\/\//, "")}`
  return isSafeUrl(withProtocol) ? withProtocol : null
}

/**
 * Turns a YouTube or Vimeo link into a privacy-friendly embed URL, or `null`
 * when the link can't be embedded. Only these providers are embedded, so the
 * renderer never frames arbitrary sites.
 */
export function toEmbedUrl(url: string | null | undefined): string | null {
  if (!url) return null
  let parsed: URL
  try {
    parsed = new URL(url.trim())
  } catch {
    return null
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null
  const host = parsed.hostname.replace(/^(www\.|m\.)/, "")
  const id = /^[\w-]{6,20}$/
  if (host === "youtu.be") {
    const v = parsed.pathname.slice(1)
    return id.test(v) ? `https://www.youtube-nocookie.com/embed/${v}` : null
  }
  if (host === "youtube.com" || host === "youtube-nocookie.com") {
    const v = parsed.searchParams.get("v") ?? parsed.pathname.match(/^\/(?:embed|shorts|live)\/([^/?#]+)/)?.[1] ?? ""
    return id.test(v) ? `https://www.youtube-nocookie.com/embed/${v}` : null
  }
  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const v = parsed.pathname.match(/(?:^|\/)(\d{4,12})(?:$|\/)/)?.[1]
    return v ? `https://player.vimeo.com/video/${v}` : null
  }
  return null
}

// First strong character, as in the Unicode bidi algorithm (P2): Hebrew, Arabic, Syriac,
// Thaana, NKo, … and their presentation forms are RTL; Latin, Greek, Cyrillic, Indic, CJK, … are LTR.
const RTL_CHAR = "\u0590-\u08FF\u200F\uFB1D-\uFDFF\uFE70-\uFEFF"
const LTR_CHAR =
  "A-Za-z\u00AA\u00B5\u00BA\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02B8\u0370-\u0482\u048A-\u058F\u0900-\u1FFF\u200E\u2C00-\uFB1C\uFF21-\uFF3A\uFF41-\uFF5A"
// Ranges of code points, not visible characters: combining marks inside a range are intended.
// eslint-disable-next-line no-misleading-character-class
const FIRST_STRONG = new RegExp(`[${RTL_CHAR}]|[${LTR_CHAR}]`)
const IS_RTL = new RegExp(`^[${RTL_CHAR}]$`)

/** The direction of the first strong character in `text`, or `null` when it has none (digits, punctuation). */
export function detectDirection(text: string | null | undefined): "ltr" | "rtl" | null {
  const match = text ? FIRST_STRONG.exec(text) : null
  if (!match) return null
  return IS_RTL.test(match[0]) ? "rtl" : "ltr"
}

/**
 * The direction a container block (list, quote) should take from its content:
 * an explicit `dir` on the first descendant that has one, else the first strong
 * character of its text. Code (which is always LTR) is skipped. `null` when the
 * block has no strong text yet.
 */
export function resolveBlockDirection(node: PMNode): "ltr" | "rtl" | null {
  let result: "ltr" | "rtl" | null = null
  node.descendants((child) => {
    if (result) return false
    if (child.type.name === "codeBlock") return false
    const dir = child.attrs.dir as string | null | undefined
    if (dir === "ltr" || dir === "rtl") {
      result = dir
      return false
    }
    if (child.isText && !child.marks.some((mark) => mark.type.name === "code")) result = detectDirection(child.text)
    return !result
  })
  return result
}

/**
 * Container blocks whose `dir` is resolved from their content rather than left
 * as `dir="auto"`: the browser's auto-direction skips descendants that have their
 * own `dir` (every paragraph inside does), so `dir="auto"` on a list or quote
 * always fell back to LTR, putting bullets and the quote border on the wrong side
 * of Dhivehi text.
 */
export const DIRECTIONAL_CONTAINERS = ["blockquote", "bulletList", "orderedList"]

const autoDirectionKey = new PluginKey<DecorationSet>("onuAutoDirection")

function containerDecorations(doc: PMNode, types: string[]): DecorationSet {
  const decorations: Decoration[] = []
  doc.descendants((node, pos) => {
    if (types.includes(node.type.name) && !node.attrs.dir) {
      decorations.push(Decoration.node(pos, pos + node.nodeSize, { dir: resolveBlockDirection(node) ?? "auto" }))
    }
    return true
  })
  return DecorationSet.create(doc, decorations)
}

/**
 * Renders `dir="auto"` on every text block, so each paragraph of mixed
 * Dhivehi/English content takes its direction from its own first strong
 * character (R11.7). Lists and quotes get the direction of their first strong
 * character instead (see {@link DIRECTIONAL_CONTAINERS}), kept up to date while
 * editing. An explicit `dir` in pasted HTML is kept.
 */
export const AutoDirection = Extension.create<{ types: string[]; containers: string[] }>({
  name: "autoDirection",
  addOptions() {
    return {
      types: ["paragraph", "heading", "blockquote", "bulletList", "orderedList", "tableCell", "tableHeader", "callout"],
      containers: DIRECTIONAL_CONTAINERS,
    }
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          dir: {
            default: null,
            parseHTML: (element) => {
              const dir = element.getAttribute("dir")
              return dir === "ltr" || dir === "rtl" ? dir : null
            },
            renderHTML: (attributes) => ({ dir: (attributes.dir as string | null) ?? "auto" }),
          },
        },
      },
    ]
  },
  addProseMirrorPlugins() {
    // ProseMirror only re-renders a node when its attributes change, so while
    // typing the resolved direction is applied as a node decoration.
    const containers = this.options.containers
    return [
      new Plugin<DecorationSet>({
        key: autoDirectionKey,
        state: {
          init: (_, state) => containerDecorations(state.doc, containers),
          apply: (tr, old) => (tr.docChanged ? containerDecorations(tr.doc, containers) : old),
        },
        props: {
          decorations: (state) => autoDirectionKey.getState(state),
        },
      }),
    ]
  },
})

/** Wraps a list/quote node so its rendered HTML carries the direction resolved from its content. */
function withResolvedDirection(extension: AnyExtension): AnyExtension {
  if (extension.type !== "node" || !DIRECTIONAL_CONTAINERS.includes(extension.name)) return extension
  return (extension as Node).extend({
    renderHTML({ node, HTMLAttributes }) {
      const attributes = HTMLAttributes as Record<string, unknown>
      const dir = attributes.dir === "ltr" || attributes.dir === "rtl" ? attributes.dir : resolveBlockDirection(node)
      return this.parent!({ node, HTMLAttributes: { ...attributes, dir: dir ?? "auto" } })
    },
  })
}

/** StarterKit with direction-resolving lists and quotes, for the editors, `getHTML()` and the renderer. */
const DirectionalStarterKit = StarterKit.extend({
  addExtensions() {
    return (this.parent?.() ?? []).map(withResolvedDirection)
  },
})

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    callout: {
      /** Turn the current block into a callout. */
      setCallout: (attributes?: { variant?: CalloutVariant }) => ReturnType
    }
    embed: {
      /** Insert an embedded video (YouTube or Vimeo). */
      setEmbed: (attributes: { src: string; title?: string }) => ReturnType
    }
  }
}

/** A highlighted note block with an `info`, `success`, `warning` or `error` variant. */
export const Callout = Node.create({
  name: "callout",
  group: "block",
  content: "inline*",
  defining: true,

  addAttributes() {
    return {
      variant: {
        default: "info",
        parseHTML: (element) => {
          const v = element.getAttribute("data-variant")
          return (CALLOUT_VARIANTS as readonly string[]).includes(v ?? "") ? v : "info"
        },
        renderHTML: (attributes) => ({ "data-variant": attributes.variant as string }),
      },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="callout"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes({ "data-type": "callout", role: "note" }, HTMLAttributes), 0]
  },

  addCommands() {
    return {
      setCallout:
        (attributes) =>
        ({ commands }) =>
          commands.setNode(this.name, attributes),
    }
  },

  addKeyboardShortcuts() {
    return {
      // Enter at the end of a callout continues with a normal paragraph.
      Enter: ({ editor }) => {
        const { $from, empty } = editor.state.selection
        if (!empty || $from.parent.type.name !== this.name || $from.parentOffset !== $from.parent.content.size) {
          return false
        }
        const after = $from.after()
        return editor
          .chain()
          .insertContentAt(after, { type: "paragraph" })
          .setTextSelection(after + 1)
          .run()
      },
      // Backspace at the start of a callout turns it back into a paragraph.
      Backspace: ({ editor }) => {
        const { $from, empty } = editor.state.selection
        if (!empty || $from.parent.type.name !== this.name || $from.parentOffset !== 0) return false
        return editor.commands.setNode("paragraph")
      },
    }
  },
})

/** An embedded YouTube or Vimeo video. Other links render as a plain link. */
export const Embed = Node.create({
  name: "embed",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      src: { default: null, parseHTML: (element) => element.getAttribute("data-src") },
      title: { default: null, parseHTML: (element) => element.getAttribute("data-title") },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="embed"]' }]
  },

  renderHTML({ node }) {
    const src = node.attrs.src as string | null
    const title = (node.attrs.title as string | null) ?? src ?? ""
    const embedUrl = toEmbedUrl(src)
    const attrs = { "data-type": "embed", "data-src": src ?? "", "data-title": node.attrs.title ?? "" }
    if (!embedUrl) {
      return ["div", attrs, ["a", { href: isSafeUrl(src) ? src : null, rel: "noopener noreferrer nofollow" }, title]]
    }
    // In the editor, a static preview card: nothing is loaded from YouTube/Vimeo while editing.
    // Published content renders the click-to-load VideoEmbed (BlockRenderer).
    return [
      "div",
      { ...attrs, "data-embed-preview": "", class: "rounded-lg border bg-muted p-4 text-sm" },
      ["p", { class: "font-medium" }, `▶ ${title}`],
      ["p", { class: "text-muted-foreground break-all", dir: "ltr" }, src ?? ""],
    ]
  },

  addCommands() {
    return {
      setEmbed:
        (attributes) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs: attributes }),
    }
  },
})

export interface SchemaOptions {
  /** Heading levels offered. Default `[1, 2, 3]`. */
  headingLevels?: (1 | 2 | 3 | 4 | 5 | 6)[]
  /** Include the block-editor-only nodes (callout, embed). */
  blocks?: boolean
}

/** The shared document schema: StarterKit, images, tables, alignment, auto direction (+ callout and embed). */
export function createSchemaExtensions({ headingLevels = [1, 2, 3], blocks = true }: SchemaOptions = {}): Extensions {
  return [
    DirectionalStarterKit.configure({
      heading: { levels: headingLevels },
      codeBlock: { HTMLAttributes: { dir: "ltr", spellcheck: "false" } },
      code: { HTMLAttributes: { dir: "ltr" } },
      link: {
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
        HTMLAttributes: { rel: "noopener noreferrer nofollow", target: null },
        isAllowedUri: (url, ctx) => ctx.defaultValidate(url) && isSafeUrl(url),
      },
      trailingNode: false,
    }),
    Image.configure({ allowBase64: true, HTMLAttributes: { loading: "lazy" } }),
    TableKit.configure({ table: { resizable: false, renderWrapper: true } }),
    TextAlign.configure({
      types: ["heading", "paragraph"],
      alignments: [...ALIGNMENTS],
    }),
    AutoDirection,
    ...(blocks ? [Callout, Embed] : []),
  ]
}
