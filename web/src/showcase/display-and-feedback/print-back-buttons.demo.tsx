import { BackButton, PrintButton } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Print and back buttons",
  group: "Display and feedback",
  order: 23,
  description: "Both hide themselves when printing. The back arrow mirrors in RTL.",
}

export default function PrintBackButtonsDemo() {
  return (
    <DemoPage>
      <DemoSection title="Defaults">
        <BackButton fallbackHref="#/" />
        <BackButton href="#/components">All components</BackButton>
        <PrintButton />
      </DemoSection>
      <DemoSection title="Icon only and variants">
        <BackButton iconOnly variant="outline" />
        <PrintButton iconOnly variant="ghost" />
        <PrintButton variant="default">Print receipt</PrintButton>
      </DemoSection>
    </DemoPage>
  )
}
