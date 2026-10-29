import { AttachmentPreview } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"
import { scene } from "./_mock"

export const meta = { title: "Attachment preview", group: "Files and media", order: 14 }

const pdf = `data:application/pdf;base64,JVBERi0xLjQKMSAwIG9iajw8L1R5cGUvQ2F0YWxvZy9QYWdlcyAyIDAgUj4+ZW5kb2JqCjIgMCBvYmo8PC9UeXBlL1BhZ2VzL0tpZHNbMyAwIFJdL0NvdW50IDE+PmVuZG9iagozIDAgb2JqPDwvVHlwZS9QYWdlL1BhcmVudCAyIDAgUi9NZWRpYUJveFswIDAgMjAwIDIwMF0+PmVuZG9iagp0cmFpbGVyPDwvUm9vdCAxIDAgUj4+CiUlRU9G`

export default function AttachmentPreviewDemo() {
  return (
    <DemoPage>
      <DemoSection title="Rows" className="max-w-lg gap-2 grid w-full">
        <AttachmentPreview
          name="Beach clean-up.jpg"
          url={scene("Beach clean-up", 190)}
          size={1_820_000}
          onRemove={() => {}}
        />
        <AttachmentPreview name="Council gazette.pdf" url={pdf} size={240_000} />
        <AttachmentPreview name="Budget 2026.xlsx" url="#" size={64_000} />
        <AttachmentPreview name="ހުށަހެޅުން.docx" url="#" size={32_000} onRemove={() => {}} />
        <AttachmentPreview name="Site survey.zip" size={14_200_000} />
      </DemoSection>
      <DemoSection title="Language versions" className="gap-3 md:grid-cols-2 grid w-full">
        <AttachmentPreview
          name="Decentralisation Act (Law No. 7/2010)"
          description="Consolidated with amendments up to 2025"
          meta={<span>Published 14 January 2026</span>}
          versions={[
            { lang: "dv", href: "#", size: 1_240_000, type: "application/pdf" },
            { lang: "en", href: "#", size: 980_000, type: "application/pdf" },
          ]}
        />
        <AttachmentPreview
          name="ރަށު ތަރައްޤީގެ ޕްލޭން 2026"
          description="މާފުށި ކައުންސިލް"
          versions={[{ lang: "dv", href: "#", size: 2_400_000, type: "application/pdf" }]}
        />
      </DemoSection>
      <DemoSection title="Download only" className="max-w-lg gap-2 grid w-full">
        <AttachmentPreview name="tender-form.docx" description="Tender form" downloadUrl="#tender.docx" size={56_000} />
        <AttachmentPreview name="prices.xlsx" description="Price schedule" downloadUrl="#prices.xlsx" size={18_000} />
      </DemoSection>
      <DemoSection title="Cards" className="gap-3 flex flex-wrap">
        <AttachmentPreview variant="card" name="Harbour.jpg" url={scene("Harbour", 210)} size={980_000} />
        <AttachmentPreview variant="card" name="Drone flight.mp4" url="#" size={84_000_000} />
        <AttachmentPreview variant="card" name="Gazette.pdf" url={pdf} size={240_000} />
      </DemoSection>
    </DemoPage>
  )
}
