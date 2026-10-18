var e=`import * as React from "react"
import { DateCalendar, TimePanel, type DateRangeValue, type TimeValue } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Calendar and time panel",
  group: "Date and time",
  order: 11,
  description: "The panels inside the pickers, for use inline.",
}

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
        description={\`\${range.from?.toDateString() ?? "…"} – \${range.to?.toDateString() ?? "…"}\`}
      >
        <DateCalendar mode="range" selected={range} onSelect={setRange} className="rounded-lg border" />
      </DemoSection>
      <DemoSection title="Time panel">
        <TimePanel value={time} onChange={setTime} className="rounded-lg border" />
      </DemoSection>
    </DemoPage>
  )
}
`;export{e as default};