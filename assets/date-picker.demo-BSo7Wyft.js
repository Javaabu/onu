var e=`import * as React from "react"
import { Button, DatePicker, FormField, OnuProvider } from "@javaabu/onu"
import { dv } from "@javaabu/onu/locales/dv"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Date picker",
  group: "Date and time",
  order: 1,
  description: "A date field that opens a calendar (§25.1), or picks several dates, a week, a month or a year.",
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
        <FormField label="Joined on" help={\`Value: \${value ? value.toDateString() : "empty"}\`}>
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
        title="Several dates"
        description={'mode="multiple": click days to toggle them; the panel stays open until Done.'}
        className="max-w-md gap-4 grid"
      >
        <FormField label="Training days" name="training_days" help="Posts training_days[]">
          <DatePicker mode="multiple" defaultValue={[new Date(2026, 2, 3), new Date(2026, 2, 10)]} />
        </FormField>
        <FormField label="Up to three interview slots">
          <DatePicker mode="multiple" maxSelected={3} disabledDates={{ dayOfWeek: [5, 6] }} />
        </FormField>
        <FormField label="Required" required error="Pick at least one day.">
          <DatePicker mode="multiple" />
        </FormField>
      </DemoSection>

      <DemoSection
        title="Weeks"
        description={'mode="week": click any day to pick its whole week; hovering previews the week.'}
        className="max-w-md gap-4 grid"
      >
        <FormField label="Roster week" name="roster_week" help="Posts the first day of the week">
          <DatePicker mode="week" defaultValue={new Date(2026, 2, 8)} />
        </FormField>
        <FormField label="Week starting Monday">
          <DatePicker mode="week" weekStartsOn={1} />
        </FormField>
      </DemoSection>

      <DemoSection
        title="Months and years"
        description={'mode="month" and mode="year": a grid of 12 that zooms out to years.'}
        className="max-w-md gap-4 grid"
      >
        <FormField label="Payroll month" name="payroll_month" help="Posts yyyy-MM">
          <DatePicker mode="month" defaultValue={new Date(2026, 2, 1)} />
        </FormField>
        <FormField label="Card expiry" help="Limited to the next five years">
          <DatePicker mode="month" format="MM/yy" min={today} max={new Date(today.getFullYear() + 5, 11, 31)} />
        </FormField>
        <FormField label="Year of graduation">
          <DatePicker mode="year" />
        </FormField>
      </DemoSection>

      <DemoSection
        title="ދިވެހި"
        description="Dhivehi month and day names, right to left."
        className="max-w-md gap-4 grid"
      >
        <OnuProvider locale={dv} syncDocument={false}>
          <div dir="rtl" lang="dv" className="gap-4 grid">
            <FormField label="އުފަން ތާރީޚު">
              <DatePicker />
            </FormField>
            <FormField label="ތަމްރީނު ދުވަސްތައް">
              <DatePicker
                mode="multiple"
                defaultValue={[new Date(2026, 2, 3), new Date(2026, 2, 10), new Date(2026, 2, 17)]}
              />
            </FormField>
            <FormField label="ހަފްތާ">
              <DatePicker mode="week" defaultValue={new Date(2026, 2, 8)} />
            </FormField>
            <FormField label="މަސް">
              <DatePicker mode="month" defaultValue={new Date(2026, 6, 1)} />
            </FormField>
          </div>
        </OnuProvider>
      </DemoSection>
    </DemoPage>
  )
}
`;export{e as default};