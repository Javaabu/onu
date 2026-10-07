import * as React from "react"
import { Button, Countdown, toast } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"
import { daysFromNow } from "./_data"

export const meta = {
  title: "Countdown",
  group: "Display and feedback",
  order: 17,
  description: "Counts down with tabular numbers; screen readers hear it once a minute, not every second.",
}

export default function CountdownDemo() {
  const [target] = React.useState(() => daysFromNow(2.4))
  const [short, setShort] = React.useState(() => new Date(Date.now() + 15_000))
  return (
    <DemoPage>
      <DemoSection title="Boxes" description="Registration for the housing scheme closes in…">
        <Countdown to={target} />
        <Countdown to={target} size="sm" />
      </DemoSection>
      <DemoSection title="Inline and completion" className="grid">
        <p className="text-sm">
          Offer ends in <Countdown to={target} variant="inline" />
        </p>
        <div className="gap-3 flex flex-wrap items-center">
          <Countdown
            key={short.getTime()}
            to={short}
            variant="inline"
            completeText="Registration closed"
            onComplete={() => toast.info("Countdown finished")}
          />
          <Button size="sm" variant="outline" onClick={() => setShort(new Date(Date.now() + 15_000))}>
            Restart (15 s)
          </Button>
        </div>
      </DemoSection>
      <DemoSection title="Large, without seconds">
        <Countdown to={target} size="lg" showSeconds={false} showDays />
      </DemoSection>
    </DemoPage>
  )
}
