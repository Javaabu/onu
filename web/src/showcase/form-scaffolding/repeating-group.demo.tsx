import * as React from "react"
import { FormField, FormGroup, RepeatingGroup, TextInput } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Repeating group",
  group: "Form scaffolding",
  order: 10,
  description: "Add, remove and reorder rows of fields, with min/max and names like items[0][name].",
}

interface LineItem {
  item: string
  qty: string
  price: string
}

interface Member {
  name: string
  relation: string
}

export default function RepeatingGroupDemo() {
  const [items, setItems] = React.useState<LineItem[]>([
    { item: "Fresh tuna (kg)", qty: "3", price: "85.00" },
    { item: "Rihaakuru (jar)", qty: "1", price: "120.00" },
  ])
  const [members, setMembers] = React.useState<Member[]>([{ name: "އާމިނަތު", relation: "މަންމަ" }])
  const total = items.reduce((sum, i) => sum + Number(i.qty || 0) * Number(i.price || 0), 0)

  const update = <T,>(set: React.Dispatch<React.SetStateAction<T[]>>, index: number, patch: Partial<T>) =>
    set((rows) => rows.map((r, i) => (i === index ? { ...r, ...patch } : r)))

  return (
    <DemoPage>
      <DemoSection title="Invoice line items" description="1 to 5 rows, reorderable." className="max-w-3xl grid">
        <RepeatingGroup<LineItem>
          label="Line items"
          name="items"
          value={items}
          onChange={setItems}
          createItem={() => ({ item: "", qty: "1", price: "" })}
          min={1}
          max={5}
          addLabel="Add line item"
        >
          {({ item, index, name }) => (
            <FormGroup columns={3}>
              <FormField label="Item" name={name("item")}>
                <TextInput value={item.item} onChange={(e) => update(setItems, index, { item: e.target.value })} />
              </FormField>
              <FormField label="Quantity" name={name("qty")}>
                <TextInput
                  inputMode="numeric"
                  dir="ltr"
                  value={item.qty}
                  onChange={(e) => update(setItems, index, { qty: e.target.value })}
                />
              </FormField>
              <FormField label="Unit price" name={name("price")}>
                <TextInput
                  inputMode="decimal"
                  dir="ltr"
                  endAddon="MVR"
                  value={item.price}
                  onChange={(e) => update(setItems, index, { price: e.target.value })}
                />
              </FormField>
            </FormGroup>
          )}
        </RepeatingGroup>
        <p className="text-sm font-medium tabular-nums">
          Total: MVR {total.toLocaleString("en", { minimumFractionDigits: 2 })}
        </p>
      </DemoSection>

      <DemoSection title="ދިވެހި (Thaana fields)" className="max-w-2xl grid">
        <div lang="dv" dir="rtl">
          <RepeatingGroup<Member>
            label="އާއިލާގެ މެމްބަރުން"
            name="members"
            value={members}
            onChange={setMembers}
            createItem={() => ({ name: "", relation: "" })}
            itemLabel={(i) => `މެމްބަރު ${i + 1}`}
            addLabel="މެމްބަރެއް އިތުރުކުރޭ"
          >
            {({ item, index, name }) => (
              <FormGroup columns={2}>
                <FormField label="ނަން" name={name("name")}>
                  <TextInput
                    thaana
                    value={item.name}
                    onChange={(e) => update(setMembers, index, { name: e.target.value })}
                  />
                </FormField>
                <FormField label="ގާތްކަން" name={name("relation")}>
                  <TextInput
                    thaana
                    value={item.relation}
                    onChange={(e) => update(setMembers, index, { relation: e.target.value })}
                  />
                </FormField>
              </FormGroup>
            )}
          </RepeatingGroup>
        </div>
      </DemoSection>

      <DemoSection title="Empty and disabled" className="max-w-2xl gap-6 grid">
        <RepeatingGroup label="Attachments" value={[] as string[]} onChange={() => {}} createItem={() => ""}>
          {() => null}
        </RepeatingGroup>
        <RepeatingGroup label="Locked" value={[{ id: 1 }]} disabled>
          {() => <p className="text-sm text-muted-foreground">Read only row</p>}
        </RepeatingGroup>
      </DemoSection>
    </DemoPage>
  )
}
