import * as React from "react"
import { fireEvent, screen, configure } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { FormField } from "../form/form-field"
import { Rating } from "./rating"

// Interaction-heavy tests: allow for slow, shared CI machines.
vi.setConfig({ testTimeout: 30_000 })
configure({ asyncUtilTimeout: 5_000 })

function stars(container: HTMLElement) {
  return Array.from(container.querySelectorAll("[data-slot=rating-star]")).map((s) => s.getAttribute("data-fill"))
}

describe("Rating", () => {
  it("is a slider with a text value and sets by clicking", async () => {
    const onValueChange = vi.fn()
    const { container } = renderWithOnu(<Rating aria-label="Service" onValueChange={onValueChange} />)
    const slider = screen.getByRole("slider", { name: "Service" })
    expect(slider).toHaveAttribute("aria-valuetext", "Not rated")
    const targets = container.querySelectorAll("[data-slot=rating-star]")
    await userEvent.click(targets[2]!)
    expect(onValueChange).toHaveBeenLastCalledWith(3)
    expect(slider).toHaveAttribute("aria-valuetext", "3 out of 5 stars")
    expect(stars(container)).toEqual(["1", "1", "1", "0", "0"])
    await userEvent.click(targets[2]!)
    expect(onValueChange).toHaveBeenLastCalledWith(0)
  })

  it.each(directions)("supports the keyboard in %s", async (dir) => {
    const onValueChange = vi.fn()
    renderWithOnu(<Rating aria-label="Service" defaultValue={2} onValueChange={onValueChange} />, { dir })
    screen.getByRole("slider").focus()
    await userEvent.keyboard(dir === "rtl" ? "{ArrowLeft}" : "{ArrowRight}")
    expect(onValueChange).toHaveBeenLastCalledWith(3)
    await userEvent.keyboard("{ArrowDown}")
    expect(onValueChange).toHaveBeenLastCalledWith(2)
    await userEvent.keyboard("{End}")
    expect(onValueChange).toHaveBeenLastCalledWith(5)
    await userEvent.keyboard("{Home}")
    expect(onValueChange).toHaveBeenLastCalledWith(0)
    await userEvent.keyboard("4")
    expect(onValueChange).toHaveBeenLastCalledWith(4)
    await userEvent.keyboard("{ArrowUp}{ArrowUp}")
    expect(onValueChange).toHaveBeenLastCalledWith(5)
    await userEvent.keyboard("x")
    expect(onValueChange).toHaveBeenCalledTimes(7)
  })

  it("supports half stars with the pointer and keyboard", async () => {
    const onValueChange = vi.fn()
    const { container } = renderWithOnu(
      <Rating aria-label="Food" allowHalf defaultValue={3.5} onValueChange={onValueChange} />,
    )
    expect(stars(container)).toEqual(["1", "1", "1", "0.5", "0"])
    expect(screen.getByRole("slider")).toHaveAttribute("aria-valuetext", "3.5 out of 5 stars")
    const target = container.querySelectorAll("[data-slot=rating-star]")[1]!.parentElement!
    target.getBoundingClientRect = () => ({ left: 0, right: 20, width: 20, top: 0, bottom: 20, height: 20 }) as DOMRect
    fireEvent.pointerMove(target, { clientX: 5 })
    expect(stars(container)).toEqual(["1", "0.5", "0", "0", "0"])
    fireEvent.click(target, { clientX: 15 })
    expect(onValueChange).toHaveBeenLastCalledWith(2)
    fireEvent.pointerLeave(screen.getByRole("slider"))
    screen.getByRole("slider").focus()
    await userEvent.keyboard("{ArrowRight}")
    expect(onValueChange).toHaveBeenLastCalledWith(2.5)
  })

  it("is an image when read-only and inert when disabled", () => {
    renderWithOnu(
      <>
        <Rating readOnly value={4} name="score" size="sm" />
        <Rating disabled defaultValue={1} aria-label="Off" />
      </>,
    )
    expect(screen.getByRole("img", { name: "4 out of 5 stars" })).toBeInTheDocument()
    expect(document.querySelector("input[name=score]")).toHaveValue("4")
    expect(screen.queryByRole("slider")).not.toBeInTheDocument()
  })

  it("is controlled, labelled by a FormField and submits", async () => {
    function Controlled() {
      const [value, setValue] = React.useState(1)
      return (
        <FormField label="Overall" name="overall">
          <Rating value={value} onValueChange={setValue} max={10} icon="heart" clearable={false} />
        </FormField>
      )
    }
    const { container } = renderWithOnu(<Controlled />)
    const slider = screen.getByRole("slider", { name: "Overall" })
    expect(container.querySelectorAll("[data-slot=rating-star]")).toHaveLength(10)
    await userEvent.click(container.querySelectorAll("[data-slot=rating-star]")[0]!)
    expect(slider).toHaveAttribute("aria-valuenow", "1")
    expect(document.querySelector("input[name=overall]")).toHaveValue("1")
    await expectNoA11yViolations()
  })

  it.each(directions)("passes axe in %s (dv)", async (dir) => {
    renderWithOnu(<Rating aria-label="ރޭޓިންގ" defaultValue={2} />, { locale: "dv", dir })
    expect(screen.getByRole("slider")).toHaveAttribute("aria-valuetext", "5 ތަރިން 2")
    await expectNoA11yViolations()
  })
})
