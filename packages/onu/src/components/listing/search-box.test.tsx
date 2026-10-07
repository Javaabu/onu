import * as React from "react"
import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { FormField } from "../form/form-field"
import { SearchBox } from "./search-box"

// Interaction-heavy tests: allow for slow CI machines and coverage instrumentation.
vi.setConfig({ testTimeout: 30_000 })

describe("SearchBox", () => {
  it("does nothing while typing and submits on Enter (§25.6)", async () => {
    const onSearch = vi.fn()
    const onValueChange = vi.fn()
    renderWithOnu(<SearchBox onSearch={onSearch} onValueChange={onValueChange} />)
    const box = screen.getByRole("searchbox", { name: "Search" })
    await userEvent.type(box, "jane")
    expect(onSearch).not.toHaveBeenCalled()
    expect(onValueChange).toHaveBeenLastCalledWith("jane")
    await userEvent.keyboard("{Enter}")
    expect(onSearch).toHaveBeenCalledWith("jane")
    expect(screen.getByRole("search")).toBeInTheDocument()
    await expectNoA11yViolations()
  })

  it("submits when leaving the box after changing the text, but not without a change (§25.6)", async () => {
    const onSearch = vi.fn()
    renderWithOnu(
      <>
        <SearchBox onSearch={onSearch} defaultValue="ali" />
        <button type="button">elsewhere</button>
      </>,
    )
    const box = screen.getByRole("searchbox")
    await userEvent.click(box)
    await userEvent.tab()
    expect(onSearch).not.toHaveBeenCalled()
    await userEvent.type(box, "x")
    await userEvent.tab()
    expect(onSearch).toHaveBeenCalledWith("alix")
  })

  it("shows everything again after clearing the box and pressing Enter (§25.6)", async () => {
    const onSearch = vi.fn()
    renderWithOnu(<SearchBox value="jane" onSearch={onSearch} />)
    const box = screen.getByRole("searchbox")
    await userEvent.clear(box)
    await userEvent.keyboard("{Enter}")
    expect(onSearch).toHaveBeenCalledWith("")
  })

  it("clears with the ✕ button, and Escape reverts unsaved typing", async () => {
    const onSearch = vi.fn()
    renderWithOnu(<SearchBox defaultValue="jane" onSearch={onSearch} />)
    const box = screen.getByRole("searchbox")
    await userEvent.type(box, "zz")
    await userEvent.keyboard("{Escape}")
    expect(box).toHaveValue("jane")
    await userEvent.click(screen.getByRole("button", { name: "Clear search box" }))
    expect(box).toHaveValue("")
    expect(box).toHaveFocus()
    expect(onSearch).toHaveBeenCalledWith("")
    expect(screen.queryByRole("button", { name: "Clear search box" })).not.toBeInTheDocument()
  })

  it("follows a controlled value", () => {
    const { rerender } = renderWithOnu(<SearchBox value="a" />)
    rerender(<SearchBox value="b" />)
    expect(screen.getByRole("searchbox")).toHaveValue("b")
  })

  it("lets the consumer handle keys first, and can drop the landmark", async () => {
    const onSearch = vi.fn()
    renderWithOnu(
      <SearchBox landmark={false} onSearch={onSearch} onKeyDown={(e) => e.preventDefault()} className="box-x" />,
    )
    expect(screen.queryByRole("search")).not.toBeInTheDocument()
    expect(document.querySelector("[data-slot=search-box]")).toHaveClass("box-x")
    await userEvent.type(screen.getByRole("searchbox"), "{Enter}")
    expect(onSearch).not.toHaveBeenCalled()
  })

  it("submits through the form", () => {
    const onSearch = vi.fn()
    renderWithOnu(<SearchBox defaultValue="q" onSearch={onSearch} />)
    ;(screen.getByRole("search") as HTMLFormElement).requestSubmit()
    expect(onSearch).toHaveBeenCalledWith("q")
  })

  it("types Thaana with the thaana prop", () => {
    renderWithOnu(<SearchBox thaana />)
    expect(screen.getByRole("searchbox")).toHaveAttribute("lang", "dv")
  })

  it("is wired to a FormField", () => {
    renderWithOnu(
      <FormField label="Find" name="q">
        <SearchBox />
      </FormField>,
    )
    expect(screen.getByRole("searchbox")).toHaveAttribute("name", "q")
  })

  it.each(directions)("works in %s with Dhivehi strings", async (dir) => {
    renderWithOnu(<SearchBox defaultValue="x" />, { locale: "dv", dir })
    expect(screen.getByRole("searchbox", { name: "ހޯދާ" })).toHaveAttribute("placeholder", "ހޯދާ…")
    expect(screen.getByRole("button", { name: "ހޯދާ ބޮކްސް ސާފުކުރޭ" })).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})
