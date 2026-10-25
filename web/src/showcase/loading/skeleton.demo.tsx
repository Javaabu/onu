import * as React from "react"
import {
  Button,
  FormField,
  SkeletonCard,
  SkeletonField,
  SkeletonTable,
  SkeletonText,
  TextInput,
  Textarea,
} from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Skeleton",
  group: "Loading",
  order: 2,
  description: "Skeleton presets for text, cards, tables and form fields.",
}

export default function SkeletonDemo() {
  const [loading, setLoading] = React.useState(true)
  return (
    <DemoPage>
      <DemoSection title="Text" className="gap-6 sm:grid-cols-3 grid">
        <SkeletonText />
        <SkeletonText lines={5} size="sm" />
        <SkeletonText lines={2} size="lg" widths={["40%", "80%"]} />
      </DemoSection>
      <DemoSection title="Cards" className="gap-4 sm:grid-cols-3 grid">
        <SkeletonCard />
        <SkeletonCard avatar lines={3} actions={2} />
        <SkeletonCard media lines={2} />
      </DemoSection>
      <DemoSection
        title="Table"
        description="Narrow containers show only the first two columns."
        className="gap-4 grid"
      >
        <SkeletonTable selectable />
        <div className="max-w-xs">
          <SkeletonTable rows={3} columns={5} />
        </div>
      </DemoSection>
      <DemoSection
        title="Form fields"
        description="Shaped like a FormField, so forms don't jump when their values arrive."
        className="max-w-md gap-4 grid"
      >
        <SkeletonField />
        <SkeletonField control="select" help />
        <SkeletonField control="textarea" />
        <SkeletonField control="checkbox" />
        <SkeletonField control="switch" />
        <SkeletonField showLabel={false} />
      </DemoSection>
      <DemoSection title="Inline labels" className="max-w-xl gap-4 grid">
        <SkeletonField labelLayout="inline" />
        <SkeletonField labelLayout="inline" control="textarea" help />
      </DemoSection>
      <DemoSection title="Loading a form" className="max-w-md gap-4 grid">
        <Button variant="outline" className="justify-self-start" onClick={() => setLoading((l) => !l)}>
          {loading ? "Show form" : "Show placeholders"}
        </Button>
        {loading ? (
          <>
            <SkeletonField />
            <SkeletonField control="textarea" />
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
