import * as React from "react"
import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { Callout } from "./callout"
import { Notice } from "./notice"

describe("Callout", () => {
  it.each([
    ["default", "status", "info"],
    ["info", "status", "info"],
    ["success", "status", "success"],
    ["warning", "alert", "warning"],
    ["destructive", "alert", "error"],
  ] as const)("%s variant uses role=%s and the %s icon", (variant, role, icon) => {
    const { container } = renderWithOnu(<Callout variant={variant} title="Heads up" description="Body" />)
    const el = screen.getByRole(role)
    expect(el).toHaveAttribute("data-variant", variant)
    expect(el).toHaveTextContent("Heads up")
    expect(container.querySelector(`[data-icon-name=${icon}]`)).toBeInTheDocument()
  })

  it("renders children, actions, a custom icon and overrides", () => {
    const { container } = renderWithOnu(
      <Callout
        icon="bell"
        role="note"
        actions={<button type="button">Renew</button>}
        className="custom"
        classNames={{ actions: "acts" }}
      >
        Your permit expires on 30 June.
      </Callout>,
    )
    expect(screen.getByRole("note")).toHaveClass("custom")
    expect(screen.getByText("Your permit expires on 30 June.")).toBeInTheDocument()
    expect(container.querySelector(".acts")).toContainElement(screen.getByRole("button", { name: "Renew" }))
    expect(container.querySelector("[data-icon-name=bell]")).toBeInTheDocument()
  })

  it("can hide the icon or pass a node", () => {
    const { container, rerender } = renderWithOnu(<Callout icon={false} title="T" />)
    expect(container.querySelector("svg")).toBeNull()
    rerender(<Callout icon={<span data-testid="i" />} title="T" />)
    expect(screen.getByTestId("i")).toBeInTheDocument()
  })

  it("is dismissible (uncontrolled)", async () => {
    const onDismiss = vi.fn()
    renderWithOnu(<Callout dismissible title="Saved" onDismiss={onDismiss} />)
    await userEvent.click(screen.getByRole("button", { name: "Dismiss" }))
    expect(screen.queryByText("Saved")).toBeNull()
    expect(onDismiss).toHaveBeenCalled()
  })

  it("is dismissible (controlled)", async () => {
    const onOpenChange = vi.fn()
    const { rerender } = renderWithOnu(<Callout dismissible open title="Saved" onOpenChange={onOpenChange} />)
    await userEvent.click(screen.getByRole("button", { name: "Dismiss" }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(screen.getByText("Saved")).toBeInTheDocument()
    rerender(<Callout dismissible open={false} title="Saved" />)
    expect(screen.queryByText("Saved")).toBeNull()
  })

  it.each(directions)("is accessible in %s (dv)", async (dir) => {
    const { container } = renderWithOnu(<Callout dismissible variant="warning" title="ސަމާލުކަމަށް" />, {
      dir,
      locale: "dv",
    })
    expect(screen.getByRole("button", { name: "ފޮރުވާ" })).toBeInTheDocument()
    await expectNoA11yViolations(container)
  })
})

describe("Notice", () => {
  it.each(["neutral", "info", "success", "warning", "destructive"] as const)("renders the %s tone", (tone) => {
    renderWithOnu(
      <Notice tone={tone} variant="bordered">
        Changes apply next month.
      </Notice>,
    )
    expect(screen.getByRole("note")).toHaveAttribute("data-tone", tone)
  })

  it("supports custom and hidden icons", () => {
    const { container, rerender } = renderWithOnu(<Notice icon="clock">Soon</Notice>)
    expect(container.querySelector("[data-icon-name=clock]")).toBeInTheDocument()
    rerender(<Notice icon={false}>Soon</Notice>)
    expect(container.querySelector("svg")).toBeNull()
    rerender(<Notice icon={<i data-testid="x" />}>Soon</Notice>)
    expect(screen.getByTestId("x")).toBeInTheDocument()
  })

  it.each(directions)("is accessible in %s", async (dir) => {
    const { container } = renderWithOnu(<Notice variant="subtle">Hint</Notice>, { dir })
    await expectNoA11yViolations(container)
  })
})
