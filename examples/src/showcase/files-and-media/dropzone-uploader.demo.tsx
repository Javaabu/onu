import { DropzoneUploader, FormField } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"
import { fakeUpload } from "./_mock"

export const meta = { title: "Drag-and-drop uploader", group: "Files and media", order: 5 }

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
      <DemoSection title="Collect only, single file, paste anywhere" className="max-w-xl gap-4 grid">
        <DropzoneUploader multiple={false} size="sm" pasteFromDocument description="Paste anywhere on the page" />
      </DemoSection>
      <DemoSection title="Large and disabled" className="max-w-xl gap-4 grid">
        <DropzoneUploader size="lg" />
        <DropzoneUploader disabled />
      </DemoSection>
    </DemoPage>
  )
}
