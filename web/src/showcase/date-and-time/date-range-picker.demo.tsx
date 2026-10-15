import * as React from "react"
import { DateRangePicker, FormField, OnuProvider, type DateRangeValue } from "@javaabu/onu"
import { dv } from "@javaabu/onu/locales/dv"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Date range",
  group: "Date and time",
  order: 4,
  description: "From and To fields; either may be empty; To is the end of its day (§25.4).",
}

export default function DateRangePickerDemo() {
  const [range, setRange] = React.useState<DateRangeValue>({ from: new Date(2026, 2, 1), to: null })
  return (
    <DemoPage>
      <DemoSection title="Dates" className="max-w-xl gap-4 grid">
        <FormField
          label="Leave period"
          help={`From ${range.from?.toLocaleString() ?? "—"} to ${range.to?.toLocaleString() ?? "—"}`}
        >
          <DateRangePicker value={range} onChange={setRange} name="leave" />
        </FormField>
        <FormField label="Reversed range" help="Shows the error message under the fields.">
          <DateRangePicker defaultValue={{ from: new Date(2026, 2, 20), to: new Date(2026, 2, 10) }} />
        </FormField>
      </DemoSection>
      <DemoSection title="Date-time range" className="max-w-xl gap-4 grid">
        <FormField label="Exam window">
          <DateRangePicker withTime hourCycle={24} />
        </FormField>
      </DemoSection>
      <DemoSection
        title="Narrow column"
        description="Stacks when its container is narrow."
        className="max-w-56 gap-4 grid"
      >
        <FormField label="Period">
          <DateRangePicker labels={{ from: "Check-in", to: "Check-out" }} />
        </FormField>
      </DemoSection>
      <DemoSection title="ދިވެހި" className="max-w-xl gap-4 grid">
        <OnuProvider locale={dv} syncDocument={false}>
          <div dir="rtl" lang="dv">
            <FormField label="ޗުއްޓީގެ މުއްދަތު">
              <DateRangePicker defaultValue={{ from: new Date(2026, 2, 1), to: new Date(2026, 2, 5) }} />
            </FormField>
          </div>
        </OnuProvider>
      </DemoSection>
    </DemoPage>
  )
}
