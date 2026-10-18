var e=`import { FormField, MultipleDatePicker, OnuProvider } from "@javaabu/onu"
import { dv } from "@javaabu/onu/locales/dv"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Multiple-date picker",
  group: "Date and time",
  order: 8,
  description: "Pick any number of days from one calendar.",
}

export default function MultipleDatePickerDemo() {
  return (
    <DemoPage>
      <DemoSection title="Basic" className="max-w-md gap-4 grid">
        <FormField label="Training days" name="training_days" help="Posts training_days[]">
          <MultipleDatePicker defaultValue={[new Date(2026, 2, 3), new Date(2026, 2, 10)]} />
        </FormField>
        <FormField label="Up to three interview slots">
          <MultipleDatePicker maxSelected={3} disabledDates={{ dayOfWeek: [5, 6] }} />
        </FormField>
      </DemoSection>
      <DemoSection title="States" className="max-w-md gap-4 grid">
        <FormField label="Required" required error="Pick at least one day.">
          <MultipleDatePicker />
        </FormField>
        <FormField label="Disabled" disabled>
          <MultipleDatePicker defaultValue={[new Date(2026, 2, 3)]} />
        </FormField>
      </DemoSection>
      <DemoSection title="ދިވެހި" className="max-w-md gap-4 grid">
        <OnuProvider locale={dv} syncDocument={false}>
          <div dir="rtl" lang="dv">
            <FormField label="ތަމްރީނު ދުވަސްތައް">
              <MultipleDatePicker defaultValue={[new Date(2026, 2, 3), new Date(2026, 2, 10), new Date(2026, 2, 17)]} />
            </FormField>
          </div>
        </OnuProvider>
      </DemoSection>
    </DemoPage>
  )
}
`;export{e as default};