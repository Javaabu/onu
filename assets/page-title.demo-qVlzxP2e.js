var e=`import { Avatar, AvatarFallback, Breadcrumbs, Button, Icon, PageTitle } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"
import { DemoNav, useDhivehi } from "./_demo-nav"

export const meta = {
  title: "Page title",
  group: "Layout and navigation",
  order: 10,
  description:
    "The page header of index, view and edit pages (§25.6, §25.8): title, main action, and secondary links where a dot marks a non-empty Trash.",
}

export default function PageTitleDemo() {
  const dv = useDhivehi()
  return (
    <DemoNav>
      {() => (
        <DemoPage>
          <DemoSection title="Index page (§25.6)" className="block">
            <PageTitle
              title={dv ? "މެމްބަރުން" : "Users"}
              action={
                <Button>
                  <Icon name="add" />
                  {dv ? "އައު މެމްބަރެއް" : "New user"}
                </Button>
              }
              links={[{ label: dv ? "ކުނިފޮށި" : "Trash", href: "/users/trash", icon: "trash", dot: true }]}
            />
          </DemoSection>
          <DemoSection title="Record page (§25.8)" className="block">
            <PageTitle
              breadcrumbs={
                <Breadcrumbs
                  items={[
                    { label: dv ? "މެމްބަރުން" : "Users", href: "/users" },
                    { label: dv ? "އައިޝަތު ޝިފާ" : "Aishath Shifa" },
                  ]}
                />
              }
              media={
                <Avatar size="lg">
                  <AvatarFallback>AS</AvatarFallback>
                </Avatar>
              }
              title={dv ? "އައިޝަތު ޝިފާ" : "Aishath Shifa"}
              description="shifa@example.mv · Hulhumalé"
              links={[
                { label: dv ? "ހުރިހާ މެމްބަރުން" : "All users", href: "/users", icon: "back" },
                { label: dv ? "ކުނިފޮށި" : "Trash", href: "/users/trash", icon: "trash", count: 4, dot: true },
              ]}
              actions={
                <Button variant="outline">
                  <Icon name="history" />
                  {dv ? "ލޮގްތައް" : "Logs"}
                </Button>
              }
              action={
                <Button variant="destructive">
                  <Icon name="trash" />
                  {dv ? "ފުހެލާ" : "Delete"}
                </Button>
              }
            />
          </DemoSection>
          <DemoSection title="Empty trash (no dot)" className="block">
            <PageTitle
              title={dv ? "ފައިސާ" : "Payments"}
              description={dv ? "ފަހު 30 ދުވަސް" : "Last 30 days · MVR 48,250.00"}
              action={<Button>{dv ? "ބިލެއް ހަދާ" : "Create invoice"}</Button>}
              links={[{ label: dv ? "ކުނިފޮށި" : "Trash", href: "/payments/trash", icon: "trash" }]}
            />
          </DemoSection>
        </DemoPage>
      )}
    </DemoNav>
  )
}
`;export{e as default};