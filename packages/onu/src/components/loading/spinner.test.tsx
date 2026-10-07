import * as React from "react"
import { screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { Spinner as RootSpinner } from "../../index"
import { Spinner, spinnerVariants } from "./spinner"

// axe runs are slow in jsdom, especially under coverage on a busy machine.
vi.setConfig({ testTimeout: 20_000 })

describe("Spinner", () => {
  it("is a status with a screen-reader label", async () => {
    renderWithOnu(<Spinner />)
    const status = screen.getByRole("status")
    expect(status).toHaveTextContent("Loading…")
    expect(status).toHaveAttribute("data-slot", "spinner")
    expect(screen.getByText("Loading…")).toHaveClass("sr-only")
    expect(status.querySelector("svg")).toHaveAttribute("aria-hidden", "true")
    await expectNoA11yViolations()
  })

  it("shows a custom label visibly with showLabel", () => {
    renderWithOnu(<Spinner label="Fetching permits…" showLabel classNames={{ label: "l-x", icon: "i-x" }} />)
    expect(screen.getByText("Fetching permits…")).not.toHaveClass("sr-only")
    expect(screen.getByText("Fetching permits…")).toHaveClass("l-x")
    expect(screen.getByRole("status").querySelector("svg")).toHaveClass("i-x")
  })

  it.each(["xs", "sm", "md", "lg", "xl"] as const)("applies size %s", (size) => {
    renderWithOnu(<Spinner size={size} tone="primary" />)
    const status = screen.getByRole("status")
    expect(status).toHaveAttribute("data-size", size)
    expect(status.querySelector("svg")!.getAttribute("class")).toContain(spinnerVariants({ size }).split(" ").at(-1))
    expect(status.querySelector("svg")).toHaveClass("text-primary")
  })

  it("passes className, props and ref to the root", () => {
    const ref = React.createRef<HTMLSpanElement>()
    renderWithOnu(<Spinner ref={ref} className="root-x" data-testid="s" />)
    expect(ref.current).toBe(screen.getByTestId("s"))
    expect(ref.current).toHaveClass("root-x")
  })

  it("replaces the shadcn Spinner in the package root export", () => {
    expect(RootSpinner).toBe(Spinner)
  })

  it.each(directions)("works in %s with Dhivehi strings", async (dir) => {
    renderWithOnu(<Spinner />, { locale: "dv", dir })
    expect(screen.getByRole("status")).toHaveTextContent("ލޯޑުވަނީ…")
    await expectNoA11yViolations()
  })
})
