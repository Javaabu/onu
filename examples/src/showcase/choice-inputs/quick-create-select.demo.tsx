import * as React from "react"
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  FormField,
  QuickCreateSelect,
  TextInput,
  type ChoiceOption,
} from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Select with quick-create",
  group: "Choice inputs",
  order: 18,
  description: "Type something that isn't in the list and create it, inline or through a dialog.",
}

const categories: ChoiceOption[] = [
  { value: "1", label: "Infrastructure" },
  { value: "2", label: "Health" },
  { value: "3", label: "Education" },
]

export default function QuickCreateSelectDemo() {
  return (
    <DemoPage>
      <DemoSection title="Inline" className="max-w-md gap-4 grid">
        <FormField label="Category" help="Try “Tourism”.">
          <QuickCreateSelect
            options={categories}
            onCreate={(label) =>
              new Promise<ChoiceOption>((resolve) => setTimeout(() => resolve({ value: `new-${label}`, label }), 600))
            }
          />
        </FormField>
        <FormField label="Tags">
          <QuickCreateSelect options={categories} multiple onCreate={(label) => ({ value: label, label })} />
        </FormField>
      </DemoSection>
      <DemoSection title="Through a dialog" className="max-w-md gap-4 grid">
        <FormField label="Vendor">
          <QuickCreateSelect
            options={[
              { value: "v1", label: "Maldives Ports Ltd" },
              { value: "v2", label: "State Trading Organization" },
            ]}
            renderCreateDialog={({ query, open, onOpenChange, onCreated }) => (
              <CreateVendorDialog query={query} open={open} onOpenChange={onOpenChange} onCreated={onCreated} />
            )}
          />
        </FormField>
      </DemoSection>
    </DemoPage>
  )
}

function CreateVendorDialog({
  query,
  open,
  onOpenChange,
  onCreated,
}: {
  query: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (option: ChoiceOption) => void
}) {
  const [name, setName] = React.useState(query)
  const [tin, setTin] = React.useState("")
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New vendor</DialogTitle>
          <DialogDescription>The vendor is created and selected.</DialogDescription>
        </DialogHeader>
        <div className="gap-4 grid">
          <FormField label="Name" required>
            <TextInput value={name} onChange={(e) => setName(e.target.value)} />
          </FormField>
          <FormField label="TIN">
            <TextInput value={tin} onChange={(e) => setTin(e.target.value)} placeholder="1000123GST001" />
          </FormField>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => onCreated({ value: `v-${Date.now()}`, label: name, description: tin })}>
            Create vendor
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
