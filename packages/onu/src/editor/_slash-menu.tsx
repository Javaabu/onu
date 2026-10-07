"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { Extension, type Editor, type Range } from "@tiptap/core"
import { PluginKey } from "@tiptap/pm/state"
import Suggestion, { type SuggestionProps } from "@tiptap/suggestion"

import { Icon } from "../icons/icon"
import { cn } from "../lib/utils"
import type { Translate } from "../i18n/types"
import { useTranslation } from "../providers/onu-provider"
import type { BlockType } from "./_blocks"

export const slashMenuPluginKey = new PluginKey("onuSlashMenu")

interface SlashState {
  open: boolean
  items: BlockType[]
  index: number
  props: SuggestionProps<BlockType, BlockType> | null
}

const CLOSED: SlashState = { open: false, items: [], index: 0, props: null }

/** Bridges the Suggestion plugin (outside React) and the menu component. */
export class SlashMenuStore {
  private state: SlashState = CLOSED
  private listeners = new Set<() => void>()

  subscribe = (listener: () => void) => {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  getSnapshot = () => this.state

  private set(next: Partial<SlashState>) {
    this.state = { ...this.state, ...next }
    this.listeners.forEach((listener) => listener())
  }

  show(props: SuggestionProps<BlockType, BlockType>) {
    const keepIndex = this.state.open && this.state.items.length === props.items.length
    this.set({ open: true, items: props.items, props, index: keepIndex ? this.state.index : 0 })
  }

  hide() {
    this.set(CLOSED)
  }

  highlight(index: number) {
    this.set({ index })
  }

  select(index = this.state.index) {
    const item = this.state.items[index]
    if (item && this.state.props) this.state.props.command(item)
  }

  /** Arrow keys move, Enter/Tab picks. Escape is handled by the plugin. */
  keyDown(event: KeyboardEvent): boolean {
    const { open, items, index } = this.state
    if (!open || !items.length) return false
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      const step = event.key === "ArrowDown" ? 1 : -1
      this.set({ index: (index + step + items.length) % items.length })
      return true
    }
    if (event.key === "Enter" || event.key === "Tab") {
      this.select()
      return true
    }
    return false
  }
}

export interface SlashMenuOptions {
  store: SlashMenuStore
  items: (query: string) => BlockType[]
  onSelect: (editor: Editor, block: BlockType, range: Range) => void
}

/** Typing "/" opens the block menu (built on `@tiptap/suggestion`, MIT). */
export const SlashMenu = Extension.create<SlashMenuOptions>({
  name: "slashMenu",

  addOptions() {
    return { store: new SlashMenuStore(), items: () => [], onSelect: () => {} }
  },

  addProseMirrorPlugins() {
    const { store, items, onSelect } = this.options
    return [
      Suggestion<BlockType, BlockType>({
        editor: this.editor,
        pluginKey: slashMenuPluginKey,
        char: "/",
        allowSpaces: false,
        startOfLine: false,
        // Not inside code, where "/" is just a character.
        allow: ({ state, range }) => !state.doc.resolve(range.from).parent.type.spec.code,
        items: ({ query }) => items(query),
        command: ({ editor, range, props }) => onSelect(editor, props, range),
        render: () => ({
          onStart: (props) => store.show(props),
          onUpdate: (props) => store.show(props),
          onExit: () => store.hide(),
          onKeyDown: ({ event }) => store.keyDown(event),
        }),
      }),
    ]
  },
})

export function useSlashMenu(store: SlashMenuStore) {
  return React.useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot)
}

export function blockTitle(block: BlockType, t: Translate) {
  return t(block.title, block.level ? { level: block.level } : undefined)
}

/**
 * The floating list of blocks for the slash command. The editor keeps focus;
 * the highlighted option is exposed with `aria-activedescendant` on the editor.
 */
export function SlashMenuPopup({ store, editor }: { store: SlashMenuStore; editor: Editor }) {
  const { t } = useTranslation()
  const { open, items, index, props } = useSlashMenu(store)
  const listId = React.useId()
  const ref = React.useRef<HTMLDivElement>(null)
  const [position, setPosition] = React.useState<React.CSSProperties>({ visibility: "hidden" })

  React.useEffect(() => {
    const el = ref.current
    if (!open || !el || !props) return
    return props.mount(el, {
      onPosition: ({ x, y, strategy }) => setPosition({ position: strategy, left: x, top: y }),
    })
  }, [open, props])

  React.useEffect(() => {
    const dom = editor.view.dom
    if (!open) return
    dom.setAttribute("aria-controls", listId)
    const active = items[index]
    if (active) dom.setAttribute("aria-activedescendant", `${listId}-${active.id}`)
    else dom.removeAttribute("aria-activedescendant")
    ref.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: "nearest" })
    return () => {
      dom.removeAttribute("aria-controls")
      dom.removeAttribute("aria-activedescendant")
    }
  }, [open, items, index, editor, listId])

  if (!open) return null

  return createPortal(
    <div
      ref={ref}
      data-slot="slash-menu"
      style={{ position: "fixed", ...position }}
      className="max-h-80 w-72 p-1 shadow-md z-50 max-w-[calc(100vw-2rem)] overflow-y-auto rounded-lg bg-popover text-popover-foreground ring-1 ring-foreground/10"
    >
      {items.length ? (
        <div role="listbox" id={listId} aria-label={t("editor.blocks")}>
          {items.map((item, i) => (
            // Keyboard selection happens in the editor, which owns focus (aria-activedescendant).
            // eslint-disable-next-line jsx-a11y/click-events-have-key-events
            <div
              key={item.id}
              id={`${listId}-${item.id}`}
              role="option"
              aria-selected={i === index}
              tabIndex={-1}
              onMouseDown={(event) => event.preventDefault()}
              onMouseEnter={() => store.highlight(i)}
              onClick={() => store.select(i)}
              className={cn(
                "gap-3 px-2 py-1.5 text-sm touch:min-h-11 flex cursor-default items-center rounded-md",
                "aria-selected:bg-accent aria-selected:text-accent-foreground",
              )}
            >
              <span className="size-8 flex shrink-0 items-center justify-center rounded-md border border-border bg-background">
                <Icon name={item.icon} />
              </span>
              <span className="min-w-0 grid">
                <span className="font-medium truncate">{blockTitle(item, t)}</span>
                {item.description ? (
                  <span className="text-xs truncate text-muted-foreground">{t(item.description)}</span>
                ) : null}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="px-2 py-1.5 text-sm text-muted-foreground">{t("editor.noBlocks")}</p>
      )}
      <span className="sr-only" aria-live="polite">
        {items.length ? t("editor.blockResults", { count: items.length }) : t("editor.noBlocks")}
      </span>
    </div>,
    document.body,
  )
}
