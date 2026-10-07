import { screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { FormLayoutProvider } from "../form/form-context"
import { PlaceholderInput } from "./placeholder-input"

// axe runs are slow in jsdom, especially under coverage on a busy machine.
vi.setConfig({ testTimeout: 20_000 })

describe("PlaceholderInput", () => {
  it("renders a label and input-shaped skeleton, stacked by default", async () => {
    renderWithOnu(<PlaceholderInput />)
    const root = screen.getByRole("status", { name: "Loading…" })
    expect(root).toHaveAttribute("data-control", "input")
    expect(root).toHaveAttribute("data-label-layout", "stacked")
    expect(root.querySelectorAll("[data-slot=skeleton]")).toHaveLength(2)
    expect(root.querySelector("[aria-hidden=true]")).toBeInTheDocument()
    await expectNoA11yViolations()
  })

  it("follows the form's label layout, with per-field override", () => {
    renderWithOnu(
      <FormLayoutProvider labelLayout="inline">
        <PlaceholderInput data-testid="a" />
        <PlaceholderInput data-testid="b" labelLayout="stacked" />
      </FormLayoutProvider>,
    )
    expect(screen.getByTestId("a")).toHaveAttribute("data-label-layout", "inline")
    expect(screen.getByTestId("a").firstElementChild!.className).toContain("@md/form-field:grid-cols")
    expect(screen.getByTestId("b")).toHaveAttribute("data-label-layout", "stacked")
  })

  it.each([
    ["textarea", "h-16"],
    ["select", "justify-end"],
    ["input", "h-8"],
  ] as const)("shapes the %s control", (control, cls) => {
    renderWithOnu(<PlaceholderInput control={control} classNames={{ control: "ctl-x" }} />)
    expect(screen.getByRole("status").querySelector(".ctl-x")).toHaveClass(cls)
  })

  it.each([
    ["checkbox", "size-4"],
    ["switch", "rounded-full"],
  ] as const)("renders the %s control beside its label", (control, cls) => {
    renderWithOnu(<PlaceholderInput control={control} classNames={{ control: "ctl-x", label: "lbl-x" }} />)
    const root = screen.getByRole("status")
    expect(root.querySelector(".ctl-x")).toHaveClass(cls)
    expect(root.querySelector(".lbl-x")).toBeInTheDocument()
  })

  it("can drop the label and add help text", () => {
    renderWithOnu(<PlaceholderInput label={false} help classNames={{ help: "help-x" }} className="root-x" />)
    const root = screen.getByRole("status")
    expect(root).toHaveClass("root-x")
    expect(root.querySelector(".help-x")).toBeInTheDocument()
    expect(root.querySelectorAll("[data-slot=skeleton]")).toHaveLength(2)
  })

  it("drops the label for toggles too", () => {
    renderWithOnu(<PlaceholderInput control="checkbox" label={false} srLabel="Loading consent" />)
    expect(
      screen.getByRole("status", { name: "Loading consent" }).querySelectorAll("[data-slot=skeleton]"),
    ).toHaveLength(1)
  })

  it.each(directions)("works in %s with Dhivehi strings", async (dir) => {
    renderWithOnu(<PlaceholderInput labelLayout="inline" />, { locale: "dv", dir })
    expect(screen.getByRole("status", { name: "ލޯޑުވަނީ…" })).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})
