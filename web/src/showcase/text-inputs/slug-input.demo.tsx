import * as React from "react"
import { FormField, SlugInput, TextInput } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Slug generator",
  group: "Text inputs",
  order: 15,
  description: "Generated from the title, editable on demand, with a URL preview. Works with Thaana titles.",
}

export default function SlugInputDemo() {
  const [title, setTitle] = React.useState("New ferry schedule for Hulhumalé")
  const [dvTitle, setDvTitle] = React.useState("ހުޅުމާލެ ފެރީގެ އާ ޝެޑިއުލް")
  return (
    <DemoPage>
      <DemoSection
        title="New post"
        description="The slug follows the title until you edit it. The lock button generates it again."
        className="max-w-lg gap-4 grid"
      >
        <FormField label="Title">
          <TextInput value={title} onChange={(e) => setTitle(e.target.value)} />
        </FormField>
        <FormField label="Slug">
          <SlugInput source={title} prefix="https://example.mv/news/" />
        </FormField>
      </DemoSection>
      <DemoSection title="Thaana title" className="max-w-lg gap-4 grid">
        <FormField label="ސުރުޚީ">
          <TextInput thaana thaanaToggle value={dvTitle} onChange={(e) => setDvTitle(e.target.value)} />
        </FormField>
        <FormField label="ސްލަގް">
          <SlugInput source={dvTitle} prefix="https://example.mv/dv/news/" />
        </FormField>
      </DemoSection>
      <DemoSection
        title="Edit page"
        description="An existing slug is kept until you unlock it."
        className="max-w-lg gap-4 grid"
      >
        <FormField label="Slug">
          <SlugInput source="Annual report 2025 (revised)" defaultValue="annual-report-2025" prefix="/reports/" />
        </FormField>
        <FormField label="Disabled">
          <SlugInput source="Archived page" disabled prefix="/pages/" />
        </FormField>
      </DemoSection>
    </DemoPage>
  )
}
