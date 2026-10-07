import * as React from "react"
import { screen, configure } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { FormField } from "../form/form-field"
import { RangeSlider } from "./range-slider"

// Interaction-heavy tests: allow for slow, shared CI machines.
vi.setConfig({ testTimeout: 30_000 })
configure({ asyncUtilTimeout: 5_000 })

describe("RangeSlider", () => {
  it("is a single slider when given a number and keeps the shape", async () => {
    const onValueChange = vi.fn()
    renderWithOnu(<RangeSlider aria-label="Volume" defaultValue={40} onValueChange={onValueChange} />)
    const thumb = screen.getByRole("slider", { name: "Volume" })
    expect(thumb).toHaveAttribute("aria-valuenow", "40")
    thumb.focus()
    await userEvent.keyboard("{ArrowRight}")
    expect(onValueChange).toHaveBeenLastCalledWith(41)
    expect(thumb).toHaveAttribute("aria-valuetext", "41")
  })

  it("is a range with Minimum/Maximum thumbs", async () => {
    const onValueChange = vi.fn()
    const onValueCommit = vi.fn()
    renderWithOnu(
      <RangeSlider
        aria-label="Price"
        min={0}
        max={5000}
        step={100}
        defaultValue={[500, 2000]}
        onValueChange={onValueChange}
        onValueCommit={onValueCommit}
        formatValue={(v) => `MVR ${v}`}
        showValue="always"
      />,
    )
    const [low, high] = screen.getAllByRole("slider")
    expect(low).toHaveAccessibleName("Price, Minimum")
    expect(high).toHaveAccessibleName("Price, Maximum")
    expect(high).toHaveAttribute("aria-valuetext", "MVR 2000")
    expect(screen.getByText("MVR 500")).toBeInTheDocument()
    high!.focus()
    await userEvent.keyboard("{End}")
    expect(onValueChange).toHaveBeenLastCalledWith([500, 5000])
    expect(onValueCommit).toHaveBeenLastCalledWith([500, 5000])
  })

  it.each(directions)("keyboard follows the visual direction in %s", async (dir) => {
    const onValueChange = vi.fn()
    renderWithOnu(<RangeSlider aria-label="Level" defaultValue={50} onValueChange={onValueChange} />, { dir })
    screen.getByRole("slider").focus()
    await userEvent.keyboard("{ArrowLeft}")
    expect(onValueChange).toHaveBeenLastCalledWith(dir === "rtl" ? 51 : 49)
  })

  it("renders marks and is controlled", async () => {
    function Controlled() {
      const [value, setValue] = React.useState([2, 8])
      return (
        <>
          <RangeSlider
            aria-label="Nights"
            min={0}
            max={10}
            value={value}
            onValueChange={setValue}
            marks={[0, { value: 5, label: "5" }, { value: 10, label: "10+" }]}
            showValue="never"
            thumbLabels={["From", "To"]}
            classNames={{ mark: "mark-x" }}
          />
          <output>{value.join("-")}</output>
        </>
      )
    }
    const { container } = renderWithOnu(<Controlled />)
    expect(container.querySelectorAll(".mark-x")).toHaveLength(3)
    expect(screen.getByText("10+")).toBeInTheDocument()
    screen.getByRole("slider", { name: "Nights, From" }).focus()
    await userEvent.keyboard("{ArrowRight}")
    expect(screen.getByText("3-8")).toBeInTheDocument()
    expect(container.querySelector("[data-slot=slider-value]")).toBeNull()
  })

  it("is labelled by a FormField", async () => {
    renderWithOnu(
      <FormField label="Budget" help="In MVR">
        <RangeSlider defaultValue={[10, 20]} />
      </FormField>,
    )
    expect(screen.getAllByRole("slider")[0]).toHaveAccessibleName("Budget Minimum")
    expect(screen.getAllByRole("slider")[0]).toHaveAccessibleDescription("In MVR")
    await expectNoA11yViolations()
  })

  it.each(directions)("passes axe in %s (dv)", async (dir) => {
    renderWithOnu(<RangeSlider aria-label="އަގު" defaultValue={[1, 3]} max={5} />, { locale: "dv", dir })
    expect(screen.getAllByRole("slider")[1]).toHaveAccessibleName("އަގު, އެންމެ ބޮޑު")
    await expectNoA11yViolations()
  })
})
