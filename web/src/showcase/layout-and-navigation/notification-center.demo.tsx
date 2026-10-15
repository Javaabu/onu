import * as React from "react"
import { Button, NotificationCenter, type NotificationItem } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"
import { DemoNav, useDhivehi } from "./_demo-nav"

export const meta = {
  title: "Notification centre",
  group: "Layout and navigation",
  order: 23,
  description:
    "Bell with the unread count; a popover on desktop and a bottom sheet on phones. Mark read, mark all read, empty state, and new items announced.",
}

export default function NotificationCenterDemo() {
  const dv = useDhivehi()
  const [items, setItems] = React.useState<NotificationItem[]>(() => {
    const now = Date.now()
    return [
      {
        id: "1",
        title: dv ? "އެޕްލިކޭޝަން ފާސްކުރެވިއްޖެ" : "Application approved",
        description: dv ? "ހުޅުމާލޭގެ ބިމުގެ ހުއްދަ" : "Your land permit for Hulhumalé was approved.",
        time: now - 5 * 60_000,
        variant: "success",
        icon: "success",
        href: "/applications/1",
      },
      {
        id: "2",
        title: dv ? "ފައިސާ ލިބިއްޖެ" : "Payment received",
        description: "MVR 1,250.00 · BML Transfer",
        time: now - 3 * 3600_000,
        variant: "info",
        icon: "credit-card",
      },
      {
        id: "3",
        title: dv ? "ލިޔުމެއް ބޭނުންވޭ" : "Document requested",
        description: dv ? "ގޭގެ ލިޔުން ފޮނުއްވާ" : "Please upload proof of address.",
        time: now - 2 * 86400_000,
        variant: "warning",
        icon: "warning",
        read: true,
      },
    ]
  })
  return (
    <DemoNav>
      {() => (
        <DemoPage>
          <DemoSection title="With notifications">
            <NotificationCenter
              notifications={items}
              viewAllHref="/notifications"
              onMarkRead={(id) => setItems((list) => list.map((n) => (n.id === id ? { ...n, read: true } : n)))}
              onMarkAllRead={() => setItems((list) => list.map((n) => ({ ...n, read: true })))}
            />
            <Button
              variant="outline"
              onClick={() =>
                setItems((list) => [
                  {
                    id: String(Date.now()),
                    title: dv
                      ? `އައު މެސެޖް ${list.length + 1}`
                      : `New message from Addu City Council (${list.length + 1})`,
                    time: Date.now(),
                    icon: "mail",
                  },
                  ...list,
                ])
              }
            >
              {dv ? "އައު ނޮޓިފިކޭޝަނެއް" : "Simulate a new notification"}
            </Button>
          </DemoSection>
          <DemoSection title="Empty">
            <NotificationCenter notifications={[]} />
          </DemoSection>
        </DemoPage>
      )}
    </DemoNav>
  )
}
