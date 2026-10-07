"use client"

import * as React from "react"
import type { Editor } from "@tiptap/core"

import { Icon } from "../icons/icon"
import { useTranslation } from "../providers/onu-provider"
import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import {
  blockPositions,
  currentBlockIndex,
  deleteBlock,
  duplicateBlock,
  insertParagraphAfter,
  moveBlock,
  runBlock,
  type BlockContext,
  type BlockType,
} from "./_blocks"
import { blockTitle } from "./_slash-menu"

function blockDom(editor: Editor, index: number): HTMLElement | null {
  const pos = blockPositions(editor)[index]
  if (pos === undefined) return null
  const dom = editor.view.nodeDOM(pos)
  return dom instanceof HTMLElement ? dom : null
}

/** Index of the top-level block that contains a DOM node inside the editor. */
function indexFromTarget(editor: Editor, target: EventTarget | null): number | null {
  const root = editor.view.dom
  let el = target instanceof Node ? (target as Node) : null
  while (el && el.parentNode !== root) el = el.parentNode
  if (!el) return null
  try {
    return editor.state.doc.resolve(editor.view.posAtDOM(el, 0)).index(0)
  } catch {
    return null
  }
}

export interface BlockHandleProps {
  editor: Editor
  /** The positioned element that wraps the editor content. */
  container: HTMLElement | null
  blocks: BlockType[]
  context: BlockContext
  onMoved: (position: number) => void
}

/**
 * The gutter controls beside the active block: "+" to add a block below and
 * a grip to drag the block (pointer, touch or pen) or open its menu (move up,
 * move down, duplicate, delete) — the keyboard alternative to dragging.
 */
export function BlockHandle({ editor, container, blocks, context, onMoved }: BlockHandleProps) {
  const { t } = useTranslation()
  const [hovered, setHovered] = React.useState<number | null>(null)
  const [selected, setSelected] = React.useState(() => currentBlockIndex(editor))
  const [count, setCount] = React.useState(() => editor.state.doc.childCount)
  // Re-measure after every change, since edits move the blocks below.
  const [, setVersion] = React.useState(0)
  const [menu, setMenu] = React.useState(false)
  const [indicator, setIndicator] = React.useState<number | null>(null)
  const drag = React.useRef<{ startY: number; index: number; active: boolean; before: number } | null>(null)

  // Follow the selection (keyboard and touch users) and the pointer (mouse users).
  React.useEffect(() => {
    const update = () => {
      setSelected(currentBlockIndex(editor))
      setCount(editor.state.doc.childCount)
      setVersion((v) => v + 1)
    }
    editor.on("transaction", update)
    return () => {
      editor.off("transaction", update)
    }
  }, [editor])

  React.useEffect(() => {
    if (!container) return
    const onMove = (event: PointerEvent) => {
      if (drag.current || menu) return
      const index = indexFromTarget(editor, event.target)
      if (index !== null) setHovered(index)
    }
    container.addEventListener("pointermove", onMove)
    return () => container.removeEventListener("pointermove", onMove)
  }, [container, editor, menu])

  const index = Math.min(hovered ?? selected, count - 1)
  const dom = blockDom(editor, index)
  const top = dom?.offsetTop ?? 0

  const dropIndex = (y: number) => {
    for (let i = 0; i < count; i++) {
      const rect = blockDom(editor, i)?.getBoundingClientRect()
      if (rect && y < rect.top + rect.height / 2) return i
    }
    return count
  }

  const indicatorTop = (before: number) => {
    if (before < count) return blockDom(editor, before)?.offsetTop ?? 0
    const last = blockDom(editor, count - 1)
    return last ? last.offsetTop + last.offsetHeight : 0
  }

  const move = (before: number) => {
    const next = moveBlock(editor, index, before)
    if (next !== null) {
      setHovered(next)
      onMoved(next + 1)
    }
  }

  const onPointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return
    // Keep Radix from opening the menu on press; a press without dragging opens it on release.
    event.preventDefault()
    drag.current = { startY: event.clientY, index, active: false, before: index }
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  const onPointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    const d = drag.current
    if (!d) return
    if (!d.active && Math.abs(event.clientY - d.startY) < 4) return
    d.active = true
    d.before = dropIndex(event.clientY)
    setIndicator(indicatorTop(d.before))
  }

  const endDrag = (event: React.PointerEvent<HTMLButtonElement>, cancelled = false) => {
    const d = drag.current
    drag.current = null
    event.currentTarget.releasePointerCapture?.(event.pointerId)
    setIndicator(null)
    if (cancelled || !d) return
    if (d.active) move(d.before)
    else setMenu(true)
  }

  if (count === 0) return null

  return (
    <>
      <div
        data-slot="block-handle"
        style={{ top }}
        className="gap-0.5 start-0 absolute z-10 flex items-center transition-[top] duration-150 motion-reduce:transition-none touch:flex-col"
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-label={t("editor.addBlock")}
              title={t("editor.addBlock")}
              onMouseDown={(event) => event.preventDefault()}
              className="touch:size-11 text-muted-foreground"
            >
              <Icon name="plus" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="max-h-80 min-w-56 w-auto">
            {blocks.map((block) => (
              <DropdownMenuItem
                key={block.id}
                onSelect={() => {
                  insertParagraphAfter(editor, index)
                  runBlock(editor, block, context)
                }}
              >
                <Icon name={block.icon} />
                {blockTitle(block, t)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu open={menu} onOpenChange={setMenu}>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-label={t("editor.blockHandle")}
              title={t("editor.blockHandle")}
              data-dragging={indicator !== null || undefined}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={(event) => endDrag(event)}
              onPointerCancel={(event) => endDrag(event, true)}
              className="touch:size-11 cursor-grab touch-none text-muted-foreground data-dragging:cursor-grabbing"
            >
              <Icon name="grip-vertical" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-44 w-auto">
            <DropdownMenuItem disabled={index === 0} onSelect={() => move(index - 1)}>
              <Icon name="arrow-up" />
              {t("editor.moveUp")}
            </DropdownMenuItem>
            <DropdownMenuItem disabled={index >= count - 1} onSelect={() => move(index + 2)}>
              <Icon name="arrow-down" />
              {t("editor.moveDown")}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => duplicateBlock(editor, index)}>
              <Icon name="copy" />
              {t("editor.duplicate")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={() => deleteBlock(editor, index)}>
              <Icon name="trash" />
              {t("editor.deleteBlock")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {indicator !== null ? (
        <div
          aria-hidden="true"
          data-slot="block-drop-indicator"
          style={{ top: indicator }}
          className="inset-x-0 h-0.5 pointer-events-none absolute z-10 -translate-y-1/2 rounded-full bg-primary"
        />
      ) : null}
    </>
  )
}
