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
        <pre
          dir="ltr"
          role="region"
          aria-label="Example code"
          // Focusable so the scrollable region can be scrolled by keyboard.
          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
          tabIndex={0}
          className="text-xs p-3 overflow-x-auto rounded-lg bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          {`<InstantFileUpload
  url="/api/uploads"
  uploadOptions={{ headers: { "X-CSRF-TOKEN": token } }}
/>`}
        </pre>
      </DemoSection>
    </DemoPage>
  )
}
