import { NavTabs } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"
import { DemoNav, useDhivehi } from "./_demo-nav"

export const meta = {
  title: "Nav tabs",
  group: "Layout and navigation",
  order: 15,
  description:
    'Link-based tabs for record pages (§25.8): each tab is its own page, counts like "Activity (12)", the current page highlighted, scrollable on phones.',
}

export default function NavTabsDemo() {
  const dv = useDhivehi()
  const items = [
    { label: dv ? "ޕްރޮފައިލް" : "Profile", href: "/users/12", icon: "user" },
    { label: dv ? "ބަދަލުކުރޭ" : "Edit", href: "/users/12/edit", icon: "edit" },
    { label: dv ? "ހަރަކާތްތައް" : "Activity", href: "/users/12/activity", icon: "history", count: 12 },
    { label: dv ? "ލިޔުންތައް" : "Documents", href: "/users/12/documents", icon: "file", count: 3 },
    { label: dv ? "ފައިސާ" : "Payments", href: "/users/12/payments", icon: "credit-card", badge: 1 },
    { label: dv ? "ނޯޓު" : "Notes", href: "/users/12/notes", icon: "file-text" },
  ]
  return (
    <DemoPage>
      <DemoSection title="Record tabs" className="block">
        <DemoNav initial="/users/12/activity">
          {(current) => (
            <>
              <NavTabs items={items} currentHref={current} />
              <p className="mt-4 text-sm text-muted-foreground">{current}</p>
            </>
          )}
        </DemoNav>
      </DemoSection>
      <DemoSection title="Pill variant" className="block">
        <DemoNav initial="/users/12">
          {(current) => <NavTabs variant="pill" items={items.slice(0, 4)} currentHref={current} />}
        </DemoNav>
      </DemoSection>
      <DemoSection title="Create page (§25.9): tabs greyed out until saved" className="block">
        <NavTabs
          items={items.slice(0, 4).map((item, i) => ({ ...item, disabled: i > 1 }))}
          currentHref="/users/12/edit"
        />
      </DemoSection>
    </DemoPage>
  )
}
