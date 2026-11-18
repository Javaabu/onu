var e=`import * as React from "react"
import { announce, Button, LiveRegion, useAnnouncer } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Live region and announcer",
  group: "Foundations",
  order: 4,
  description: "Tell screen-reader users about changes that have no visible text of their own.",
}

const ISLANDS = ["Malé", "Hulhumalé", "Addu", "Fuvahmulah"]

function Reorder() {
  const [items, setItems] = React.useState(ISLANDS)
  const { announce, message, region } = useAnnouncer()
  const moveUp = (index: number) => {
    const next = [...items]
    ;[next[index - 1], next[index]] = [next[index]!, next[index - 1]!]
    setItems(next)
    announce(\`\${items[index]} moved to position \${index} of \${items.length}\`)
  }
  return (
    <div className="gap-2 max-w-sm grid w-full">
      <ol className="divide-y rounded-lg border">
        {items.map((item, index) => (
          <li key={item} className="px-3 py-2 text-sm flex items-center justify-between">
            {item}
            <Button size="sm" variant="ghost" disabled={index === 0} onClick={() => moveUp(index)}>
              Move up
            </Button>
          </li>
        ))}
      </ol>
      <p className="text-xs text-muted-foreground">Last announcement: {message || "none yet"}</p>
      {region}
    </div>
  )
}

function Uploads() {
  const [done, setDone] = React.useState(2)
  return (
    <div className="gap-3 flex flex-wrap items-center">
      <Button variant="outline" onClick={() => setDone((n) => Math.min(5, n + 1))} disabled={done === 5}>
        Upload one more
      </Button>
      <LiveRegion role="status" visible className="text-sm">
        {done} of 5 files uploaded
      </LiveRegion>
    </div>
  )
}

export default function LiveRegionDemo() {
  return (
    <DemoPage>
      <DemoSection
        title="useAnnouncer"
        description="Each move is read out; the same message twice is read twice."
        className="gap-3 grid"
      >
        <Reorder />
      </DemoSection>

      <DemoSection
        title="LiveRegion"
        description="A visible status line whose changes are announced. Keep it mounted and change its text."
        className="gap-3 grid"
      >
        <Uploads />
      </DemoSection>

      <DemoSection
        title="announce()"
        description="From an event handler or code outside React, through one page-wide region."
        className="gap-2 flex flex-wrap"
      >
        <Button variant="outline" onClick={() => announce("Settings saved")}>
          Save settings
        </Button>
        <Button variant="outline" onClick={() => announce("Connection lost. Retrying…", { politeness: "assertive" })}>
          Simulate an error
        </Button>
      </DemoSection>
    </DemoPage>
  )
}
`;export{e as default};