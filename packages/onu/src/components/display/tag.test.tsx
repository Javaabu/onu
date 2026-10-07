import * as React from "react"
import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { Tag } from "./tag"

describe("Tag", () => {
  it("renders a static tag with an icon", () => {
    const { container } = renderWithOnu(<Tag icon="star">Featured</Tag>)
    expect(screen.getByText("Featured")).toBeInTheDocument()
    expect(container.querySelector("[data-icon-name=star]")).toBeInTheDocument()
    expect(screen.queryByRole("button")).toBeNull()
  })

  it("is clickable and toggles a selected state", async () => {
    const onClick = vi.fn()
    renderWithOnu(
      <Tag onClick={onClick} selected>
        Malé
      </Tag>,
    )
    const button = screen.getByRole("button", { name: "Malé" })
    expect(button).toHaveAttribute("aria-pressed", "true")
    await userEvent.click(button)
    expect(onClick).toHaveBeenCalled()
  })

  it("can be a link", () => {
    renderWithOnu(<Tag href="/tags/news">News</Tag>)
    expect(screen.getByRole("link", { name: "News" })).toHaveAttribute("href", "/tags/news")
  })

  it("is removable with the × button or Delete/Backspace", async () => {
    const onRemove = vi.fn()
    const user = userEvent.setup()
    renderWithOnu(
      <Tag onRemove={onRemove} onClick={() => {}}>
        Addu
      </Tag>,
    )
    await user.click(screen.getByRole("button", { name: "Remove Addu" }))
    expect(onRemove).toHaveBeenCalledTimes(1)
    screen.getByRole("button", { name: "Addu" }).focus()
    await user.keyboard("{Delete}")
    await user.keyboard("{Backspace}")
    expect(onRemove).toHaveBeenCalledTimes(3)
  })

  it("supports a custom remove label and Dhivehi", () => {
    renderWithOnu(
      <>
        <Tag onRemove={() => {}} removeLabel="Drop">
          X
        </Tag>
        <Tag onRemove={() => {}}>ހުޅުމާލެ</Tag>
      </>,
      { locale: "dv" },
    )
    expect(screen.getByRole("button", { name: "Drop" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "ހުޅުމާލެ ނައްތާލާ" })).toBeInTheDocument()
  })

  it("disables interaction", async () => {
    const onRemove = vi.fn()
    renderWithOnu(
      <Tag disabled onRemove={onRemove} href="/x" size="lg" variant="outline" classNames={{ remove: "rm" }}>
        <b>Off</b>
      </Tag>,
    )
    expect(screen.queryByRole("link")).toBeNull()
    expect(screen.getByRole("button", { name: "Remove Off" })).toBeDisabled()
    expect(screen.getByRole("button", { name: "Remove Off" })).toHaveClass("rm")
    expect(document.querySelector("[data-slot=tag]")).toHaveAttribute("data-size", "lg")
  })

  it.each(directions)("is accessible in %s", async (dir) => {
    const { container } = renderWithOnu(
      <Tag onRemove={() => {}} onClick={() => {}}>
        Hulhumalé
      </Tag>,
      { dir },
    )
    await expectNoA11yViolations(container)
  })
})
