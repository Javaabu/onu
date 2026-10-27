import * as React from "react"
import { DateCalendar, TimePanel, type DateCalendarEvent, type DateRangeValue, type TimeValue } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Calendar and time panel",
  group: "Date and time",
  order: 11,
  description: "The panels inside the pickers, for use inline, and a read-only month with event dots.",
}

const today = new Date()
const day = (offset: number, hour = 9) =>
  new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset, hour)

const events: DateCalendarEvent[] = [
  { id: 1, date: day(0, 10), title: "Council meeting", tone: "primary" },
  { id: 2, date: day(0, 14), title: "Public hearing: land use plan", tone: "warning" },
  { id: 3, date: day(2), title: "Job fair at Dharubaaruge", tone: "success", href: "#job-fair" },
  { id: 4, date: day(5), title: "Clean-up day, Hulhumalé", tone: "info" },
  { id: 5, date: day(9), title: "Application deadline", tone: "destructive" },
  { id: 6, date: day(9, 15), title: "Info session", tone: "primary" },
  { id: 7, date: day(9, 16), title: "Q&A", tone: "muted" },
  { id: 8, date: day(-4), title: "Budget briefing", tone: "muted" },
]

export default function DateCalendarDemo() {
  const [date, setDate] = React.useState<Date | null>(new Date())
  const [range, setRange] = React.useState<DateRangeValue>({ from: null, to: null })
  const [time, setTime] = React.useState<TimeValue | null>({ hours: 9, minutes: 30 })
  return (
    <DemoPage>
      <DemoSection title="Single date" description={date?.toDateString()}>
        <DateCalendar selected={date} onSelect={setDate} className="rounded-lg border" />
      </DemoSection>
      <DemoSection
        title="Range"
        description={`${range.from?.toDateString() ?? "…"} – ${range.to?.toDateString() ?? "…"}`}
      >
        <DateCalendar mode="range" selected={range} onSelect={setRange} className="rounded-lg border" />
      </DemoSection>
      <DemoSection
        title="Events, read-only"
        description='`readOnly`, `size="sm"` and `events`: a compact month for sidebars. Click a day to list its events.'
      >
        <DateCalendar readOnly size="sm" events={events} className="rounded-lg border" />
      </DemoSection>
      <DemoSection title="Time panel">
        <TimePanel value={time} onChange={setTime} className="rounded-lg border" />
      </DemoSection>
    </DemoPage>
  )
}
