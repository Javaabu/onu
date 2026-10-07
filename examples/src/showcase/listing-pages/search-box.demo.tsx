import * as React from "react"
import { SearchBox } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = { title: "Search box", group: "Listing pages", order: 5 }

export default function SearchBoxDemo() {
  const [applied, setApplied] = React.useState("")
  const [dv, setDv] = React.useState("")
  return (
    <DemoPage>
      <DemoSection
        title="Submits on Enter or blur"
        description="Typing alone does nothing; Escape reverts unsaved text."
        className="gap-2 grid"
      >
        <SearchBox value={applied} onSearch={setApplied} placeholder="Search users…" />
        <p className="text-sm text-muted-foreground">Applied search: “{applied}”</p>
      </DemoSection>
      <DemoSection title="Thaana" className="gap-2 grid">
        <SearchBox thaana value={dv} onSearch={setDv} placeholder="ނަމުން ހޯދާ…" />
        <p className="text-sm text-muted-foreground" lang="dv">
          {dv}
        </p>
      </DemoSection>
      <DemoSection title="Disabled">
        <SearchBox disabled defaultValue="Malé" />
      </DemoSection>
    </DemoPage>
  )
}
