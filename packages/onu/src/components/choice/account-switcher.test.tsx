import * as React from "react"
import { screen, waitFor, configure } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { AccountSwitcher, type Account } from "./account-switcher"

// Interaction-heavy tests: allow for slow, shared CI machines.
vi.setConfig({ testTimeout: 30_000 })
configure({ asyncUtilTimeout: 5_000 })

const accounts: Account[] = [
  { id: "me", name: "Aishath Shifa", description: "A123456", type: "personal" },
  { id: "org-1", name: "Javaabu Pvt Ltd", description: "C-0123/2014", type: "organisation" },
  { id: "org-2", name: "Male' City Council", type: "organisation", avatar: "/mcc.png" },
  { id: "del-1", name: "Ahmed Ali", description: "Delegated by Ahmed Ali", type: "delegated" },
  { id: "del-2", name: "Mariyam Nisha", type: "delegated", disabled: true },
  { id: "del-3", name: "Hassan Rasheed", type: "delegated" },
]

describe("AccountSwitcher", () => {
  it("shows the current account and switches with search", async () => {
    const onValueChange = vi.fn()
    renderWithOnu(<AccountSwitcher accounts={accounts} defaultValue="me" onValueChange={onValueChange} />)
    const trigger = screen.getByRole("button", { name: /Switch account: Aishath Shifa/ })
    expect(screen.getByText("AS")).toBeInTheDocument()
    await userEvent.click(trigger)
    expect(screen.getByText("Organisations")).toBeInTheDocument()
    expect(screen.getByText("Delegated accounts")).toBeInTheDocument()
    expect(screen.getByRole("option", { name: /Aishath Shifa/ })).toHaveAttribute("aria-current", "true")
    await userEvent.type(screen.getByRole("combobox", { name: "Search accounts…" }), "javaabu")
    expect(screen.getAllByRole("option")).toHaveLength(1)
    await userEvent.keyboard("{Enter}")
    expect(onValueChange).toHaveBeenCalledWith("org-1", accounts[1])
    await waitFor(() => expect(trigger).toHaveFocus())
    expect(trigger).toHaveTextContent("Javaabu Pvt Ltd")
  })

  it("shows an empty message and footer", async () => {
    renderWithOnu(<AccountSwitcher accounts={accounts} searchable footer={<a href="/delegations">Manage</a>} />)
    await userEvent.click(screen.getByRole("button"))
    await userEvent.type(screen.getByRole("combobox"), "zzz")
    expect(screen.getByText("No accounts found")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Manage" })).toBeInTheDocument()
  })

  it("uses a radio menu for short lists", async () => {
    const onValueChange = vi.fn()
    function Controlled() {
      const [value, setValue] = React.useState("me")
      return (
        <AccountSwitcher
          accounts={accounts.slice(0, 2)}
          value={value}
          onValueChange={(id, a) => {
            setValue(id)
            onValueChange(id, a)
          }}
          footer={<span>Footer</span>}
          size="lg"
          className="x"
        />
      )
    }
    renderWithOnu(<Controlled />)
    const trigger = screen.getByRole("button", { name: /Aishath Shifa/ })
    expect(trigger).toHaveClass("x")
    trigger.focus()
    await userEvent.keyboard("{Enter}")
    expect(await screen.findByRole("menuitemradio", { name: /Aishath Shifa/ })).toHaveAttribute("aria-checked", "true")
    await userEvent.click(screen.getByRole("menuitemradio", { name: /Javaabu/ }))
    expect(onValueChange).toHaveBeenCalledWith("org-1", accounts[1])
    expect(screen.getByRole("button", { name: /Javaabu/ })).toBeInTheDocument()
  })

  it("handles no accounts", () => {
    renderWithOnu(<AccountSwitcher accounts={[]} />)
    expect(screen.getByRole("button", { name: "Switch account" })).toBeInTheDocument()
  })

  it.each(directions)("passes axe in %s (dv)", async (dir) => {
    renderWithOnu(
      <AccountSwitcher
        accounts={[
          { id: "1", name: "އައިޝަތު ޝިފާ" },
          { id: "2", name: "ޖާވާބު", type: "organisation" },
        ]}
        searchable
      />,
      { locale: "dv", dir },
    )
    await expectNoA11yViolations()
    await userEvent.click(screen.getByRole("button"))
    expect(screen.getByText("މުއައްސަސާތައް")).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})
