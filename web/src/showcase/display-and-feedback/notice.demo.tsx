import { Notice } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Notice",
  group: "Display and feedback",
  order: 8,
  description: "A subtle inline hint, quieter than an alert.",
}

export default function NoticeDemo() {
  return (
    <DemoPage>
      <DemoSection title="Plain" className="grid">
        <Notice>Changes apply from the next billing period.</Notice>
        <Notice tone="info">Your documents are reviewed within 3 working days.</Notice>
        <Notice tone="success">All required documents are attached.</Notice>
        <Notice tone="warning">This record is locked while it is being reviewed.</Notice>
        <Notice tone="destructive">This action can't be undone.</Notice>
      </DemoSection>
      <DemoSection title="Subtle and bordered" className="max-w-lg grid">
        <Notice variant="subtle" tone="info" icon="clock">
          Last synced with the National Registration Bureau 5 minutes ago.
        </Notice>
        <Notice variant="bordered" tone="warning">
          Fees are charged in MVR. Card payments may include a bank fee.
        </Notice>
        <Notice variant="bordered" tone="info">
          ފޯމު ފުރިހަމަކުރުމަށް 10 މިނެޓު ހޭދަވާނެ.
        </Notice>
      </DemoSection>
    </DemoPage>
  )
}
