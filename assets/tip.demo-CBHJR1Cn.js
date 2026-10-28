var e=`import { Button, Icon, Tip } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Tooltip",
  group: "Overlays",
  order: 6,
  description: "Tip: hover or focus on desktop, tap or long press on touch. Never the only place for information.",
}

export default function TipDemo() {
  return (
    <DemoPage>
      <DemoSection title="Info button" description="Without children, Tip renders an ⓘ button (tap to show on touch).">
        <span className="gap-1 text-sm inline-flex items-center">
          Service charge
          <Tip content="A 10% service charge applies to all bookings made in resorts." />
        </span>
        <span className="gap-1 text-sm inline-flex items-center" lang="dv">
          ޖީއެސްޓީ
          <Tip content="ޖީއެސްޓީ 8% ހިމެނޭ" />
        </span>
      </DemoSection>

      <DemoSection
        title="Icon buttons"
        description="The button has its own action, so on touch the tip opens with a long press."
      >
        <Tip content="Edit (E)">
          <Button size="icon" variant="outline" aria-label="Edit" onClick={() => undefined}>
            <Icon name="edit" />
          </Button>
        </Tip>
        <Tip content="Print receipt" side="bottom">
          <Button size="icon" variant="outline" aria-label="Print receipt" onClick={() => window.print()}>
            <Icon name="print" />
          </Button>
        </Tip>
        <Tip content="Download as PDF" side="right">
          <Button size="icon" variant="outline" aria-label="Download as PDF" onClick={() => undefined}>
            <Icon name="download" />
          </Button>
        </Tip>
      </DemoSection>

      <DemoSection title="Truncated text" description="Full text in a tip; it is also in the accessible name.">
        <Tip content="Ministry of Housing, Land and Urban Development, Malé">
          <button type="button" className="max-w-40 text-sm truncate underline decoration-dotted">
            Ministry of Housing, Land and Urban Development, Malé
          </button>
        </Tip>
      </DemoSection>

      <DemoSection title="Disabled">
        <Tip content="Never shown" disabled>
          <Button variant="outline">No tip</Button>
        </Tip>
      </DemoSection>
    </DemoPage>
  )
}
`;export{e as default};