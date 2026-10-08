import * as React from "react"
import { DropzoneUploader, FormField, type DropzoneFile } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"
import { fakeUpload, scene } from "./_mock"

export const meta = { title: "Drag-and-drop uploader", group: "Files and media", order: 5 }

/** Files already saved on the record, as an edit page would load them. */
const saved: DropzoneFile[] = [
  { id: 101, name: "building-permit-hulhumale.pdf", size: 482_000, type: "application/pdf", url: "#" },
  {
    id: 102,
    name: "ސައިޓް-ފޮޓޯ.jpg",
    size: 1_240_000,
    type: "image/jpeg",
    thumbnailUrl: scene("Hulhumalé", 210, 160, 160),
  },
]

function EditPageDemo() {
  const [documents, setDocuments] = React.useState<DropzoneFile[]>(saved)
  return (
    <>
      <FormField
        label="Supporting documents"
        name="documents"
        className="min-w-0"
        help="Saved files are listed; remove or add more."
      >
        <DropzoneUploader
          upload={fakeUpload}
          value={documents}
          onValueChange={setDocuments}
          accept="image/*,.pdf"
          maxFiles={5}
          size="sm"
        />
      </FormField>
      <p className="text-xs text-muted-foreground">
        Submitted ids: <span className="font-mono">{documents.map((d) => ("id" in d ? d.id : d.name)).join(", ")}</span>
      </p>
    </>
  )
}

export default function DropzoneUploaderDemo() {
  return (
    <DemoPage>
      <DemoSection
        title="Uploading"
        description="Drop files, use Browse, or focus the button and paste an image from the clipboard."
        className="max-w-xl gap-4 grid"
      >
        <FormField label="Project photos" name="photos">
          <DropzoneUploader
            upload={fakeUpload}
            accept="image/*,.pdf"
            maxFiles={6}
            maxSize={8 * 1024 * 1024}
            description="Images or PDF, up to 8 MB each, 6 files"
          />
        </FormField>
      </DemoSection>
      <DemoSection
        title="Edit page: controlled value with saved files"
        description="value / onValueChange hold the saved files and every finished upload."
        className="max-w-xl gap-4 grid"
      >
        <EditPageDemo />
      </DemoSection>
      <DemoSection title="Collect only, single file, paste anywhere" className="max-w-xl gap-4 grid">
        <DropzoneUploader multiple={false} size="sm" pasteFromDocument description="Paste anywhere on the page" />
      </DemoSection>
      <DemoSection title="Large and disabled" className="max-w-xl gap-4 grid">
        <DropzoneUploader size="lg" />
        <DropzoneUploader disabled defaultValue={saved.slice(0, 1)} />
      </DemoSection>
    </DemoPage>
  )
}
