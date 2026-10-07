import * as React from "react"
import { act, fireEvent, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../test/utils"
import { TranslationsEditor, type TranslationEntry } from "./translations-editor"

vi.setConfig({ testTimeout: 30_000 })

const entries: TranslationEntry[] = [
  { key: "auth.login", values: { en: "Log in", dv: "ލޮގިން" }, description: "Login button" },
  { key: "auth.logout", values: { en: "Log out", dv: "" } },
  { key: "nav.islands", values: { en: "Islands", dv: "ރަށްތައް" } },
  { key: "nav.atolls", values: { en: "", dv: null } },
]

const field = (key: string, language: string) => screen.getByRole("textbox", { name: `${key} in ${language}` })

describe("TranslationsEditor", () => {
  it("lists keys with English and Dhivehi fields and counts", async () => {
    const { container } = renderWithOnu(<TranslationsEditor defaultValue={entries} className="root-x" />)
    expect(container.querySelector("[data-slot=translations-editor]")).toHaveClass("root-x")
    expect(screen.getAllByRole("listitem")).toHaveLength(4)
    expect(screen.getByText("4 keys · 2 missing")).toBeInTheDocument()
    expect(field("auth.login", "English")).toHaveValue("Log in")
    expect(screen.getByText("Login button")).toBeInTheDocument()
    expect(screen.getAllByText("Missing")).toHaveLength(3)
    await expectNoA11yViolations()
  })

  it("types Thaana in the Dhivehi column and keeps English Latin", () => {
    renderWithOnu(<TranslationsEditor defaultValue={entries} />)
    const dv = field("auth.logout", "Dhivehi")
    expect(dv).toHaveAttribute("lang", "dv")
    expect(dv).toHaveAttribute("dir", "rtl")
    act(() => {
      for (const ch of "salAm") {
        dv.dispatchEvent(
          new InputEvent("beforeinput", { inputType: "insertText", data: ch, cancelable: true, bubbles: true }),
        )
      }
    })
    expect(dv).toHaveValue("ސަލާމ")
    const en = field("auth.logout", "English")
    expect(en).toHaveAttribute("dir", "auto")
    expect(en).toHaveAttribute("lang", "en")
  })

  it("searches keys and text, and filters missing only", async () => {
    const user = userEvent.setup()
    renderWithOnu(<TranslationsEditor defaultValue={entries} />)
    await user.type(screen.getByRole("searchbox", { name: "Search keys and text" }), "ރަށް")
    expect(screen.getAllByRole("listitem")).toHaveLength(1)
    await user.clear(screen.getByRole("searchbox"))
    await user.type(screen.getByRole("searchbox"), "AUTH")
    expect(screen.getAllByRole("listitem")).toHaveLength(2)
    await user.type(screen.getByRole("searchbox"), "zzz")
    expect(screen.queryByRole("listitem")).not.toBeInTheDocument()
    expect(screen.getByText("No translations match")).toBeInTheDocument()
    await user.clear(screen.getByRole("searchbox"))
    await user.click(screen.getByRole("switch", { name: "Missing only" }))
    expect(screen.getAllByRole("listitem").map((li) => within(li).getByText(/\./).textContent)).toEqual([
      "auth.logout",
      "nav.atolls",
    ])
  })

  it("keeps a row visible while its missing text is typed", async () => {
    const user = userEvent.setup()
    renderWithOnu(<TranslationsEditor defaultValue={entries} defaultMissingOnly saveOnBlur={false} />)
    await user.type(field("auth.logout", "English"), "!")
    expect(screen.getAllByRole("listitem")).toHaveLength(2)
  })

  it("saves a changed cell on blur and shows the status", async () => {
    const user = userEvent.setup()
    let resolve: () => void = () => {}
    const onSave = vi.fn(() => new Promise<void>((r) => (resolve = r)))
    const onChange = vi.fn()
    renderWithOnu(<TranslationsEditor defaultValue={entries} onSave={onSave} onChange={onChange} />)
    const en = field("nav.atolls", "English")
    await user.type(en, "Atolls")
    expect(onChange).toHaveBeenLastCalledWith(
      expect.arrayContaining([expect.objectContaining({ key: "nav.atolls", values: { en: "Atolls", dv: null } })]),
    )
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument()
    await user.tab()
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ key: "nav.atolls", locale: "en", value: "Atolls" }))
    expect(screen.getByText("Saving…")).toBeInTheDocument()
    await act(async () => resolve())
    expect(screen.getAllByText("Saved").length).toBeGreaterThan(0)
    // Unchanged cells don't save again.
    act(() => en.focus())
    await user.tab()
    expect(onSave).toHaveBeenCalledTimes(1)
  })

  it("saves with Ctrl+Enter or the Save button, and retries after errors", async () => {
    const user = userEvent.setup()
    const onSave = vi.fn().mockRejectedValueOnce(new Error("422")).mockResolvedValue(undefined)
    renderWithOnu(<TranslationsEditor defaultValue={entries} onSave={onSave} saveOnBlur={false} />)
    const en = field("auth.logout", "English")
    await user.type(en, "!")
    await user.keyboard("{Control>}{Enter}{/Control}")
    expect(await screen.findByText("Couldn’t save")).toBeInTheDocument()
    expect(en).toHaveAttribute("aria-invalid", "true")
    expect(screen.getByText("auth.logout: Couldn’t save")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Retry" }))
    await waitFor(() => expect(screen.getByText("auth.logout: Saved")).toBeInTheDocument())
    expect(onSave).toHaveBeenCalledTimes(2)

    await user.type(en, "?")
    await user.click(screen.getByRole("button", { name: "Save" }))
    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(3))
  })

  it("marks cells saved without a callback", async () => {
    const user = userEvent.setup()
    renderWithOnu(<TranslationsEditor defaultValue={entries} />)
    await user.type(field("auth.logout", "English"), "!")
    await user.tab()
    expect(screen.queryByRole("button", { name: "Save" })).not.toBeInTheDocument()
  })

  it("is controlled through value and onChange", () => {
    function Controlled() {
      const [value, setValue] = React.useState(entries.slice(0, 1))
      return <TranslationsEditor value={value} onChange={setValue} />
    }
    renderWithOnu(<Controlled />)
    const en = field("auth.login", "English")
    fireEvent.change(en, { target: { value: "Sign in" } })
    expect(en).toHaveValue("Sign in")
  })

  it("supports custom locales, read-only and classNames", () => {
    renderWithOnu(
      <TranslationsEditor
        defaultValue={[{ key: "a", values: { ar: "" } }]}
        locales={[
          { code: "ar", label: "Arabic" },
          { code: "dv", thaana: false },
        ]}
        thaana={false}
        readOnly
        classNames={{ toolbar: "tb-x", list: "list-x", row: "row-x", key: "key-x", cell: "cell-x" }}
      />,
    )
    expect(field("a", "Arabic")).toHaveAttribute("readonly")
    expect(field("a", "Dhivehi")).not.toHaveAttribute("data-thaana")
    expect(field("a", "Dhivehi")).toHaveAttribute("dir", "auto")
    expect(document.querySelector(".tb-x")).toBeInTheDocument()
    expect(document.querySelector(".row-x")).toBeInTheDocument()
    expect(document.querySelectorAll(".cell-x")).toHaveLength(2)
  })

  it.each(directions)("works in %s with Dhivehi strings", async (dir) => {
    renderWithOnu(<TranslationsEditor defaultValue={entries} />, { dir, locale: "dv" })
    expect(screen.getByRole("switch", { name: "ނެތް އެއްޗެހި އެކަނި" })).toBeInTheDocument()
    expect(screen.getByRole("textbox", { name: "ދިވެހި ން auth.login" })).toBeInTheDocument()
    expect(screen.getByText("4 ކީ · 2 ނެތް")).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})
