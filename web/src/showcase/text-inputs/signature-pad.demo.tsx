import * as React from "react"
import { SignaturePad } from "@javaabu/onu/media"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Signature pad",
  group: "Text inputs",
  order: 19,
  description: "Draw with finger, pen or mouse; undo, clear, or type your name instead.",
}

export default function SignaturePadDemo() {
  const [signature, setSignature] = React.useState<string | null>(null)
  return (
    <DemoPage>
      <DemoSection title="Applicant signature" className="max-w-lg gap-4 grid">
        <SignaturePad label="Applicant signature" onValueChange={setSignature} />
        {signature ? (
          <div className="gap-2 grid">
            <p className="text-sm text-muted-foreground">Exported PNG:</p>
            <img src={signature} alt="Captured signature" className="h-20 w-fit rounded-md border border-border" />
          </div>
        ) : null}
      </DemoSection>
      <DemoSection title="ސޮއި (Thaana name)" className="max-w-lg gap-4 grid">
        <SignaturePad label="ސޮއި" defaultMode="type" thaana />
      </DemoSection>
      <DemoSection title="Variants" className="max-w-lg gap-4 grid">
        <SignaturePad label="Draw only" allowTyped={false} penColor="#1d4ed8" classNames={{ canvas: "h-56" }} />
        <SignaturePad label="Disabled" disabled />
      </DemoSection>
    </DemoPage>
  )
}
