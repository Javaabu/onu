import * as React from "react"
import { screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { NotificationCenter, type NotificationItem } from "./notification-center"

// Overlays and axe are slow under parallel coverage runs.
vi.setConfig({ testTimeout: 30_000 })

const now = new Date("2026-10-07T10:00:00Z")
const base: NotificationItem[] = [
  {
    id: "1",
    title: "Application approved",
    description: "Your building permit for Hulhumalé was approved.",
    time: new Date("2026-10-07T09:00:00Z"),
    variant: "success",
    icon: "success",
    href: "/applications/1",
  },
  { id: "2", title: "Payment received", description: "MVR 1,250.00", time: "2026-10-05T10:00:00Z", read: true },
  { id: "3", title: "Document requested", time: 1759800000000, variant: "warning" },
]

const original = window.matchMedia

function Stateful(props: Partial<React.ComponentProps<typeof NotificationCenter>>) {
  const [items, setItems] = React.useState(base)
  return (
    <NotificationCenter
      notifications={items}
      now={now}
      onMarkRead={(id) => setItems((list) => list.map((n) => (n.id === id ? { ...n, read: true } : n)))}
      onMarkAllRead={() => setItems((list) => list.map((n) => ({ ...n, read: true })))}
      {...props}
    />
  )
}

describe("NotificationCenter", () => {
  afterEach(() => {
    window.matchMedia = original
  })

  it("shows the unread count on the bell and lists notifications in a popover", async () => {
    renderWithOnu(<Stateful viewAllHref="/notifications" className="extra" />)
    const bell = screen.getByRole("button", { name: "Notifications, 2 unread" })
    expect(bell).toHaveClass("extra")
    expect(within(bell).getByText("2")).toHaveAttribute("aria-hidden", "true")
    await userEvent.click(bell)
    const list = await screen.findByRole("list", { name: "Notifications" })
    expect(within(list).getAllByRole("listitem")).toHaveLength(3)
    expect(within(list).getByText("about 1 hour ago")).toHaveAttribute("datetime", "2026-10-07T09:00:00.000Z")
    expect(within(list).getAllByText("Unread")).toHaveLength(2)
    expect(screen.getByRole("link", { name: "View all" })).toHaveAttribute("href", "/notifications")
    await expectNoA11yViolations()
  })

  it("marks one or all notifications as read", async () => {
    renderWithOnu(<Stateful />)
    await userEvent.click(screen.getByRole("button", { name: "Notifications, 2 unread" }))
    const marks = await screen.findAllByRole("button", { name: "Mark as read" })
    await userEvent.click(marks[0]!)
    expect(screen.getByRole("button", { name: "Notifications, 1 unread" })).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Mark all as read" }))
    expect(screen.getByRole("button", { name: "Notifications" })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Mark all as read" })).toBeNull()
  })

  it("marks read on click and closes after following a link", async () => {
    const onItemClick = vi.fn()
    renderWithOnu(<Stateful onItemClick={onItemClick} />)
    await userEvent.click(screen.getByRole("button", { name: /Notifications/ }))
    await userEvent.click(await screen.findByRole("button", { name: /Document requested/ }))
    expect(onItemClick).toHaveBeenCalledWith(expect.objectContaining({ id: "3" }))
    await userEvent.click(screen.getByRole("link", { name: /Application approved/ }))
    expect(screen.queryByRole("list")).toBeNull()
    expect(screen.getByRole("button", { name: "Notifications" })).toBeInTheDocument()
  })

  it("shows an empty state", async () => {
    renderWithOnu(<NotificationCenter notifications={[]} defaultOpen />)
    expect(await screen.findByText("You’re all caught up")).toBeInTheDocument()
    expect(screen.getByText("New notifications will appear here.")).toBeInTheDocument()
  })

  it("announces new unread notifications in a live region", () => {
    const { rerender } = renderWithOnu(<NotificationCenter notifications={base} now={now} />)
    const live = screen.getByRole("status")
    expect(live).toHaveTextContent("")
    rerender(
      <NotificationCenter
        notifications={[{ id: "4", title: "New message" }, { id: "5", title: "Another" }, ...base]}
        now={now}
      />,
    )
    expect(live).toHaveTextContent("2 new notifications")
    rerender(<NotificationCenter notifications={base.map((n) => ({ ...n, read: true }))} now={now} />)
    expect(live).toHaveTextContent("2 new notifications")
  })

  it("caps large counts and is controllable", async () => {
    const onOpenChange = vi.fn()
    const many = Array.from({ length: 120 }, (_, i) => ({ id: String(i), title: `N${i}` }))
    renderWithOnu(<NotificationCenter notifications={many} open={false} onOpenChange={onOpenChange} />)
    expect(screen.getByText("99+")).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Notifications, 120 unread" }))
    expect(onOpenChange).toHaveBeenCalledWith(true)
    expect(screen.queryByRole("list")).toBeNull()
  })

  it("opens as a bottom sheet on phones", async () => {
    window.matchMedia = ((query: string) => ({
      matches: query.includes("max-width"),
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    })) as unknown as typeof window.matchMedia
    renderWithOnu(<Stateful />)
    await userEvent.click(screen.getByRole("button", { name: "Notifications, 2 unread" }))
    const dialog = await screen.findByRole("dialog", { name: "Notifications" })
    expect(within(dialog).getByText("Payment received")).toBeInTheDocument()
  })

  it.each(directions)("translates in %s with Dhivehi relative times", async (dir) => {
    renderWithOnu(<NotificationCenter notifications={base} now={now} defaultOpen />, { locale: "dv", dir })
    expect(screen.getByRole("button", { name: "ނޮޓިފިކޭޝަންތައް، 2 ނުކިޔާ" })).toBeInTheDocument()
    expect(await screen.findByRole("list", { name: "ނޮޓިފިކޭޝަންތައް" })).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})
