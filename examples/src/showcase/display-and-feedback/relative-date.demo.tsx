import { RelativeDate } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"
import { minutesAgo } from "./_data"

export const meta = {
  title: "Relative date",
  group: "Display and feedback",
  order: 16,
  description:
    "“5 minutes ago”, “in 2 hours”. Hover or focus for the exact date; on touch screens it shows underneath (§25.5).",
}

const samples = [
  ["Just now", minutesAgo(0)],
  ["5 minutes ago", minutesAgo(5)],
  ["3 hours ago", minutesAgo(180)],
  ["3 days ago", minutesAgo(60 * 24 * 3)],
  ["In 2 hours", minutesAgo(-120)],
  ["In 2 weeks", minutesAgo(-60 * 24 * 14)],
  ["Last year", minutesAgo(60 * 24 * 400)],
] as const

export default function RelativeDateDemo() {
  return (
    <DemoPage>
      <DemoSection title="Relative times" description="Tab through them to see the tooltip on focus." className="grid">
        <dl className="gap-x-6 gap-y-2 text-sm grid grid-cols-[auto_1fr]">
          {samples.map(([label, value]) => (
            <div key={label} className="contents">
              <dt className="text-muted-foreground">{label}</dt>
              <dd>
                <RelativeDate value={value} />
              </dd>
            </div>
          ))}
          <dt className="text-muted-foreground">No value</dt>
          <dd>
            <RelativeDate value={null} />
          </dd>
        </dl>
      </DemoSection>
      <DemoSection title="Options" className="grid">
        <p className="text-sm">
          Custom format: <RelativeDate value={minutesAgo(90)} format="EEEE d MMMM yyyy, HH:mm" />
        </p>
        <p className="text-sm">
          Without exact date: <RelativeDate value={minutesAgo(90)} showExact={false} />
        </p>
      </DemoSection>
    </DemoPage>
  )
}
