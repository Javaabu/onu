var e=`import * as React from "react"
import { AdditionalFilesUpload, FormField, type AdditionalFilesValue } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"
import { scene } from "./_mock"

export const meta = { title: "Additional files upload", group: "Files and media", order: 6 }

const existing = [
  { id: 11, name: "Lease agreement (signed).pdf", url: "#", size: 482_000, description: "Signed on 12 March 2026" },
  {
    id: 12,
    name: "Shop front.jpg",
    url: scene("Shop front", 30),
    thumbnailUrl: scene("Shop front", 30, 120, 80),
    size: 1_240_000,
  },
  { id: 13, name: "Trade licence.pdf", url: "#", size: 96_000 },
]

export default function AdditionalFilesUploadDemo() {
  const [value, setValue] = React.useState<AdditionalFilesValue>({ removed: [], added: [] })
  return (
    <DemoPage>
      <DemoSection title="Existing and new attachments" className="max-w-2xl gap-4 grid">
        <FormField
          label="Attachments"
          help="Remove (and restore) saved files, or add new ones with a name and description."
        >
          <AdditionalFilesUpload
            existing={existing}
            value={value}
            onChange={setValue}
            maxFiles={6}
            name="attachments"
          />
        </FormField>
        <pre className="text-xs p-3 overflow-x-auto rounded-lg bg-muted">
          {JSON.stringify(
            {
              removed: value.removed,
              added: value.added.map((a) => ({ file: a.file.name, name: a.name, description: a.description })),
            },
            null,
            2,
          )}
        </pre>
      </DemoSection>
      <DemoSection title="Thaana fields, empty" className="max-w-2xl gap-4 grid">
        <AdditionalFilesUpload thaana withDescription aria-label="ފައިލު އިތުރުކުރޭ" />
      </DemoSection>
      <DemoSection title="Disabled" className="max-w-2xl gap-4 grid">
        <AdditionalFilesUpload existing={existing.slice(0, 1)} disabled />
      </DemoSection>
    </DemoPage>
  )
}
`;export{e as default};