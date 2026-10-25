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
      <FormField label="Supporting documents" name="documents" help="Saved files are listed; remove or add more.">
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
      <DemoSection
        title="Compact input: uploads on pick"
        description='appearance="input" swaps the drop area for a file input. Name a file with “fail” to see an error and retry.'
        className="max-w-md gap-4 grid"
      >
        <FormField
          label="BML transfer slip"
          name="slip_id"
          help="Uploaded straight away; the form submits the file id."
        >
          <DropzoneUploader
            appearance="input"
            multiple={false}
            upload={fakeUpload}
            accept="image/*,.pdf"
            maxSize={5 * 1024 * 1024}
          />
        </FormField>
        <FormField label="Supporting documents" name="supporting_documents">
          <DropzoneUploader appearance="input" upload={fakeUpload} />
        </FormField>
      </DemoSection>
      <DemoSection title="Built-in XHR uploader" className="max-w-md gap-4 grid">
        <pre
          dir="ltr"
          role="region"
          aria-label="Example code"
          // Focusable so the scrollable region can be scrolled by keyboard.
          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
          tabIndex={0}
          className="text-xs p-3 overflow-x-auto rounded-lg bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          {`<DropzoneUploader
  appearance="input"
  multiple={false}
  url="/api/uploads"
  uploadOptions={{ headers: { "X-CSRF-TOKEN": token } }}
/>`}
        </pre>
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
