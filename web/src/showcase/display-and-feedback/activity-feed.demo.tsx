import * as React from "react"
import { ActivityFeed, StatusBadge, type ActivityItem } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"
import { minutesAgo } from "./_data"

export const meta = {
  title: "Activity feed",
  group: "Display and feedback",
  order: 18,
  description: "Who did what and when, grouped by day, with Load more.",
}

const initial: ActivityItem[] = [
  { id: 1, actor: { name: "Aishath Shiuna" }, action: "approved the application", timestamp: minutesAgo(12) },
  {
    id: 2,
    actor: { name: "Ahmed Ali" },
    action: "uploaded a document",
    detail: "Lease agreement – H. Maafanu.pdf",
    timestamp: minutesAgo(95),
  },
  {
    id: 3,
    icon: "settings",
    action: (
      <>
        Status changed to <StatusBadge status="pending" size="sm" />
      </>
    ),
    timestamp: minutesAgo(60 * 20),
  },
  { id: 4, actor: { name: "މަރިޔަމް ޒާހިރާ" }, action: "ކޮމެންޓެއް ލިޔުއްވައިފި", timestamp: minutesAgo(60 * 28) },
  { id: 5, actor: { name: "Mohamed Naseem" }, action: "created the record", timestamp: minutesAgo(60 * 24 * 4) },
]

const older: ActivityItem[] = [
  { id: 6, actor: { name: "Ibrahim Waheed" }, action: "imported 312 users", timestamp: minutesAgo(60 * 24 * 9) },
  { id: 7, icon: "upload", action: "Nightly backup completed", timestamp: minutesAgo(60 * 24 * 10) },
]

export default function ActivityFeedDemo() {
  const [items, setItems] = React.useState(initial)
  return (
    <DemoPage>
      <DemoSection title="Grouped by day" className="max-w-lg block">
        <ActivityFeed
          items={items}
          hasMore={items.length < initial.length + older.length}
          onLoadMore={async () => {
            await new Promise((r) => setTimeout(r, 800))
            setItems((current) => [...current, ...older])
          }}
        />
      </DemoSection>
      <DemoSection title="Empty" className="max-w-lg block">
        <ActivityFeed items={[]} />
      </DemoSection>
    </DemoPage>
  )
}
