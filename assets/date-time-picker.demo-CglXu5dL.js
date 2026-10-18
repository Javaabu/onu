var e=`import { DateTimePicker, FormField, OnuProvider } from "@javaabu/onu"
import { dv } from "@javaabu/onu/locales/dv"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Date-time picker",
  group: "Date and time",
  order: 3,
  description: "Calendar plus a time chip that swaps in the time steppers (§25.3).",
}

export default function DateTimePickerDemo() {
  return (
    <DemoPage>
      <DemoSection title="Basic" className="max-w-md gap-4 grid">
        <FormField label="Council meeting starts" help="Pick a day, then the clock chip for the time.">
          <DateTimePicker />
        </FormField>
        <FormField label="Vessel arrival" name="arrives_at" help="Posts 2026-03-12T14:30:00">
          <DateTimePicker defaultValue={new Date(2026, 2, 12, 14, 30)} />
        </FormField>
      </DemoSection>
      <DemoSection title="24-hour and custom format" className="max-w-md gap-4 grid">
        <FormField label="Flight departs (MLE)">
          <DateTimePicker hourCycle={24} minuteStep={10} format="d MMM yyyy, HH:mm" />
        </FormField>
      </DemoSection>
      <DemoSection title="States" className="max-w-md gap-4 grid">
        <FormField label="Required" required error="Choose when the exam starts.">
          <DateTimePicker />
        </FormField>
        <FormField label="Disabled" disabled>
          <DateTimePicker defaultValue={new Date(2026, 2, 12, 9, 0)} />
        </FormField>
      </DemoSection>
      <DemoSection title="ދިވެހި" className="max-w-md gap-4 grid">
        <OnuProvider locale={dv} syncDocument={false}>
          <div dir="rtl" lang="dv">
            <FormField label="ބައްދަލުވުން ފަށާ ވަގުތު">
              <DateTimePicker defaultValue={new Date(2026, 2, 12, 10, 0)} />
            </FormField>
          </div>
        </OnuProvider>
      </DemoSection>
    </DemoPage>
  )
}
`;export{e as default};