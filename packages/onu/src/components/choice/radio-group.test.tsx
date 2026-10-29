import * as React from "react"
import { screen, configure } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { RadioGroupItem } from "../../ui/radio-group"
import { FormField } from "../form/form-field"
import { Radio } from "./radio"
import { RadioGroup } from "./radio-group"

// Interaction-heavy tests: allow for slow, shared CI machines.
vi.setConfig({ testTimeout: 30_000 })
configure({ asyncUtilTimeout: 5_000 })

const methods = [
  { value: "post", label: "Post", description: "Collect from the post office" },
  { value: "courier", label: "Courier", description: "Delivered to your door", aside: "MVR 50" },
  { value: "pickup", label: "Pick up", disabled: true },
]

describe("RadioGroup", () => {
  it("renders options and selects with the mouse", async () => {
    const onValueChange = vi.fn()
    renderWithOnu(<RadioGroup aria-label="Delivery" options={methods} onValueChange={onValueChange} />)
    expect(screen.getByRole("radiogroup", { name: "Delivery" })).toHaveAttribute("aria-orientation", "vertical")
    await userEvent.click(screen.getByText("Courier"))
    expect(onValueChange).toHaveBeenCalledWith("courier")
    expect(screen.getByRole("radio", { name: "Courier" })).toBeChecked()
    expect(screen.getByRole("radio", { name: "Pick up" })).toBeDisabled()
  })

  it.each(directions)("moves with arrow keys in %s", async (dir) => {
    renderWithOnu(
      <RadioGroup
        aria-label="Delivery"
        options={["One", "Two", "Three"]}
        orientation="horizontal"
        defaultValue="One"
      />,
      { dir },
    )
    screen.getByRole("radio", { name: "One" }).focus()
    await userEvent.keyboard(dir === "rtl" ? "{ArrowLeft}" : "{ArrowRight}")
    expect(screen.getByRole("radio", { name: "Two" })).toHaveFocus()
  })

  it("renders the card variant with descriptions and asides", async () => {
    renderWithOnu(<RadioGroup aria-label="Delivery" variant="card" size="lg" options={methods} defaultValue="post" />)
    const card = screen.getByRole("radio", { name: "Courier" })
    expect(card).toHaveAttribute("data-slot", "radio-card")
    expect(card).toHaveAttribute("data-size", "lg")
    expect(card).toHaveAccessibleDescription("Delivered to your door")
    expect(screen.getByText("MVR 50")).toBeInTheDocument()
    await userEvent.click(card)
    expect(card).toBeChecked()
    await expectNoA11yViolations()
  })

  it("accepts Radio and shadcn RadioGroupItem children", () => {
    renderWithOnu(
      <RadioGroup aria-label="Size" defaultValue="s" classNames={{ item: "item-x" }}>
        <Radio value="s" label="Small" />
        <Radio value="m" label="Medium" variant="card" media={<span>M</span>} />
        <RadioGroupItem value="l" aria-label="Large" />
        <Radio value="xl" aria-label="Extra large" size="lg" className="bare-x" />
      </RadioGroup>,
    )
    expect(screen.getByRole("radio", { name: "Small" })).toBeChecked()
    expect(screen.getByRole("radio", { name: "Medium" })).toHaveClass("item-x")
    expect(screen.getByRole("radio", { name: "Large" })).toBeInTheDocument()
    expect(screen.getByRole("radio", { name: "Extra large" })).toHaveClass("bare-x")
  })

  it("is labelled by a FormField and marks errors", async () => {
    renderWithOnu(
      <FormField label="Gender" name="gender" required error="Choose one">
        <RadioGroup options={["Female", "Male"]} variant="card" />
      </FormField>,
    )
    const group = screen.getByRole("radiogroup", { name: /Gender/ })
    expect(group).toHaveAttribute("aria-invalid", "true")
    expect(screen.getByRole("radio", { name: "Female" })).toHaveAttribute("aria-invalid", "true")
    await expectNoA11yViolations()
  })

  it.each(directions)("passes axe in %s (dv)", async (dir) => {
    renderWithOnu(<RadioGroup aria-label="ޖިންސު" options={["އަންހެން", "ފިރިހެން"]} />, { locale: "dv", dir })
    await expectNoA11yViolations()
  })
})

const themes = [
  { value: "lagoon", label: "Lagoon", image: { src: "/lagoon.jpg", alt: "" }, description: "Light blue" },
  { value: "reef", label: "Reef", image: { src: "/reef.jpg", alt: "Coral reef" } },
  { value: "sunset", label: "Sunset", image: { src: "/sunset.jpg", alt: "" }, disabled: true },
]

describe("RadioGroup variant=image", () => {
  it("is a radio group of image tiles", async () => {
    const onValueChange = vi.fn()
    renderWithOnu(
      <RadioGroup variant="image" aria-label="Theme" options={themes} onValueChange={onValueChange} name="theme" />,
    )
    const group = screen.getByRole("radiogroup", { name: "Theme" })
    expect(group).toHaveAttribute("data-variant", "image")
    expect(group).not.toHaveAttribute("aria-orientation")
    expect(group.style.gridTemplateColumns).toBe("repeat(auto-fill, minmax(min(100%, 8rem), 1fr))")
    await userEvent.click(screen.getByRole("radio", { name: "Reef" }))
    expect(onValueChange).toHaveBeenCalledWith("reef")
    expect(screen.getByRole("radio", { name: "Reef" })).toBeChecked()
    expect(screen.getByRole("radio", { name: "Lagoon" })).toHaveAccessibleDescription("Light blue")
    expect(screen.getByRole("radio", { name: "Sunset" })).toBeDisabled()
    expect(screen.getByAltText("Coral reef")).toHaveAttribute("loading", "lazy")
  })

  it.each(directions)("moves with arrow keys in %s", async (dir) => {
    renderWithOnu(<RadioGroup variant="image" aria-label="Theme" options={themes} defaultValue="lagoon" />, { dir })
    screen.getByRole("radio", { name: "Lagoon" }).focus()
    await userEvent.keyboard(dir === "rtl" ? "{ArrowLeft}" : "{ArrowRight}")
    expect(screen.getByRole("radio", { name: "Reef" })).toHaveFocus()
    await userEvent.keyboard("{ArrowUp}")
    expect(screen.getByRole("radio", { name: "Lagoon" })).toHaveFocus()
  })

  it("is controlled, takes a tile width, a numeric aspect ratio and visually hidden labels", async () => {
    function Controlled() {
      const [value, setValue] = React.useState("lagoon")
      return (
        <RadioGroup
          variant="image"
          aria-label="Theme"
          options={themes}
          value={value}
          onValueChange={setValue}
          aspectRatio={1.5}
          minItemWidth="6rem"
          className="x"
          classNames={{ item: "item-x", label: "sr-only" }}
        />
      )
    }
    renderWithOnu(<Controlled />)
    expect(screen.getByRole("radio", { name: "Lagoon" })).toBeChecked()
    expect(screen.getByRole("radio", { name: "Reef" })).toHaveClass("item-x")
    expect(screen.getByText("Reef")).toHaveClass("sr-only")
    const group = screen.getByRole("radiogroup")
    expect(group).toHaveClass("x")
    expect(group.style.gridTemplateColumns).toContain("6rem")
    expect(group.querySelector<HTMLElement>("[data-slot=radio-image-media]")?.style.aspectRatio).toMatch(/^1\.5/)
    await userEvent.click(screen.getByRole("radio", { name: "Reef" }))
    expect(screen.getByRole("radio", { name: "Reef" })).toBeChecked()
  })

  it("is labelled by a FormField", async () => {
    renderWithOnu(
      <FormField label="Cover" name="cover" required error="Pick one">
        <RadioGroup variant="image" options={themes} aspectRatio="video" />
      </FormField>,
    )
    expect(screen.getByRole("radiogroup", { name: /Cover/ })).toBeInTheDocument()
    expect(screen.getByRole("radio", { name: "Lagoon" })).toHaveAttribute("aria-invalid", "true")
    await expectNoA11yViolations()
  })

  it.each(directions)("passes axe in %s (dv)", async (dir) => {
    renderWithOnu(
      <RadioGroup
        variant="image"
        aria-label="ތީމް"
        options={[{ value: "1", label: "ފެހި", image: { src: "/x.jpg", alt: "" } }]}
        aspectRatio="portrait"
      />,
      { locale: "dv", dir },
    )
    await expectNoA11yViolations()
  })
})
