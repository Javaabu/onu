var e=`import { FormField, UrlInput } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "URL input",
  group: "Text inputs",
  order: 10,
  description: "Adds https:// when you leave it out. Always LTR.",
}

export default function UrlInputDemo() {
  return (
    <DemoPage>
      <DemoSection title="Basic" description="Type “javaabu.com” and leave the field." className="max-w-md gap-4 grid">
        <FormField label="Website">
          <UrlInput placeholder="example.mv" />
        </FormField>
        <FormField label="ވެބްސައިޓް">
          <UrlInput showIcon defaultValue="https://gov.mv" />
        </FormField>
        <FormField label="Internal link" help="No protocol is added.">
          <UrlInput defaultProtocol={false} placeholder="/news/ferry-schedule" />
        </FormField>
      </DemoSection>
      <DemoSection title="States" className="max-w-md gap-4 grid">
        <FormField label="Disabled">
          <UrlInput disabled defaultValue="https://example.mv" />
        </FormField>
        <FormField label="With error" error="The URL must start with https://">
          <UrlInput defaultValue="ftp://files.example.mv" />
        </FormField>
      </DemoSection>
    </DemoPage>
  )
}
`;export{e as default};