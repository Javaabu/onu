import { FormField, OnuProvider, WeekPicker } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Week picker",
  group: "Date and time",
  order: 9,
  description: "Click any day to pick its whole week; hovering previews the week.",
}

export default function WeekPickerDemo() {
  return (
    <DemoPage>
      <DemoSection title="Basic" className="max-w-md gap-4 grid">
        <FormField label="Roster week" name="roster_week" help="Posts the first day of the week">
          <WeekPicker defaultValue={new Date(2026, 2, 8)} />
        </FormField>
        <FormField label="Week starting Monday">
          <WeekPicker weekStartsOn={1} />
        </FormField>
      </DemoSection>
      <DemoSection title="States" className="max-w-md gap-4 grid">
        <FormField label="Disabled" disabled>
          <WeekPicker defaultValue={new Date(2026, 2, 8)} />
        </FormField>
      </DemoSection>
      <DemoSection title="ދިވެހި" className="max-w-md gap-4 grid">
        <OnuProvider locale="dv" syncDocument={false}>
          <div dir="rtl" lang="dv">
            <FormField label="ހަފްތާ">
              <WeekPicker defaultValue={new Date(2026, 2, 8)} />
            </FormField>
          </div>
        </OnuProvider>
      </DemoSection>
    </DemoPage>
  )
}
