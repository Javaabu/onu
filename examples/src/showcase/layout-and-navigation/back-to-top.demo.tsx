import * as React from "react"
import { BackToTop } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"
import { useDhivehi } from "./_demo-nav"

export const meta = {
  title: "Back to top",
  group: "Layout and navigation",
  order: 27,
  description: "Appears after scrolling; scrolls smoothly, or instantly with reduced motion.",
}

export default function BackToTopDemo() {
  const dv = useDhivehi()
  const box = React.useRef<HTMLDivElement>(null)
  const paragraphs = Array.from({ length: 30 }, (_, i) =>
    dv
      ? `ފަޤުރާ ${i + 1}: ދިވެހިރާއްޖޭގައި 1,192 ރަށް ހިމެނެއެވެ.`
      : `Paragraph ${i + 1}: the Maldives has 1,192 islands in 26 atolls.`,
  )
  return (
    <DemoPage>
      <DemoSection title="Inside a scroll container" description="Scroll the box." className="block">
        <div ref={box} className="h-72 p-4 text-sm relative overflow-y-auto rounded-xl border">
          {paragraphs.map((p) => (
            <p key={p} className="mb-3">
              {p}
            </p>
          ))}
          <div className="bottom-0 sticky flex justify-end">
            <BackToTop scrollContainer={box} threshold={150} position="static" showLabel />
          </div>
        </div>
      </DemoSection>
      <DemoSection title="Page (fixed)" description="Scroll this page: a round button appears at the bottom end.">
        <BackToTop threshold={300} />
        <BackToTop alwaysVisible position="static" />
      </DemoSection>
    </DemoPage>
  )
}
