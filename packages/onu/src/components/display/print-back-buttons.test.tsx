import * as React from "react"
import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { IconText } from "./icon-text"
import { BackButton, PrintButton } from "./print-back-buttons"

describe("PrintButton", () => {
  afterEach(() => vi.restoreAllMocks())

  it("opens the print dialog after onBeforePrint", async () => {
    const print = vi.spyOn(window, "print").mockImplementation(() => {})
    const before = vi.fn()
    renderWithOnu(<PrintButton onBeforePrint={before} />)
    const button = screen.getByRole("button", { name: "Print" })
    expect(button).toHaveClass("print:hidden")
    await userEvent.click(button)
    expect(before).toHaveBeenCalled()
    expect(print).toHaveBeenCalled()
  })

  it("can be icon-only, labelled, and cancelled via preventDefault", async () => {
    const print = vi.spyOn(window, "print").mockImplementation(() => {})
    renderWithOnu(<PrintButton iconOnly onClick={(e) => e.preventDefault()} />, { locale: "dv" })
    await userEvent.click(screen.getByRole("button", { name: "ޕްރިންޓްކުރޭ" }))
    expect(print).not.toHaveBeenCalled()
  })
})

describe("BackButton", () => {
  afterEach(() => vi.restoreAllMocks())

  it("goes back in history", async () => {
    const back = vi.spyOn(window.history, "back").mockImplementation(() => {})
    vi.spyOn(window.history, "length", "get").mockReturnValue(3)
    renderWithOnu(<BackButton fallbackHref="/list" />)
    await userEvent.click(screen.getByRole("button", { name: "Back" }))
    expect(back).toHaveBeenCalled()
  })

  it("uses the fallback when there is no history", async () => {
    vi.spyOn(window.history, "length", "get").mockReturnValue(1)
    const assign = vi.fn()
    vi.spyOn(window, "location", "get").mockReturnValue({ ...window.location, assign })
    renderWithOnu(<BackButton fallbackHref="/list" />)
    await userEvent.click(screen.getByRole("button", { name: "Back" }))
    expect(assign).toHaveBeenCalledWith("/list")
  })

  it("renders a link with href, icon-only labels, and respects preventDefault", async () => {
    const back = vi.spyOn(window.history, "back").mockImplementation(() => {})
    renderWithOnu(
      <>
        <BackButton href="/users">All users</BackButton>
        <BackButton iconOnly onClick={(e) => e.preventDefault()} />
      </>,
    )
    expect(screen.getByRole("link", { name: "All users" })).toHaveAttribute("href", "/users")
    await userEvent.click(screen.getByRole("button", { name: "Back" }))
    expect(back).not.toHaveBeenCalled()
  })

  it.each(directions)("mirrors the arrow in %s and is accessible", async (dir) => {
    const { container } = renderWithOnu(<BackButton />, { dir })
    expect(container.querySelector("[data-icon-name=back]")).toHaveClass("rtl:-scale-x-100")
    await expectNoA11yViolations(container)
  })
})

describe("IconText", () => {
  it("renders an icon next to text, at the start or end", () => {
    const { container } = renderWithOnu(
      <>
        <IconText icon="map-pin" tone="muted" size="sm">
          Malé
        </IconText>
        <IconText icon="external-link" iconPosition="end" iconLabel="opens in a new tab">
          Gazette
        </IconText>
      </>,
    )
    const [first, second] = container.querySelectorAll("[data-slot=icon-text]")
    expect(first!.firstElementChild).toHaveAttribute("data-icon-name", "map-pin")
    expect(second!.lastElementChild).toHaveAttribute("data-icon-name", "external-link")
    expect(screen.getByRole("img", { name: "opens in a new tab" })).toBeInTheDocument()
  })

  it("accepts a node icon and asChild", () => {
    renderWithOnu(
      <IconText icon={<span data-testid="ic" />} asChild>
        <a href="/x">Link</a>
      </IconText>,
    )
    expect(screen.getByRole("link", { name: "Link" })).toHaveAttribute("data-slot", "icon-text")
    expect(screen.getByTestId("ic")).toBeInTheDocument()
  })

  it.each(directions)("is accessible in %s", async (dir) => {
    const { container } = renderWithOnu(<IconText icon="clock">2 hours</IconText>, { dir })
    await expectNoA11yViolations(container)
  })
})
