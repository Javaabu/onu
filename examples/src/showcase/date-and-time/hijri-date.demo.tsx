import { FormField, HijriCalendar, HijriDate, HijriDatePicker, OnuProvider } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Hijri date",
  group: "Date and time",
  order: 6,
  description: "Umm al-Qura Hijri dates, shown and picked, with Dhivehi month names.",
}

const today = new Date()

export default function HijriDateDemo() {
  return (
    <DemoPage>
      <DemoSection title="Display" className="gap-2 grid">
        <HijriDate date={today} />
        <HijriDate date={today} format="short" showGregorian />
        <HijriDate date={today} format="numeric" />
        <OnuProvider locale="dv" syncDocument={false}>
          <p dir="rtl" lang="dv">
            <HijriDate date={today} showGregorian />
          </p>
        </OnuProvider>
      </DemoSection>
      <DemoSection title="Picker" className="max-w-md gap-4 grid">
        <FormField label="Date of the event" name="event_date" help="The value stays Gregorian (yyyy-MM-dd).">
          <HijriDatePicker />
        </FormField>
        <OnuProvider locale="dv" syncDocument={false}>
          <div dir="rtl" lang="dv">
            <FormField label="ހިޖްރީ ތާރީޚު">
              <HijriDatePicker defaultValue={today} />
            </FormField>
          </div>
        </OnuProvider>
      </DemoSection>
      <DemoSection title="Inline calendar">
        <HijriCalendar className="rounded-lg border" />
      </DemoSection>
    </DemoPage>
  )
}
