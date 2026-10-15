import { ShareButtons, toast } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Share buttons",
  group: "Display and feedback",
  order: 22,
  description: "Uses the device share sheet where available, with copy link and network fallbacks.",
}

const url = "https://example.gov.mv/news/new-ferry-routes"
const title = "New ferry routes to Hulhumalé"

export default function ShareButtonsDemo() {
  return (
    <DemoPage>
      <DemoSection title="Auto" description="On phones you get one Share button; on desktops the network buttons.">
        <ShareButtons url={url} title={title} onShare={(n) => toast(`Shared via ${n}`)} />
      </DemoSection>
      <DemoSection title="Networks only">
        <ShareButtons url={url} title={title} native="never" />
      </DemoSection>
      <DemoSection title="Icon only, small">
        <ShareButtons url={url} title={title} native="never" iconOnly size="sm" variant="ghost" />
      </DemoSection>
      <DemoSection title="A subset">
        <ShareButtons url={url} title={title} native="never" networks={["copy", "whatsapp", "viber", "email"]} />
      </DemoSection>
    </DemoPage>
  )
}
