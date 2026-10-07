import * as React from "react"
import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { AnnouncementBar } from "./announcement-bar"

describe("AnnouncementBar", () => {
  afterEach(() => window.localStorage.clear())

  it("shows the message and a link", () => {
    renderWithOnu(
      <AnnouncementBar href="/apply" linkText="Apply now" icon="megaphone">
        Applications close on 30 June.
      </AnnouncementBar>,
    )
    expect(screen.getByRole("region", { name: "Announcement" })).toHaveTextContent("Applications close on 30 June.")
    expect(screen.getByRole("link", { name: "Apply now" })).toHaveAttribute("href", "/apply")
  })

  it("uses the provider's link component", () => {
    const Link = ({ href, children, ...rest }: React.ComponentProps<"a">) => (
      <a data-router="" href={href} {...rest}>
        {children}
      </a>
    )
    renderWithOnu(
      <AnnouncementBar href="/a" linkText="Go">
        Hi
      </AnnouncementBar>,
      { provider: { linkComponent: Link } },
    )
    expect(screen.getByRole("link", { name: "Go" })).toHaveAttribute("data-router")
  })

  it("dismisses without persistence when there is no id", async () => {
    const onDismiss = vi.fn()
    renderWithOnu(<AnnouncementBar onDismiss={onDismiss}>Hello</AnnouncementBar>)
    await userEvent.click(screen.getByRole("button", { name: "Dismiss" }))
    expect(screen.queryByText("Hello")).toBeNull()
    expect(onDismiss).toHaveBeenCalled()
    expect(window.localStorage.length).toBe(0)
  })

  it("remembers the dismissal by id", async () => {
    const { unmount } = renderWithOnu(<AnnouncementBar id="ramazan-hours">Ramazan hours</AnnouncementBar>)
    await userEvent.click(screen.getByRole("button", { name: "Dismiss" }))
    expect(window.localStorage.getItem("onu-announcement:ramazan-hours")).toBe("true")
    unmount()
    renderWithOnu(<AnnouncementBar id="ramazan-hours">Ramazan hours</AnnouncementBar>)
    expect(screen.queryByText("Ramazan hours")).toBeNull()
    renderWithOnu(<AnnouncementBar id="eid-hours">Eid hours</AnnouncementBar>)
    expect(screen.getByText("Eid hours")).toBeInTheDocument()
  })

  it("can be non-dismissible with a variant", () => {
    renderWithOnu(
      <AnnouncementBar dismissible={false} variant="warning" className="custom">
        Maintenance tonight
      </AnnouncementBar>,
    )
    expect(screen.queryByRole("button")).toBeNull()
    expect(screen.getByRole("region")).toHaveClass("custom", "bg-warning")
  })

  it.each(directions)("is accessible in %s (dv)", async (dir) => {
    const { container } = renderWithOnu(<AnnouncementBar>އިޢުލާން</AnnouncementBar>, { dir, locale: "dv" })
    expect(screen.getByRole("region", { name: "އިޢުލާން" })).toBeInTheDocument()
    await expectNoA11yViolations(container)
  })
})
