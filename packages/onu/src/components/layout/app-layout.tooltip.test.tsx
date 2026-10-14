import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { renderWithOnu } from "../../../test/utils"
import { AppLayout } from "./app-layout"
import { AppSidebar } from "./app-sidebar"

describe("AppLayout without a TooltipProvider", () => {
  it("renders the sidebar (the sidebar provides its own tooltip provider)", () => {
    renderWithOnu(
      <AppLayout sidebar={<AppSidebar items={[{ label: "Dashboard", href: "/", icon: "home" }]} currentHref="/" />}>
        Content
      </AppLayout>,
    )
    expect(screen.getByRole("link", { name: /Dashboard/ })).toHaveAttribute("aria-current", "page")
    expect(screen.getByText("Content")).toBeInTheDocument()
  })
})
