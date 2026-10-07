import * as React from "react"
import { Button, FormField, PlaceholderInput, TextInput, Textarea } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Placeholder input",
  group: "Loading",
  order: 3,
  description: "Skeleton shaped like a form field, so forms don't jump when their values arrive.",
}

export default function PlaceholderInputDemo() {
  const [loading, setLoading] = React.useState(true)
  return (
    <DemoPage>
      <DemoSection title="Controls" className="max-w-md gap-4 grid">
        <PlaceholderInput />
        <PlaceholderInput control="select" help />
        <PlaceholderInput control="textarea" />
        <PlaceholderInput control="checkbox" />
        <PlaceholderInput control="switch" />
        <PlaceholderInput label={false} />
      </DemoSection>
      <DemoSection title="Inline labels" className="max-w-xl gap-4 grid">
        <PlaceholderInput labelLayout="inline" />
        <PlaceholderInput labelLayout="inline" control="textarea" help />
      </DemoSection>
      <DemoSection title="Loading a form" className="max-w-md gap-4 grid">
        <Button variant="outline" className="justify-self-start" onClick={() => setLoading((l) => !l)}>
          {loading ? "Show form" : "Show placeholders"}
        </Button>
        {loading ? (
          <>
            <PlaceholderInput />
            <PlaceholderInput control="textarea" />
          </>
        ) : (
          <>
            <FormField label="Full name">
              <TextInput defaultValue="Hawwa Ibrahim" />
            </FormField>
            <FormField label="Address">
              <Textarea defaultValue="H. Seaview, Fuvahmulah" />
            </FormField>
          </>
        )}
      </DemoSection>
    </DemoPage>
  )
}
