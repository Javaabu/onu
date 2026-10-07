import * as React from "react"
import { screen, configure } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { FormField } from "../form/form-field"
import { ImageSelect, type ImageOption } from "./image-select"

// Interaction-heavy tests: allow for slow, shared CI machines.
vi.setConfig({ testTimeout: 30_000 })
configure({ asyncUtilTimeout: 5_000 })

const themes: ImageOption[] = [
  { value: "lagoon", label: "Lagoon", src: "/lagoon.jpg", alt: "", description: "Light blue" },
  { value: "reef", label: "Reef", src: "/reef.jpg", alt: "Coral reef" },
  { value: "sunset", label: "Sunset", src: "/sunset.jpg", alt: "", disabled: true },
]

describe("ImageSelect", () => {
  it("has radio semantics for one choice", async () => {
    const onValueChange = vi.fn()
    renderWithOnu(<ImageSelect aria-label="Theme" options={themes} onValueChange={onValueChange} name="theme" />)
    expect(screen.getByRole("radiogroup", { name: "Theme" })).toBeInTheDocument()
    await userEvent.click(screen.getByRole("radio", { name: "Reef" }))
    expect(onValueChange).toHaveBeenCalledWith("reef")
    expect(screen.getByRole("radio", { name: "Reef" })).toBeChecked()
    expect(screen.getByRole("radio", { name: "Sunset" })).toBeDisabled()
    expect(screen.getByAltText("Coral reef")).toHaveAttribute("loading", "lazy")
  })

  it.each(directions)("moves with arrow keys in %s", async (dir) => {
    renderWithOnu(<ImageSelect aria-label="Theme" options={themes} defaultValue="lagoon" />, { dir })
    screen.getByRole("radio", { name: "Lagoon" }).focus()
    await userEvent.keyboard(dir === "rtl" ? "{ArrowLeft}" : "{ArrowRight}")
    expect(screen.getByRole("radio", { name: "Reef" })).toHaveFocus()
  })

  it("has checkbox semantics with multiple and respects max", async () => {
    const onValueChange = vi.fn()
    renderWithOnu(
      <ImageSelect
        aria-label="Photos"
        options={themes.slice(0, 2).concat({ value: "beach", label: "Beach", src: "/b.jpg", alt: "" })}
        multiple
        max={2}
        name="photos"
        onValueChange={onValueChange}
      />,
    )
    expect(screen.getByRole("group", { name: "Photos" })).toBeInTheDocument()
    await userEvent.click(screen.getByRole("checkbox", { name: "Lagoon" }))
    await userEvent.click(screen.getByRole("checkbox", { name: "Reef" }))
    expect(onValueChange).toHaveBeenLastCalledWith(["lagoon", "reef"])
    expect(screen.getByRole("checkbox", { name: "Beach" })).toBeDisabled()
    expect(screen.getByText("You can select up to 2")).toBeInTheDocument()
    expect(document.querySelectorAll("input[name='photos[]']")).toHaveLength(2)
    await userEvent.click(screen.getByRole("checkbox", { name: "Lagoon" }))
    expect(onValueChange).toHaveBeenLastCalledWith(["reef"])
  })

  it("is controlled, hides labels and takes a numeric aspect ratio", async () => {
    function Controlled() {
      const [value, setValue] = React.useState<string | null>("lagoon")
      return (
        <ImageSelect
          aria-label="Theme"
          options={themes}
          value={value}
          onValueChange={setValue}
          showLabels={false}
          aspectRatio={1.5}
          minItemWidth="6rem"
          className="x"
          classNames={{ item: "item-x" }}
        />
      )
    }
    renderWithOnu(<Controlled />)
    expect(screen.getByRole("radio", { name: "Lagoon" })).toBeChecked()
    expect(screen.getByRole("radio", { name: "Reef" })).toHaveClass("item-x")
    expect(screen.queryByText("Reef")).not.toBeInTheDocument()
    expect(screen.getByRole("radiogroup")).toHaveClass("x")
    await userEvent.click(screen.getByRole("radio", { name: "Reef" }))
    expect(screen.getByRole("radio", { name: "Reef" })).toBeChecked()
  })

  it("is labelled by a FormField", async () => {
    renderWithOnu(
      <FormField label="Cover" name="cover" required error="Pick one">
        <ImageSelect options={themes} multiple aspectRatio="video" />
      </FormField>,
    )
    expect(screen.getByRole("group", { name: /Cover/ })).toBeInTheDocument()
    expect(screen.getByRole("checkbox", { name: "Lagoon" })).toHaveAttribute("aria-invalid", "true")
    await expectNoA11yViolations()
  })

  it.each(directions)("passes axe in %s (dv)", async (dir) => {
    renderWithOnu(
      <ImageSelect
        aria-label="ތީމް"
        options={[{ value: "1", label: "ފެހި", src: "/x.jpg", alt: "" }]}
        aspectRatio="portrait"
      />,
      { locale: "dv", dir },
    )
    await expectNoA11yViolations()
  })
})
