import * as React from "react"
import { act, fireEvent, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { en } from "../../locales"
import { createTranslator } from "../../i18n/translate"
import { TextInput } from "../inputs/text-input"
import { Form } from "./form"
import { FormField } from "./form-field"
import { describeChanges, formatChangeValue, SaveBar, type SaveBarProps } from "./save-bar"
import { useUnsavedChangesGuard } from "./unsaved-changes-guard"
import { ValidationError } from "./validation"

const saved = { email: "jane@example.mv", role: "Viewer" }
const labels = { email: "Email", role: "Role" }

/** A tiny edit page: two fields, a form and a save bar (§25.9). */
function EditPage({
  onSubmit = () => {},
  bar,
}: {
  onSubmit?: (values: Record<string, unknown>) => unknown
  bar?: Partial<SaveBarProps>
}) {
  const [initial, setInitial] = React.useState(saved)
  const [values, setValues] = React.useState(saved)
  const changes = describeChanges(initial, values, labels)
  return (
    <Form
      onSubmit={async (v) => {
        await onSubmit(v)
        setInitial(values)
      }}
    >
      <FormField label="Email" name="email">
        <TextInput value={values.email} onChange={(e) => setValues({ ...values, email: e.target.value })} />
      </FormField>
      <FormField label="Role" name="role">
        <TextInput value={values.role} onChange={(e) => setValues({ ...values, role: e.target.value })} />
      </FormField>
      <a href="/users">All users</a>
      <SaveBar changes={changes} onDiscard={() => setValues(initial)} successMessage="User saved" {...bar} />
    </Form>
  )
}

describe("SaveBar (§25.9)", () => {
  it("Save is disabled until something changes", async () => {
    renderWithOnu(<EditPage />)
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled()
    expect(screen.getByRole("button", { name: "Discard" })).toBeDisabled()
    expect(screen.getByText("No changes yet")).toBeInTheDocument()
    await userEvent.type(screen.getByLabelText("Role"), "!")
    expect(screen.getByRole("button", { name: "Save" })).toBeEnabled()
    await expectNoA11yViolations()
  })

  it("lists each change in plain words", async () => {
    renderWithOnu(<EditPage />)
    const email = screen.getByLabelText("Email")
    await userEvent.clear(email)
    await userEvent.type(email, "jane@new.com")
    const list = screen.getByRole("list")
    expect(within(list).getByRole("listitem")).toHaveTextContent("Email changes to jane@new.com")
    const role = screen.getByLabelText("Role")
    await userEvent.clear(role)
    expect(
      within(list)
        .getAllByRole("listitem")
        .map((li) => li.textContent),
    ).toEqual(["Email changes to jane@new.com", "Role is cleared"])
    await userEvent.type(role, "Editor")
    expect(within(list).getAllByRole("listitem")[1]).toHaveTextContent("Role changes to Editor")
    expect(screen.getByRole("button", { name: /Show changes/ })).toHaveTextContent("2 unsaved changes")
  })

  it("Discard puts every field back", async () => {
    renderWithOnu(<EditPage />)
    await userEvent.type(screen.getByLabelText("Email"), "x")
    await userEvent.type(screen.getByLabelText("Role"), "y")
    await userEvent.click(screen.getByRole("button", { name: "Discard" }))
    expect(screen.getByLabelText("Email")).toHaveValue(saved.email)
    expect(screen.getByLabelText("Role")).toHaveValue(saved.role)
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled()
  })

  it("Save shows a spinner, prevents double clicks, then shows the success message and empties", async () => {
    let resolve!: () => void
    const onSubmit = vi.fn(() => new Promise<void>((r) => (resolve = r)))
    renderWithOnu(<EditPage onSubmit={onSubmit} />)
    await userEvent.type(screen.getByLabelText("Role"), "!")
    const save = screen.getByRole("button", { name: "Save" })
    await userEvent.click(save)
    expect(save).toHaveAttribute("aria-busy", "true")
    await userEvent.click(save)
    expect(onSubmit).toHaveBeenCalledTimes(1)
    await act(async () => resolve())
    expect(screen.getByText("User saved")).toBeInTheDocument()
    expect(screen.queryByRole("list")).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled()
  })

  it("on error says the save didn't go through and focuses the first invalid field", async () => {
    renderWithOnu(
      <EditPage
        onSubmit={() => {
          throw new ValidationError({ email: ["Email is already taken"] })
        }}
      />,
    )
    await userEvent.type(screen.getByLabelText("Email"), "x")
    await userEvent.click(screen.getByRole("button", { name: "Save" }))
    await waitFor(() => expect(screen.getByLabelText("Email")).toHaveFocus())
    expect(screen.getByLabelText("Email")).toHaveAccessibleDescription("Email is already taken")
    expect(screen.getByText("Your changes were not saved. Please try again.")).toBeInTheDocument()
  })

  it("asks before following a link with unsaved changes; staying keeps the user on the page", async () => {
    const navigated = vi.fn((e: MouseEvent) => e.preventDefault())
    renderWithOnu(<EditPage />)
    const link = screen.getByRole("link", { name: "All users" })
    link.addEventListener("click", navigated)
    await userEvent.type(screen.getByLabelText("Role"), "!")
    await userEvent.click(link)
    expect(navigated).not.toHaveBeenCalled()
    const dialog = await screen.findByRole("alertdialog")
    expect(dialog).toHaveTextContent("You have unsaved changes. Leave anyway?")
    await userEvent.click(within(dialog).getByRole("button", { name: "Stay on page" }))
    expect(navigated).not.toHaveBeenCalled()
    await userEvent.click(link)
    await userEvent.click(within(await screen.findByRole("alertdialog")).getByRole("button", { name: "Leave" }))
    expect(navigated).toHaveBeenCalledTimes(1)
  })

  it("closing the tab triggers the browser warning only while there are unsaved changes", async () => {
    renderWithOnu(<EditPage />)
    const clean = new Event("beforeunload", { cancelable: true })
    window.dispatchEvent(clean)
    expect(clean.defaultPrevented).toBe(false)
    await userEvent.type(screen.getByLabelText("Role"), "!")
    const dirty = new Event("beforeunload", { cancelable: true })
    window.dispatchEvent(dirty)
    expect(dirty.defaultPrevented).toBe(true)
    await userEvent.click(screen.getByRole("button", { name: "Discard" }))
    const discarded = new Event("beforeunload", { cancelable: true })
    window.dispatchEvent(discarded)
    expect(discarded.defaultPrevented).toBe(false)
  })

  it("no warning once the changes are saved", async () => {
    const navigated = vi.fn((e: MouseEvent) => e.preventDefault())
    renderWithOnu(<EditPage />)
    const link = screen.getByRole("link", { name: "All users" })
    link.addEventListener("click", navigated)
    await userEvent.type(screen.getByLabelText("Role"), "!")
    await userEvent.click(screen.getByRole("button", { name: "Save" }))
    await screen.findByText("User saved")
    await userEvent.click(link)
    expect(navigated).toHaveBeenCalled()
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument()
  })

  it("is a sticky side panel on desktop and a fixed bottom bar on phones", () => {
    const { container, rerender } = renderWithOnu(<SaveBar />)
    const bar = () => container.querySelector("[data-slot=save-bar]")!
    expect(bar()).toHaveClass("fixed", "bottom-0", "lg:sticky", "lg:top-4")
    expect(container.querySelector("[data-slot=save-bar-spacer]")).toHaveClass("lg:hidden")
    rerender(<SaveBar layout="side" />)
    expect(bar()).toHaveClass("sticky")
    expect(bar()).not.toHaveClass("fixed")
    rerender(<SaveBar layout="bottom" />)
    expect(bar()).toHaveClass("fixed")
    expect(bar()).not.toHaveClass("lg:sticky")
  })

  it("toggles the change list on phones", async () => {
    renderWithOnu(<SaveBar changes={[{ field: "Island", value: "Hulhumalé" }]} />)
    const toggle = screen.getByRole("button", { name: /Show changes/ })
    expect(toggle).toHaveAttribute("aria-expanded", "false")
    expect(screen.getByRole("list", { hidden: true })).toHaveClass("hidden", "lg:grid")
    await userEvent.click(toggle)
    expect(toggle).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByRole("list")).not.toHaveClass("hidden")
  })

  it("works standalone with onSave (success and failure) and a custom description", async () => {
    let fail = true
    const onSave = vi.fn(async () => {
      if (fail) throw new Error("x")
    })
    const { rerender } = renderWithOnu(
      <SaveBar changes={[{ field: "Name", description: <em>custom</em> }]} onSave={onSave} guard={false} />,
    )
    expect(screen.getByText("custom")).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Save" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("Your changes were not saved")
    fail = false
    await userEvent.click(screen.getByRole("button", { name: "Save" }))
    rerender(<SaveBar changes={[]} onSave={onSave} guard={false} />)
    expect(screen.getByText("Changes saved")).toBeInTheDocument()
  })

  it("submits another form by id and accepts explicit saving/status", () => {
    renderWithOnu(<SaveBar form="profile" dirty saving status="error" errorMessage="Nope" title="Profile" />)
    expect(screen.getByRole("button", { name: "Save" })).toHaveAttribute("form", "profile")
    expect(screen.getByRole("button", { name: "Save" })).toHaveAttribute("aria-busy", "true")
    expect(screen.getByRole("alert")).toHaveTextContent("Nope")
    expect(screen.getByRole("complementary", { name: "Profile" })).toBeInTheDocument()
  })

  it.each(directions)("speaks Dhivehi (%s)", async (dir) => {
    renderWithOnu(<SaveBar changes={[{ field: "އީމެއިލް", value: "jane@new.com" }]} guard={false} />, {
      locale: "dv",
      dir,
    })
    expect(screen.getByRole("list", { hidden: true })).toHaveTextContent("އީމެއިލް ބަދަލުވަނީ jane@new.com އަށް")
    expect(screen.getByRole("button", { name: "ސޭވްކުރޭ" })).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})

describe("save bar helpers", () => {
  const t = createTranslator(en)
  it("formats values for the locale", () => {
    expect(formatChangeValue("", t, en)).toBeNull()
    expect(formatChangeValue([], t, en)).toBeNull()
    expect(formatChangeValue(true, t, en)).toBe("Yes")
    expect(formatChangeValue(false, t, en)).toBe("No")
    expect(formatChangeValue(1234.5, t, en)).toBe("1,234.5")
    expect(formatChangeValue(["a", 2], t, en)).toBe("a, 2")
    expect(formatChangeValue(new Date(2026, 2, 12), t, en)).toBe("Mar 12, 2026")
    expect(formatChangeValue({ label: "Editor" }, t, en)).toBe("Editor")
    expect(formatChangeValue({ a: 1 }, t, en)).toBe('{"a":1}')
    const el = <b>x</b>
    expect(formatChangeValue(el, t, en)).toBe(el)
  })

  it("describes changes between saved and current values", () => {
    expect(
      describeChanges(
        { name: "Ali", age: 30, island: "Male'" },
        { name: "Ali", age: 31, island: "Addu" },
        { name: "Name", age: "Age", island: "Island" },
        { island: (v) => `${v} City` },
      ),
    ).toEqual([
      { key: "age", field: "Age", value: 31 },
      { key: "island", field: "Island", value: "Addu City" },
    ])
    expect(describeChanges(undefined, { a: null }, { a: "A" })).toEqual([])
  })
})

describe("useUnsavedChangesGuard", () => {
  function Guarded({ dirty, onLeave }: { dirty: boolean; onLeave: (ok: boolean) => void }) {
    const { confirmLeave, guard, dialog } = useUnsavedChangesGuard(dirty, { interceptLinks: false })
    return (
      <>
        <button type="button" onClick={() => void confirmLeave().then(onLeave)}>
          Go
        </button>
        <button type="button" onClick={() => guard(() => onLeave(true))}>
          Guarded
        </button>
        <a href="/elsewhere">elsewhere</a>
        {dialog}
      </>
    )
  }

  it("resolves straight away when clean", async () => {
    const onLeave = vi.fn()
    renderWithOnu(<Guarded dirty={false} onLeave={onLeave} />)
    await userEvent.click(screen.getByRole("button", { name: "Go" }))
    await waitFor(() => expect(onLeave).toHaveBeenCalledWith(true))
  })

  it("asks when dirty; Escape means stay, and focus returns", async () => {
    const onLeave = vi.fn()
    renderWithOnu(<Guarded dirty onLeave={onLeave} />)
    const go = screen.getByRole("button", { name: "Go" })
    await userEvent.click(go)
    await screen.findByRole("alertdialog")
    await userEvent.keyboard("{Escape}")
    await waitFor(() => expect(onLeave).toHaveBeenCalledWith(false))
    await waitFor(() => expect(go).toHaveFocus())
    await userEvent.click(screen.getByRole("button", { name: "Guarded" }))
    await userEvent.click(within(await screen.findByRole("alertdialog")).getByRole("button", { name: "Leave" }))
    await waitFor(() => expect(onLeave).toHaveBeenCalledWith(true))
  })

  it("lets modified clicks, new tabs, downloads, other origins and in-page anchors through", async () => {
    function Links() {
      const { dialog } = useUnsavedChangesGuard(true)
      return (
        <>
          <a href="/a">plain</a>
          <a href="/b" target="_blank">
            tab
          </a>
          <a href="/c" download>
            dl
          </a>
          <a href="https://example.com/x">ext</a>
          <a href="#section">anchor</a>
          <div data-unsaved-guard-ignore="">
            <a href="/d">ignored</a>
          </div>
          {dialog}
        </>
      )
    }
    renderWithOnu(<Links />)
    const prevent = (e: Event) => e.preventDefault()
    document.addEventListener("click", prevent)
    for (const name of ["tab", "dl", "ext", "anchor", "ignored"]) {
      fireEvent.click(screen.getByRole("link", { name }))
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument()
    }
    fireEvent.click(screen.getByRole("link", { name: "plain" }), { ctrlKey: true })
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole("link", { name: "plain" }))
    expect(await screen.findByRole("alertdialog")).toBeInTheDocument()
    document.removeEventListener("click", prevent)
  })
})
