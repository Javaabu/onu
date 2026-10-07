import { FormField, InstantFileUpload } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"
import { fakeUpload } from "./_mock"

export const meta = { title: "Instant file upload", group: "Files and media", order: 3 }

export default function InstantFileUploadDemo() {
  return (
    <DemoPage>
      <DemoSection
        title="Uploads on pick"
        description="Uses a fake uploader with progress. Name a file with “fail” to see an error and retry."
        className="max-w-md gap-4 grid"
      >
        <FormField
          label="BML transfer slip"
          name="slip_id"
          help="Uploaded straight away; the form submits the file id."
        >
          <InstantFileUpload upload={fakeUpload} accept="image/*,.pdf" maxSize={5 * 1024 * 1024} />
        </FormField>
        <FormField label="Supporting documents" name="documents">
          <InstantFileUpload upload={fakeUpload} multiple />
        </FormField>
      </DemoSection>
      <DemoSection title="Built-in XHR uploader" className="max-w-md gap-4 grid">
        <pre className="text-xs p-3 overflow-x-auto rounded-lg bg-muted">
          {`<InstantFileUpload
  url="/api/uploads"
  uploadOptions={{ headers: { "X-CSRF-TOKEN": token } }}
/>`}
        </pre>
      </DemoSection>
    </DemoPage>
  )
}
