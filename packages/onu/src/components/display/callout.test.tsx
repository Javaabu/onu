import * as React from "react"
import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { Callout } from "./callout"

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

describe("Callout appearance", () => {
  it.each([
    ["default", "info", "text-muted-foreground"],
    ["warning", "warning", "border-warning"],
    ["destructive", "error", "border-destructive"],
  ] as const)("inline %s callouts are notes with the %s icon", (variant, icon, cls) => {
    const { container } = renderWithOnu(
      <Callout variant={variant} appearance="bordered">
        Changes apply next month.
      </Callout>,
    )
    const el = screen.getByRole("note")
    expect(el).toHaveAttribute("data-slot", "callout")
    expect(el).toHaveAttribute("data-appearance", "bordered")
    expect(el).toHaveClass("border-s-2", cls)
    expect(el).not.toHaveAttribute("data-slot", "alert")
    expect(container.querySelector(`[data-icon-name=${icon}]`)).toBeInTheDocument()
  })

  it("leaves out title, actions and dismiss (box-only) when inline", () => {
    renderWithOnu(
      <Callout
        appearance="subtle"
        title="Ignored"
        description="Last synced 5 minutes ago."
        actions={<button type="button">Sync</button>}
        dismissible
        classNames={{ description: "desc-x" }}
      />,
    )
    const el = screen.getByRole("note")
    expect(el).toHaveClass("bg-muted/60")
    expect(screen.getByText("Last synced 5 minutes ago.")).toHaveClass("desc-x")
    expect(screen.queryByText("Ignored")).toBeNull()
    expect(screen.queryByRole("button")).toBeNull()
  })

  it.each(directions)("is accessible in %s (dv)", async (dir) => {
    const { container } = renderWithOnu(
      <Callout variant="info" appearance="bordered">
        ފޯމު ފުރިހަމަކުރުމަށް 10 މިނެޓު ހޭދަވާނެ.
      </Callout>,
      { dir, locale: "dv" },
    )
    expect(screen.getByRole("note")).toBeInTheDocument()
    await expectNoA11yViolations(container)
  })
})

describe("Callout inline variants", () => {
  it.each(["default", "info", "success", "warning", "destructive"] as const)("renders the %s variant", (variant) => {
    renderWithOnu(
      <Callout variant={variant} appearance="bordered">
        Changes apply next month.
      </Callout>,
    )
    const el = screen.getByRole("note")
    expect(el).toHaveAttribute("data-slot", "callout")
    expect(el).toHaveAttribute("data-variant", variant)
    expect(el).toHaveClass(variant === "default" ? "border-border" : `border-${variant}`)
  })

  it("is neutral by default", () => {
    const { container } = renderWithOnu(
      <Callout appearance="plain" className="n-x">
        Hint
      </Callout>,
    )
    const el = screen.getByRole("note")
    expect(el).toHaveAttribute("data-variant", "default")
    expect(el).toHaveClass("n-x", "text-muted-foreground")
    expect(el).not.toHaveClass("rounded-md")
    expect(container.querySelector("[data-icon-name=info]")).toBeInTheDocument()
  })

  it("supports custom and hidden icons", () => {
    const { container, rerender } = renderWithOnu(
      <Callout appearance="plain" icon="clock">
        Soon
      </Callout>,
    )
    expect(container.querySelector("[data-icon-name=clock]")).toBeInTheDocument()
    rerender(
      <Callout appearance="plain" icon={false}>
        Soon
      </Callout>,
    )
    expect(container.querySelector("svg")).toBeNull()
    rerender(
      <Callout appearance="plain" icon={<i data-testid="x" />}>
        Soon
      </Callout>,
    )
    expect(screen.getByTestId("x")).toBeInTheDocument()
  })

  it.each(directions)("is accessible in %s", async (dir) => {
    const { container } = renderWithOnu(<Callout appearance="subtle">Hint</Callout>, { dir })
    await expectNoA11yViolations(container)
  })
})
