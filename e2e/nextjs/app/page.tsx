import { Callout, Card, cn, Countdown, PageTitle, PublishBox, RelativeDate, StatusBadge, Timeline } from "@javaabu/onu"
import { toCsv } from "@javaabu/onu/export"
import { transliterate } from "@javaabu/onu/thaana"

import { ContactForm } from "@/components/contact-form"

// A Server Component rendering Onu's client components with serialisable props. The clock-based ones catch hydration
// mismatches; ContactForm is the "use client" boundary for props that are functions. `cn`, `transliterate` and `toCsv`
// run here, on the server: pure helpers have no "use client".
export default function HomePage() {
  return (
    <main className={cn("p-4", "p-6", "server-cn")}>
      <PageTitle title="Applications" />
      <Callout tone="info" title="Welcome" />
      <Card title="Recent">
        <StatusBadge status="success">Approved</StatusBadge>
      </Card>
      <Countdown to="2030-01-01T00:00:00Z" />
      <RelativeDate value="2025-12-31T00:00:00Z" />
      <PublishBox status="draft" publishAt="2030-03-01T00:00:00Z" />
      <Timeline groupByDay items={[{ id: "1", title: "Opened", time: "2026-01-01T00:00:00Z" }]} />
      <ContactForm />
      <pre data-testid="server-helpers">
        {`${transliterate("divehi")}|${toCsv([{ name: "Ali" }], [{ header: "Name", accessor: "name" }]).trim()}`}
      </pre>
    </main>
  )
}
