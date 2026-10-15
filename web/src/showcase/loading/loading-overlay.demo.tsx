import * as React from "react"
import { Button, Card, CardContent, CardHeader, CardTitle, LoadingOverlay } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Loading overlay",
  group: "Loading",
  order: 4,
  description: "Covers a container while it loads, with aria-busy, an optional message and a delay against flicker.",
}

const payments = [
  ["Aishath Ali", "MVR 1,250.00"],
  ["Mohamed Naseem", "MVR 640.50"],
  ["Hawwa Ibrahim", "MVR 3,100.00"],
]

export default function LoadingOverlayDemo() {
  const [loading, setLoading] = React.useState(false)
  const [full, setFull] = React.useState(false)
  const run = (set: (v: boolean) => void, ms: number) => {
    set(true)
    setTimeout(() => set(false), ms)
  }
  return (
    <DemoPage>
      <DemoSection title="Container" className="gap-4 max-w-md grid">
        <div className="gap-2 flex flex-wrap">
          <Button onClick={() => run(setLoading, 2000)}>Refresh (2 s)</Button>
          <Button variant="outline" onClick={() => run(setLoading, 100)}>
            Quick refresh (no flash)
          </Button>
        </div>
        <LoadingOverlay loading={loading} message="Refreshing payments…" className="rounded-xl">
          <Card>
            <CardHeader>
              <CardTitle>Recent payments</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="gap-2 text-sm grid">
                {payments.map(([name, amount]) => (
                  <li key={name} className="flex justify-between">
                    <span>{name}</span>
                    <span className="tabular-nums">{amount}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </LoadingOverlay>
      </DemoSection>
      <DemoSection title="Always on" className="max-w-md grid">
        <LoadingOverlay loading delay={0} className="rounded-lg border">
          <p className="p-6 text-sm">Content underneath is inert while loading.</p>
        </LoadingOverlay>
      </DemoSection>
      <DemoSection title="Full screen">
        <Button variant="outline" onClick={() => run(setFull, 1500)}>
          Submit application
        </Button>
        <LoadingOverlay loading={full} fullScreen message="Submitting…" />
      </DemoSection>
    </DemoPage>
  )
}
