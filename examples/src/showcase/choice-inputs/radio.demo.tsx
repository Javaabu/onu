import { Icon, Radio, RadioGroup } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Radio",
  group: "Choice inputs",
  order: 9,
  description: "One radio with a label, description or media. Compose them inside a RadioGroup.",
}

export default function RadioDemo() {
  return (
    <DemoPage>
      <DemoSection title="Radio children" className="max-w-md gap-4 grid">
        <RadioGroup aria-label="Collection" defaultValue="post">
          <Radio value="post" label="Collect from the post office" description="Usually within 3 working days" />
          <Radio value="courier" label="Courier to my address" description="MVR 50, next working day" />
          <Radio value="counter" label="Collect from the service counter" disabled />
        </RadioGroup>
      </DemoSection>
      <DemoSection title="Cards with media" className="max-w-xl gap-4 grid w-full">
        <RadioGroup aria-label="Plan" variant="card" orientation="horizontal" defaultValue="standard">
          <Radio value="standard" label="Standard" description="10 users" media={<Icon name="user" />} aside="Free" />
          <Radio value="team" label="Team" description="50 users" media={<Icon name="users" />} aside="MVR 450" />
          <Radio
            value="org"
            label="Organisation"
            description="Unlimited"
            media={<Icon name="building" />}
            aside="MVR 1,200"
          />
        </RadioGroup>
      </DemoSection>
    </DemoPage>
  )
}
