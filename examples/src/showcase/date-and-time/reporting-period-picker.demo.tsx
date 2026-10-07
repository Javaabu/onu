import * as React from "react"
import { FormField, OnuProvider, ReportingPeriodPicker, type ReportingPeriod } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Reporting-period picker",
  group: "Date and time",
  order: 10,
  description: "Monthly, quarterly, yearly or custom periods with a configurable financial-year start.",
}

export default function ReportingPeriodPickerDemo() {
  const [period, setPeriod] = React.useState<ReportingPeriod | null>(null)
  return (
    <DemoPage>
      <DemoSection title="Calendar year" className="max-w-md gap-4 grid">
        <FormField
          label="Revenue report (MVR)"
          name="period"
          help={period ? `${period.type}: ${period.from.toDateString()} – ${period.to.toDateString()}` : "No period"}
        >
          <ReportingPeriodPicker value={period} onChange={setPeriod} />
        </FormField>
      </DemoSection>
      <DemoSection
        title="Financial year from July"
        description="Quarters and years follow the financial year."
        className="max-w-md gap-4 grid"
      >
        <FormField label="Budget period">
          <ReportingPeriodPicker fiscalYearStartMonth={6} defaultType="quarterly" />
        </FormField>
        <FormField label="Yearly only">
          <ReportingPeriodPicker fiscalYearStartMonth={6} types={["yearly"]} />
        </FormField>
      </DemoSection>
      <DemoSection title="ދިވެހި" className="max-w-md gap-4 grid">
        <OnuProvider locale="dv" syncDocument={false}>
          <div dir="rtl" lang="dv">
            <FormField label="ރިޕޯޓުގެ މުއްދަތު">
              <ReportingPeriodPicker />
            </FormField>
          </div>
        </OnuProvider>
      </DemoSection>
    </DemoPage>
  )
}
