import * as React from "react"
import { FormField, OnuProvider, TimePicker } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Time picker",
  group: "Date and time",
  order: 2,
  description: "Steppers with ▲/▼, AM/PM, a clock-face hour grid and a minute grid (§25.2).",
}

export default function TimePickerDemo() {
  const [value, setValue] = React.useState<Date | null>(new Date(2026, 2, 12, 14, 30))
  return (
    <DemoPage>
      <DemoSection title="12-hour" className="max-w-md gap-4 grid">
        <FormField label="Prayer room opens at" help="Click the hour or the minute for a grid. A and P switch AM/PM.">
          <TimePicker value={value} onChange={setValue} />
        </FormField>
        <FormField label="Ferry departs" help="15-minute grid">
          <TimePicker minuteStep={15} />
        </FormField>
      </DemoSection>

      <DemoSection title="24-hour" className="max-w-md gap-4 grid">
        <FormField label="Shift starts">
          <TimePicker hourCycle={24} defaultValue={new Date(2026, 2, 12, 6, 0)} />
        </FormField>
      </DemoSection>

      <DemoSection title="States" className="max-w-md gap-4 grid">
        <FormField label="Required" required>
          <TimePicker defaultValue={new Date(2026, 2, 12, 9, 0)} />
        </FormField>
        <FormField label="With an error" error="Closing time must be after opening time.">
          <TimePicker defaultValue={new Date(2026, 2, 12, 8, 0)} />
        </FormField>
        <FormField label="Disabled" disabled>
          <TimePicker defaultValue={new Date(2026, 2, 12, 17, 45)} />
        </FormField>
      </DemoSection>

      <DemoSection title="ދިވެހި" className="max-w-md gap-4 grid">
        <OnuProvider locale="dv" syncDocument={false}>
          <div dir="rtl" lang="dv">
            <FormField label="ހުޅުވާ ގަޑި">
              <TimePicker defaultValue={new Date(2026, 2, 12, 20, 15)} />
            </FormField>
          </div>
        </OnuProvider>
      </DemoSection>
    </DemoPage>
  )
}
