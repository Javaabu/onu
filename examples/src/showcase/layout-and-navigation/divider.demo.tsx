import { Button, Divider } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"
import { useDhivehi } from "./_demo-nav"

export const meta = {
  title: "Divider",
  group: "Layout and navigation",
  order: 20,
  description: "A separator line, optionally with a label.",
}

export default function DividerDemo() {
  const dv = useDhivehi()
  return (
    <DemoPage>
      <DemoSection title="Horizontal" className="gap-6 grid">
        <Divider />
        <Divider variant="dashed" />
        <Divider label={dv ? "ނުވަތަ" : "or"} />
        <Divider label={dv ? "މިއަދު" : "Today"} align="start" />
        <Divider label={dv ? "ނިމުނީ" : "End of list"} align="end" variant="dashed" />
      </DemoSection>
      <DemoSection title="Sign in" className="gap-4 max-w-sm grid">
        <Button variant="outline">eFaas</Button>
        <Divider label={dv ? "ނުވަތަ" : "or"} />
        <Button>{dv ? "އީމެއިލް" : "Continue with email"}</Button>
      </DemoSection>
      <DemoSection title="Vertical" className="h-16 items-center">
        <span>{dv ? "ހުޅުމާލެ" : "Hulhumalé"}</span>
        <Divider orientation="vertical" />
        <span>{dv ? "މާލެ" : "Malé"}</span>
        <Divider orientation="vertical" label="·" />
        <span>{dv ? "ވިލިމާލެ" : "Vilimalé"}</span>
      </DemoSection>
    </DemoPage>
  )
}
