import * as React from "react"
import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { getInitials, UserAvatar } from "./user-avatar"
import { UserAvatarGroup } from "./user-avatar-group"

describe("getInitials", () => {
  it.each([
    ["Ahmed Ali", "AA"],
    ["aishath shiuna mohamed", "AM"],
    ["Mariyam", "M"],
    ["  Ibrahim  (Ibbe)  Rasheed ", "IR"],
    ["Mr. Hassan Manik", "MM"],
    ["އަޙްމަދު ޢަލީ", "އަޢަ"],
    ["މަރިޔަމް", "މަ"],
    ["", ""],
    [null, ""],
    ["123 !!", ""],
  ])("%s → %s", (name, expected) => {
    expect(getInitials(name)).toBe(expected)
  })

  it("respects max", () => {
    expect(getInitials("Ahmed Ali", 1)).toBe("A")
  })
})

describe("UserAvatar", () => {
  it("shows initials when there is no image, named by the person", () => {
    renderWithOnu(<UserAvatar name="Ahmed Ali" />)
    expect(screen.getByRole("img", { name: "Ahmed Ali" })).toHaveTextContent("AA")
  })

  it("uses the Thaana font and lang for Dhivehi initials", () => {
    const { container } = renderWithOnu(<UserAvatar name="އަޙްމަދު ޢަލީ" />)
    const fallback = container.querySelector("[data-slot=avatar-fallback]")!
    expect(fallback).toHaveAttribute("lang", "dv")
    expect(fallback).toHaveClass("font-thaana")
  })

  it("shows a status dot with a text alternative", () => {
    const { container } = renderWithOnu(<UserAvatar name="Ahmed Ali" status="online" />, { locale: "dv" })
    expect(screen.getByRole("img", { name: "Ahmed Ali, އޮންލައިން" })).toBeInTheDocument()
    expect(container.querySelector("[data-slot=user-avatar-status]")).toHaveClass("bg-success")
  })

  it("falls back to a user icon without a name and can be decorative", () => {
    const { container } = renderWithOnu(
      <>
        <UserAvatar />
        <UserAvatar name="Hidden" decorative size="xl" shape="square" />
      </>,
    )
    expect(container.querySelector("[data-icon-name=user]")).toBeInTheDocument()
    expect(screen.queryByRole("img", { name: "Hidden" })).toBeNull()
    const avatars = container.querySelectorAll("[data-slot=avatar]")
    expect(avatars[1]).toHaveClass("size-16", "rounded-lg")
  })

  it("renders the image source when given (fallback until it loads)", () => {
    renderWithOnu(<UserAvatar name="Ahmed Ali" src="/a.png" fallback="?" classNames={{ fallback: "fb" }} />)
    // jsdom never loads images, so the fallback shows after the delay.
    expect(screen.getByRole("img", { name: "Ahmed Ali" })).toBeInTheDocument()
  })

  it.each(directions)("is accessible in %s", async (dir) => {
    const { container } = renderWithOnu(<UserAvatar name="Ahmed Ali" status="busy" />, { dir })
    await expectNoA11yViolations(container)
  })
})

describe("UserAvatarGroup", () => {
  const users = [
    { id: 1, name: "Ahmed Ali" },
    { id: 2, name: "Aishath Shiuna" },
    { id: 3, name: "Mohamed Naseem" },
    { id: 4, name: "Fathimath Rasheeda" },
    { id: 5, name: "Ibrahim Waheed" },
    { id: 6, name: "Mariyam Zahira" },
  ]

  it("shows up to max avatars and a +N button listing the rest", async () => {
    const user = userEvent.setup()
    renderWithOnu(<UserAvatarGroup users={users} max={4} />)
    expect(screen.getByRole("group", { name: "6 people" })).toBeInTheDocument()
    expect(screen.getAllByRole("img")).toHaveLength(3)
    const more = screen.getByRole("button", { name: "Show 3 more people" })
    expect(more).toHaveTextContent("+3")
    await user.click(more)
    expect(await screen.findByText("Mariyam Zahira")).toBeInTheDocument()
    await user.keyboard("{Escape}")
    expect(more).toHaveFocus()
  })

  it("shows everyone when within max, and supports a custom overflow", async () => {
    const user = userEvent.setup()
    const { rerender } = renderWithOnu(<UserAvatarGroup users={users.slice(0, 3)} />)
    expect(screen.queryByRole("button")).toBeNull()
    rerender(
      <UserAvatarGroup
        users={users}
        max={2}
        size="sm"
        shape="square"
        renderOverflow={(hidden) => <p>{hidden.length} hidden</p>}
      />,
    )
    await user.click(screen.getByRole("button"))
    expect(await screen.findByText("5 hidden")).toBeInTheDocument()
  })

  it.each(directions)("is accessible in %s", async (dir) => {
    const { container } = renderWithOnu(<UserAvatarGroup users={users} />, { dir, locale: "dv" })
    expect(screen.getByRole("group", { name: "6 މީހުން" })).toBeInTheDocument()
    await expectNoA11yViolations(container)
  })
})
