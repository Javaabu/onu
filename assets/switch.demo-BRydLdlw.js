var e=`import { FormField, Switch } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Switch",
  group: "Choice inputs",
  order: 11,
  description: "For settings that apply immediately.",
}

export default function SwitchDemo() {
  return (
    <DemoPage>
      <DemoSection title="Settings list" className="max-w-md gap-5 grid">
        <Switch
          label="Email notifications"
          description="A daily digest of new applications."
          labelPosition="start"
          className="ms-auto"
          classNames={{ root: "justify-between w-full" }}
          defaultChecked
        />
        <Switch
          label="SMS notifications"
          description="Only for status changes."
          labelPosition="start"
          classNames={{ root: "justify-between w-full" }}
        />
        <Switch label="Two-factor authentication" disabled defaultChecked />
      </DemoSection>
      <DemoSection title="Sizes, form field and Dhivehi" className="max-w-md gap-5 grid">
        <div className="gap-4 flex items-center">
          <Switch aria-label="Small" size="sm" defaultChecked />
          <Switch aria-label="Default" defaultChecked />
        </div>
        <FormField label="Publish">
          <Switch />
        </FormField>
        <Switch label="ނޯޓިފިކޭޝަން ފޮނުވާ" description="ކޮންމެ ދުވަހަކު އީމެއިލެއް" />
      </DemoSection>
    </DemoPage>
  )
}
`;export{e as default};