import * as React from "react"
import { act, fireEvent, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { FormField } from "../form/form-field"
import { DatePicker } from "./date-picker"

const TODAY = new Date(2026, 2, 12) // Thursday 12 March 2026

function setup(ui: React.ReactElement, options?: Parameters<typeof renderWithOnu>[1]) {
  const user = userEvent.setup()
  const result = renderWithOnu(ui, options)
  return { user, ...result }
}

const trigger = () => screen.getByRole("combobox")
const dialog = () => screen.getByRole("dialog")
const day = (name: RegExp | string) => within(dialog()).getByRole("button", { name })
const focusedDay = () => document.activeElement as HTMLElement

describe("DatePicker — field (§25.1)", () => {
  it("shows the selected date in the configured format, or a placeholder when empty", () => {
    const { rerender } = renderWithOnu(<DatePicker aria-label="Date" value={null} today={TODAY} />)
    expect(trigger()).toHaveTextContent("Select a date")
    expect(trigger()).toHaveAttribute("data-empty")
    rerender(<DatePicker aria-label="Date" value={new Date(2026, 2, 12)} today={TODAY} />)
    expect(trigger()).toHaveTextContent("12/03/2026")
    rerender(<DatePicker aria-label="Date" value={new Date(2026, 2, 12)} format="d MMMM yyyy" today={TODAY} />)
    expect(trigger()).toHaveTextContent("12 March 2026")
  })

  it("names the field with its label and its value", () => {
    renderWithOnu(<DatePicker aria-label="Date of birth" defaultValue={TODAY} />)
    expect(trigger()).toHaveAccessibleName("Date of birth 12/03/2026")
  })

  it("opens below the field when clicked", async () => {
    const { user } = setup(<DatePicker aria-label="Date" today={TODAY} />)
    expect(trigger()).toHaveAttribute("aria-expanded", "false")
    await user.click(trigger())
    expect(dialog()).toHaveAccessibleName("Choose a date")
    expect(trigger()).toHaveAttribute("aria-expanded", "true")
  })

  it.each(["{Enter}", " "])("opens with %s on the field", async (key) => {
    const { user } = setup(<DatePicker aria-label="Date" today={TODAY} />)
    trigger().focus()
    await user.keyboard(key)
    expect(dialog()).toBeInTheDocument()
  })

  it("does nothing when disabled", async () => {
    const { user } = setup(<DatePicker aria-label="Date" disabled today={TODAY} />)
    await user.click(trigger())
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    expect(trigger()).toBeDisabled()
  })

  it("highlights a field with an error and shows the message underneath", async () => {
    renderWithOnu(
      <FormField label="Start date" error="The start date is required." required name="start">
        <DatePicker today={TODAY} />
      </FormField>,
    )
    expect(trigger()).toHaveAttribute("aria-invalid", "true")
    expect(trigger()).toHaveAttribute("aria-required", "true")
    expect(trigger()).toHaveAccessibleDescription("The start date is required.")
    expect(trigger()).toHaveAccessibleName(/Start date/)
    expect(screen.getByText("The start date is required.")).toBeVisible()
    await expectNoA11yViolations()
  })
})

describe("DatePicker — days view (§25.1)", () => {
  it("shows one month as a grid with weekday names across the top", async () => {
    const { user } = setup(<DatePicker aria-label="Date" today={TODAY} />)
    await user.click(trigger())
    const grid = within(dialog()).getByRole("grid", { name: "March 2026" })
    const headers = within(grid).getAllByRole("columnheader", { hidden: true })
    expect(headers.map((h) => h.textContent)).toEqual(["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"])
  })

  it("shows the selected date's month, or today's month when empty", async () => {
    const { user, unmount } = setup(<DatePicker aria-label="Date" defaultValue={new Date(2025, 10, 5)} today={TODAY} />)
    await user.click(trigger())
    expect(within(dialog()).getByRole("grid")).toHaveAccessibleName("November 2025")
    unmount()
    const second = setup(<DatePicker aria-label="Date" today={TODAY} />)
    await second.user.click(trigger())
    expect(within(dialog()).getByRole("grid")).toHaveAccessibleName("March 2026")
  })

  it("marks today and highlights the selected date", async () => {
    const { user } = setup(<DatePicker aria-label="Date" defaultValue={new Date(2026, 2, 20)} today={TODAY} />)
    await user.click(trigger())
    const today = day(/^Today, Thursday, March 12th, 2026/)
    expect(today.closest("td")).toHaveAttribute("data-today")
    const selected = day(/March 20th, 2026/)
    expect(selected.closest("td")).toHaveAttribute("aria-selected", "true")
    expect(selected).toHaveAttribute("data-selected-single", "true")
  })

  it("styles weekend days (Friday and Saturday by default)", async () => {
    const { user } = setup(<DatePicker aria-label="Date" today={TODAY} />)
    await user.click(trigger())
    expect(day(/Friday, March 13th/).closest("td")?.className).toContain("text-destructive")
    expect(day(/Thursday, March 19th/).closest("td")?.className).not.toContain("text-destructive")
  })

  it("supports other weekend days", async () => {
    const { user } = setup(<DatePicker aria-label="Date" today={TODAY} weekendDays={[0]} />)
    await user.click(trigger())
    expect(day(/Sunday, March 15th/).closest("td")?.className).toContain("text-destructive")
  })

  it("fills the first and last rows with dimmed days from the next and previous months", async () => {
    const { user } = setup(<DatePicker aria-label="Date" today={TODAY} />)
    await user.click(trigger())
    expect(day(/Saturday, April 4th, 2026/).closest("td")).toHaveAttribute("data-outside")
    await user.click(within(dialog()).getByRole("button", { name: "Next month" }))
    const outside = day(/Tuesday, March 31st, 2026/).closest("td")!
    expect(outside).toHaveAttribute("data-outside")
    expect(outside.className).toContain("text-muted-foreground")
    expect(day(/Wednesday, April 1st, 2026/).closest("td")).not.toHaveAttribute("data-outside")
  })

  it("selects a clicked day, closes, and shows the date in the field", async () => {
    const onChange = vi.fn()
    const { user } = setup(<DatePicker aria-label="Date" today={TODAY} onChange={onChange} />)
    await user.click(trigger())
    await user.click(day(/March 20th, 2026/))
    expect(onChange).toHaveBeenCalledWith(new Date(2026, 2, 20))
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    expect(trigger()).toHaveTextContent("20/03/2026")
  })

  it("moves to the previous and next month with ‹ and ›", async () => {
    const { user } = setup(<DatePicker aria-label="Date" today={TODAY} />)
    await user.click(trigger())
    await user.click(within(dialog()).getByRole("button", { name: "Next month" }))
    expect(within(dialog()).getByRole("grid")).toHaveAccessibleName("April 2026")
    await user.click(within(dialog()).getByRole("button", { name: "Previous month" }))
    await user.click(within(dialog()).getByRole("button", { name: "Previous month" }))
    expect(within(dialog()).getByRole("grid")).toHaveAccessibleName("February 2026")
  })

  it("greys out dates outside min/max and does not let them be clicked", async () => {
    const onChange = vi.fn()
    const { user } = setup(
      <DatePicker
        aria-label="Date"
        today={TODAY}
        min={new Date(2026, 2, 5)}
        max={new Date(2026, 2, 25)}
        disabledDates={{ dayOfWeek: [5] }}
        onChange={onChange}
      />,
    )
    await user.click(trigger())
    const early = day(/March 4th, 2026/)
    expect(early).toBeDisabled()
    expect(early.closest("td")).toHaveAttribute("data-disabled")
    await user.click(early)
    expect(day(/March 26th, 2026/)).toBeDisabled()
    expect(day(/Friday, March 13th/)).toBeDisabled()
    expect(onChange).not.toHaveBeenCalled()
    expect(within(dialog()).getByRole("button", { name: "Previous month" })).toBeDisabled()
    expect(within(dialog()).getByRole("button", { name: "Next month" })).toBeDisabled()
  })

  it("does not select anything just by opening", async () => {
    const onChange = vi.fn()
    const { user } = setup(<DatePicker aria-label="Date" today={TODAY} onChange={onChange} />)
    await user.click(trigger())
    await user.keyboard("{Escape}")
    expect(onChange).not.toHaveBeenCalled()
    expect(trigger()).toHaveTextContent("Select a date")
    expect(within(document.body).queryAllByRole("gridcell", { selected: true })).toHaveLength(0)
  })
})

describe("DatePicker — zooming out (§25.1)", () => {
  it("shows the month and year in the header", async () => {
    const { user } = setup(<DatePicker aria-label="Date" today={TODAY} />)
    await user.click(trigger())
    expect(within(dialog()).getByRole("button", { name: "March 2026: choose a month" })).toHaveTextContent("March 2026")
  })

  it("clicking the month and year shows the 12 months; a month goes back to its days; ‹ › change year", async () => {
    const { user } = setup(<DatePicker aria-label="Date" today={TODAY} />)
    await user.click(trigger())
    await user.click(within(dialog()).getByRole("button", { name: /March 2026/ }))
    const grid = within(dialog()).getByRole("grid", { name: "Months" })
    expect(within(grid).getAllByRole("gridcell")).toHaveLength(12)
    expect(within(grid).getByRole("button", { name: "March 2026" })).toHaveAttribute("aria-current", "date")
    await user.click(within(dialog()).getByRole("button", { name: "Next year" }))
    expect(within(dialog()).getByRole("button", { name: /^2027/ })).toBeInTheDocument()
    await user.click(within(dialog()).getByRole("button", { name: "Previous year" }))
    await user.click(within(dialog()).getByRole("button", { name: "July 2026" }))
    expect(within(dialog()).getByRole("grid")).toHaveAccessibleName("July 2026")
    expect(focusedDay()).toHaveAccessibleName(/July 1st, 2026/)
  })

  it("clicking the year shows 12 years; a year goes back to its months; ‹ › move 12 years", async () => {
    const { user } = setup(<DatePicker aria-label="Date" today={TODAY} />)
    await user.click(trigger())
    await user.click(within(dialog()).getByRole("button", { name: /March 2026/ }))
    await user.click(within(dialog()).getByRole("button", { name: "2026: choose a year" }))
    const grid = within(dialog()).getByRole("grid", { name: "Years" })
    const years = within(grid)
      .getAllByRole("button")
      .map((b) => b.textContent)
    expect(years).toEqual(Array.from({ length: 12 }, (_, i) => String(2016 + i)))
    await user.click(within(dialog()).getByRole("button", { name: "Next 12 years" }))
    expect(within(dialog()).getByRole("button", { name: "2028–2039: choose a range of years" })).toBeInTheDocument()
    await user.click(within(dialog()).getByRole("button", { name: "Previous 12 years" }))
    await user.click(within(dialog()).getByRole("button", { name: "2020" }))
    expect(within(dialog()).getByRole("grid", { name: "Months" })).toBeInTheDocument()
    expect(within(dialog()).getByRole("button", { name: /^2020/ })).toBeInTheDocument()
  })

  it("clicking the year range shows blocks of 12 years; a block goes back to its years", async () => {
    const { user } = setup(<DatePicker aria-label="Date" today={TODAY} />)
    await user.click(trigger())
    await user.click(within(dialog()).getByRole("button", { name: /March 2026/ }))
    await user.click(within(dialog()).getByRole("button", { name: /^2026/ }))
    await user.click(within(dialog()).getByRole("button", { name: "2016–2027: choose a range of years" }))
    const grid = within(dialog()).getByRole("grid", { name: "Ranges of years" })
    expect(within(grid).getAllByRole("gridcell")).toHaveLength(12)
    expect(within(grid).getByRole("button", { name: "2016–2027" })).toHaveAttribute("aria-current", "date")
    await user.click(within(dialog()).getByRole("button", { name: "Next 144 years" }))
    await user.click(within(dialog()).getByRole("button", { name: "Previous 144 years" }))
    await user.click(within(grid).getByRole("button", { name: "1992–2003" }))
    expect(within(dialog()).getByRole("grid", { name: "Years" })).toBeInTheDocument()
    expect(within(dialog()).getByRole("button", { name: "1992–2003: choose a range of years" })).toBeInTheDocument()
  })

  it("greys out months and years outside min/max", async () => {
    const { user } = setup(
      <DatePicker aria-label="Date" today={TODAY} min={new Date(2026, 1, 10)} max={new Date(2027, 5, 1)} />,
    )
    await user.click(trigger())
    await user.click(within(dialog()).getByRole("button", { name: /March 2026/ }))
    expect(within(dialog()).getByRole("button", { name: "January 2026" })).toHaveAttribute("aria-disabled", "true")
    expect(within(dialog()).getByRole("button", { name: "February 2026" })).not.toHaveAttribute("aria-disabled")
    expect(within(dialog()).getByRole("button", { name: "Previous year" })).toBeDisabled()
    await user.click(within(dialog()).getByRole("button", { name: "January 2026" }))
    expect(within(dialog()).getByRole("grid", { name: "Months" })).toBeInTheDocument()
    await user.click(within(dialog()).getByRole("button", { name: /^2026/ }))
    expect(within(dialog()).getByRole("button", { name: "2025" })).toHaveAttribute("aria-disabled", "true")
    expect(within(dialog()).getByRole("button", { name: "2027" })).not.toHaveAttribute("aria-disabled")
  })
})

describe("DatePicker — footer (§25.1)", () => {
  it("Clear empties the field and closes the picker", async () => {
    const onChange = vi.fn()
    const { user } = setup(<DatePicker aria-label="Date" defaultValue={TODAY} onChange={onChange} />)
    await user.click(trigger())
    await user.click(within(dialog()).getByRole("button", { name: "Clear" }))
    expect(onChange).toHaveBeenCalledWith(null)
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    expect(trigger()).toHaveTextContent("Select a date")
  })

  it("shows Clear only on optional fields", async () => {
    const { user } = setup(<DatePicker aria-label="Date" required defaultValue={TODAY} />)
    await user.click(trigger())
    expect(within(dialog()).queryByRole("button", { name: "Clear" })).not.toBeInTheDocument()
  })

  it("Done closes the picker", async () => {
    const { user } = setup(<DatePicker aria-label="Date" today={TODAY} />)
    await user.click(trigger())
    await user.click(within(dialog()).getByRole("button", { name: "Done" }))
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })
})

describe("DatePicker — keyboard (§25.1)", () => {
  it("focuses the selected (or today's) day when it opens", async () => {
    const { user } = setup(<DatePicker aria-label="Date" defaultValue={new Date(2026, 2, 20)} today={TODAY} />)
    await user.click(trigger())
    expect(focusedDay()).toHaveAccessibleName(/March 20th, 2026/)
  })

  it("moves one day with left/right and one week with up/down", async () => {
    const { user } = setup(<DatePicker aria-label="Date" today={TODAY} />)
    await user.click(trigger())
    expect(focusedDay()).toHaveAccessibleName(/March 12th/)
    await user.keyboard("{ArrowRight}")
    expect(focusedDay()).toHaveAccessibleName(/March 13th/)
    await user.keyboard("{ArrowDown}")
    expect(focusedDay()).toHaveAccessibleName(/March 20th/)
    await user.keyboard("{ArrowLeft}{ArrowUp}")
    expect(focusedDay()).toHaveAccessibleName(/March 12th/)
  })

  it("follows the visual order in RTL", async () => {
    const { user } = setup(<DatePicker aria-label="Date" today={TODAY} />, { dir: "rtl" })
    await user.click(trigger())
    await user.keyboard("{ArrowLeft}")
    expect(focusedDay()).toHaveAccessibleName(/March 13th/)
    await user.keyboard("{ArrowRight}{ArrowRight}")
    expect(focusedDay()).toHaveAccessibleName(/March 11th/)
  })

  it("Page Up / Page Down go to the previous or next month", async () => {
    const { user } = setup(<DatePicker aria-label="Date" today={TODAY} />)
    await user.click(trigger())
    await user.keyboard("{PageDown}")
    expect(focusedDay()).toHaveAccessibleName(/April 12th, 2026/)
    expect(within(dialog()).getByRole("grid")).toHaveAccessibleName("April 2026")
    await user.keyboard("{PageUp}{PageUp}")
    expect(focusedDay()).toHaveAccessibleName(/February 12th, 2026/)
  })

  it("Page Up / Page Down move a year in the months view and 12 years in the years view", async () => {
    const { user } = setup(<DatePicker aria-label="Date" today={TODAY} />)
    await user.click(trigger())
    await user.click(within(dialog()).getByRole("button", { name: /March 2026/ }))
    within(dialog()).getByRole("button", { name: "March 2026" }).focus()
    await user.keyboard("{PageDown}")
    expect(within(dialog()).getByRole("button", { name: /^2027: choose/ })).toBeInTheDocument()
    expect(focusedDay()).toHaveAccessibleName("March 2027")
    await user.keyboard("{ArrowRight}{ArrowDown}")
    expect(focusedDay()).toHaveAccessibleName("July 2027")
    await user.keyboard("{Home}")
    expect(focusedDay()).toHaveAccessibleName("July 2027")
    await user.keyboard("{End}")
    expect(focusedDay()).toHaveAccessibleName("September 2027")
    await user.keyboard("{Enter}")
    expect(within(dialog()).getByRole("grid")).toHaveAccessibleName("September 2027")
    await user.click(within(dialog()).getByRole("button", { name: /September 2027/ }))
    await user.click(within(dialog()).getByRole("button", { name: /^2027: choose/ }))
    within(dialog()).getByRole("button", { name: "2027" }).focus()
    await user.keyboard("{PageUp}")
    expect(within(dialog()).getByRole("button", { name: /^2004–2015/ })).toBeInTheDocument()
    expect(focusedDay()).toHaveTextContent("2015")
    // Moving past the last cell pages forward.
    await user.keyboard("{ArrowRight}")
    expect(focusedDay()).toHaveTextContent("2016")
  })

  it("Home / End go to the start or end of the week", async () => {
    const { user } = setup(<DatePicker aria-label="Date" today={TODAY} />)
    await user.click(trigger())
    await user.keyboard("{Home}")
    expect(focusedDay()).toHaveAccessibleName(/Sunday, March 8th/)
    await user.keyboard("{End}")
    expect(focusedDay()).toHaveAccessibleName(/Saturday, March 14th/)
  })

  it.each(["{Enter}", " "])("%s selects the highlighted day", async (key) => {
    const onChange = vi.fn()
    const { user } = setup(<DatePicker aria-label="Date" today={TODAY} onChange={onChange} />)
    await user.click(trigger())
    await user.keyboard(`{ArrowRight}${key}`)
    expect(onChange).toHaveBeenCalledWith(new Date(2026, 2, 13))
  })

  it("Escape closes without changing anything and returns focus to the field", async () => {
    const onChange = vi.fn()
    const { user } = setup(<DatePicker aria-label="Date" defaultValue={TODAY} onChange={onChange} />)
    await user.click(trigger())
    await user.keyboard("{ArrowRight}{Escape}")
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    expect(onChange).not.toHaveBeenCalled()
    expect(trigger()).toHaveFocus()
    expect(trigger()).toHaveTextContent("12/03/2026")
  })

  it("closes when clicking outside", async () => {
    const { user } = setup(
      <>
        <button type="button">Elsewhere</button>
        <DatePicker aria-label="Date" today={TODAY} />
      </>,
    )
    await user.click(trigger())
    expect(dialog()).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Elsewhere" }))
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })
})

describe("DatePicker — integration", () => {
  it("works controlled", async () => {
    function Controlled() {
      const [value, setValue] = React.useState<Date | null>(new Date(2026, 0, 1))
      return (
        <>
          <DatePicker aria-label="Date" value={value} onChange={setValue} today={TODAY} />
          <output>{value ? value.toDateString() : "none"}</output>
        </>
      )
    }
    const { user } = setup(<Controlled />)
    await user.click(trigger())
    await user.click(day(/January 15th, 2026/))
    expect(screen.getByRole("status", { name: "" }).textContent ?? "").toBeDefined()
    expect(screen.getByText("Thu Jan 15 2026")).toBeInTheDocument()
  })

  it("controls the open state", async () => {
    const onOpenChange = vi.fn()
    const { user } = setup(<DatePicker aria-label="Date" open onOpenChange={onOpenChange} today={TODAY} />)
    expect(dialog()).toBeInTheDocument()
    await user.click(within(dialog()).getByRole("button", { name: "Done" }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(dialog()).toBeInTheDocument()
  })

  it("posts an ISO date through a hidden input for plain HTML forms", async () => {
    const { container, user } = setup(<DatePicker name="date_of_birth" aria-label="Date" today={TODAY} />)
    const hidden = container.querySelector<HTMLInputElement>('input[type="hidden"][name="date_of_birth"]')!
    expect(hidden.value).toBe("")
    await user.click(trigger())
    await user.click(day(/March 5th, 2026/))
    expect(hidden.value).toBe("2026-03-05")
  })

  it("takes its id, name and label from a FormField", async () => {
    const { container } = renderWithOnu(
      <FormField label="Joined on" name="joined_on" help="As in the contract">
        <DatePicker defaultValue={TODAY} />
      </FormField>,
    )
    expect(trigger()).toHaveAccessibleName("Joined on 12/03/2026")
    expect(trigger()).toHaveAccessibleDescription("As in the contract")
    expect(container.querySelector('input[name="joined_on"]')).toHaveValue("2026-03-12")
    expect(screen.getByText("Joined on").closest("label")).toHaveAttribute("for", trigger().id)
    await expectNoA11yViolations()
  })

  it("announces the selected date", async () => {
    const { user } = setup(<DatePicker aria-label="Date" today={TODAY} />)
    await user.click(trigger())
    await user.click(day(/March 5th, 2026/))
    expect(screen.getByText("Selected: Thursday, March 5th, 2026")).toHaveAttribute("aria-live", "polite")
  })

  it("accepts className, classNames, size and forwards the ref", async () => {
    const ref = React.createRef<HTMLButtonElement>()
    const { user } = setup(
      <DatePicker
        aria-label="Date"
        ref={ref}
        size="lg"
        className="extra"
        classNames={{
          trigger: "trigger-x",
          content: "content-x",
          footer: "footer-x",
          value: "value-x",
          icon: "icon-x",
        }}
        today={TODAY}
      />,
    )
    expect(ref.current).toBe(trigger())
    expect(trigger()).toHaveClass("extra", "trigger-x", "h-10")
    expect(trigger().querySelector(".value-x")).toBeInTheDocument()
    expect(trigger().querySelector(".icon-x")).toBeInTheDocument()
    await user.click(trigger())
    expect(dialog()).toHaveClass("content-x")
    expect(dialog().querySelector(".footer-x")).toBeInTheDocument()
  })

  it("starts the week on the locale's day, or weekStartsOn", async () => {
    const { user } = setup(<DatePicker aria-label="Date" today={TODAY} weekStartsOn={1} />)
    await user.click(trigger())
    expect(within(dialog()).getAllByRole("columnheader", { hidden: true })[0]).toHaveTextContent("Mo")
  })

  it.each(directions)("passes axe when open in %s", async (dir) => {
    const { user } = setup(<DatePicker aria-label="Date" defaultValue={TODAY} />, { dir })
    await user.click(trigger())
    await expectNoA11yViolations()
  })

  it("speaks Dhivehi: month names, weekdays and labels", async () => {
    const { user } = setup(<DatePicker aria-label="ތާރީޚު" today={TODAY} />, { locale: "dv" })
    expect(trigger()).toHaveTextContent("ތާރީޚެއް ހޮއްވަވާ")
    await user.click(trigger())
    expect(within(dialog()).getByRole("grid")).toHaveAccessibleName("މާޗު 2026")
    expect(within(dialog()).getAllByRole("columnheader", { hidden: true })[0]).toHaveTextContent("އާދި")
    expect(within(dialog()).getByRole("button", { name: "ކުރީ މަސް" })).toBeInTheDocument()
    expect(within(dialog()).getByRole("button", { name: "ނިމުނީ" })).toBeInTheDocument()
    await user.click(within(dialog()).getByRole("button", { name: "މާޗު 2026: މަހެއް ހޮއްވަވާ" }))
    expect(within(dialog()).getByRole("button", { name: "ޖޫން 2026" })).toBeInTheDocument()
    await expectNoA11yViolations()
  })

  it("opens in a bottom sheet on phones (R3.28)", async () => {
    const original = window.matchMedia
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query.includes("max-width"),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })) as unknown as typeof window.matchMedia
    try {
      const { user } = setup(<DatePicker aria-label="Date" today={TODAY} />)
      await user.click(trigger())
      expect(dialog()).toHaveAttribute("data-slot", "drawer-content")
      expect(within(dialog()).getByText("Choose a date")).toBeInTheDocument()
      await user.click(day(/March 5th, 2026/))
      await act(async () => {
        await new Promise((r) => setTimeout(r, 600))
      })
      expect(trigger()).toHaveTextContent("05/03/2026")
    } finally {
      window.matchMedia = original
    }
  })

  it("can be forced into a sheet", async () => {
    const { user } = setup(<DatePicker aria-label="Date" sheet today={TODAY} />)
    await user.click(trigger())
    expect(dialog()).toHaveAttribute("data-slot", "drawer-content")
    fireEvent.keyDown(dialog(), { key: "Escape" })
  })
})
