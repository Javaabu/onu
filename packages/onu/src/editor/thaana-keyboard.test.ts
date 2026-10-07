import { Editor } from "@tiptap/core"
import StarterKit from "@tiptap/starter-kit"
import { Slice } from "@tiptap/pm/model"
import type { EditorView } from "@tiptap/pm/view"
import { afterEach, describe, expect, it, vi } from "vitest"

import { ThaanaKeyboard } from "./thaana-keyboard"

let editor: Editor | null = null
afterEach(() => {
  editor?.destroy()
  editor = null
})

function create(options: Parameters<typeof ThaanaKeyboard.configure>[0] = {}, content = "<p></p>") {
  editor = new Editor({ extensions: [StarterKit, ThaanaKeyboard.configure(options)], content })
  return editor
}

/** Types like ProseMirror does after reading a DOM change. */
function typeText(view: EditorView, text: string) {
  for (const ch of text) {
    const { from, to } = view.state.selection
    const deflt = () => view.state.tr.insertText(ch, from, to)
    if (!view.someProp("handleTextInput", (f) => f(view, from, to, ch, deflt))) view.dispatch(deflt())
  }
}

function beforeInput(view: EditorView, data: string, inputType = "insertText") {
  const event = new InputEvent("beforeinput", { inputType, data, cancelable: true, bubbles: true })
  view.dom.dispatchEvent(event)
  return event
}

function pressToggle(view: EditorView) {
  const event = new KeyboardEvent("keydown", {
    key: "T",
    code: "KeyT",
    keyCode: 84,
    altKey: true,
    shiftKey: true,
    bubbles: true,
    cancelable: true,
  })
  return view.someProp("handleKeyDown", (f) => f(view, event)) ?? false
}

describe("ThaanaKeyboard", () => {
  it("maps typed Latin characters to Thaana through transactions", () => {
    const { view } = create()
    typeText(view, "ahmadu")
    expect(editor!.getText()).toBe("ަހމަދު")
  })

  it("maps beforeinput text and cancels the native insert", () => {
    const { view } = create()
    const event = beforeInput(view, "s")
    expect(event.defaultPrevented).toBe(true)
    expect(editor!.getText()).toBe("ސ")
  })

  it("leaves unmapped characters, other input types and IME text alone", () => {
    const { view } = create()
    expect(beforeInput(view, "1").defaultPrevented).toBe(false)
    expect(beforeInput(view, "s", "insertFromPaste").defaultPrevented).toBe(false)
    const composing = new InputEvent("beforeinput", {
      inputType: "insertText",
      data: "s",
      cancelable: true,
      isComposing: true,
    })
    view.dom.dispatchEvent(composing)
    expect(composing.defaultPrevented).toBe(false)
    typeText(view, "ސ")
    expect(editor!.getText()).toBe("ސ")
  })

  it("replaces the selection when typing over it", () => {
    const { view } = create({}, "<p>hello</p>")
    editor!.commands.setTextSelection({ from: 1, to: 6 })
    typeText(view, "b")
    expect(editor!.getText()).toBe("ބ")
  })

  it("keeps undo working", () => {
    const { view } = create()
    typeText(view, "salAm")
    expect(editor!.getText()).toBe("ސަލާމ")
    editor!.commands.undo()
    expect(editor!.getText()).toBe("")
  })

  it("can start disabled and be toggled by command, storage and shortcut", () => {
    const onToggle = vi.fn()
    const { view } = create({ enabled: false, onToggle })
    typeText(view, "a")
    expect(editor!.getText()).toBe("a")
    expect(editor!.storage.thaanaKeyboard.enabled).toBe(false)

    editor!.commands.toggleThaana()
    expect(editor!.storage.thaanaKeyboard.enabled).toBe(true)
    expect(onToggle).toHaveBeenLastCalledWith(true)
    typeText(view, "b")
    expect(editor!.getText()).toBe("aބ")

    expect(pressToggle(view)).toBe(true)
    expect(editor!.storage.thaanaKeyboard.enabled).toBe(false)
    editor!.commands.setThaana(true)
    expect(editor!.storage.thaanaKeyboard.enabled).toBe(true)
    // A dry run (`can()`) never changes the mode.
    expect(editor!.can().setThaana(false)).toBe(true)
    expect(editor!.storage.thaanaKeyboard.enabled).toBe(true)
  })

  it("has no shortcut when toggleShortcut is false", () => {
    const { view } = create({ toggleShortcut: false })
    expect(pressToggle(view)).toBe(false)
    expect(editor!.storage.thaanaKeyboard.enabled).toBe(true)
  })

  it("uses the typewriter keymap and custom keymaps", () => {
    const { view } = create({ keymap: { q: "ޤ" } })
    typeText(view, "qs")
    expect(editor!.getText()).toBe("ޤs")
  })

  it("keeps pasted text by default and transliterates Latin when asked", () => {
    const paste = (view: EditorView, text: string, html = "") => {
      const event = {
        clipboardData: { getData: (type: string) => (type === "text/plain" ? text : type === "text/html" ? html : "") },
      } as unknown as ClipboardEvent
      return view.someProp("handlePaste", (f) => f(view, event, Slice.empty)) ?? false
    }
    const { view } = create()
    expect(paste(view, "salAm")).toBe(false)
    editor!.destroy()

    const second = create({ paste: "transliterate" })
    expect(paste(second.view, "salAm")).toBe(true)
    expect(editor!.getText()).toBe("ސަލާމ")
    expect(paste(second.view, "ސަލާމް")).toBe(false)
    expect(paste(second.view, "rich", "<b>rich</b>")).toBe(false)
    editor!.commands.setThaana(false)
    expect(paste(second.view, "salAm")).toBe(false)
  })

  it("converts words composed by predictive keyboards", async () => {
    vi.useFakeTimers()
    const { view } = create()
    view.dom.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }))
    view.dispatch(view.state.tr.insertText("salAm"))
    view.dom.dispatchEvent(new CompositionEvent("compositionend", { data: "salAm", bubbles: true }))
    vi.runAllTimers()
    expect(editor!.getText()).toBe("ސަލާމ")

    // Native Thaana compositions and mismatched text are untouched.
    view.dom.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }))
    view.dom.dispatchEvent(new CompositionEvent("compositionend", { data: "ސ", bubbles: true }))
    view.dom.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }))
    view.dom.dispatchEvent(new CompositionEvent("compositionend", { data: "zzz", bubbles: true }))
    vi.runAllTimers()
    view.dom.dispatchEvent(new CompositionEvent("compositionend", { data: "abc", bubbles: true }))
    view.dom.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }))
    view.dom.dispatchEvent(new CompositionEvent("compositionend", { data: "123", bubbles: true }))
    vi.runAllTimers()
    expect(editor!.getText()).toBe("ސަލާމ")
    vi.useRealTimers()
  })
})
