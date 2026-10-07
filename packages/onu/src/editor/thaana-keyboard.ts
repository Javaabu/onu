import { Extension } from "@tiptap/core"
import { Plugin, PluginKey } from "@tiptap/pm/state"
import type { EditorView } from "@tiptap/pm/view"

import { isLatinKeyboardText, resolveKeymap, transliterate } from "../thaana/convert"
import type { Keymap, KeymapName } from "../thaana/keymaps"

export interface ThaanaKeyboardOptions {
  /** Start with Thaana typing on. Default `true`. */
  enabled: boolean
  /** Keymap name or a custom keymap. Default `"phonetic"` (JTK-compatible). */
  keymap: KeymapName | Keymap
  /** Pasted plain text: keep as-is (default) or convert Latin to Thaana (R13.6). */
  paste: "keep" | "transliterate"
  /** ProseMirror key name that toggles Thaana, or `false`. Default `"Alt-Shift-t"`. */
  toggleShortcut: string | false
  /** Called whenever Thaana typing is switched on or off. */
  onToggle?: (enabled: boolean) => void
}

export interface ThaanaKeyboardStorage {
  enabled: boolean
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    thaanaKeyboard: {
      /** Switch Thaana typing on or off. */
      setThaana: (enabled: boolean) => ReturnType
      /** Toggle between Thaana and Latin typing (Alt+Shift+T). */
      toggleThaana: () => ReturnType
    }
  }
  interface Storage {
    thaanaKeyboard: ThaanaKeyboardStorage
  }
}

export const thaanaKeyboardPluginKey = new PluginKey("thaanaKeyboard")

/** Maps one typed string through a keymap; unmapped characters are kept. */
function mapText(text: string, keymap: Keymap) {
  let out = ""
  for (const ch of text) out += keymap[ch] ?? ch
  return out
}

/**
 * Inserts text the way a typed character would be inserted, so other
 * `handleTextInput` plugins (input rules, for example) still see it.
 */
function insertTyped(view: EditorView, from: number, to: number, text: string) {
  const deflt = () => view.state.tr.insertText(text, from, to)
  if (!view.someProp("handleTextInput", (f) => f(view, from, to, text, deflt))) view.dispatch(deflt())
}

/**
 * Tiptap extension that types Thaana from a Latin keyboard through ProseMirror
 * transactions, not raw DOM edits (R13.2). Undo/redo, collaboration and input
 * rules keep working because every keystroke becomes a normal transaction.
 *
 * - Typed characters are mapped in `beforeinput` (works with Android's keyCode 229)
 *   and, as a fallback, in `handleTextInput`.
 * - Ctrl/Cmd shortcuts never produce text input, so they pass through.
 * - Text from an IME or a native Thaana keyboard is never touched.
 * - Words composed by predictive keyboards are converted when composition ends.
 * - `Alt+Shift+T` (or `toggleThaana()`) switches between Thaana and Latin.
 */
export const ThaanaKeyboard = Extension.create<ThaanaKeyboardOptions, ThaanaKeyboardStorage>({
  name: "thaanaKeyboard",

  addOptions() {
    return { enabled: true, keymap: "phonetic", paste: "keep", toggleShortcut: "Alt-Shift-t", onToggle: undefined }
  },

  addStorage() {
    return { enabled: this.options.enabled }
  },

  addCommands() {
    return {
      setThaana:
        (enabled) =>
        ({ tr, dispatch }) => {
          if (dispatch) {
            this.storage.enabled = enabled
            // A transaction makes React bindings (useEditorState) re-read the mode.
            tr.setMeta(thaanaKeyboardPluginKey, enabled)
            this.options.onToggle?.(enabled)
          }
          return true
        },
      toggleThaana:
        () =>
        ({ commands }) =>
          commands.setThaana(!this.storage.enabled),
    }
  },

  addKeyboardShortcuts() {
    const shortcut = this.options.toggleShortcut
    if (!shortcut) return {}
    return { [shortcut]: () => this.editor.commands.toggleThaana() }
  },

  addProseMirrorPlugins() {
    const keymap = resolveKeymap(this.options.keymap)
    const storage = this.storage
    const pasteMode = this.options.paste
    let composingFrom: number | null = null

    return [
      new Plugin({
        key: thaanaKeyboardPluginKey,
        props: {
          handleTextInput(view, from, to, text) {
            if (!storage.enabled || view.composing) return false
            const mapped = mapText(text, keymap)
            if (mapped === text) return false
            insertTyped(view, from, to, mapped)
            return true
          },
          handlePaste(view, event) {
            if (!storage.enabled || pasteMode !== "transliterate") return false
            const text = event.clipboardData?.getData("text/plain")
            if (!text || !isLatinKeyboardText(text) || event.clipboardData?.getData("text/html")) return false
            view.dispatch(view.state.tr.insertText(transliterate(text, keymap)).scrollIntoView())
            return true
          },
          handleDOMEvents: {
            beforeinput(view, event) {
              if (!storage.enabled || event.isComposing || view.composing) return false
              if (event.inputType !== "insertText" || !event.data) return false
              const mapped = mapText(event.data, keymap)
              if (mapped === event.data) return false
              event.preventDefault()
              const { from, to } = view.state.selection
              insertTyped(view, from, to, mapped)
              return true
            },
            compositionstart(view) {
              composingFrom = view.state.selection.from
              return false
            },
            compositionend(view, event) {
              const start = composingFrom
              composingFrom = null
              const data = event.data
              if (!storage.enabled || start === null || !data || !isLatinKeyboardText(data)) return false
              const converted = transliterate(data, keymap)
              if (converted === data) return false
              // ProseMirror applies the composed text after this event; swap it once it has.
              setTimeout(() => {
                const end = start + data.length
                if (end > view.state.doc.content.size) return
                if (view.state.doc.textBetween(start, end) !== data) return
                view.dispatch(view.state.tr.insertText(converted, start, end))
              })
              return false
            },
          },
        },
      }),
    ]
  },
})
