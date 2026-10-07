import { isLatinKeyboardText, resolveKeymap, transliterate } from "./convert"
import type { Keymap, KeymapName } from "./keymaps"

export type ThaanaTarget = HTMLInputElement | HTMLTextAreaElement | HTMLElement

export interface ThaanaShortcut {
  code: string
  altKey?: boolean
  shiftKey?: boolean
  ctrlKey?: boolean
  metaKey?: boolean
}

export interface ThaanaKeyboardOptions {
  /** Keymap name or a custom keymap. Default: `"phonetic"` (JTK-compatible). */
  keymap?: KeymapName | Keymap
  /** Start enabled. Default `true`. */
  enabled?: boolean
  /** Pasted text: keep as-is (default) or convert Latin to Thaana (R13.6). */
  paste?: "keep" | "transliterate"
  /**
   * Shortcut that toggles Thaana on and off, or `false` to disable.
   * Default: Alt+Shift+T. Matched on `event.code`, so it works on any layout.
   */
  toggleShortcut?: false | ThaanaShortcut
  /** Called when the shortcut toggles the mode. */
  onToggle?: (enabled: boolean) => void
}

export interface ThaanaKeyboardController {
  isEnabled: () => boolean
  setEnabled: (enabled: boolean) => void
  setKeymap: (keymap: KeymapName | Keymap) => void
  detach: () => void
}

const DEFAULT_SHORTCUT: ThaanaShortcut = { code: "KeyT", altKey: true, shiftKey: true }

function isTextControl(el: ThaanaTarget): el is HTMLInputElement | HTMLTextAreaElement {
  return el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement
}

/**
 * Inserts text at the caret, replacing the selection. Uses `execCommand` where
 * available so the browser's undo stack keeps working (R13.6), and falls back
 * to `setRangeText` / Range insertion plus a synthetic `input` event.
 */
export function insertText(el: ThaanaTarget, text: string, replace?: { start: number; end: number }) {
  if (isTextControl(el)) {
    if (replace) el.setSelectionRange(replace.start, replace.end)
    const doc = el.ownerDocument
    let done = false
    try {
      done = typeof doc.execCommand === "function" && doc.execCommand("insertText", false, text)
    } catch {
      done = false
    }
    if (!done) {
      const start = el.selectionStart ?? el.value.length
      const end = el.selectionEnd ?? start
      el.setRangeText(text, start, end, "end")
      el.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: text }))
    }
    return
  }

  const doc = el.ownerDocument
  let done = false
  try {
    done = typeof doc.execCommand === "function" && doc.execCommand("insertText", false, text)
  } catch {
    done = false
  }
  if (!done) {
    const selection = doc.getSelection()
    if (!selection || selection.rangeCount === 0) return
    const range = selection.getRangeAt(0)
    range.deleteContents()
    const node = doc.createTextNode(text)
    range.insertNode(node)
    range.setStartAfter(node)
    range.collapse(true)
    selection.removeAllRanges()
    selection.addRange(range)
    el.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: text }))
  }
}

/**
 * Makes an input, textarea or contenteditable element type Thaana from a Latin
 * keyboard (R13.1, R13.6). Works with physical and on-screen keyboards:
 *
 * - typed characters are mapped in `beforeinput` (no keyCode, so Android's 229 is fine);
 * - keyboards that compose whole words (Gboard and other predictive keyboards)
 *   are converted when the composition ends;
 * - text composed by a native Thaana or other IME passes through untouched;
 * - Ctrl/Cmd shortcuts never reach `beforeinput` as text, so they pass through.
 */
export function attachThaanaKeyboard(el: ThaanaTarget, options: ThaanaKeyboardOptions = {}): ThaanaKeyboardController {
  let keymap = resolveKeymap(options.keymap)
  let enabled = options.enabled ?? true
  const shortcut = options.toggleShortcut === undefined ? DEFAULT_SHORTCUT : options.toggleShortcut
  let compositionStart: number | null = null
  // Our own execCommand insertions fire beforeinput again; ignore those.
  let inserting = false
  const insert = (text: string, replace?: { start: number; end: number }) => {
    inserting = true
    try {
      insertText(el, text, replace)
    } finally {
      inserting = false
    }
  }

  const onBeforeInput = (event: InputEvent) => {
    if (!enabled || inserting || event.isComposing) return
    const { inputType, data } = event

    if (inputType === "insertText" && data) {
      const mapped = Array.from(data)
        .map((ch) => keymap[ch] ?? ch)
        .join("")
      if (mapped === data) return
      event.preventDefault()
      insert(mapped)
      return
    }

    if (inputType === "insertFromPaste" && options.paste === "transliterate") {
      const pasted = event.dataTransfer?.getData("text/plain") ?? data
      if (!pasted || !isLatinKeyboardText(pasted)) return
      event.preventDefault()
      insert(transliterate(pasted, keymap))
    }
  }

  const onCompositionStart = () => {
    compositionStart = isTextControl(el) ? (el.selectionStart ?? null) : null
  }

  const onCompositionEnd = (event: CompositionEvent) => {
    const start = compositionStart
    compositionStart = null
    if (!enabled || !event.data || !isLatinKeyboardText(event.data) || !isTextControl(el) || start === null) return
    const converted = transliterate(event.data, keymap)
    if (converted === event.data) return
    // The composed word is already in the field; swap it for its Thaana form.
    insert(converted, { start, end: start + event.data.length })
  }

  const onKeyDown = (event: KeyboardEvent) => {
    if (!shortcut || event.code !== shortcut.code) return
    if (
      !!shortcut.altKey !== event.altKey ||
      !!shortcut.shiftKey !== event.shiftKey ||
      !!shortcut.ctrlKey !== event.ctrlKey ||
      !!shortcut.metaKey !== event.metaKey
    ) {
      return
    }
    event.preventDefault()
    enabled = !enabled
    options.onToggle?.(enabled)
  }

  el.addEventListener("beforeinput", onBeforeInput as EventListener)
  el.addEventListener("compositionstart", onCompositionStart)
  el.addEventListener("compositionend", onCompositionEnd as EventListener)
  el.addEventListener("keydown", onKeyDown as EventListener)

  return {
    isEnabled: () => enabled,
    setEnabled: (value) => {
      enabled = value
    },
    setKeymap: (value) => {
      keymap = resolveKeymap(value)
    },
    detach: () => {
      el.removeEventListener("beforeinput", onBeforeInput as EventListener)
      el.removeEventListener("compositionstart", onCompositionStart)
      el.removeEventListener("compositionend", onCompositionEnd as EventListener)
      el.removeEventListener("keydown", onKeyDown as EventListener)
    },
  }
}
