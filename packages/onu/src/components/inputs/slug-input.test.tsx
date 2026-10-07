import * as React from "react"
import { fireEvent, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { FormField } from "../form/form-field"
import { thaanaToLatin, toSlug, SlugInput } from "./slug-input"
import { TextInput } from "./text-input"

describe("toSlug and thaanaToLatin", () => {
  it("slugifies Latin text", () => {
    expect(toSlug("Hulhumalé Ferry Schedule 2026!")).toBe("hulhumale-ferry-schedule-2026")
    expect(toSlug("A & B", { separator: "_" })).toBe("a-and-b".replace(/-/g, "_"))
    expect(toSlug("trailing ", { preserveTrailing: true })).toBe("trailing")
    expect(toSlug("trailing-", { preserveTrailing: true })).toBe("trailing-")
  })

  it("transliterates Thaana to Latin", () => {
    expect(thaanaToLatin("މާލެ")).toBe("maale")
    expect(thaanaToLatin("ހުޅުމާލެ")).toBe("hulhumaale")
    expect(thaanaToLatin("ދިވެހިރާއްޖެ")).toBe("dhivehiraajje")
    expect(thaanaToLatin("އައްޑޫ")).toBe("addoo")
    expect(thaanaToLatin("ބަސް، ރަށް")).toBe("bas, rah")
    expect(thaanaToLatin("ސުކޫލް")).toBe("sukool")
    expect(thaanaToLatin("ABC")).toBe("ABC")
  })

  it("produces sensible slugs from Thaana titles", () => {
    expect(toSlug("މާލެ ސިޓީ ކައުންސިލް")).toBe("maale-sitee-kaunsil")
    expect(toSlug("ހުޅުމާލެ 2026")).toBe("hulhumaale-2026")
  })
})

describe("SlugInput", () => {
  function Form({ initial = "", slug }: { initial?: string; slug?: string }) {
    const [title, setTitle] = React.useState(initial)
    return (
      <>
        <TextInput aria-label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <SlugInput aria-label="Slug" source={title} defaultValue={slug} prefix="https://example.mv/news/" />
      </>
    )
  }

  it("follows the source while locked and shows a URL preview", async () => {
    renderWithOnu(<Form />)
    await userEvent.type(screen.getByLabelText("Title"), "Ferry Schedule Update")
    const slug = screen.getByRole("textbox", { name: "Slug" })
    expect(slug).toHaveValue("ferry-schedule-update")
    expect(slug).toHaveAttribute("dir", "ltr")
    expect(screen.getByRole("button", { name: "Generate the slug automatically" })).toHaveAttribute(
      "aria-pressed",
      "true",
    )
    expect(document.querySelector("[data-slot=slug-preview]")).toHaveTextContent(
      "https://example.mv/news/ferry-schedule-update",
    )
    await expectNoA11yViolations()
  })

  it("stops following once edited by hand, and can be locked again", async () => {
    renderWithOnu(<Form initial="Old title" />)
    const slug = screen.getByRole("textbox", { name: "Slug" })
    expect(slug).toHaveValue("old-title")
    await userEvent.clear(slug)
    await userEvent.type(slug, "My Custom Slug")
    expect(slug).toHaveValue("my-custom-slug")
    expect(screen.getByText("Slug is edited manually")).toBeInTheDocument()
    await userEvent.type(screen.getByLabelText("Title"), " changed")
    expect(slug).toHaveValue("my-custom-slug")
    const lock = screen.getByRole("button", { name: "Generate the slug automatically" })
    expect(lock).toHaveAttribute("aria-pressed", "false")
    await userEvent.click(lock)
    expect(slug).toHaveValue("old-title-changed")
    expect(screen.getByText("Slug is generated automatically")).toBeInTheDocument()
  })

  it("keeps an existing slug on edit pages until unlocked", async () => {
    renderWithOnu(<Form initial="Annual report" slug="annual-report-2025" />)
    const slug = screen.getByRole("textbox", { name: "Slug" })
    expect(slug).toHaveValue("annual-report-2025")
    await userEvent.type(screen.getByLabelText("Title"), "!")
    expect(slug).toHaveValue("annual-report-2025")
    // Unlock → lock toggles: first click turns automatic on.
    await userEvent.click(screen.getByRole("button", { name: "Generate the slug automatically" }))
    expect(slug).toHaveValue("annual-report")
    await userEvent.click(screen.getByRole("button", { name: "Generate the slug automatically" }))
    expect(slug).toHaveFocus()
  })

  it("generates from a Thaana title", async () => {
    renderWithOnu(<SlugInput aria-label="Slug" source="ހުޅުމާލެ ފެރީ" />)
    expect(screen.getByRole("textbox")).toHaveValue("hulhumaale-feree")
  })

  it("normalises on blur and supports controlled mode and a custom slugify", async () => {
    const onValueChange = vi.fn()
    const onAutoChange = vi.fn()
    function Controlled() {
      const [v, setV] = React.useState("a")
      return (
        <SlugInput
          aria-label="Slug"
          value={v}
          auto={false}
          onAutoChange={onAutoChange}
          onValueChange={(s) => {
            setV(s)
            onValueChange(s)
          }}
          slugify={(s) => s.toUpperCase().replace(/\s+/g, "_")}
        />
      )
    }
    renderWithOnu(<Controlled />)
    const input = screen.getByRole("textbox")
    fireEvent.change(input, { target: { value: "hello world" } })
    expect(onValueChange).toHaveBeenLastCalledWith("HELLO_WORLD")
    fireEvent.blur(input)
    expect(input).toHaveValue("HELLO_WORLD")
  })

  it("trims a trailing separator on blur", async () => {
    renderWithOnu(<SlugInput aria-label="Slug" defaultValue="x" />)
    const input = screen.getByRole("textbox")
    await userEvent.type(input, "-")
    expect(input).toHaveValue("x-")
    await userEvent.tab()
    expect(input).toHaveValue("x")
  })

  it("is wired by a FormField and disables the toggle when read-only", () => {
    renderWithOnu(
      <FormField label="Slug" name="slug" help="Used in the address">
        <SlugInput source="Title" readOnly classNames={{ preview: "pv-x" }} prefix="/news/" />
      </FormField>,
    )
    const input = screen.getByLabelText("Slug")
    expect(input).toHaveAttribute("name", "slug")
    expect(input.getAttribute("aria-describedby")).toMatch(/help/)
    expect(screen.getByRole("button")).toBeDisabled()
    expect(document.querySelector(".pv-x")).toBeInTheDocument()
  })

  it.each(directions)("uses Dhivehi strings in %s", async (dir) => {
    renderWithOnu(<SlugInput aria-label="ސްލަގް" source="މާލެ" prefix="/" />, { dir, locale: "dv" })
    expect(screen.getByRole("button", { name: "ސްލަގް އަމިއްލައަށް ހައްދާ" })).toBeInTheDocument()
    expect(screen.getByRole("textbox")).toHaveValue("maale")
    await expectNoA11yViolations()
  })
})
