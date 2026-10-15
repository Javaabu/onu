import { MiniCalendar, type MiniCalendarEvent } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Calendar",
  group: "Display and feedback",
  order: 24,
  description: "`MiniCalendar`: a compact read-only month with event dots for portals. Not a date picker.",
}

const today = new Date()
const day = (offset: number, hour = 9) =>
  new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset, hour)

const events: MiniCalendarEvent[] = [
  { id: 1, date: day(0, 10), title: "Council meeting", tone: "primary" },
  { id: 2, date: day(0, 14), title: "Public hearing: land use plan", tone: "warning" },
  { id: 3, date: day(2), title: "Job fair at Dharubaaruge", tone: "success", href: "#job-fair" },
  { id: 4, date: day(5), title: "Clean-up day, Hulhumalé", tone: "info" },
  { id: 5, date: day(9), title: "Application deadline", tone: "destructive" },
  { id: 6, date: day(9, 15), title: "Info session", tone: "primary" },
  { id: 7, date: day(9, 16), title: "Q&A", tone: "muted" },
  { id: 8, date: day(-4), title: "Budget briefing", tone: "muted" },
]

export default function MiniCalendarDemo() {
  return (
    <DemoPage>
      <DemoSection title="Upcoming events" description="Click a day to list its events.">
        <MiniCalendar events={events} />
      </DemoSection>
    </DemoPage>
  )
}
