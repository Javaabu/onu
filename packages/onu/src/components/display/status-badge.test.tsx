import * as React from "react"
import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { StatusBadge } from "./status-badge"

describe("StatusBadge", () => {
  it.each([
    ["success", "Success", "success"],
    ["warning", "Warning", "warning"],
    ["danger", "Error", "error"],
    ["info", "Info", "info"],
    ["neutral", "Neutral", "dot"],
    ["pending", "Pending", "clock"],
  ] as const)("%s shows an icon and a label, not just colour", (status, label, icon) => {
    const { container } = renderWithOnu(<StatusBadge status={status} />)
    const badge = container.querySelector("[data-slot=status-badge]")!
    expect(badge).toHaveAttribute("data-tone", status)
    expect(badge).toHaveTextContent(label)
    expect(badge.querySelector(`[data-icon-name=${icon}]`)).toBeInTheDocument()
  })

  it("maps custom statuses to a tone, label and icon", () => {
    const map = {
      approved: { tone: "success" as const, label: "Approved" },
      rejected: { tone: "danger" as const, label: "Rejected", icon: "close" },
      custom: { tone: "info" as const, icon: <span data-testid="node-icon" /> },
    }
    const { container } = renderWithOnu(
      <>
        <StatusBadge status="approved" statusMap={map} />
        <StatusBadge status="rejected" statusMap={map} />
        <StatusBadge status="custom" statusMap={map} />
        <StatusBadge status="unknown_status" />
      </>,
    )
    const badges = container.querySelectorAll("[data-slot=status-badge]")
    expect(badges[0]).toHaveTextContent("Approved")
    expect(badges[0]).toHaveAttribute("data-tone", "success")
    expect(badges[1]!.querySelector("[data-icon-name=close]")).toBeInTheDocument()
    expect(screen.getByTestId("node-icon")).toBeInTheDocument()
    expect(badges[2]).toHaveTextContent("custom")
    expect(badges[3]).toHaveAttribute("data-tone", "neutral")
    expect(badges[3]).toHaveTextContent("unknown_status")
  })

  it("accepts a label, hides the icon, sizes and classes", () => {
    const { container } = renderWithOnu(
      <StatusBadge status="success" icon={false} size="lg" className="custom">
        Paid
      </StatusBadge>,
    )
    const badge = container.querySelector("[data-slot=status-badge]")!
    expect(badge).toHaveTextContent("Paid")
    expect(badge.querySelector("svg")).toBeNull()
    expect(badge).toHaveClass("custom", "h-7")
  })

  it("renders as a link with asChild", () => {
    renderWithOnu(
      <StatusBadge status="info" asChild>
        <a href="/x">Open</a>
      </StatusBadge>,
    )
    const link = screen.getByRole("link", { name: "Open" })
    expect(link).toHaveAttribute("data-slot", "status-badge")
  })

  it("translates labels in Dhivehi", () => {
    renderWithOnu(<StatusBadge status="success" />, { locale: "dv" })
    expect(screen.getByText("ކާމިޔާބު")).toBeInTheDocument()
  })

  it.each(directions)("is accessible in %s", async (dir) => {
    const { container } = renderWithOnu(<StatusBadge status="warning" />, { dir })
    await expectNoA11yViolations(container)
  })
})
