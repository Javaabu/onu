var e=`import { StackedTabs, Switch, Label } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"
import { useDhivehi } from "./_demo-nav"

export const meta = {
  title: "Stacked tabs",
  group: "Layout and navigation",
  order: 16,
  description: "Vertical tabs that become a select (or a horizontal scroller) in narrow containers.",
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

export default function StackedTabsDemo() {
  const dv = useDhivehi()
  const items = [
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
      <DemoSection title="Settings" description="Resize the window: the list becomes a select." className="block">
        <StackedTabs items={items} />
      </DemoSection>
      <DemoSection title="Scroller on narrow containers" className="max-w-md block">
        <StackedTabs items={items} mobile="scroll" defaultValue="members" />
      </DemoSection>
    </DemoPage>
  )
}
`;export{e as default};