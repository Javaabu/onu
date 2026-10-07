import { Badge, Button, Checkbox, Input, Label, Switch } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = { title: "Primitives smoke test", group: "Foundations", order: 99 }

export default function PrimitivesDemo() {
  return (
    <DemoPage>
      <DemoSection title="Buttons">
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Delete</Button>
        <Button variant="link">Link</Button>
      </DemoSection>
      <DemoSection title="Inputs" className="max-w-sm gap-3 grid">
        <Label htmlFor="name">Name</Label>
        <Input id="name" placeholder="Ahmed Ali" />
        <Label htmlFor="dv" lang="dv">
          ނަން
        </Label>
        <Input id="dv" lang="dv" dir="rtl" placeholder="އަޙްމަދު ޢަލީ" />
        <div className="gap-2 flex items-center">
          <Checkbox id="c" defaultChecked />
          <Label htmlFor="c">Remember me</Label>
          <Switch defaultChecked />
          <Badge>New</Badge>
        </div>
      </DemoSection>
    </DemoPage>
  )
}
