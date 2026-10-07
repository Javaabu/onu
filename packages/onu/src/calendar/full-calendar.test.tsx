import * as React from "react"
import { act, fireEvent, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { enUS } from "date-fns/locale/en-US"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../test/utils"
import { dv } from "../locales"
import type { CalendarApi } from "./index"
import { FullCalendar, rangeTitle, toEventInput, type CalendarEvent } from "./full-calendar"
import { dvFullCalendarLocale, fullCalendarLocale } from "./full-calendar-locale"

vi.setConfig({ testTimeout: 30_000 })

const TODAY = new Date(2026, 2, 12, 9, 0)
const EVENTS: CalendarEvent[] = [
  { id: "1", title: "Council meeting", start: new Date(2026, 2, 12, 10, 0), end: new Date(2026, 2, 12, 11, 0) },
  { id: "2", title: "Eid holiday", start: "2026-03-20", end: "2026-03-23", allDay: true, color: "success" },
]

const body = () => document.querySelector<HTMLElement>("[data-slot=full-calendar-body]")!

describe("FullCalendar", () => {
  it("shows a month with events, a translated toolbar and the visible range as the title", async () => {
    renderWithOnu(<FullCalendar events={EVENTS} initialDate={TODAY} today={TODAY} />)
    expect(await screen.findByRole("heading", { name: "March 2026" })).toBeInTheDocument()
    expect(screen.getByText("Council meeting")).toBeInTheDocument()
    expect(screen.getAllByText("Eid holiday").length).toBeGreaterThan(0)
    const views = screen.getByRole("radiogroup", { name: "Calendar view" })
    expect(
      within(views)
        .getAllByRole("radio")
        .map((r) => r.textContent),
    ).toEqual(["Month", "Week", "Day", "Agenda"])
    expect(within(views).getByRole("radio", { name: "Month" })).toHaveAttribute("aria-checked", "true")
  })

  it("moves through months with the toolbar", async () => {
    const onRangeChange = vi.fn()
    const user = userEvent.setup()
    renderWithOnu(<FullCalendar initialDate={TODAY} today={TODAY} onRangeChange={onRangeChange} />)
    const heading = () => screen.getByRole("heading")
    await user.click(screen.getByRole("button", { name: "Next" }))
    await waitFor(() => expect(heading()).toHaveTextContent("April 2026"))
    await user.click(screen.getByRole("button", { name: "Previous" }))
    await user.click(screen.getByRole("button", { name: "Previous" }))
    await waitFor(() => expect(heading()).toHaveTextContent("February 2026"))
    await user.click(screen.getByRole("button", { name: "Today" }))
    await waitFor(() => expect(heading()).toHaveTextContent("March 2026"))
    expect(onRangeChange).toHaveBeenLastCalledWith(expect.objectContaining({ view: "month" }))
  })

  it("switches between month, week, day and agenda views", async () => {
    const onViewChange = vi.fn()
    const user = userEvent.setup()
    renderWithOnu(
      <FullCalendar events={EVENTS} initialDate={TODAY} today={TODAY} onViewChange={onViewChange} hourCycle={24} />,
    )
    await user.click(screen.getByRole("radio", { name: "Week" }))
    expect(onViewChange).toHaveBeenLastCalledWith("week")
    await waitFor(() => expect(screen.getByRole("heading")).toHaveTextContent("8 – 14 Mar 2026"))
    expect(body().querySelector(".fc-timeGridWeek-view")).toBeInTheDocument()
    await user.click(screen.getByRole("radio", { name: "Day" }))
    await waitFor(() => expect(screen.getByRole("heading")).toHaveTextContent("Thursday, 12 March 2026"))
    await user.click(screen.getByRole("radio", { name: "Agenda" }))
    expect(body().querySelector(".fc-listMonth-view")).toBeInTheDocument()
    await waitFor(() => expect(screen.getByRole("heading")).toHaveTextContent(/^March 2026$/))
  })

  it("follows a controlled view and limits the views offered", () => {
    const { rerender } = renderWithOnu(<FullCalendar view="week" views={["week"]} initialDate={TODAY} today={TODAY} />)
    expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument()
    expect(body().querySelector(".fc-timeGridWeek-view")).toBeInTheDocument()
    rerender(<FullCalendar view="agenda" views={["week"]} initialDate={TODAY} today={TODAY} />)
    expect(body().querySelector(".fc-listMonth-view")).toBeInTheDocument()
  })

  it("reports event clicks", () => {
    const onEventClick = vi.fn()
    renderWithOnu(<FullCalendar events={EVENTS} initialDate={TODAY} today={TODAY} onEventClick={onEventClick} />)
    const event = screen.getByText("Council meeting").closest("a")!
    // Clickable events are reachable with the keyboard.
    expect(event).toHaveAttribute("tabindex", "0")
    fireEvent.click(event)
    expect(onEventClick).toHaveBeenCalledWith(expect.objectContaining({ event: expect.objectContaining({ id: "1" }) }))
  })

  it("wires date click, select, drag and resize callbacks", () => {
    const apiRef = React.createRef<CalendarApi | null>()
    const onDateClick = vi.fn()
    const onSelect = vi.fn()
    const onEventDrop = vi.fn()
    const onEventResize = vi.fn()
    renderWithOnu(
      <FullCalendar
        apiRef={apiRef}
        events={EVENTS}
        initialDate={TODAY}
        today={TODAY}
        editable
        selectable
        onDateClick={onDateClick}
        onSelect={onSelect}
        onEventDrop={onEventDrop}
        onEventResize={onEventResize}
      />,
    )
    // jsdom has no layout, so FullCalendar cannot hit-test pointer drags; call the wired handlers directly.
    const api = apiRef.current!
    expect(api.getOption("editable")).toBe(true)
    expect(api.getOption("selectable")).toBe(true)
    const date = new Date(2026, 2, 18)
    api.getOption("dateClick")!({ date, allDay: true } as never)
    expect(onDateClick).toHaveBeenCalledWith({ date, allDay: true })
    api.getOption("select")!({ start: date, end: new Date(2026, 2, 20), allDay: true } as never)
    expect(onSelect).toHaveBeenCalledWith({ start: date, end: new Date(2026, 2, 20), allDay: true })
    const drop = { revert: vi.fn() }
    api.getOption("eventDrop")!(drop as never)
    expect(onEventDrop).toHaveBeenCalledWith(drop)
    api.getOption("eventResize")!(drop as never)
    expect(onEventResize).toHaveBeenCalledWith(drop)
  })

  it("shades weekend days and marks today", () => {
    renderWithOnu(<FullCalendar initialDate={TODAY} today={TODAY} weekendDays={[5, 6]} />)
    expect(body().querySelector('[data-date="2026-03-13"]')).toHaveClass("onu-weekend")
    expect(body().querySelector('[data-date="2026-03-12"]')).not.toHaveClass("onu-weekend")
    expect(body().querySelector('[data-date="2026-03-12"]')).toHaveClass("fc-day-today")
  })

  it("goes to the day view from a day number", async () => {
    renderWithOnu(<FullCalendar initialDate={TODAY} today={TODAY} />)
    const link = body().querySelector<HTMLElement>('[data-date="2026-03-18"] .fc-daygrid-day-number')!
    fireEvent.click(link)
    expect(screen.getByRole("radio", { name: "Day" })).toHaveAttribute("aria-checked", "true")
    await waitFor(() => expect(screen.getByRole("heading")).toHaveTextContent("Wednesday, 18 March 2026"))
  })

  it("exposes FullCalendar's API and accepts extra options", () => {
    const apiRef = React.createRef<CalendarApi | null>()
    const ref = React.createRef<HTMLDivElement>()
    renderWithOnu(
      <FullCalendar
        apiRef={apiRef}
        ref={ref}
        hideToolbar
        initialDate={TODAY}
        today={TODAY}
        options={{ weekNumbers: true }}
        className="cal-x"
        classNames={{ calendar: "body-x" }}
      />,
    )
    expect(screen.queryByRole("heading")).not.toBeInTheDocument()
    expect(ref.current).toHaveClass("cal-x")
    expect(body()).toHaveClass("body-x")
    act(() => apiRef.current!.next())
    expect(apiRef.current!.getDate().getMonth()).toBe(3)
    expect(body().querySelector(".fc-daygrid-week-number")).toBeInTheDocument()
  })

  it.each(directions)("passes axe in %s", async (dir) => {
    renderWithOnu(<FullCalendar events={EVENTS} initialDate={TODAY} today={TODAY} />, { dir })
    expect(body().querySelector(".fc")).toHaveClass(dir === "rtl" ? "fc-direction-rtl" : "fc-direction-ltr")
    await expectNoA11yViolations(document.querySelector("[data-slot=full-calendar-toolbar]")!)
  })

  it("speaks Dhivehi, right to left", () => {
    renderWithOnu(<FullCalendar events={EVENTS} initialDate={TODAY} today={TODAY} />, { locale: "dv" })
    expect(screen.getByRole("heading")).toHaveTextContent("މާޗު 2026")
    expect(screen.getByRole("radio", { name: "މަސް" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "މިއަދު" })).toBeInTheDocument()
    expect(body().querySelector(".fc")).toHaveClass("fc-direction-rtl")
    expect(body().querySelector(".fc-col-header-cell")).toHaveTextContent("އާދި")
  })

  it.each(directions)("keeps the agenda's hidden header in place in %s (no 10,000px overflow)", (dir) => {
    renderWithOnu(<FullCalendar view="agenda" events={EVENTS} initialDate={TODAY} today={TODAY} />, { dir })
    // FullCalendar hides the list header at `left: -10000px`, which overflows in RTL;
    // Onu replaces that with an in-place visually hidden header.
    expect(body().querySelector(".fc-list-table thead")).toBeInTheDocument()
    expect(body()).toHaveClass("[&_.fc-list-table_thead]:sr-only", "[&_.fc-list-table_thead]:inset-x-auto!")
    expect(body()).toHaveClass("[&_.fc-daygrid-event]:overflow-hidden")
  })

  it("starts on the agenda on phones", () => {
    const original = window.matchMedia
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query.includes("max-width"),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })) as unknown as typeof window.matchMedia
    try {
      renderWithOnu(<FullCalendar events={EVENTS} initialDate={TODAY} today={TODAY} />)
      expect(screen.getByRole("radio", { name: "Agenda" })).toHaveAttribute("aria-checked", "true")
    } finally {
      window.matchMedia = original
    }
  })
})

describe("FullCalendar helpers", () => {
  it("maps theme colours onto events", () => {
    expect(toEventInput({ title: "a", start: "2026-03-01" })).toEqual({ title: "a", start: "2026-03-01" })
    expect(toEventInput({ title: "b", start: "2026-03-01", color: "warning" })).toMatchObject({
      backgroundColor: "var(--warning)",
      textColor: "var(--warning-foreground)",
      classNames: ["onu-event-warning"],
    })
  })

  it("titles every kind of range", () => {
    const d = (m: number, day: number, y = 2026) => new Date(y, m, day)
    expect(rangeTitle("week", d(2, 29), d(3, 5), enUS)).toBe("29 Mar – 4 Apr 2026")
    expect(rangeTitle("week", d(11, 28, 2025), d(0, 4), enUS)).toBe("28 Dec 2025 – 3 Jan 2026")
    expect(rangeTitle("agenda", d(2, 1), d(3, 1), enUS)).toBe("March 2026")
  })

  it("builds FullCalendar locales from Onu locales", () => {
    expect(dvFullCalendarLocale).toMatchObject({ code: "dv", direction: "rtl", firstDay: 0, allDayText: "މުޅި ދުވަހު" })
    const custom = fullCalendarLocale(dv, { weekStartsOn: 6, hourCycle: 24 })
    expect(custom.firstDay).toBe(6)
    const more = custom.moreLinkText as (n: number) => string
    expect(more(3)).toBe("+3 އިތުރަށް")
    const fmt = custom.eventTimeFormat as unknown as (arg: { date: object }) => string
    expect(fmt({ date: { year: 2026, month: 2, day: 12, hour: 14, minute: 5 } })).toBe("14:05")
  })
})
