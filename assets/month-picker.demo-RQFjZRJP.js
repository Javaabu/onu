var e=`import { FormField, MonthPicker, OnuProvider, YearPicker } from "@javaabu/onu"
import { dv } from "@javaabu/onu/locales/dv"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Month / year picker",
  group: "Date and time",
  order: 5,
  description: "Pick a month or a year from a grid that zooms out to years.",
}

export default function MonthPickerDemo() {
  return (
    <DemoPage>
      <DemoSection title="Month" className="max-w-md gap-4 grid">
        <FormField label="Payroll month" name="payroll_month" help="Posts yyyy-MM">
          <MonthPicker defaultValue={new Date(2026, 2, 1)} />
        </FormField>
        <FormField label="Card expiry" help="Limited to the next five years">
          <MonthPicker format="MM/yy" min={new Date()} max={new Date(new Date().getFullYear() + 5, 11, 31)} />
        </FormField>
      </DemoSection>
      <DemoSection title="Year" className="max-w-md gap-4 grid">
        <FormField label="Year of graduation">
          <YearPicker />
        </FormField>
        <FormField label="Disabled" disabled>
          <YearPicker defaultValue={new Date(2024, 0, 1)} />
        </FormField>
      </DemoSection>
      <DemoSection title="ދިވެހި" className="max-w-md gap-4 grid">
        <OnuProvider locale={dv} syncDocument={false}>
          <div dir="rtl" lang="dv">
            <FormField label="މަސް">
              <MonthPicker defaultValue={new Date(2026, 6, 1)} />
            </FormField>
          </div>
        </OnuProvider>
      </DemoSection>
    </DemoPage>
  )
}
`;export{e as default};