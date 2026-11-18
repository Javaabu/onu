import * as React from "react"
import { InlineEdit } from "@javaabu/onu"

// 2.5: clicking Cancel must not save first (Safari doesn't focus buttons on click).
export default function InlineEditHarness() {
  const [saved, setSaved] = React.useState<string[]>([])
  return (
    <div className="gap-4 grid">
      <InlineEdit label="Name" defaultValue="Aishath Shifa" onSave={(v) => setSaved((s) => [...s, v])} />
      <output data-testid="saves">{saved.join("|")}</output>
    </div>
  )
}
