import { Button, Callout } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Alert",
  group: "Display and feedback",
  order: 7,
  description:
    "`Callout`: info, success, warning and destructive messages with actions and dismiss, or quiet inline notices.",
}

export default function CalloutDemo() {
  return (
    <DemoPage>
      <DemoSection title="Variants" className="grid">
        <Callout title="New this month" description="Online passport renewals are now available on eFaas." />
        <Callout
          variant="info"
          title="Office hours"
          description="The Malé service centre is open 8:00–14:00 during Ramazan."
        />
        <Callout
          variant="success"
          title="Application submitted"
          description="Reference APP-2026-00412. We'll email you when it's reviewed."
        />
        <Callout
          variant="warning"
          title="Permit expires in 5 days"
          description="Renew before 30 June to avoid a MVR 500 late fee."
        />
        <Callout
          variant="destructive"
          title="Payment failed"
          description="Your card was declined. No money was taken."
        />
      </DemoSection>
      <DemoSection title="Actions and dismiss" className="grid">
        <Callout
          variant="warning"
          dismissible
          title="Unverified email"
          description="Verify aishath@example.mv to receive notifications."
          actions={
            <>
              <Button size="sm">Resend link</Button>
              <Button size="sm" variant="ghost">
                Change email
              </Button>
            </>
          }
        />
        <Callout dismissible icon={false} description="A dismissible callout without an icon." />
      </DemoSection>
      <DemoSection title="Dhivehi" className="grid">
        <Callout
          variant="info"
          title="ރަސްމީ ބަންދު"
          description="ޖުލައި 26 ގައި ހުރިހާ ސަރވިސް ސެންޓަރުތަކެއް ބަންދުވާނެ."
          dismissible
        />
      </DemoSection>
      <DemoSection
        title="Inline notices"
        description="An inline appearance makes a quiet line of supporting text with an icon, not announced (role=note)."
        className="grid"
      >
        <Callout appearance="plain">Changes apply from the next billing period.</Callout>
        <Callout appearance="plain" variant="info">
          Your documents are reviewed within 3 working days.
        </Callout>
        <Callout appearance="plain" variant="success">
          All required documents are attached.
        </Callout>
        <Callout appearance="plain" variant="warning">
          This record is locked while it is being reviewed.
        </Callout>
        <Callout appearance="plain" variant="destructive">
          This action can't be undone.
        </Callout>
      </DemoSection>
      <DemoSection title="Subtle and bordered" className="max-w-lg grid">
        <Callout appearance="subtle" variant="info" icon="clock">
          Last synced with the National Registration Bureau 5 minutes ago.
        </Callout>
        <Callout appearance="bordered" variant="warning">
          Fees are charged in MVR. Card payments may include a bank fee.
        </Callout>
        <Callout appearance="bordered" variant="info">
          ފޯމު ފުރިހަމަކުރުމަށް 10 މިނެޓު ހޭދަވާނެ.
        </Callout>
      </DemoSection>
    </DemoPage>
  )
}
