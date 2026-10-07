import * as React from "react"
import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { Button, buttonVariants } from "./button"
import { ButtonGroup } from "./button-group"
import { LinkButton } from "./link-button"
import { SubmitButton } from "./submit-button"

describe("Button", () => {
  it("renders a type=button with shadcn styles and data attributes", async () => {
    const onClick = vi.fn()
    renderWithOnu(
      <Button onClick={onClick} className="extra">
        Save
      </Button>,
    )
    const button = screen.getByRole("button", { name: "Save" })
    expect(button).toHaveAttribute("type", "button")
    expect(button).toHaveAttribute("data-slot", "button")
    expect(button).toHaveAttribute("data-variant", "default")
    expect(button).toHaveClass("bg-primary", "extra")
    await userEvent.click(button)
    expect(onClick).toHaveBeenCalledOnce()
    await expectNoA11yViolations()
  })

  it.each(["success", "warning", "destructive", "outline", "secondary", "ghost", "link"] as const)(
    "supports the %s variant",
    (variant) => {
      renderWithOnu(<Button variant={variant}>Go</Button>)
      expect(screen.getByRole("button")).toHaveAttribute("data-variant", variant)
    },
  )

  it("success and warning use their tokens, and buttonVariants is reusable", () => {
    expect(buttonVariants({ variant: "success" })).toContain("bg-success")
    expect(buttonVariants({ variant: "warning", size: "sm", className: "x" })).toMatch(/bg-warning.*x|x.*bg-warning/)
    expect(buttonVariants({ variant: "success" })).not.toContain("bg-primary ")
    expect(buttonVariants()).toContain("bg-primary")
    expect(buttonVariants({ variant: "outline", size: "lg" })).toContain("h-9")
  })

  it("renders semantic icons and node icons", () => {
    const { container } = renderWithOnu(
      <Button startIcon="save" endIcon={<span data-testid="end">→</span>}>
        Save
      </Button>,
    )
    expect(container.querySelector("[data-icon-name=save]")).toHaveAttribute("data-icon", "inline-start")
    expect(screen.getByTestId("end")).toBeInTheDocument()
  })

  it("loading shows a spinner, sets aria-busy and ignores clicks without losing focus", async () => {
    const onClick = vi.fn()
    const { container, rerender } = renderWithOnu(
      <Button onClick={onClick} startIcon="save" loadingText="Saving…">
        Save
      </Button>,
    )
    const button = screen.getByRole("button")
    button.focus()
    rerender(
      <Button onClick={onClick} startIcon="save" loading loadingText="Saving…">
        Save
      </Button>,
    )
    expect(button).toHaveAttribute("aria-busy", "true")
    expect(button).toHaveAttribute("aria-disabled", "true")
    expect(button).toHaveTextContent("Saving…")
    expect(container.querySelector("[data-slot=button-spinner]")).toBeInTheDocument()
    expect(container.querySelector("[data-icon-name=save]")).not.toBeInTheDocument()
    expect(button).toHaveFocus()
    await userEvent.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })

  it("supports asChild with icons", () => {
    renderWithOnu(
      <Button asChild startIcon="add" variant="outline">
        <a href="/new">New</a>
      </Button>,
    )
    const link = screen.getByRole("link", { name: "New" })
    expect(link).toHaveAttribute("data-slot", "button")
    expect(link).not.toHaveAttribute("type")
    expect(link.querySelector("[data-icon-name=add]")).toBeInTheDocument()
  })

  it("forwards refs and respects disabled", () => {
    const ref = React.createRef<HTMLButtonElement>()
    renderWithOnu(
      <Button ref={ref} disabled>
        X
      </Button>,
    )
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
    expect(ref.current).toBeDisabled()
  })

  it.each(directions)("mirrors directional icons in %s", async (dir) => {
    const { container } = renderWithOnu(<Button endIcon="arrow-right">ކުރިއަށް</Button>, { locale: "dv", dir })
    expect(container.querySelector("[data-icon-name=arrow-right]")).toHaveClass("rtl:-scale-x-100")
    await expectNoA11yViolations()
  })
})

describe("LinkButton", () => {
  it("renders through the provider's link component", async () => {
    const Link = React.forwardRef<HTMLAnchorElement, React.ComponentProps<"a">>(({ children, ...props }, ref) => (
      <a ref={ref} data-router="" {...props}>
        {children}
      </a>
    ))
    renderWithOnu(
      <LinkButton href="/users" variant="outline" startIcon="users">
        Users
      </LinkButton>,
      { provider: { linkComponent: Link } },
    )
    const link = screen.getByRole("link", { name: "Users" })
    expect(link).toHaveAttribute("data-router")
    expect(link).toHaveAttribute("href", "/users")
    expect(link).toHaveAttribute("data-variant", "outline")
    await expectNoA11yViolations()
  })

  it("opens external links in a new tab and says so", () => {
    renderWithOnu(
      <LinkButton href="https://gov.mv" external>
        gov.mv
      </LinkButton>,
      { locale: "en" },
    )
    const link = screen.getByRole("link")
    expect(link).toHaveAttribute("target", "_blank")
    expect(link).toHaveAttribute("rel", "noopener noreferrer")
    expect(link).toHaveAccessibleName(/gov\.mv\s*\(opens in a new tab\)/)
    expect(link.querySelector("[data-icon-name=external-link]")).toBeInTheDocument()
  })

  it("renders a disabled link without href", () => {
    renderWithOnu(
      <LinkButton href="/x" disabled>
        Nope
      </LinkButton>,
    )
    const link = screen.getByRole("link")
    expect(link).not.toHaveAttribute("href")
    expect(link).toHaveAttribute("aria-disabled", "true")
  })

  it("translates the new-tab hint in Dhivehi", () => {
    renderWithOnu(
      <LinkButton href="https://x.mv" external>
        x
      </LinkButton>,
      { locale: "dv" },
    )
    expect(screen.getByText("(އައު ޓެބެއްގައި ހުޅުވޭނެ)")).toBeInTheDocument()
  })
})

describe("ButtonGroup", () => {
  it("joins buttons by default and labels the group", async () => {
    renderWithOnu(
      <ButtonGroup label="View">
        <Button variant="outline">List</Button>
        <Button variant="outline">Grid</Button>
      </ButtonGroup>,
    )
    const group = screen.getByRole("group", { name: "View" })
    expect(group).toHaveAttribute("data-slot", "button-group")
    expect(group.className).toContain("rounded-s-none")
    await expectNoA11yViolations()
  })

  it("can keep buttons separate and vertical", () => {
    renderWithOnu(
      <ButtonGroup attached={false} orientation="vertical" className="custom">
        <Button>A</Button>
      </ButtonGroup>,
    )
    const group = screen.getByRole("group")
    expect(group).toHaveAttribute("data-attached", "false")
    expect(group).toHaveClass("flex-col", "custom")
  })
})

describe("SubmitButton", () => {
  it("is a submit button with a default label", () => {
    renderWithOnu(<SubmitButton />)
    expect(screen.getByRole("button", { name: "Submit" })).toHaveAttribute("type", "submit")
  })

  it("shows a spinner and blocks double submits while processing", async () => {
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault())
    renderWithOnu(
      <form onSubmit={onSubmit}>
        <SubmitButton processing>Save</SubmitButton>
      </form>,
    )
    const button = screen.getByRole("button", { name: "Save" })
    expect(button).toHaveAttribute("aria-busy", "true")
    await userEvent.click(button)
    await userEvent.click(button)
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it("uses the Dhivehi default label", () => {
    renderWithOnu(<SubmitButton />, { locale: "dv" })
    expect(screen.getByRole("button", { name: "ހުށަހަޅާ" })).toBeInTheDocument()
  })
})
