import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { TabsContent, TabsList, TabsTrigger } from "../../ui/tabs"
import { Tabs, type TabItem } from "./tabs"

// Overlays and axe are slow under parallel coverage runs.
vi.setConfig({ testTimeout: 30_000 })

const items: TabItem[] = [
  { value: "profile", label: "Profile", icon: "user", content: "Profile panel" },
  { value: "activity", label: "Activity", count: 12, content: "Activity panel" },
  { value: "archived", label: "Archived", disabled: true, content: "Archived panel" },
  { value: "notes", label: "Notes", content: "Notes panel" },
]

describe("Tabs", () => {
  it("renders items with counts and selects the first enabled tab", async () => {
    renderWithOnu(
      <Tabs
        items={items}
        listLabel="Record"
        className="extra"
        classNames={{ list: "lst", trigger: "trg", count: "cnt" }}
      />,
    )
    expect(screen.getByRole("tablist", { name: "Record" })).toHaveClass("lst")
    expect(screen.getByRole("tab", { name: "Profile" })).toHaveAttribute("aria-selected", "true")
    expect(screen.getByRole("tab", { name: /Activity/ })).toHaveTextContent("Activity(12)")
    expect(screen.getByText("(12)")).toHaveClass("cnt")
    expect(screen.getByText("Profile panel")).toBeVisible()
    await expectNoA11yViolations()
  })

  it("moves with arrow keys, skipping disabled tabs", async () => {
    renderWithOnu(<Tabs items={items} />)
    await userEvent.click(screen.getByRole("tab", { name: /Activity/ }))
    await userEvent.keyboard("{ArrowRight}")
    expect(screen.getByRole("tab", { name: "Notes" })).toHaveFocus()
    expect(screen.getByText("Notes panel")).toBeVisible()
  })

  it("follows the visual order in RTL (ArrowLeft moves forward)", async () => {
    renderWithOnu(<Tabs items={items} />, { dir: "rtl" })
    await userEvent.click(screen.getByRole("tab", { name: "Profile" }))
    await userEvent.keyboard("{ArrowLeft}")
    expect(screen.getByRole("tab", { name: /Activity/ })).toHaveFocus()
  })

  it("is controlled and still composes like shadcn Tabs", async () => {
    const onValueChange = vi.fn()
    renderWithOnu(
      <>
        <Tabs items={items} value="notes" onValueChange={onValueChange} variant="line" scrollable={false} />
        <Tabs defaultValue="a">
          <TabsList>
            <TabsTrigger value="a">A</TabsTrigger>
            <TabsTrigger value="b">B</TabsTrigger>
          </TabsList>
          <TabsContent value="a">Panel A</TabsContent>
          <TabsContent value="b">Panel B</TabsContent>
        </Tabs>
      </>,
    )
    expect(screen.getByRole("tab", { name: "Notes" })).toHaveAttribute("aria-selected", "true")
    await userEvent.click(screen.getByRole("tab", { name: "Profile" }))
    expect(onValueChange).toHaveBeenCalledWith("profile")
    expect(screen.getByRole("tab", { name: "Notes" })).toHaveAttribute("aria-selected", "true")
    await userEvent.click(screen.getByRole("tab", { name: "B" }))
    expect(screen.getByText("Panel B")).toBeVisible()
  })

  it.each(directions)("works in %s with Dhivehi and vertical orientation", async (dir) => {
    renderWithOnu(
      <Tabs
        orientation="vertical"
        items={[
          { value: "a", label: "ޕްރޮފައިލް", content: "a" },
          { value: "b", label: "ހަރަކާތްތައް", count: 3, content: "b" },
        ]}
      />,
      { locale: "dv", dir },
    )
    expect(screen.getByRole("tablist")).toHaveAttribute("aria-orientation", "vertical")
    await expectNoA11yViolations()
  })
})
