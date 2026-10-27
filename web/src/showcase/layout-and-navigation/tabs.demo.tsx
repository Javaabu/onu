import * as React from "react"
import { Label, Switch, Tabs, TabsContent, TabsList, TabsTrigger } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"
import { useDhivehi } from "./_demo-nav"

export const meta = {
  title: "Tabs",
  group: "Layout and navigation",
  order: 14,
  description:
    "shadcn Tabs, extended with an items API, counts, badges, icons and a scrollable list. Vertical tabs can become a select (or a scroller) in narrow containers, and tabs without panels filter a listing. Arrow keys follow RTL.",
}

function Panel({ title, text }: { title: string; text: string }) {
  return (
    <div className="gap-3 p-4 grid rounded-xl border">
      <h3 className="font-medium">{title}</h3>
      <p className="text-muted-foreground">{text}</p>
      <div className="gap-2 flex items-center">
        <Switch id={title} defaultChecked />
        <Label htmlFor={title}>{title}</Label>
      </div>
    </div>
  )
}

export default function TabsDemo() {
  const dv = useDhivehi()
  const [status, setStatus] = React.useState("all")
  const statuses = [
    { value: "all", label: dv ? "ހުރިހާ" : "All", count: 312 },
    { value: "new", label: dv ? "އާ" : "New", count: 18 },
    { value: "done", label: dv ? "ނިމިފައި" : "Done", count: 294 },
    { value: "locked", label: dv ? "ބަންދު" : "Locked", disabled: true },
  ]
  const shown = statuses.find((s) => s.value === status)
  const items = [
    {
      value: "details",
      label: dv ? "ތަފްސީލު" : "Details",
      icon: "info",
      content: dv ? "މެމްބަރުގެ ތަފްސީލު" : "Member details",
    },
    {
      value: "documents",
      label: dv ? "ލިޔުންތައް" : "Documents",
      icon: "file",
      count: 4,
      content: dv ? "4 ލިޔުން" : "4 documents",
    },
    {
      value: "history",
      label: dv ? "ތާރީޚު" : "History",
      icon: "history",
      count: 128,
      content: dv ? "ބަދަލުތައް" : "Change history",
    },
    { value: "notes", label: dv ? "ނޯޓު" : "Notes", content: dv ? "ނޯޓެއް ނެތް" : "No notes" },
    { value: "locked", label: dv ? "ބަންދު" : "Locked", disabled: true, content: "" },
  ]
  const settings = [
    {
      value: "general",
      label: dv ? "އާންމު" : "General",
      icon: "settings",
      description: dv ? "ނަމާއި ލޯގޯ" : "Name and logo",
      content: (
        <Panel
          title={dv ? "އާންމު" : "General"}
          text={dv ? "ޖަމްޢިއްޔާގެ މަޢުލޫމާތު" : "Organisation name, logo and address."}
        />
      ),
    },
    {
      value: "members",
      label: dv ? "މެމްބަރުން" : "Members",
      icon: "users",
      badge: 3,
      content: (
        <Panel
          title={dv ? "މެމްބަރުން" : "Members"}
          text={dv ? "24 މެމްބަރުން" : "24 members, 3 pending invitations."}
        />
      ),
    },
    {
      value: "notifications",
      label: dv ? "ނޮޓިފިކޭޝަން" : "Notifications",
      icon: "bell",
      content: (
        <Panel
          title={dv ? "ނޮޓިފިކޭޝަން" : "Notifications"}
          text={dv ? "އީމެއިލް އަދި އެސްއެމްއެސް" : "Email and SMS alerts."}
        />
      ),
    },
    {
      value: "billing",
      label: dv ? "ފައިސާ" : "Billing",
      icon: "credit-card",
      content: <Panel title={dv ? "ފައިސާ" : "Billing"} text="MVR 1,250.00 / month" />,
    },
    { value: "danger", label: dv ? "ނުރައްކާ" : "Danger zone", icon: "warning", disabled: true },
  ]
  return (
    <DemoPage>
      <DemoSection title="Items API" className="block">
        <Tabs items={items} listLabel={dv ? "މެމްބަރު" : "Member"} />
      </DemoSection>
      <DemoSection title="Line variant" className="block">
        <Tabs items={items} variant="line" defaultValue="documents" />
      </DemoSection>
      <DemoSection
        title="Filter tabs above a listing"
        description="Items without content: no panels, aria-controls points at the list, counts as pills."
        className="gap-3 grid"
      >
        <Tabs
          variant="line"
          countAppearance="pill"
          listLabel={dv ? "ހާލަތުން ފިލްޓަރ" : "Filter by status"}
          controls="tabs-demo-list"
          value={status}
          onValueChange={setStatus}
          items={statuses}
        />
        <p id="tabs-demo-list" className="text-sm text-muted-foreground">
          {shown?.label}: {shown?.count}
        </p>
        <Tabs
          countAppearance="pill"
          listLabel={dv ? "ހާލަތުން ފިލްޓަރ" : "Filter by status"}
          value={status}
          onValueChange={setStatus}
          items={statuses}
        />
      </DemoSection>
      <DemoSection title="Vertical" className="block">
        <Tabs items={items.slice(0, 3)} orientation="vertical" />
      </DemoSection>
      <DemoSection
        title="Settings layout"
        description="Vertical tabs with narrow: resize the window and the list becomes a select."
        className="block"
      >
        <Tabs items={settings} orientation="vertical" narrow="select" />
      </DemoSection>
      <DemoSection title="Scroller on narrow containers" className="max-w-md block">
        <Tabs items={settings} orientation="vertical" narrow="scroll" defaultValue="members" />
      </DemoSection>
      <DemoSection title="Composed (shadcn API)" className="block">
        <Tabs defaultValue="a">
          <TabsList>
            <TabsTrigger value="a">{dv ? "ހުޅުމާލެ" : "Hulhumalé"}</TabsTrigger>
            <TabsTrigger value="b">{dv ? "ވިލިމާލެ" : "Vilimalé"}</TabsTrigger>
          </TabsList>
          <TabsContent value="a">{dv ? "ހުޅުމާލެ" : "Hulhumalé panel"}</TabsContent>
          <TabsContent value="b">{dv ? "ވިލިމާލެ" : "Vilimalé panel"}</TabsContent>
        </Tabs>
      </DemoSection>
    </DemoPage>
  )
}
