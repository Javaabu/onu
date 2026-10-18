var e=`import { Button, Callout } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Alert",
  group: "Display and feedback",
  order: 7,
  description: "\`Callout\`: info, success, warning and destructive messages with actions and dismiss.",
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
    </DemoPage>
  )
}
`;export{e as default};