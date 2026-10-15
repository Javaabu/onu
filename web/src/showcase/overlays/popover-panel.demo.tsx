import { Button, FormField, Icon, PopoverPanel, TextInput } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Popover",
  group: "Overlays",
  order: 5,
  description: "PopoverPanel: an anchored panel with title, body and footer; optionally a bottom sheet on phones.",
}

export default function PopoverPanelDemo() {
  return (
    <DemoPage>
      <DemoSection title="Basic">
        <PopoverPanel
          trigger={
            <Button variant="outline">
              <Icon name="user" />
              Account details
            </Button>
          }
          title="Aishath Ali"
          description="Senior officer · Hulhumalé"
        >
          <dl className="gap-x-4 gap-y-1 grid grid-cols-[auto_1fr]">
            <dt className="text-muted-foreground">Staff ID</dt>
            <dd>S-10442</dd>
            <dt className="text-muted-foreground">Phone</dt>
            <dd dir="ltr" className="text-start">
              +960 777 1234
            </dd>
          </dl>
        </PopoverPanel>
      </DemoSection>

      <DemoSection title="Form with footer and close button">
        <PopoverPanel
          trigger={<Button variant="outline">Set budget</Button>}
          title="Monthly budget"
          closeButton
          footer={<Button size="sm">Save</Button>}
        >
          <FormField label="Amount (MVR)">
            <TextInput inputMode="decimal" defaultValue="15,000.00" />
          </FormField>
        </PopoverPanel>
      </DemoSection>

      <DemoSection title="Bottom sheet on phones" description="Resize below 768px to see it become a bottom sheet.">
        <PopoverPanel
          mobile="sheet"
          trigger={
            <Button variant="outline">
              <Icon name="filter" />
              Filters
            </Button>
          }
          title="Filters"
          footer={<Button size="sm">Apply</Button>}
        >
          <FormField label="Island">
            <TextInput placeholder="e.g. Fuvahmulah" />
          </FormField>
        </PopoverPanel>
      </DemoSection>

      <DemoSection title="Sides">
        {(["top", "right", "bottom", "left"] as const).map((side) => (
          <PopoverPanel key={side} side={side} trigger={<Button variant="ghost">{side}</Button>} title={side}>
            Opens on the {side}.
          </PopoverPanel>
        ))}
      </DemoSection>
    </DemoPage>
  )
}
