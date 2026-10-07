import "../../test/prosemirror"

import * as React from "react"
import type { Editor, JSONContent } from "@tiptap/core"
import { act, fireEvent, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../test/utils"
import { FormField } from "../components/form/form-field"
import { deleteBlock, filterBlocks, BLOCK_TYPES, moveBlock } from "./_blocks"
import { BlockEditor, type BlockEditorProps } from "./block-editor"

async function setup(props: Partial<BlockEditorProps> = {}, options: Parameters<typeof renderWithOnu>[1] = {}) {
  let editor: Editor | null = null
  const utils = renderWithOnu(
    <BlockEditor
      aria-label="Page"
      onReady={(e) => {
        editor = e
      }}
      {...props}
    />,
    options,
  )
  const textbox = await screen.findByRole("textbox", { name: "Page" })
  await waitFor(() => expect(editor).not.toBeNull())
  return { ...utils, textbox, editor: editor! as Editor }
}

const blocks = (editor: Editor) => (editor.getJSON().content ?? []).map((n) => n.type)
const texts = (editor: Editor) => {
  const out: string[] = []
  editor.state.doc.forEach((node) => out.push(node.textContent))
  return out
}

function key(editor: Editor, init: KeyboardEventInit) {
  let handled = false
  act(() => {
    handled = !!editor.view.someProp("handleKeyDown", (f) => f(editor.view, new KeyboardEvent("keydown", init)))
  })
  return handled
}

const threeParagraphs = "<p>One</p><p>Two</p><p>Three</p>"

// Editor interactions (dialogs, menus, Tiptap) are slow under jsdom on busy machines.
vi.setConfig({ testTimeout: 30_000 })

describe("BlockEditor", () => {
  it("renders an accessible block editor with JSON output", async () => {
    const onChange = vi.fn()
    const { editor, textbox, container } = await setup({ onChange, className: "root-x" })
    expect(container.querySelector("[data-slot=block-editor]")).toHaveClass("root-x")
    expect(textbox).toHaveAttribute("aria-multiline", "true")
    expect(screen.getByRole("toolbar", { name: "Formatting" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Add block" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Drag to move/ })).toBeInTheDocument()
    expect(container.querySelector("[data-placeholder='Type “/” for blocks']")).toBeInTheDocument()
    act(() => {
      editor.commands.insertContent("Hello")
    })
    expect(onChange.mock.lastCall?.[0]).toMatchObject({
      type: "doc",
      content: [{ type: "paragraph", content: [{ type: "text", text: "Hello" }] }],
    })
    await expectNoA11yViolations()
  })

  it("follows a controlled JSON value", async () => {
    const first: JSONContent = { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "A" }] }] }
    const second: JSONContent = {
      type: "doc",
      content: [{ type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "B" }] }],
    }
    function Controlled() {
      const [value, setValue] = React.useState(first)
      return (
        <>
          <BlockEditor aria-label="Page" name="content" value={value} onChange={setValue} />
          <button type="button" onClick={() => setValue(second)}>
            Swap
          </button>
        </>
      )
    }
    const { container } = renderWithOnu(<Controlled />)
    const textbox = await screen.findByRole("textbox", { name: "Page" })
    expect(textbox).toHaveTextContent("A")
    fireEvent.click(screen.getByRole("button", { name: "Swap" }))
    await waitFor(() => expect(textbox.querySelector("h2")).toHaveTextContent("B"))
    expect(JSON.parse(container.querySelector<HTMLInputElement>("input[name=content]")!.value)).toEqual(second)
  })

  describe("slash menu", () => {
    async function openSlash(editor: Editor, query = "") {
      act(() => {
        editor.commands.insertContent(`/${query}`)
      })
      return screen.findByRole("listbox", { name: "Blocks" })
    }

    it("opens on '/', filters, moves with arrows and inserts with Enter", async () => {
      const { editor, textbox } = await setup()
      let list = await openSlash(editor)
      expect(within(list).getAllByRole("option").length).toBe(BLOCK_TYPES.length)
      expect(within(list).getAllByRole("option")[0]).toHaveAttribute("aria-selected", "true")
      expect(textbox).toHaveAttribute("aria-controls", list.id)
      expect(screen.getByText(`${BLOCK_TYPES.length} blocks`)).toBeInTheDocument()

      act(() => {
        editor.commands.insertContent("head")
      })
      list = await screen.findByRole("listbox")
      await waitFor(() => expect(within(list).getAllByRole("option")).toHaveLength(3))
      expect(key(editor, { key: "ArrowDown" })).toBe(true)
      expect(within(list).getByRole("option", { name: /Heading 2/ })).toHaveAttribute("aria-selected", "true")
      expect(textbox.getAttribute("aria-activedescendant")).toContain("heading2")
      key(editor, { key: "ArrowUp" })
      key(editor, { key: "ArrowUp" })
      expect(within(list).getByRole("option", { name: /Heading 3/ })).toHaveAttribute("aria-selected", "true")
      key(editor, { key: "Enter" })
      await waitFor(() => expect(screen.queryByRole("listbox")).not.toBeInTheDocument())
      expect(editor.isActive("heading", { level: 3 })).toBe(true)
      expect(editor.getText()).toBe("")
      expect(textbox).not.toHaveAttribute("aria-controls")
    })

    it("shows an empty state, closes with Escape and picks with the pointer", async () => {
      const user = userEvent.setup()
      const { editor } = await setup()
      act(() => {
        editor.commands.insertContent("/zzz")
      })
      expect(await screen.findByText("No matching blocks", { selector: "p" })).toBeInTheDocument()
      expect(key(editor, { key: "ArrowDown" })).toBe(false)
      key(editor, { key: "Escape" })
      await waitFor(() => expect(screen.queryByText("No matching blocks", { selector: "p" })).not.toBeInTheDocument())

      act(() => {
        editor.commands.clearContent()
        editor.commands.insertContent("/")
      })
      const list = await screen.findByRole("listbox")
      const quote = within(list).getByRole("option", { name: /Quote/ })
      fireEvent.mouseEnter(quote)
      expect(quote).toHaveAttribute("aria-selected", "true")
      await user.click(quote)
      expect(editor.isActive("blockquote")).toBe(true)
    })

    it.each([
      ["Bulleted list", "bulletList"],
      ["Numbered list", "orderedList"],
      ["Table", "table"],
      ["Divider", "horizontalRule"],
      ["Callout", "callout"],
      ["Code block", "codeBlock"],
      ["Text", "paragraph"],
    ])("inserts %s", async (name, type) => {
      const { editor } = await setup()
      const list = await openSlash(editor)
      fireEvent.click(within(list).getByRole("option", { name: new RegExp(`^${name}`) }))
      expect(blocks(editor)).toContain(type)
    })

    it("opens the image and embed dialogs", async () => {
      const user = userEvent.setup()
      const { editor } = await setup()
      let list = await openSlash(editor, "image")
      fireEvent.click(within(list).getByRole("option", { name: /Image/ }))
      let dialog = await screen.findByRole("dialog", { name: "Insert image" })
      await user.type(within(dialog).getByLabelText(/Image URL/), "https://example.mv/reef.jpg")
      await user.click(within(dialog).getByRole("button", { name: "Insert" }))
      await waitFor(() => expect(blocks(editor)).toContain("image"))

      act(() => {
        editor.commands.focus("end")
      })
      list = await openSlash(editor, "vid")
      fireEvent.click(within(list).getByRole("option", { name: /Embed/ }))
      dialog = await screen.findByRole("dialog", { name: "Embed media" })
      const url = within(dialog).getByLabelText(/Video link/)
      await user.type(url, "https://example.mv/clip")
      await user.click(within(dialog).getByRole("button", { name: "Insert" }))
      expect(within(dialog).getByText("This link can’t be embedded")).toBeInTheDocument()
      await user.clear(url)
      await user.type(url, "https://youtu.be/dQw4w9WgXcQ")
      await user.click(within(dialog).getByRole("button", { name: "Insert" }))
      await waitFor(() => expect(blocks(editor)).toContain("embed"))
      // The editor shows a preview card (no third-party iframe while editing).
      expect(editor.getHTML()).toContain('data-src="https://youtu.be/dQw4w9WgXcQ"')
      expect(editor.getHTML()).not.toContain("<iframe")
    })

    it("does not open inside code blocks", async () => {
      const { editor } = await setup({ defaultValue: "<pre><code>a</code></pre>" })
      act(() => {
        editor.commands.focus("end")
        editor.commands.insertContent("/")
      })
      await new Promise((r) => setTimeout(r, 20))
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument()
    })

    it("offers only the chosen block types", async () => {
      const { editor } = await setup({ blockTypes: ["paragraph", "callout"] })
      const list = await openSlash(editor)
      expect(within(list).getAllByRole("option")).toHaveLength(2)
    })
  })

  describe("moving blocks", () => {
    it("moves, duplicates and deletes blocks from the grip menu and announces moves", async () => {
      const user = userEvent.setup()
      const { editor } = await setup({ defaultValue: threeParagraphs })
      act(() => {
        editor.commands.setTextSelection(2)
      })
      const grip = screen.getByRole("button", { name: /Drag to move/ })
      fireEvent.pointerDown(grip, { button: 0, pointerId: 1, clientY: 10 })
      fireEvent.pointerUp(grip, { button: 0, pointerId: 1, clientY: 10 })
      const menu = await screen.findByRole("menu")
      expect(within(menu).getByRole("menuitem", { name: "Move up" })).toHaveAttribute("data-disabled")
      await user.click(within(menu).getByRole("menuitem", { name: "Move down" }))
      expect(texts(editor)).toEqual(["Two", "One", "Three"])
      expect(screen.getByText("Block moved to position 2")).toBeInTheDocument()

      fireEvent.keyDown(grip, { key: "Enter" })
      await user.click(await screen.findByRole("menuitem", { name: "Move up" }))
      expect(texts(editor)).toEqual(["One", "Two", "Three"])

      fireEvent.keyDown(grip, { key: "Enter" })
      await user.click(await screen.findByRole("menuitem", { name: "Duplicate" }))
      expect(texts(editor)).toEqual(["One", "One", "Two", "Three"])

      fireEvent.keyDown(grip, { key: "Enter" })
      await user.click(await screen.findByRole("menuitem", { name: "Delete block" }))
      expect(texts(editor)).toEqual(["One", "Two", "Three"])
    })

    it("moves the current block with Ctrl+Shift+Arrow keys", async () => {
      const { editor } = await setup({ defaultValue: threeParagraphs })
      act(() => {
        editor.commands.setTextSelection(2)
      })
      expect(key(editor, { key: "ArrowDown", ctrlKey: true, shiftKey: true })).toBe(true)
      expect(texts(editor)).toEqual(["Two", "One", "Three"])
      expect(screen.getByText("Block moved to position 2")).toBeInTheDocument()
      key(editor, { key: "ArrowUp", ctrlKey: true, shiftKey: true })
      expect(texts(editor)).toEqual(["One", "Two", "Three"])
      // Already at the top: nothing moves.
      expect(key(editor, { key: "ArrowUp", ctrlKey: true, shiftKey: true })).toBe(true)
      expect(texts(editor)).toEqual(["One", "Two", "Three"])
    })

    it("drags a block with the pointer and shows a drop indicator", async () => {
      const { editor, textbox, container } = await setup({ defaultValue: threeParagraphs })
      const paragraphs = Array.from(textbox.querySelectorAll("p"))
      paragraphs.forEach((el, i) => {
        el.getBoundingClientRect = () => new DOMRect(0, i * 40, 300, 40)
      })
      // Hovering a block moves the handle to it.
      fireEvent.pointerMove(paragraphs[0]!)
      const grip = screen.getByRole("button", { name: /Drag to move/ })
      fireEvent.pointerDown(grip, { button: 0, pointerId: 1, clientY: 20 })
      fireEvent.pointerMove(grip, { pointerId: 1, clientY: 22 })
      expect(container.querySelector("[data-slot=block-drop-indicator]")).toBeNull()
      fireEvent.pointerMove(grip, { pointerId: 1, clientY: 200 })
      expect(container.querySelector("[data-slot=block-drop-indicator]")).toBeInTheDocument()
      fireEvent.pointerUp(grip, { pointerId: 1, clientY: 200 })
      expect(texts(editor)).toEqual(["Two", "Three", "One"])
      expect(container.querySelector("[data-slot=block-drop-indicator]")).toBeNull()

      // A cancelled drag changes nothing; a right click does nothing.
      fireEvent.pointerDown(grip, { button: 0, pointerId: 2, clientY: 100 })
      fireEvent.pointerMove(grip, { pointerId: 2, clientY: 5 })
      fireEvent.pointerCancel(grip, { pointerId: 2 })
      fireEvent.pointerDown(grip, { button: 2, pointerId: 3 })
      fireEvent.pointerMove(grip, { pointerId: 3, clientY: 5 })
      expect(texts(editor)).toEqual(["Two", "Three", "One"])
    })

    it("adds a block below the current one from the + menu", async () => {
      const user = userEvent.setup()
      const { editor } = await setup({ defaultValue: "<p>First</p><p>Last</p>" })
      act(() => {
        editor.commands.setTextSelection(2)
      })
      await user.click(screen.getByRole("button", { name: "Add block" }))
      await user.click(await screen.findByRole("menuitem", { name: "Quote" }))
      expect(blocks(editor)).toEqual(["paragraph", "blockquote", "paragraph"])
    })

    it("has pure helpers that refuse no-op moves", async () => {
      const { editor } = await setup({ defaultValue: threeParagraphs })
      expect(moveBlock(editor, 0, 0)).toBeNull()
      expect(moveBlock(editor, 0, 1)).toBeNull()
      expect(moveBlock(editor, 5, 0)).toBeNull()
      act(() => {
        expect(moveBlock(editor, 2, 0)).toBe(0)
      })
      expect(texts(editor)).toEqual(["Three", "One", "Two"])
      act(() => {
        deleteBlock(editor, 0)
        deleteBlock(editor, 0)
        deleteBlock(editor, 0)
      })
      expect(blocks(editor)).toEqual(["paragraph"])
      expect(filterBlocks(BLOCK_TYPES, "  ", () => "")).toBe(BLOCK_TYPES)
    })
  })

  it("continues after a callout with Enter and turns it back with Backspace", async () => {
    const { editor } = await setup({
      defaultValue: { type: "doc", content: [{ type: "callout", content: [{ type: "text", text: "Tide" }] }] },
    })
    act(() => {
      editor.commands.focus("end")
    })
    key(editor, { key: "Enter" })
    expect(blocks(editor)).toEqual(["callout", "paragraph"])
    act(() => {
      editor.commands.setTextSelection(1)
    })
    key(editor, { key: "Backspace" })
    expect(blocks(editor)).toEqual(["paragraph", "paragraph"])
  })

  it("is read-only without handles or toolbar", async () => {
    const { textbox } = await setup({ readOnly: true, defaultValue: "<p>Fixed</p>" })
    expect(textbox).toHaveAttribute("contenteditable", "false")
    expect(screen.queryByRole("toolbar")).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Add block" })).not.toBeInTheDocument()
  })

  it("works inside a FormField and posts JSON", async () => {
    renderWithOnu(
      <FormField label="Content" name="page[content]" error="Required">
        <BlockEditor toolbar={false} />
      </FormField>,
    )
    const textbox = await screen.findByRole("textbox", { name: "Content" })
    expect(textbox).toHaveAttribute("aria-invalid", "true")
    const hidden = document.querySelector<HTMLInputElement>("input[name='page[content]']")!
    // An empty document posts an empty string, so "required" validation works server-side.
    expect(hidden.value).toBe("")
  })

  it("opens the link dialog with Mod+K and jumps to the toolbar with Alt+F10", async () => {
    const user = userEvent.setup()
    const { editor } = await setup({ defaultValue: "<p>Link me</p>" })
    key(editor, { key: "F10", altKey: true })
    expect(screen.getByRole("button", { name: "Bold" })).toHaveFocus()
    act(() => {
      editor.commands.selectAll()
    })
    key(editor, { key: "k", ctrlKey: true })
    const dialog = await screen.findByRole("dialog", { name: "Insert link" })
    await user.type(within(dialog).getByLabelText(/URL/), "gov.mv{Enter}")
    await waitFor(() => expect(editor.getHTML()).toContain('href="https://gov.mv"'))
  })

  it("types Thaana", async () => {
    const { textbox, editor } = await setup({ thaana: true })
    await waitFor(() => expect(textbox).toHaveAttribute("lang", "dv"))
    act(() => {
      textbox.dispatchEvent(new InputEvent("beforeinput", { inputType: "insertText", data: "m", cancelable: true }))
    })
    expect(editor.getText()).toBe("މ")
  })

  it.each(directions)("works in %s with Dhivehi strings", async (dir) => {
    renderWithOnu(<BlockEditor />, { dir, locale: "dv" })
    expect(await screen.findByRole("textbox", { name: "ބްލޮކް އެޑިޓަރު" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "ބްލޮކެއް އިތުރުކުރޭ" })).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})
