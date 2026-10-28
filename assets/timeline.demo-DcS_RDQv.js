var e=`import * as React from "react"
import { Button, StatusBadge, Timeline, type TimelineItem } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"
import { useDhivehi } from "./_demo-nav"

export const meta = {
  title: "Timeline",
  group: "Layout and navigation",
  order: 19,
  description:
    "Vertical timeline with status icons and colours, localised timestamps and RTL support; also an activity feed grouped by day, with avatars and Load more.",
}

const minutesAgo = (n: number) => new Date(Date.now() - n * 60_000)

const initialActivity: TimelineItem[] = [
  { id: 1, actor: { name: "Aishath Shiuna" }, title: "approved the application", time: minutesAgo(12) },
  {
    id: 2,
    actor: { name: "Ahmed Ali" },
    title: "uploaded a document",
    description: "Lease agreement – H. Maafanu.pdf",
    time: minutesAgo(95),
  },
  {
    id: 3,
    icon: "settings",
    title: (
      <>
        Status changed to <StatusBadge status="pending" size="sm" />
      </>
    ),
    time: minutesAgo(60 * 20),
  },
  { id: 4, actor: { name: "މަރިޔަމް ޒާހިރާ" }, title: "ކޮމެންޓެއް ލިޔުއްވައިފި", time: minutesAgo(60 * 28) },
  { id: 5, actor: { name: "Mohamed Naseem" }, title: "created the record", time: minutesAgo(60 * 24 * 4) },
]

const olderActivity: TimelineItem[] = [
  { id: 6, actor: { name: "Ibrahim Waheed" }, title: "imported 312 users", time: minutesAgo(60 * 24 * 9) },
  { id: 7, icon: "upload", title: "Nightly backup completed", time: minutesAgo(60 * 24 * 10) },
]

export default function TimelineDemo() {
  const dv = useDhivehi()
  const day = 24 * 60 * 60 * 1000
  const [now] = React.useState(() => Date.now())
  const [activity, setActivity] = React.useState(initialActivity)
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
      <DemoSection
        title="Activity feed"
        description="\`groupByDay\`, \`actor\` avatars, relative times and \`hasMore\` / \`onLoadMore\`."
        className="max-w-lg block"
      >
        <Timeline
          title="Activity"
          groupByDay
          timeFormat="relative"
          items={activity}
          hasMore={activity.length < initialActivity.length + olderActivity.length}
          onLoadMore={async () => {
            await new Promise((r) => setTimeout(r, 800))
            setActivity((current) => [...current, ...olderActivity])
          }}
        />
      </DemoSection>
      <DemoSection title="Empty" className="max-w-lg block">
        <Timeline items={[]} />
      </DemoSection>
    </DemoPage>
  )
}
`;export{e as default};