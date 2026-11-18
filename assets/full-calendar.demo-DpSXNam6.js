var e=`import * as React from "react"
import { Card, CardContent, OnuProvider } from "@javaabu/onu"
import { FullCalendar, type CalendarEvent } from "@javaabu/onu/calendar"
import { dv } from "@javaabu/onu/locales/dv"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Full calendar",
  group: "Date and time",
  order: 7,
  description: "Month, week, day and agenda views on FullCalendar's MIT plugins, themed with Onu tokens.",
}

function at(dayOffset: number, hours = 0, minutes = 0) {
  const d = new Date()
  d.setDate(d.getDate() + dayOffset)
  d.setHours(hours, minutes, 0, 0)
  return d
}

const INITIAL: CalendarEvent[] = [
  { id: "1", title: "Council meeting — Malé", start: at(0, 10), end: at(0, 11, 30) },
  { id: "2", title: "Budget review (MVR 2.4m)", start: at(1, 14), end: at(1, 15), color: "warning" },
  { id: "3", title: "Ferry maintenance, Hulhumalé", start: at(2), end: at(4), allDay: true, color: "info" },
  { id: "4", title: "Independence Day", start: at(6), allDay: true, color: "success" },
  { id: "5", title: "Site visit — Addu City", start: at(-2, 8), end: at(-2, 12), color: "chart-3" },
  { id: "6", title: "ސްޓާފް ބައްދަލުވުން", start: at(3, 9), end: at(3, 10), color: "chart-5" },
  { id: "7", title: "Server patching window", start: at(-5, 22), end: at(-5, 23), color: "destructive" },
]

export default function FullCalendarDemo() {
  const [events, setEvents] = React.useState(INITIAL)
  const [log, setLog] = React.useState("Click a day, drag an event or select a range.")
  return (
    <DemoPage>
      <DemoSection title="Editable calendar" description={log} className="block">
        <FullCalendar
          events={events}
          editable
          selectable
          onDateClick={({ date }) => setLog(\`Clicked \${date.toDateString()}\`)}
          onSelect={({ start, end }) => {
            setLog(\`Selected \${start.toDateString()} – \${end.toDateString()}\`)
            setEvents((list) => [
              ...list,
              { id: String(list.length + 1), title: "New booking", start, end, color: "chart-2" },
            ])
          }}
          onEventClick={({ event }) => setLog(\`Opened “\${event.title}”\`)}
          onEventDrop={({ event }) => setLog(\`Moved “\${event.title}” to \${event.start?.toLocaleString()}\`)}
          onEventResize={({ event }) => setLog(\`Resized “\${event.title}” to end \${event.end?.toLocaleString()}\`)}
        />
      </DemoSection>
      <DemoSection title="ދިވެހި" description="Right to left, Dhivehi names." className="block">
        <OnuProvider locale={dv} syncDocument={false}>
          <Card dir="rtl" lang="dv">
            <CardContent>
              <FullCalendar events={events} defaultView="week" />
            </CardContent>
          </Card>
        </OnuProvider>
      </DemoSection>
    </DemoPage>
  )
}
`;export{e as default};