import * as React from "react"
import type { Editor } from "@tiptap/core"
import { act, fireEvent, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import "../../test/prosemirror"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../test/utils"
import { FormErrorsProvider } from "../components/form/form-context"
import { FormField } from "../components/form/form-field"
import { formatShortcut } from "./_toolbar"
import { WysiwygEditor, type WysiwygEditorProps } from "./wysiwyg-editor"

async function setup(props: Partial<WysiwygEditorProps> = {}, options: Parameters<typeof renderWithOnu>[1] = {}) {
  let editor: Editor | null = null
  const utils = renderWithOnu(
    <WysiwygEditor
      aria-label="Story"
      onReady={(e) => {
        editor = e
      }}
      {...props}
    />,
    options,
  )
  const textbox = await screen.findByRole("textbox", { name: "Story" })
  await waitFor(() => expect(editor).not.toBeNull())
  return { ...utils, textbox, editor: editor! as Editor }
}

const toolbar = () => screen.getByRole("toolbar", { name: "Formatting" })
const button = (name: string | RegExp) => within(toolbar()).getByRole("button", { name })

// Editor interactions (dialogs, menus, Tiptap) are slow under jsdom on busy machines.
vi.setConfig({ testTimeout: 30_000 })

describe("WysiwygEditor", () => {
  it("renders an accessible editor with a toolbar and placeholder", async () => {
    const { textbox, container } = await setup({ placeholder: "Write the news…", className: "root-x" })
    expect(textbox).toHaveAttribute("contenteditable", "true")
    expect(textbox).toHaveAttribute("aria-multiline", "true")
    expect(container.querySelector("[data-slot=wysiwyg-editor]")).toHaveClass("root-x")
    expect(container.querySelector("[data-placeholder='Write the news…']")).toBeInTheDocument()
    expect(button("Bold")).toHaveAttribute("aria-pressed", "false")
    await expectNoA11yViolations()
  })

  it("is uncontrolled with HTML by default and gives every block dir=auto", async () => {
    const onChange = vi.fn()
    const { editor, textbox } = await setup({ defaultValue: "<p>Hello</p><p>ހެލޯ</p>", onChange })
    expect(textbox.querySelectorAll("p[dir=auto]")).toHaveLength(2)
    act(() => {
      editor.commands.setContent("<p>Changed</p>", { emitUpdate: true })
    })
    expect(onChange).toHaveBeenLastCalledWith('<p dir="auto">Changed</p>', editor)
    act(() => {
      editor.commands.clearContent(true)
    })
    expect(onChange).toHaveBeenLastCalledWith("", editor)
  })

  it("resolves list and quote direction from their content while editing and in the HTML", async () => {
    const onChange = vi.fn()
    const { editor, textbox } = await setup({
      defaultValue: "<ul><li><p>ހުޅުމާލެ</p></li></ul><blockquote><p>Quote</p></blockquote>",
      onChange,
    })
    expect(textbox.querySelector("ul")).toHaveAttribute("dir", "rtl")
    expect(textbox.querySelector("blockquote")).toHaveAttribute("dir", "ltr")
    // Typing into an empty list updates its direction without re-rendering the node.
    act(() => {
      editor.commands.setContent("<ol><li><p></p></li></ol>", { emitUpdate: false })
    })
    expect(textbox.querySelector("ol")).toHaveAttribute("dir", "auto")
    act(() => {
      editor.chain().focus("end").insertContent("ދިވެހި").run()
    })
    expect(textbox.querySelector("ol")).toHaveAttribute("dir", "rtl")
    expect(onChange).toHaveBeenLastCalledWith(expect.stringContaining('<ol dir="rtl">'), editor)
  })

  it("resolves table direction from the cells while editing and in the HTML", async () => {
    const onChange = vi.fn()
    const { editor, textbox } = await setup({
      defaultValue:
        "<table><tbody><tr><th><p>ރަށް</p></th><th><p>Island</p></th></tr><tr><td><p>ހުޅުމާލެ</p></td><td><p>Hulhumalé</p></td></tr></tbody></table>",
      onChange,
    })
    const wrapper = () => textbox.querySelector<HTMLElement>(".tableWrapper")!
    // The live table view takes the direction on its wrapper; the table inherits it.
    expect(wrapper()).toHaveAttribute("dir", "rtl")
    expect(textbox.querySelector("table")).not.toHaveAttribute("dir")
    expect(textbox.querySelector("td")).toHaveAttribute("dir", "auto")
    expect(editor.getHTML()).toContain('<div class="tableWrapper" dir="rtl"><table dir="rtl"')

    // An empty table is auto until its first strong text is typed.
    act(() => {
      editor.commands.setContent("<p>Intro</p>", { emitUpdate: false })
      editor.chain().focus("end").insertTable({ rows: 2, cols: 2, withHeaderRow: true }).run()
    })
    expect(wrapper()).toHaveAttribute("dir", "auto")
    act(() => {
      editor.commands.insertContent("ދިވެހި")
    })
    expect(wrapper()).toHaveAttribute("dir", "rtl")
    expect(onChange).toHaveBeenLastCalledWith(expect.stringContaining('<table dir="rtl"'), editor)

    // An explicit direction from pasted HTML wins and stays on the table.
    act(() => {
      editor.commands.setContent('<table dir="ltr"><tbody><tr><td><p>ދިވެހި</p></td></tr></tbody></table>', {
        emitUpdate: false,
      })
    })
    expect(textbox.querySelector("table")).toHaveAttribute("dir", "ltr")
    expect(editor.getHTML()).toContain('<table dir="ltr"')
  })

  it("emits Tiptap JSON when given JSON", async () => {
    const onChange = vi.fn()
    const { editor } = await setup({
      defaultValue: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Hi" }] }] },
      onChange,
    })
    act(() => {
      editor.commands.insertContent("!")
    })
    expect(onChange.mock.lastCall?.[0]).toMatchObject({ type: "doc" })
  })

  it("follows a controlled value and writes it to a hidden input", async () => {
    function Controlled() {
      const [value, setValue] = React.useState("<p>One</p>")
      return (
        <>
          <WysiwygEditor aria-label="Story" name="body" value={value} onChange={(v) => setValue(v as string)} />
          <button type="button" onClick={() => setValue("<p>Two</p>")}>
            Set
          </button>
        </>
      )
    }
    const { container } = renderWithOnu(<Controlled />)
    const textbox = await screen.findByRole("textbox", { name: "Story" })
    expect(textbox).toHaveTextContent("One")
    expect(container.querySelector("input[type=hidden][name=body]")).toHaveValue("<p>One</p>")
    fireEvent.click(screen.getByRole("button", { name: "Set" }))
    await waitFor(() => expect(textbox).toHaveTextContent("Two"))
    expect(container.querySelector("input[type=hidden][name=body]")).toHaveValue("<p>Two</p>")
  })

  it("stores JSON in the hidden input as a string", async () => {
    const { container, editor } = await setup({ name: "content", format: "json" })
    act(() => {
      editor.commands.insertContent("Hi")
    })
    const hidden = container.querySelector<HTMLInputElement>("input[name=content]")!
    expect(JSON.parse(hidden.value)).toMatchObject({ type: "doc" })
  })

  it("applies marks from the toolbar and reflects them with aria-pressed", async () => {
    const { editor } = await setup({ defaultValue: "<p>Word</p>" })
    act(() => {
      editor.commands.selectAll()
    })
    for (const name of ["Bold", "Italic"]) {
      fireEvent.click(button(name))
      await waitFor(() => expect(button(name)).toHaveAttribute("aria-pressed", "true"))
    }
    expect(editor.getHTML()).toContain("<strong><em>Word</em></strong>")
    fireEvent.click(button("Bulleted list"))
    expect(editor.isActive("bulletList")).toBe(true)
    fireEvent.click(button("Numbered list"))
    expect(editor.isActive("orderedList")).toBe(true)
  })

  it("runs every toolbar action", async () => {
    const { editor } = await setup({ defaultValue: "<p>Word</p>" })
    act(() => {
      editor.commands.selectAll()
    })
    fireEvent.click(button("Underline"))
    fireEvent.click(button("Strikethrough"))
    fireEvent.click(button("Inline code"))
    expect(editor.getHTML()).toMatch(/<u>|<s>|<code/)
    fireEvent.click(button("Align to centre"))
    expect(editor.isActive({ textAlign: "center" })).toBe(true)
    await waitFor(() => expect(button("Align to centre")).toHaveAttribute("aria-pressed", "true"))
    fireEvent.click(button("Align to end"))
    expect(editor.isActive({ textAlign: "end" })).toBe(true)
    fireEvent.click(button("Align to start"))
    expect(editor.isActive({ textAlign: "start" })).toBe(true)
    fireEvent.click(button("Quote"))
    expect(editor.isActive("blockquote")).toBe(true)
    fireEvent.click(button("Divider"))
    expect(editor.getHTML()).toContain("<hr>")
    await waitFor(() => expect(button("Undo")).toBeEnabled())
    fireEvent.click(button("Undo"))
    expect(editor.getHTML()).not.toContain("<hr>")
    await waitFor(() => expect(button("Redo")).toBeEnabled())
    fireEvent.click(button("Redo"))
    expect(editor.getHTML()).toContain("<hr>")
  })

  it("changes the text style from the menu", async () => {
    const user = userEvent.setup()
    const { editor } = await setup({ defaultValue: "<p>Title</p>", headingLevels: [1, 2] })
    await user.click(button("Text style: Paragraph"))
    await user.click(await screen.findByRole("menuitemradio", { name: "Heading 2" }))
    expect(editor.isActive("heading", { level: 2 })).toBe(true)
    await waitFor(() => expect(button("Text style: Heading 2")).toBeInTheDocument())
    await user.click(button("Text style: Heading 2"))
    await user.click(await screen.findByRole("menuitemradio", { name: "Paragraph" }))
    expect(editor.isActive("paragraph")).toBe(true)
  })

  it("inserts and edits tables", async () => {
    const user = userEvent.setup()
    const { editor } = await setup()
    await user.click(button("Table"))
    const items = await screen.findAllByRole("menuitem")
    expect(screen.getByRole("menuitem", { name: "Delete table" })).toHaveAttribute("data-disabled")
    await user.click(items[0]!)
    expect(editor.isActive("table")).toBe(true)
    expect(editor.getHTML()).toContain("<table")
    for (const name of ["Add row below", "Add column after", "Delete row", "Header row on/off", "Delete table"]) {
      await user.click(await waitFor(() => button("Table options")))
      await user.click(await screen.findByRole("menuitem", { name }))
    }
    expect(editor.getHTML()).not.toContain("<table")
  })

  it("adds, edits and removes links through the dialog and returns focus", async () => {
    const user = userEvent.setup()
    const { editor } = await setup({ defaultValue: "<p>Visit</p>" })
    act(() => {
      editor.commands.selectAll()
    })
    const linkButton = button("Link")
    await user.click(linkButton)
    const dialog = await screen.findByRole("dialog", { name: "Insert link" })
    const url = within(dialog).getByLabelText(/URL/)
    await user.type(url, "javascript:alert(1)")
    await user.click(within(dialog).getByRole("button", { name: "Insert" }))
    expect(within(dialog).getByText("Enter a valid web address")).toBeInTheDocument()
    await user.clear(url)
    await user.type(url, "visitmaldives.com")
    await user.click(within(dialog).getByRole("checkbox", { name: "Open in a new tab" }))
    await user.click(within(dialog).getByRole("button", { name: "Insert" }))
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    expect(editor.getHTML()).toContain('href="https://visitmaldives.com"')
    expect(editor.getHTML()).toContain('target="_blank"')
    await waitFor(() => expect(linkButton).toHaveFocus())

    await user.click(button("Link"))
    const edit = await screen.findByRole("dialog", { name: "Edit link" })
    expect(within(edit).getByLabelText(/URL/)).toHaveValue("https://visitmaldives.com")
    await user.click(within(edit).getByRole("button", { name: "Remove link" }))
    expect(editor.getHTML()).not.toContain("href")
  })

  it("inserts a link at the caret, opens with Mod+K and cancels", async () => {
    const user = userEvent.setup()
    const { editor } = await setup()
    act(() => {
      editor.view.someProp("handleKeyDown", (f) =>
        f(editor.view, new KeyboardEvent("keydown", { key: "k", ctrlKey: true })),
      )
    })
    let dialog = await screen.findByRole("dialog", { name: "Insert link" })
    await user.click(within(dialog).getByRole("button", { name: "Cancel" }))
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    await user.click(button("Link"))
    dialog = await screen.findByRole("dialog", { name: "Insert link" })
    await user.type(within(dialog).getByLabelText(/URL/), "https://gov.mv{Enter}")
    await waitFor(() => expect(editor.getHTML()).toMatch(/<a [^>]*href="https:\/\/gov.mv"/))
    expect(editor.getText()).toBe("https://gov.mv")
  })

  it("inserts images by URL with alt text", async () => {
    const user = userEvent.setup()
    const { editor } = await setup()
    await user.click(button("Image"))
    const dialog = await screen.findByRole("dialog", { name: "Insert image" })
    await user.click(within(dialog).getByRole("button", { name: "Insert" }))
    expect(within(dialog).getByText("Enter a valid web address")).toBeInTheDocument()
    await user.type(within(dialog).getByLabelText(/Image URL/), "https://example.mv/male.jpg")
    await user.type(within(dialog).getByLabelText(/Alternative text/), "Malé skyline")
    await user.click(within(dialog).getByRole("button", { name: "Insert" }))
    expect(editor.getHTML()).toContain('src="https://example.mv/male.jpg"')
    expect(editor.getHTML()).toContain('alt="Malé skyline"')
  })

  it("uploads images through the upload callback and reports failures", async () => {
    const user = userEvent.setup()
    const onImageUpload = vi
      .fn<(file: File) => Promise<string>>()
      .mockRejectedValueOnce(new Error("nope"))
      .mockResolvedValue("https://cdn.example.mv/up.png")
    const { editor } = await setup({ onImageUpload })
    await user.click(button("Image"))
    const dialog = await screen.findByRole("dialog", { name: "Insert image" })
    await user.click(within(dialog).getByRole("tab", { name: "Upload" }))
    const insert = within(dialog).getByRole("button", { name: "Insert" })
    expect(insert).toBeDisabled()
    const file = new File(["x"], "up.png", { type: "image/png" })
    await user.upload(within(dialog).getByLabelText(/Image file/), file)
    await user.click(insert)
    expect(await within(dialog).findByText("The image couldn’t be uploaded")).toBeInTheDocument()
    await user.click(within(dialog).getByRole("button", { name: "Insert" }))
    await waitFor(() => expect(editor.getHTML()).toContain('src="https://cdn.example.mv/up.png"'))
    expect(onImageUpload).toHaveBeenCalledWith(file)
  })

  it("moves focus through the toolbar with arrow keys, Home, End and Escape", async () => {
    const { textbox } = await setup()
    const first = button("Text style: Paragraph")
    expect(first).toHaveAttribute("tabindex", "0")
    expect(button("Bold")).toHaveAttribute("tabindex", "-1")
    act(() => first.focus())
    fireEvent.keyDown(first, { key: "ArrowRight" })
    expect(button("Bold")).toHaveFocus()
    expect(button("Bold")).toHaveAttribute("tabindex", "0")
    fireEvent.keyDown(button("Bold"), { key: "ArrowLeft" })
    expect(first).toHaveFocus()
    fireEvent.keyDown(first, { key: "End" })
    expect(screen.getAllByRole("button", { name: "More formatting" })[0]).toHaveFocus()
    fireEvent.keyDown(document.activeElement!, { key: "Home" })
    expect(first).toHaveFocus()
    fireEvent.keyDown(first, { key: "a" })
    expect(first).toHaveFocus()
    fireEvent.keyDown(first, { key: "Escape" })
    await waitFor(() => expect(textbox).toHaveFocus())
  })

  it("jumps to the toolbar with Alt+F10", async () => {
    const { editor } = await setup()
    act(() => {
      editor.view.someProp("handleKeyDown", (f) =>
        f(editor.view, new KeyboardEvent("keydown", { key: "F10", altKey: true })),
      )
    })
    expect(button("Text style: Paragraph")).toHaveFocus()
  })

  it.each(directions)("mirrors arrow keys in %s", async (dir) => {
    await setup({}, { dir })
    const first = button("Text style: Paragraph")
    act(() => first.focus())
    fireEvent.keyDown(first, { key: dir === "rtl" ? "ArrowLeft" : "ArrowRight" })
    expect(button("Bold")).toHaveFocus()
    await expectNoA11yViolations()
  })

  it("offers less common controls in a More menu for narrow containers", async () => {
    const user = userEvent.setup()
    const { editor } = await setup({ defaultValue: "<p>Word</p>" })
    act(() => {
      editor.commands.selectAll()
    })
    await user.click(button("More formatting"))
    const menu = await screen.findByRole("menu")
    await user.click(within(menu).getByRole("menuitemcheckbox", { name: "Underline" }))
    expect(editor.getHTML()).toContain("<u>Word</u>")
    await user.click(button("More formatting"))
    await user.click(await screen.findByRole("menuitem", { name: "Divider" }))
    expect(editor.getHTML()).toContain("<hr>")
    await user.click(button("More formatting"))
    const sub = await screen.findByRole("menuitem", { name: "Table" })
    act(() => sub.focus())
    await user.keyboard("{ArrowRight}")
    await user.click(await screen.findByRole("menuitem", { name: "Insert table" }))
    expect(editor.getHTML()).toContain("<table")
  })

  it("uses a custom toolbar or none", async () => {
    const { unmount } = await setup({ toolbar: ["bold", "|", "codeBlock"] })
    expect(within(toolbar()).getAllByRole("button")).toHaveLength(3)
    fireEvent.click(button("Code block"))
    unmount()
    await setup({ toolbar: false })
    expect(screen.queryByRole("toolbar")).not.toBeInTheDocument()
  })

  it("is read-only without a toolbar", async () => {
    const { textbox } = await setup({ readOnly: true, defaultValue: "<p>Fixed</p>" })
    expect(textbox).toHaveAttribute("contenteditable", "false")
    expect(textbox).toHaveAttribute("aria-readonly", "true")
    expect(screen.queryByRole("toolbar")).not.toBeInTheDocument()
  })

  it("disables the toolbar and content when disabled", async () => {
    const { textbox, container } = await setup({ disabled: true })
    expect(textbox).toHaveAttribute("contenteditable", "false")
    expect(textbox).toHaveAttribute("aria-disabled", "true")
    expect(container.querySelector("[data-slot=wysiwyg-editor]")).toHaveAttribute("data-disabled")
  })

  it("is wired to a FormField and server errors", async () => {
    renderWithOnu(
      <FormErrorsProvider errors={{ "post.body": ["The body is required."] }}>
        <FormField label="Body" name="post[body]" help="Markdown is not supported" required>
          <WysiwygEditor />
        </FormField>
      </FormErrorsProvider>,
    )
    const textbox = await screen.findByRole("textbox", { name: /Body/ })
    expect(textbox).toHaveAttribute("aria-invalid", "true")
    expect(textbox).toHaveAttribute("aria-required", "true")
    expect(textbox.getAttribute("aria-describedby")).toMatch(/-help .*-error/)
    expect(document.querySelector("input[type=hidden][name='post[body]']")).toBeInTheDocument()
    expect(document.querySelector("[data-slot=wysiwyg-editor]")).toHaveAttribute("data-invalid")
    await expectNoA11yViolations()
  })

  it("types Thaana, toggles with the toolbar and Alt+Shift+T, and sets lang/dir", async () => {
    const { textbox, editor } = await setup({ thaana: true })
    await waitFor(() => expect(textbox).toHaveAttribute("lang", "dv"))
    expect(textbox).toHaveAttribute("dir", "rtl")
    const toggle = within(toolbar()).getByRole("button", { name: /Thaana and Latin/ })
    expect(toggle).toHaveAttribute("aria-pressed", "true")
    act(() => {
      textbox.dispatchEvent(new InputEvent("beforeinput", { inputType: "insertText", data: "s", cancelable: true }))
    })
    expect(editor.getText()).toBe("ސ")
    fireEvent.click(toggle)
    await waitFor(() => expect(toggle).toHaveAttribute("aria-pressed", "false"))
    expect(screen.getByText("Latin typing on")).toBeInTheDocument()
    await waitFor(() => expect(textbox).not.toHaveAttribute("lang"))
    act(() => {
      editor.view.someProp("handleKeyDown", (f) =>
        f(
          editor.view,
          new KeyboardEvent("keydown", { key: "T", code: "KeyT", keyCode: 84, altKey: true, shiftKey: true }),
        ),
      )
    })
    await waitFor(() => expect(toggle).toHaveAttribute("aria-pressed", "true"))
  })

  it("accepts Thaana options", async () => {
    const { editor } = await setup({ thaana: { defaultEnabled: false, toggleShortcut: false } })
    expect(editor.storage.thaanaKeyboard.enabled).toBe(false)
  })

  it("shows Dhivehi strings", async () => {
    renderWithOnu(<WysiwygEditor thaana />, { locale: "dv" })
    expect(await screen.findByRole("textbox", { name: "ލިޔުން އެޑިޓަރު" })).toBeInTheDocument()
    expect(screen.getByRole("toolbar", { name: "ފޯމެޓިންގ" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "ބޯލްޑް" })).toBeInTheDocument()
    await expectNoA11yViolations()
  })

  it("supports the ghost variant, sizes and classNames", async () => {
    const { container } = await setup({
      variant: "ghost",
      size: "lg",
      classNames: { toolbar: "tb-x", content: "content-x" },
    })
    expect(container.querySelector("[data-slot=editor-toolbar]")).toHaveClass("tb-x")
    expect(container.querySelector("[data-slot=wysiwyg-editor-content]")).toHaveClass("content-x", "text-lg")
  })

  it("formats shortcuts for each platform", () => {
    expect(formatShortcut("Mod+Shift+Z", false)).toBe("Ctrl+Shift+Z")
    expect(formatShortcut("Mod+Alt+Shift+Z", true)).toBe("⌘⌥⇧Z")
  })
})
