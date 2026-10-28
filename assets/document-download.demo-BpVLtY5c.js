var e=`import { DocumentDownload } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = { title: "Document download", group: "Files and media", order: 15 }

export default function DocumentDownloadDemo() {
  return (
    <DemoPage>
      <DemoSection title="Language versions" className="gap-3 md:grid-cols-2 grid w-full">
        <DocumentDownload
          title="Decentralisation Act (Law No. 7/2010)"
          description="Consolidated with amendments up to 2025"
          versions={[
            { lang: "dv", href: "#", size: 1_240_000, type: "application/pdf" },
            { lang: "en", href: "#", size: 980_000, type: "application/pdf" },
          ]}
          meta={<span>Published 14 January 2026</span>}
        />
        <DocumentDownload
          title="ރަށު ތަރައްޤީގެ ޕްލޭން 2026"
          description="މާފުށި ކައުންސިލް"
          versions={[{ lang: "dv", href: "#", size: 2_400_000, type: "application/pdf" }]}
        />
      </DemoSection>
      <DemoSection title="Single file" className="gap-3 md:grid-cols-3 grid w-full">
        <DocumentDownload title="Tender form" href="#tender.docx" fileName="tender-form.docx" size={56_000} />
        <DocumentDownload title="Price schedule" href="#prices.xlsx" fileName="prices.xlsx" size={18_000} />
        <DocumentDownload title="Site drawings" href="#drawings.zip" fileName="drawings.zip" size={42_000_000} />
      </DemoSection>
    </DemoPage>
  )
}
`;export{e as default};