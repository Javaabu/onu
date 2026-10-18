var e=`import * as React from "react"
import { CopyInput, FormField } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Copy input",
  group: "Text inputs",
  order: 5,
  description: "A read-only value with a copy button that announces “Copied”.",
}

export default function CopyInputDemo() {
  const [copies, setCopies] = React.useState(0)
  return (
    <DemoPage>
      <DemoSection title="Basic" className="max-w-lg gap-4 grid">
        <FormField label="Share link" help="Anyone with the link can view the application status.">
          <CopyInput value="https://portal.gov.mv/track/REF-2026-00451" />
        </FormField>
        <FormField label="Reference number" help={\`Copied \${copies} time(s)\`}>
          <CopyInput value="REF-2026-00451" mono onCopy={() => setCopies((n) => n + 1)} />
        </FormField>
        <FormField label="ބޭންކް އެކައުންޓް ނަންބަރު">
          <CopyInput value="7730000123456" mono />
        </FormField>
      </DemoSection>
      <DemoSection title="Disabled" className="max-w-lg gap-4 grid">
        <FormField label="Invite link (expired)">
          <CopyInput value="https://example.mv/invite/expired" disabled />
        </FormField>
      </DemoSection>
    </DemoPage>
  )
}
`;export{e as default};