import * as React from "react"
import {
  Button,
  Checkbox,
  ConditionalDisplay,
  FormField,
  NativeSelect,
  NativeSelectOption,
  TextInput,
} from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Conditional display",
  group: "Display and feedback",
  order: 13,
  description:
    "Show/hide or enable/disable fields from another field's value. Hidden fields are disabled, so they don't submit. With react-hook-form pass `control` and `name` instead of `value`.",
}

export default function ConditionalDisplayDemo() {
  const [type, setType] = React.useState("person")
  const [hasVehicle, setHasVehicle] = React.useState(false)
  const [submitted, setSubmitted] = React.useState("")

  return (
    <DemoPage>
      <DemoSection
        title="Show, hide and enable"
        description="Submit to see which fields are sent: hidden ones are left out."
        className="max-w-md gap-4 grid"
      >
        <form
          className="gap-4 grid"
          onSubmit={(e) => {
            e.preventDefault()
            const data = Object.fromEntries(new FormData(e.currentTarget))
            setSubmitted(JSON.stringify(data, null, 2))
          }}
        >
          <FormField label="Applicant type" name="applicant_type">
            <NativeSelect value={type} onChange={(e) => setType(e.target.value)}>
              <NativeSelectOption value="person">Person</NativeSelectOption>
              <NativeSelectOption value="company">Company</NativeSelectOption>
            </NativeSelect>
          </FormField>
          <ConditionalDisplay value={type} when="company">
            <FormField label="Company name" name="company_name">
              <TextInput placeholder="Javaabu Pvt Ltd" />
            </FormField>
          </ConditionalDisplay>
          <ConditionalDisplay value={type} when="person">
            <FormField label="ID card number" name="id_card">
              <TextInput placeholder="A123456" />
            </FormField>
          </ConditionalDisplay>
          <div className="gap-2 text-sm flex items-center">
            <Checkbox id="has-vehicle" checked={hasVehicle} onCheckedChange={(v) => setHasVehicle(v === true)} />
            <label htmlFor="has-vehicle">I have a registered vehicle</label>
          </div>
          <ConditionalDisplay value={hasVehicle} action="enable">
            <FormField label="Plate number" name="plate" help="Enabled when the box above is ticked.">
              <TextInput placeholder="P-1234" />
            </FormField>
          </ConditionalDisplay>
          <ConditionalDisplay value={type} when="company" action="hide">
            <p className="text-sm text-muted-foreground">Individuals pay MVR 100; companies pay MVR 500.</p>
          </ConditionalDisplay>
          <Button type="submit" className="justify-self-start">
            Submit
          </Button>
        </form>
        {submitted ? <pre className="p-3 text-xs rounded-md bg-muted">{submitted}</pre> : null}
      </DemoSection>
    </DemoPage>
  )
}
