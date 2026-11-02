var e=`import * as React from "react"
import { FileInput, FormField, type FileInputEntry } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"
import { fakeUpload, scene } from "./_mock"

export const meta = { title: "File input", group: "Files and media", order: 1 }

/** Files already saved on the record, as an edit page would load them. */
const saved: FileInputEntry[] = [
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
  const [documents, setDocuments] = React.useState<FileInputEntry[]>(saved)
  return (
    <>
      <FormField label="Supporting documents" name="documents" help="Saved files are listed; remove or add more.">
        <FileInput
          appearance="dropzone"
          multiple
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

export default function FileInputDemo() {
  return (
    <DemoPage>
      <DemoSection title="Basic" className="max-w-md gap-4 grid">
        <FormField label="National ID card" help="PDF or image, up to 2 MB." name="id_card" required>
          <FileInput accept=".pdf,image/*" maxSize={2 * 1024 * 1024} />
        </FormField>
        <FormField label="Supporting documents" help="Choose several at once.">
          <FileInput multiple accept=".pdf,.docx" />
        </FormField>
      </DemoSection>
      <DemoSection title="Sizes" className="max-w-md gap-4 grid">
        <FileInput aria-label="Small" size="sm" />
        <FileInput aria-label="Default" />
        <FileInput aria-label="Large" size="lg" />
      </DemoSection>
      <DemoSection title="States" className="max-w-md gap-4 grid">
        <FormField label="Disabled" disabled>
          <FileInput />
        </FormField>
        <FormField label="With a server error" error="The trade licence field is required.">
          <FileInput />
        </FormField>
        <FormField label="Photos only, 200 KB max" help="Try a larger file or a PDF to see the messages.">
          <FileInput accept="image/*" maxSize={200 * 1024} multiple />
        </FormField>
      </DemoSection>
      <DemoSection
        title="Several files"
        description="append adds each pick to the list; duplicates are skipped. showLimits shows the limits and a count."
        className="max-w-md gap-4 grid"
      >
        <FormField label="Tender documents">
          <FileInput append showLimits accept=".pdf,.xlsx,.docx" maxFiles={5} maxSize={10 * 1024 * 1024} />
        </FormField>
        <FormField label="Site photos">
          <FileInput append accept="image/*" />
        </FormField>
      </DemoSection>
      <DemoSection
        title="Drop zone with uploads"
        description="Drop files, click the zone, or focus it and paste an image from the clipboard."
        className="max-w-xl gap-4 grid"
      >
        <FormField label="Project photos" name="photos">
          <FileInput
            appearance="dropzone"
            multiple
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
        title="Uploads on pick"
        description="With upload or url each file uploads as soon as it is chosen. Name a file with “fail” to see an error and retry."
        className="max-w-md gap-4 grid"
      >
        <FormField
          label="BML transfer slip"
          name="slip_id"
          help="Uploaded straight away; the form submits the file id."
        >
          <FileInput upload={fakeUpload} accept="image/*,.pdf" maxSize={5 * 1024 * 1024} />
        </FormField>
        <FormField label="Supporting documents" name="supporting_documents">
          <FileInput multiple upload={fakeUpload} />
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
          {\`<FileInput
  url="/api/uploads"
  uploadOptions={{ headers: { "X-CSRF-TOKEN": token } }}
/>\`}
        </pre>
      </DemoSection>
      <DemoSection title="Drop zone: collect only, paste anywhere" className="max-w-xl gap-4 grid">
        <FileInput
          appearance="dropzone"
          aria-label="Screenshot"
          size="sm"
          pasteFromDocument
          description="Paste anywhere on the page"
        />
      </DemoSection>
      <DemoSection title="Drop zone: large and disabled" className="max-w-xl gap-4 grid">
        <FileInput appearance="dropzone" aria-label="Files" multiple size="lg" />
        <FileInput appearance="dropzone" aria-label="Saved files" disabled defaultValue={saved.slice(0, 1)} />
      </DemoSection>
      <DemoSection
        title="ދިވެހި"
        className="max-w-md gap-4 grid"
        description="Switch the locale to Dhivehi in the toolbar."
      >
        <FormField label="ކާޑުގެ ކޮޕީ">
          <FileInput accept="image/*,.pdf" />
        </FormField>
      </DemoSection>
    </DemoPage>
  )
}
`;export{e as default};