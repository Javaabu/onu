import * as React from "react"
import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { IconText } from "./icon-text"

const root = (container: HTMLElement) => container.querySelector<HTMLElement>("[data-slot=icon-text]")!

describe("IconText", () => {
  it("puts a decorative icon before the text by default", () => {
    const { container } = renderWithOnu(<IconText icon="clock">2 hours</IconText>)
    const [icon, text] = Array.from(root(container).children)
    expect(icon).toHaveAttribute("data-icon-name", "clock")
    expect(icon).toHaveAttribute("aria-hidden", "true")
    expect(text).toHaveTextContent("2 hours")
  })

  it("puts the icon after the text with iconPosition end", () => {
    const { container } = renderWithOnu(
      <IconText icon="clock" iconPosition="end">
        2 hours
      </IconText>,
    )
    const [text, icon] = Array.from(root(container).children)
    expect(text).toHaveTextContent("2 hours")
    expect(icon).toHaveAttribute("data-icon-name", "clock")
  })

  it("names the icon with iconLabel", () => {
    renderWithOnu(
      <IconText icon="clock" iconLabel="Duration">
        2 hours
      </IconText>,
    )
    expect(screen.getByRole("img", { name: "Duration" })).toBeInTheDocument()
  })

  it("accepts an icon node", () => {
    renderWithOnu(<IconText icon={<svg data-testid="custom" />}>Malé</IconText>)
    expect(screen.getByTestId("custom")).toBeInTheDocument()
  })

  it("applies size and tone, classNames and rest props", () => {
    const { container } = renderWithOnu(
      <IconText
        icon="clock"
        size="lg"
        tone="danger"
        className="extra"
        classNames={{ icon: "my-icon", text: "my-text" }}
        id="duration"
      >
        Late
      </IconText>,
    )
    expect(root(container)).toHaveClass("text-base", "text-destructive", "extra")
    expect(root(container)).toHaveAttribute("id", "duration")
    expect(container.querySelector("[data-icon-name=clock]")).toHaveClass("my-icon")
    expect(screen.getByText("Late")).toHaveClass("my-text")
  })

  it("renders as its child with asChild", () => {
    renderWithOnu(
      <IconText icon="clock" asChild>
        <a href="#later">Later</a>
      </IconText>,
    )
    const link = screen.getByRole("link", { name: "Later" })
    expect(link).toHaveAttribute("data-slot", "icon-text")
    expect(link.querySelector("[data-icon-name=clock]")).toBeInTheDocument()
  })

  it.each(directions)("is axe-clean in %s with Dhivehi text", async (dir) => {
    renderWithOnu(
      <IconText icon="clock" iconLabel="ވަގުތު">
        ދެ ގަޑިއިރު
      </IconText>,
      { locale: "dv", dir },
    )
    expect(screen.getByText("ދެ ގަޑިއިރު")).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})
