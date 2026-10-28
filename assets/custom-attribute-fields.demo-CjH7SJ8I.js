var e=`import * as React from "react"
import { Button, Switch, Label } from "@javaabu/onu"
import { CustomAttributeFields, type AttributeField, type AttributeValues } from "@javaabu/onu/editor"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Custom attribute fields",
  group: "Rich content",
  order: 6,
  description: "Form fields generated from a schema, with Laravel-style names and errors.",
}

const schema: AttributeField[] = [
  { name: "name", label: "Property name", type: "text", required: true, placeholder: "Coral Breeze Villa" },
  { name: "name_dv", label: "ނަން (ދިވެހިން)", type: "text", thaana: true },
  {
    name: "island",
    label: "Island",
    type: "select",
    required: true,
    options: ["Malé", "Hulhumalé", "Maafushi", "Hithadhoo"],
  },
  { name: "bedrooms", label: "Bedrooms", type: "number", min: 0, max: 20 },
  { name: "price", label: "Price per night (MVR)", type: "number", min: 0, step: 50, help: "Including taxes" },
  { name: "tenure", label: "Tenure", type: "radio", options: ["Freehold", "Leasehold"] },
  { name: "available_from", label: "Available from", type: "date" },
  { name: "check_in", label: "Check-in time", type: "time" },
  { name: "contact_email", label: "Contact email", type: "email" },
  { name: "contact_phone", label: "Contact phone", type: "tel", placeholder: "+960 7XX XXXX" },
  {
    name: "amenities",
    label: "Amenities",
    type: "multiselect",
    options: ["Pool", "Jetty", "Wi-Fi", "Generator", "Desalination"],
  },
  { name: "furnished", label: "Furnished", type: "boolean" },
  { name: "description", label: "Description", type: "textarea", maxLength: 500, help: "Shown on the listing page" },
  { name: "brand_colour", label: "Brand colour", type: "color", defaultValue: "#1f7a4d" },
]

const errors = {
  "attributes.name": ["The property name field is required."],
  "attributes.island": ["The selected island is invalid."],
}

export default function CustomAttributeFieldsDemo() {
  const [values, setValues] = React.useState<AttributeValues>({ bedrooms: 3, furnished: true, amenities: ["Pool"] })
  const [showErrors, setShowErrors] = React.useState(false)
  return (
    <DemoPage>
      <DemoSection
        title="Property attributes"
        description="Inputs are named attributes[name], attributes[amenities][] … ready for a Laravel controller."
        className="gap-4 grid"
      >
        <div className="gap-2 flex items-center">
          <Switch id="attr-errors" checked={showErrors} onCheckedChange={setShowErrors} />
          <Label htmlFor="attr-errors">Show server errors</Label>
        </div>
        <form
          className="gap-4 grid"
          onSubmit={(event) => {
            event.preventDefault()
            setShowErrors(true)
          }}
        >
          <CustomAttributeFields
            schema={schema}
            name="attributes"
            columns={2}
            value={values}
            onChange={setValues}
            errors={showErrors ? errors : undefined}
          />
          <div>
            <Button type="submit">Save property</Button>
          </div>
        </form>
        <pre className="p-3 text-xs overflow-auto rounded-md bg-muted" dir="ltr">
          {JSON.stringify(values, null, 2)}
        </pre>
      </DemoSection>
      <DemoSection title="Inline labels, disabled" className="gap-4 grid">
        <CustomAttributeFields schema={schema.slice(0, 6)} labelLayout="inline" disabled defaultValue={values} />
      </DemoSection>
    </DemoPage>
  )
}
`;export{e as default};