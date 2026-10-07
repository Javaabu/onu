import * as React from "react"
import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../test/utils"
import { MapInfoPanel } from "./map-info-panel"

function Harness({ variant }: { variant?: "auto" | "side" | "sheet" }) {
  const [open, setOpen] = React.useState(false)
  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen(true)}>
        Maafushi pin
      </button>
      <MapInfoPanel
        open={open}
        onOpenChange={setOpen}
        variant={variant}
        title="Maafushi"
        description="Kaafu Atoll"
        actions={<button type="button">Directions</button>}
        classNames={{ body: "body-x" }}
      >
        <p>Population 3,025</p>
      </MapInfoPanel>
    </div>
  )
}

const originalMatchMedia = window.matchMedia
afterEach(() => {
  window.matchMedia = originalMatchMedia
})

describe("MapInfoPanel", () => {
  it("opens a side panel, moves focus into it and returns focus on Escape", async () => {
    renderWithOnu(<Harness />)
    const trigger = screen.getByRole("button", { name: "Maafushi pin" })
    await userEvent.click(trigger)
    const panel = screen.getByRole("complementary", { name: "Maafushi" })
    expect(panel).toHaveAttribute("data-variant", "side")
    expect(panel).toHaveAccessibleDescription("Kaafu Atoll")
    expect(screen.getByRole("heading", { name: "Maafushi" })).toHaveFocus()
    expect(screen.getByText("Population 3,025").parentElement).toHaveClass("body-x")
    await expectNoA11yViolations()
    await userEvent.keyboard("{Escape}")
    expect(screen.queryByRole("complementary")).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  it("closes with the close button", async () => {
    renderWithOnu(<Harness variant="side" />)
    await userEvent.click(screen.getByRole("button", { name: "Maafushi pin" }))
    await userEvent.keyboard("a")
    await userEvent.click(screen.getByRole("button", { name: "Close" }))
    expect(screen.queryByRole("complementary")).not.toBeInTheDocument()
  })

  it("is a bottom sheet on phones", async () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query.includes("max-width"),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
    })) as unknown as typeof window.matchMedia
    renderWithOnu(<Harness />)
    await userEvent.click(screen.getByRole("button", { name: "Maafushi pin" }))
    const sheet = await screen.findByRole("dialog", { name: "Maafushi" })
    expect(sheet).toHaveAttribute("data-variant", "sheet")
    expect(screen.getByText("Kaafu Atoll")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Directions" })).toBeInTheDocument()
  })

  it.each(directions)("works in Dhivehi (%s)", async (dir) => {
    renderWithOnu(<MapInfoPanel open onOpenChange={() => {}} title="މާފުށި" variant="side" />, { locale: "dv", dir })
    expect(screen.getByRole("button", { name: "ބަންދުކުރޭ" })).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})
