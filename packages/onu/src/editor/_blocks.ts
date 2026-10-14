import type { Editor, Range } from "@tiptap/core"
import { TextSelection } from "@tiptap/pm/state"
import { registerEnglish } from "../i18n/english"
import { editor as en_editor } from "../locales/en/editor"

registerEnglish({ editor: en_editor })

/** What a block type needs from the editor UI (dialogs). */
export interface BlockContext {
  openImage: () => void
  openEmbed: () => void
}

/** A block the slash menu and the "+" menu can insert. */
export interface BlockType {
  id: string
  /** Locale key of the title, or a literal title. */
  title: string
  description?: string
  icon: string
  /** Extra search words (English; titles are searched in the active locale too). */
  keywords: string[]
  /** Heading level, used for the translated title. */
  level?: number
  /** Turns the current (empty) block into this one. */
  run: (editor: Editor, context: BlockContext) => void
}

export const BLOCK_TYPES: BlockType[] = [
  {
    id: "paragraph",
    title: "editor.text",
    description: "editor.textDescription",
    icon: "text",
    keywords: ["paragraph", "text", "p"],
    run: (e) => e.chain().focus().setParagraph().run(),
  },
  ...([1, 2, 3] as const).map<BlockType>((level) => ({
    id: `heading${level}`,
    title: "editor.heading",
    description: "editor.headingDescription",
    icon: "heading",
    level,
    keywords: ["heading", "title", `h${level}`],
    run: (e) => e.chain().focus().setHeading({ level }).run(),
  })),
  {
    id: "bulletList",
    title: "editor.bulletList",
    description: "editor.bulletListDescription",
    icon: "list",
    keywords: ["bullet", "list", "ul"],
    run: (e) => e.chain().focus().toggleBulletList().run(),
  },
  {
    id: "orderedList",
    title: "editor.orderedList",
    description: "editor.orderedListDescription",
    icon: "list-ordered",
    keywords: ["numbered", "ordered", "list", "ol"],
    run: (e) => e.chain().focus().toggleOrderedList().run(),
  },
  {
    id: "blockquote",
    title: "editor.blockquote",
    description: "editor.blockquoteDescription",
    icon: "quote",
    keywords: ["quote", "blockquote", "citation"],
    run: (e) => e.chain().focus().toggleBlockquote().run(),
  },
  {
    id: "image",
    title: "editor.image",
    description: "editor.imageDescription",
    icon: "image",
    keywords: ["image", "photo", "picture", "img"],
    run: (_e, ctx) => ctx.openImage(),
  },
  {
    id: "table",
    title: "editor.table",
    description: "editor.tableDescription",
    icon: "table",
    keywords: ["table", "grid", "rows", "columns"],
    run: (e) => e.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
  },
  {
    id: "divider",
    title: "editor.horizontalRule",
    description: "editor.dividerDescription",
    icon: "minus",
    keywords: ["divider", "rule", "hr", "line", "separator"],
    run: (e) => e.chain().focus().setHorizontalRule().run(),
  },
  {
    id: "callout",
    title: "editor.callout",
    description: "editor.calloutDescription",
    icon: "info",
    keywords: ["callout", "note", "info", "warning", "alert"],
    run: (e) => e.chain().focus().setCallout().run(),
  },
  {
    id: "codeBlock",
    title: "editor.codeBlock",
    description: "editor.codeDescription",
    icon: "code",
    keywords: ["code", "snippet", "pre"],
    run: (e) => e.chain().focus().setCodeBlock().run(),
  },
  {
    id: "embed",
    title: "editor.embed",
    description: "editor.embedDescription",
    icon: "play",
    keywords: ["embed", "video", "youtube", "vimeo"],
    run: (_e, ctx) => ctx.openEmbed(),
  },
]

/** Filters block types by a query against translated titles and keywords. */
export function filterBlocks(blocks: BlockType[], query: string, title: (block: BlockType) => string): BlockType[] {
  const q = query.trim().toLocaleLowerCase()
  if (!q) return blocks
  return blocks.filter(
    (block) => title(block).toLocaleLowerCase().includes(q) || block.keywords.some((k) => k.startsWith(q)),
  )
}

/** Deletes the slash command text, then runs the block. */
export function runBlock(editor: Editor, block: BlockType, context: BlockContext, range?: Range) {
  if (range) editor.chain().focus().deleteRange(range).run()
  block.run(editor, context)
}

/** Start positions of the document's top-level blocks. */
export function blockPositions(editor: Editor): number[] {
  const positions: number[] = []
  editor.state.doc.forEach((_node, offset) => positions.push(offset))
  return positions
}

/** Index of the top-level block holding the selection. */
export function currentBlockIndex(editor: Editor): number {
  return editor.state.selection.$from.index(0)
}

/**
 * Moves the top-level block at `from` so it sits before the block that is
 * currently at `before` (`before` may equal the block count, meaning "at the
 * end"). Returns the block's new index, or `null` when nothing moved.
 */
export function moveBlock(editor: Editor, from: number, before: number): number | null {
  const { doc } = editor.state
  const count = doc.childCount
  if (from < 0 || from >= count || before < 0 || before > count || before === from || before === from + 1) return null
  const positions = blockPositions(editor)
  const node = doc.child(from)
  const start = positions[from]!
  const target = before === count ? doc.content.size : positions[before]!
  const insertAt = target > start ? target - node.nodeSize : target
  const tr = editor.state.tr.delete(start, start + node.nodeSize).insert(insertAt, node)
  tr.setSelection(TextSelection.near(tr.doc.resolve(insertAt + 1)))
  editor.view.dispatch(tr.scrollIntoView())
  return before > from ? before - 1 : before
}

/** Moves the block holding the selection one step up (-1) or down (+1). */
export function moveCurrentBlock(editor: Editor, step: -1 | 1): number | null {
  const index = currentBlockIndex(editor)
  return moveBlock(editor, index, step < 0 ? index - 1 : index + 2)
}

export function duplicateBlock(editor: Editor, index: number) {
  const { doc } = editor.state
  const node = doc.child(index)
  const end = blockPositions(editor)[index]! + node.nodeSize
  editor.view.dispatch(editor.state.tr.insert(end, node.copy(node.content)))
}

export function deleteBlock(editor: Editor, index: number) {
  const { doc } = editor.state
  const node = doc.child(index)
  const start = blockPositions(editor)[index]!
  const tr = editor.state.tr.delete(start, start + node.nodeSize)
  // Keep at least one paragraph to type in.
  if (tr.doc.childCount === 0) tr.insert(0, editor.schema.nodes.paragraph!.create())
  tr.setSelection(TextSelection.near(tr.doc.resolve(Math.min(start, tr.doc.content.size))))
  editor.view.dispatch(tr)
}

/** Adds an empty paragraph after a block and puts the caret in it. */
export function insertParagraphAfter(editor: Editor, index: number) {
  const { doc } = editor.state
  const node = doc.child(index)
  const end = blockPositions(editor)[index]! + node.nodeSize
  const tr = editor.state.tr.insert(end, editor.schema.nodes.paragraph!.create())
  tr.setSelection(TextSelection.create(tr.doc, end + 1))
  editor.view.dispatch(tr)
}
