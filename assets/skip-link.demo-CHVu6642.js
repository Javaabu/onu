var e=`import { SkipLink } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Skip link",
  group: "Layout and navigation",
  order: 26,
  description:
    '"Skip to content": the first focusable element, hidden until focused. AppLayout adds one automatically.',
}

export default function SkipLinkDemo() {
  return (
    <DemoPage>
      <DemoSection
        title="Try it"
        description="Click in the box, then press Tab: the skip link appears at the top start of the page."
        className="block"
      >
        <div className="p-4 rounded-xl border" tabIndex={-1}>
          <SkipLink href="#skip-demo-target" />
          <nav aria-label="Demo" className="gap-3 text-sm flex flex-wrap">
            <a href="#a" className="underline">
              Link 1
            </a>
            <a href="#b" className="underline">
              Link 2
            </a>
            <a href="#c" className="underline">
              Link 3
            </a>
          </nav>
          <div
            id="skip-demo-target"
            className="mt-4 p-4 text-sm rounded-lg bg-muted outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            Main content receives focus.
          </div>
        </div>
      </DemoSection>
    </DemoPage>
  )
}
`;export{e as default};