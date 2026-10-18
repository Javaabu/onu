var e=`import * as React from "react"
import { Button, Timeline } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"
import { useDhivehi } from "./_demo-nav"

export const meta = {
  title: "Timeline",
  group: "Layout and navigation",
  order: 19,
  description: "Vertical timeline with status icons and colours, localised timestamps and RTL support.",
}

export default function TimelineDemo() {
  const dv = useDhivehi()
  const day = 24 * 60 * 60 * 1000
  const [now] = React.useState(() => Date.now())
  return (
    <DemoPage>
      <DemoSection title="Application status tracker" className="max-w-xl block">
        <Timeline
          items={[
            {
              title: dv ? "އެޕްލިކޭޝަން ހުށަހެޅީ" : "Application submitted",
              description: dv ? "އޮންލައިންކޮށް" : "Submitted online through eFaas",
              time: now - 6 * day,
              status: "success",
            },
            {
              title: dv ? "ފީ ދެއްކި" : "Fee paid",
              description: "MVR 50.00 · BML Connect",
              time: now - 6 * day + 3600_000,
              status: "success",
            },
            {
              title: dv ? "ލިޔުންތައް ބަލަނީ" : "Documents under review",
              description: dv ? "ހުޅުމާލޭ އޮފީހުން" : "Hulhumalé service centre",
              time: now - 2 * day,
              status: "current",
            },
            {
              title: dv ? "އިތުރު ލިޔުމެއް ބޭނުންވޭ" : "Additional document requested",
              description: dv ? "ގޭގެ ލިޔުން" : "Proof of address",
              time: now - day,
              status: "warning",
              content: (
                <Button size="sm" variant="outline">
                  {dv ? "އަޕްލޯޑްކުރޭ" : "Upload"}
                </Button>
              ),
            },
            { title: dv ? "ފައިނަލް ހުއްދަ" : "Final approval", status: "pending" },
          ]}
        />
      </DemoSection>
      <DemoSection title="Relative times, small" className="max-w-xl block">
        <Timeline
          size="sm"
          timeFormat="relative"
          items={[
            { title: dv ? "ޕާސްވޯޑް ބަދަލުކުރި" : "Password changed", time: now - 3600_000, status: "info" },
            { title: dv ? "ލޮގިން ނާކާމިޔާބު" : "Failed sign-in", time: now - 3 * day, status: "error" },
            { title: dv ? "އެކައުންޓް ހެދީ" : "Account created", time: now - 90 * day },
          ]}
        />
      </DemoSection>
    </DemoPage>
  )
}
`;export{e as default};