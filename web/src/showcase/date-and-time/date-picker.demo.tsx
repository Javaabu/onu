import * as React from "react"
import { Button, DatePicker, FormField, OnuProvider } from "@javaabu/onu"
import { dv } from "@javaabu/onu/locales/dv"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Date picker",
  group: "Date and time",
  order: 1,
  description: "A date field that opens a calendar with month, year and year-range views (§25.1).",
}

export default function DatePickerDemo() {
  const [value, setValue] = React.useState<Date | null>(new Date(2026, 2, 12))
  const [posted, setPosted] = React.useState("")
  const today = new Date()
  return (
    <DemoPage>
      <DemoSection title="Basic" className="max-w-md gap-4 grid">
        <FormField label="Date of birth" help="Click the month and year to jump through months and years.">
          <DatePicker />
        </FormField>
        <FormField label="Joined on" help={`Value: ${value ? value.toDateString() : "empty"}`}>
          <DatePicker value={value} onChange={setValue} />
        </FormField>
      </DemoSection>

      <DemoSection title="Formats and limits" className="max-w-md gap-4 grid">
        <FormField label="Appointment" help="Only the next 30 days; Fridays are closed.">
          <DatePicker
            min={today}
            max={new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30)}
            disabledDates={{ dayOfWeek: [5] }}
            format="EEEE, d MMMM yyyy"
          />
        </FormField>
        <FormField label="Week starts on Monday, with week numbers">
          <DatePicker weekStartsOn={1} showWeekNumber />
        </FormField>
      </DemoSection>

      <DemoSection title="States" className="max-w-md gap-4 grid">
        <FormField label="Required (no Clear button)" required>
          <DatePicker defaultValue={new Date(2026, 0, 15)} />
        </FormField>
        <FormField label="With an error" error="The issue date must be before the expiry date." name="issued_on">
          <DatePicker defaultValue={new Date(2027, 5, 1)} />
        </FormField>
        <FormField label="Disabled" disabled>
          <DatePicker defaultValue={new Date(2026, 2, 12)} />
        </FormField>
        <div className="gap-2 flex flex-wrap">
          <DatePicker aria-label="Small" size="sm" className="w-40" />
          <DatePicker aria-label="Large" size="lg" className="w-48" />
        </div>
      </DemoSection>

      <DemoSection
        title="Plain HTML / Laravel forms"
        description="With a name, a hidden input posts yyyy-MM-dd."
        className="max-w-md gap-4 grid"
      >
        <form
          className="gap-3 grid"
          onSubmit={(e) => {
            e.preventDefault()
            const data = new FormData(e.currentTarget)
            setPosted(new URLSearchParams(data as unknown as Record<string, string>).toString())
          }}
        >
          <FormField label="Licence expiry" name="licence_expires_on">
            <DatePicker defaultValue={new Date(2028, 6, 31)} />
          </FormField>
          <Button type="submit" variant="outline" className="justify-self-start">
            Show posted value
          </Button>
          {posted ? <code className="text-xs">{posted}</code> : null}
        </form>
      </DemoSection>

      <DemoSection
        title="ދިވެހި"
        description="Dhivehi month and day names, right to left."
        className="max-w-md gap-4 grid"
      >
        <OnuProvider locale={dv} syncDocument={false}>
          <div dir="rtl" lang="dv">
            <FormField label="އުފަން ތާރީޚު">
              <DatePicker />
            </FormField>
          </div>
        </OnuProvider>
      </DemoSection>
    </DemoPage>
  )
}
