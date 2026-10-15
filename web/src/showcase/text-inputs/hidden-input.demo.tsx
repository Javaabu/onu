import * as React from "react"
import { Button, FormField, HiddenInput } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Hidden input",
  group: "Text inputs",
  order: 11,
  description: "A hidden form value that takes its name from a FormField.",
}

export default function HiddenInputDemo() {
  const [submitted, setSubmitted] = React.useState<string>("")
  return (
    <DemoPage>
      <DemoSection
        title="Submitting hidden values"
        description="Booleans become 1/0 and arrays become name[] — the shapes Laravel expects."
        className="max-w-md gap-4 grid"
      >
        <form
          className="gap-3 grid"
          onSubmit={(e) => {
            e.preventDefault()
            const data = new FormData(e.currentTarget)
            setSubmitted(JSON.stringify([...data.entries()], null, 2))
          }}
        >
          <FormField label="Island" name="island_id" hideLabel>
            <HiddenInput value={42} />
          </FormField>
          <HiddenInput name="is_featured" value={true} />
          <HiddenInput name="tags" value={["ferry", "transport"]} />
          <Button type="submit" className="w-fit">
            Submit
          </Button>
        </form>
        {submitted ? (
          <pre dir="ltr" className="p-3 text-xs overflow-x-auto rounded-lg bg-muted">
            {submitted}
          </pre>
        ) : null}
      </DemoSection>
    </DemoPage>
  )
}
