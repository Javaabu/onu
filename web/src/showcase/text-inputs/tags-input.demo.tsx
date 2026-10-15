import * as React from "react"
import { FormField, TagsInput } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Tags input",
  group: "Text inputs",
  order: 20,
  description: "Enter or comma adds, Backspace removes, paste splits a list.",
}

const TOPICS = ["Transport", "Tourism", "Fisheries", "Health", "Education", "Housing", "Climate", "Ferry"]
const DV_TOPICS = ["ދަތުރުފަތުރު", "ފަތުރުވެރިކަން", "މަސްވެރިކަން", "ސިއްހަތު", "ތަޢުލީމު", "ގޯތިގެދޮރު"]

export default function TagsInputDemo() {
  const [tags, setTags] = React.useState(["Transport", "Ferry"])
  return (
    <DemoPage>
      <DemoSection
        title="With suggestions"
        description="Try pasting: Health, Housing, Climate"
        className="max-w-lg gap-4 grid"
      >
        <FormField label="Topics" help={`${tags.length} selected`}>
          <TagsInput value={tags} onValueChange={setTags} suggestions={TOPICS} placeholder="Add a topic" />
        </FormField>
        <FormField label="ޓެގްތައް">
          <TagsInput thaana thaanaToggle suggestions={DV_TOPICS} defaultValue={["ދަތުރުފަތުރު"]} />
        </FormField>
      </DemoSection>
      <DemoSection title="Options" className="max-w-lg gap-4 grid">
        <FormField label="Up to 3 keywords">
          <TagsInput max={3} defaultValue={["ferry", "schedule"]} />
        </FormField>
        <FormField label="Atoll codes" help="Upper-cased; at least 2 characters">
          <TagsInput transform={(t) => (t.trim().length >= 2 ? t.trim().toUpperCase() : null)} />
        </FormField>
      </DemoSection>
      <DemoSection title="States" className="max-w-lg gap-4 grid">
        <FormField label="Disabled">
          <TagsInput disabled defaultValue={["archived", "2024"]} />
        </FormField>
        <FormField label="With error" error="Add at least one tag">
          <TagsInput />
        </FormField>
      </DemoSection>
    </DemoPage>
  )
}
