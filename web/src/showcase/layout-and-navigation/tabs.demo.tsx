import { Tabs, TabsContent, TabsList, TabsTrigger } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"
import { useDhivehi } from "./_demo-nav"

export const meta = {
  title: "Tabs",
  group: "Layout and navigation",
  order: 14,
  description: "shadcn Tabs, extended with an items API, counts, icons and a scrollable list. Arrow keys follow RTL.",
}

export default function TabsDemo() {
  const dv = useDhivehi()
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
  return (
    <DemoPage>
      <DemoSection title="Items API" className="block">
        <Tabs items={items} listLabel={dv ? "މެމްބަރު" : "Member"} />
      </DemoSection>
      <DemoSection title="Line variant" className="block">
        <Tabs items={items} variant="line" defaultValue="documents" />
      </DemoSection>
      <DemoSection title="Vertical" className="block">
        <Tabs items={items.slice(0, 3)} orientation="vertical" />
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
