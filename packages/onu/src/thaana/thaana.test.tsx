import * as React from "react"
import { act, fireEvent, render } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { attachThaanaKeyboard, insertText } from "./attach"
import { containsThaana, isLatinKeyboardText, resolveKeymap, translateKey, transliterate } from "./convert"
import { createKeymap, keymaps } from "./keymaps"
import { useThaanaField } from "./use-thaana-field"
import { useThaanaInput } from "./use-thaana-input"

function type(el: HTMLElement, data: string, init: Partial<InputEventInit> = {}) {
  const event = new InputEvent("beforeinput", {
    inputType: "insertText",
    data,
    cancelable: true,
    bubbles: true,
    ...init,
  })
  el.dispatchEvent(event)
  if (!event.defaultPrevented && (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement)) {
    // Simulate the browser inserting unhandled text.
    el.setRangeText(data, el.selectionStart ?? 0, el.selectionEnd ?? 0, "end")
  }
  return event
}

function input(value = "") {
  const el = document.createElement("input")
  el.value = value
  document.body.appendChild(el)
  el.setSelectionRange(value.length, value.length)
  return el
}

describe("keymaps", () => {
  it("map the JTK phonetic layout", () => {
    expect(transliterate("dhivehi", "phonetic")).toBe("ދހިވެހި")
    expect(translateKey("w")).toBe("އ")
    expect(translateKey("q")).toBe("ް")
    expect(translateKey("F")).toBe("ﷲ")
    expect(translateKey(",")).toBe("،")
    expect(translateKey("?")).toBe("؟")
  })

  it("differ between phonetic variants and the typewriter layout", () => {
    expect(translateKey("w", "phonetic-hh")).toBe("ަ")
    expect(translateKey("a", "phonetic-hh")).toBe("އ")
    expect(translateKey("q", "typewriter")).toBe("ޫ")
    expect(translateKey("f", "typewriter")).toBe("ަ")
  })

  it("leave unmapped and identical keys out", () => {
    expect(translateKey("1")).toBeUndefined()
    expect(translateKey(".")).toBeUndefined()
    expect(Object.keys(keymaps.phonetic)).not.toContain(".")
  })

  it("can be custom", () => {
    const map = createKeymap("ab", "ހb")
    expect(map).toEqual({ a: "ހ" })
    expect(transliterate("ab", map)).toBe("ހb")
    expect(resolveKeymap(map)).toBe(map)
    expect(() => createKeymap("abc", "x")).toThrow(/length mismatch/)
  })

  it("detect Thaana and Latin keyboard text", () => {
    expect(containsThaana("hello")).toBe(false)
    expect(containsThaana("ދިވެހި")).toBe(true)
    expect(isLatinKeyboardText("Hello, world!")).toBe(true)
    expect(isLatinKeyboardText("ދ")).toBe(false)
  })
})

describe("attachThaanaKeyboard", () => {
  it("converts typed characters and keeps unmapped ones", () => {
    const el = input()
    const kb = attachThaanaKeyboard(el)
    type(el, "s")
    type(el, "a")
    type(el, "1")
    expect(el.value).toBe("ސަ1")
    kb.detach()
    type(el, "s")
    expect(el.value).toBe("ސަ1s")
  })

  it("replaces the selection and fires input events", () => {
    const el = input("abc")
    const onInput = vi.fn()
    el.addEventListener("input", onInput)
    attachThaanaKeyboard(el)
    el.setSelectionRange(1, 2)
    type(el, "h")
    expect(el.value).toBe("aހc")
    expect(el.selectionStart).toBe(2)
    expect(onInput).toHaveBeenCalled()
  })

  it("does nothing while disabled, composing or for other input types", () => {
    const el = input()
    const kb = attachThaanaKeyboard(el, { enabled: false })
    expect(type(el, "s").defaultPrevented).toBe(false)
    kb.setEnabled(true)
    expect(kb.isEnabled()).toBe(true)
    expect(type(el, "s", { isComposing: true }).defaultPrevented).toBe(false)
    expect(type(el, "s", { inputType: "deleteContentBackward" }).defaultPrevented).toBe(false)
    expect(type(el, "", {}).defaultPrevented).toBe(false)
  })

  it("switches keymaps", () => {
    const el = input()
    const kb = attachThaanaKeyboard(el)
    kb.setKeymap("typewriter")
    type(el, "f")
    expect(el.value).toBe("ަ")
  })

  it("keeps pasted text by default and converts it when asked", () => {
    const keep = input()
    attachThaanaKeyboard(keep)
    expect(type(keep, "salAm", { inputType: "insertFromPaste" }).defaultPrevented).toBe(false)

    const convert = input()
    attachThaanaKeyboard(convert, { paste: "transliterate" })
    type(convert, "salAm", { inputType: "insertFromPaste" })
    expect(convert.value).toBe("ސަލާމ")
    // Already Thaana: left alone.
    expect(type(convert, "ދ", { inputType: "insertFromPaste" }).defaultPrevented).toBe(false)
    expect(type(convert, "", { inputType: "insertFromPaste" }).defaultPrevented).toBe(false)
  })

  it("converts words composed by predictive (Android) keyboards", () => {
    const el = input("x ")
    attachThaanaKeyboard(el)
    el.setSelectionRange(2, 2)
    el.dispatchEvent(new CompositionEvent("compositionstart"))
    el.setRangeText("salAm", 2, 2, "end")
    el.dispatchEvent(new CompositionEvent("compositionend", { data: "salAm" }))
    expect(el.value).toBe("x ސަލާމ")
  })

  it("passes native IME and unconvertible compositions through", () => {
    const el = input()
    const kb = attachThaanaKeyboard(el)
    el.dispatchEvent(new CompositionEvent("compositionstart"))
    el.setRangeText("ދިވެހި", 0, 0, "end")
    el.dispatchEvent(new CompositionEvent("compositionend", { data: "ދިވެހި" }))
    expect(el.value).toBe("ދިވެހި")
    el.dispatchEvent(new CompositionEvent("compositionstart"))
    el.dispatchEvent(new CompositionEvent("compositionend", { data: "123" }))
    expect(el.value).toBe("ދިވެހި")
    // Composition end without a start.
    el.dispatchEvent(new CompositionEvent("compositionend", { data: "abc" }))
    kb.setEnabled(false)
    el.dispatchEvent(new CompositionEvent("compositionstart"))
    el.dispatchEvent(new CompositionEvent("compositionend", { data: "abc" }))
    expect(el.value).toBe("ދިވެހި")
  })

  it("toggles with Alt+Shift+T, a custom shortcut, or not at all", () => {
    const el = input()
    const onToggle = vi.fn()
    const kb = attachThaanaKeyboard(el, { onToggle })
    fireEvent.keyDown(el, { code: "KeyT", altKey: true, shiftKey: true })
    expect(kb.isEnabled()).toBe(false)
    expect(onToggle).toHaveBeenLastCalledWith(false)
    fireEvent.keyDown(el, { code: "KeyT", altKey: true })
    fireEvent.keyDown(el, { code: "KeyX", altKey: true, shiftKey: true })
    expect(kb.isEnabled()).toBe(false)

    const custom = input()
    const c = attachThaanaKeyboard(custom, { toggleShortcut: { code: "Space", ctrlKey: true } })
    fireEvent.keyDown(custom, { code: "Space", ctrlKey: true })
    expect(c.isEnabled()).toBe(false)

    const none = input()
    const n = attachThaanaKeyboard(none, { toggleShortcut: false })
    fireEvent.keyDown(none, { code: "KeyT", altKey: true, shiftKey: true })
    expect(n.isEnabled()).toBe(true)
  })

  it("works on textareas and contenteditable elements", () => {
    const ta = document.createElement("textarea")
    document.body.appendChild(ta)
    attachThaanaKeyboard(ta)
    type(ta, "k")
    expect(ta.value).toBe("ކ")

    const div = document.createElement("div")
    div.contentEditable = "true"
    div.textContent = ""
    document.body.appendChild(div)
    const range = document.createRange()
    range.selectNodeContents(div)
    range.collapse(false)
    document.getSelection()!.removeAllRanges()
    document.getSelection()!.addRange(range)
    attachThaanaKeyboard(div)
    type(div, "k")
    expect(div.textContent).toBe("ކ")
  })
})

describe("insertText", () => {
  it("prefers execCommand so undo keeps working", () => {
    const el = input()
    const exec = vi.fn(() => true)
    Object.defineProperty(document, "execCommand", { value: exec, configurable: true })
    insertText(el, "ހ")
    expect(exec).toHaveBeenCalledWith("insertText", false, "ހ")
    const div = document.createElement("div")
    insertText(div, "ހ")
    expect(exec).toHaveBeenCalledTimes(2)
    // A throwing execCommand falls back to manual insertion.
    Object.defineProperty(document, "execCommand", {
      value: () => {
        throw new Error("nope")
      },
      configurable: true,
    })
    insertText(el, "ށ")
    expect(el.value).toBe("ށ")
    const div2 = document.createElement("div")
    document.body.appendChild(div2)
    document.getSelection()!.removeAllRanges()
    insertText(div2, "ށ")
    expect(div2.textContent).toBe("")
    // @ts-expect-error cleanup of the test override
    delete document.execCommand
  })

  it("inserts at the end when the control reports no selection", () => {
    const el = document.createElement("textarea")
    el.value = "ab"
    Object.defineProperty(el, "selectionStart", { get: () => null, configurable: true })
    Object.defineProperty(el, "selectionEnd", { get: () => null, configurable: true })
    const setRangeText = vi.spyOn(el, "setRangeText").mockImplementation(() => {})
    insertText(el, "ހ")
    expect(setRangeText).toHaveBeenCalledWith("ހ", 2, 2, "end")
  })

  it("ignores compositions in contenteditable elements and without a caret", () => {
    const div = document.createElement("div")
    div.contentEditable = "true"
    attachThaanaKeyboard(div)
    div.dispatchEvent(new CompositionEvent("compositionstart"))
    div.dispatchEvent(new CompositionEvent("compositionend", { data: "abc" }))
    expect(div.textContent).toBe("")

    const el = input()
    Object.defineProperty(el, "selectionStart", { get: () => null, configurable: true })
    attachThaanaKeyboard(el)
    el.dispatchEvent(new CompositionEvent("compositionstart"))
    el.dispatchEvent(new CompositionEvent("compositionend", { data: "abc" }))
    expect(el.value).toBe("")
  })
})

describe("useThaanaInput", () => {
  function Field(props: { enabled?: boolean; onEnabledChange?: (v: boolean) => void; defaultEnabled?: boolean }) {
    const ref = React.useRef<HTMLInputElement>(null)
    const { enabled, toggle } = useThaanaInput(ref, {
      ...props,
      toggleShortcut: { code: "KeyT", altKey: true, shiftKey: true },
    })
    return (
      <>
        <input ref={ref} aria-label="field" />
        <button onClick={toggle}>{enabled ? "on" : "off"}</button>
      </>
    )
  }

  it("attaches, toggles from a button and the shortcut, and detaches", () => {
    const { getByLabelText, getByRole, unmount } = render(<Field />)
    const el = getByLabelText("field") as HTMLInputElement
    act(() => {
      type(el, "m")
    })
    expect(el.value).toBe("މ")
    fireEvent.click(getByRole("button"))
    expect(getByRole("button")).toHaveTextContent("off")
    type(el, "m")
    expect(el.value).toBe("މm")
    fireEvent.keyDown(el, { code: "KeyT", altKey: true, shiftKey: true })
    expect(getByRole("button")).toHaveTextContent("on")
    unmount()
  })

  it("supports controlled state", () => {
    const onEnabledChange = vi.fn()
    const { getByRole, rerender } = render(<Field enabled={false} onEnabledChange={onEnabledChange} />)
    fireEvent.click(getByRole("button"))
    expect(onEnabledChange).toHaveBeenCalledWith(true)
    expect(getByRole("button")).toHaveTextContent("off")
    rerender(<Field enabled onEnabledChange={onEnabledChange} />)
    expect(getByRole("button")).toHaveTextContent("on")
  })
})

describe("useThaanaField", () => {
  function Field({ thaana }: { thaana?: Parameters<typeof useThaanaField>[1] }) {
    const ref = React.useRef<HTMLInputElement>(null)
    const { fieldProps, enabled, active, toggle } = useThaanaField(ref, thaana)
    return (
      <>
        <input ref={ref} aria-label="field" {...fieldProps} />
        <output>{`${active}:${enabled}`}</output>
        <button onClick={toggle}>toggle</button>
      </>
    )
  }

  it("sets dir, lang and data-thaana only when on", () => {
    const { getByLabelText, getByRole, rerender } = render(<Field thaana />)
    const el = getByLabelText("field")
    expect(el).toHaveAttribute("dir", "rtl")
    expect(el).toHaveAttribute("lang", "dv")
    expect(el).toHaveAttribute("data-thaana")
    fireEvent.click(getByRole("button"))
    expect(el).toHaveAttribute("dir", "auto")
    expect(el).not.toHaveAttribute("lang")
    rerender(<Field thaana={false} />)
    expect(el).not.toHaveAttribute("dir")
    expect(getByRole("status")).toHaveTextContent("false:false")
  })

  it("accepts options", () => {
    const { getByLabelText } = render(<Field thaana={{ keymap: "typewriter", defaultEnabled: false }} />)
    expect(getByLabelText("field")).toHaveAttribute("dir", "auto")
  })
})
