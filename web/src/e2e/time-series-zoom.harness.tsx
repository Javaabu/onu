import * as React from "react"
import { Button } from "@javaabu/onu"
import { TimeSeriesChart } from "@javaabu/onu/charts"

const days = (n: number, start: string) =>
  Array.from({ length: n }, (_, i) => {
    const d = new Date(`${start}T00:00:00`)
    d.setDate(d.getDate() + i)
    return { date: d.toISOString().slice(0, 10), value: 100 + ((i * 37) % 50) }
  })

// 8.10: the zoom range after `data` changes.
export default function TimeSeriesZoomHarness() {
  const [short, setShort] = React.useState(false)
  return (
    <div className="gap-4 grid">
      <Button onClick={() => setShort(true)}>Switch data</Button>
      <TimeSeriesChart
        title="Visitors"
        data={short ? days(10, "2026-05-01") : days(60, "2026-01-01")}
        config={{ value: { label: "Visitors" } }}
        interval="day"
        brush
        animate={false}
      />
    </div>
  )
}
