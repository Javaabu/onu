import { ExportMenu } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"
import { wait } from "./_data"

export const meta = { title: "Export menu", group: "Listing pages", order: 16 }

export default function ExportMenuDemo() {
  return (
    <DemoPage>
      <DemoSection
        title="CSV, Excel and PDF"
        description="onExport builds the file; the button shows a spinner meanwhile."
      >
        <ExportMenu onExport={() => wait(1500)} scopeLabel="312 users, current filters" />
        <ExportMenu
          onExport={() => wait()}
          options={[
            "csv",
            { format: "json", label: "JSON", icon: "code", description: "For developers" },
            { format: "pdf", disabled: true },
          ]}
        />
        <ExportMenu onExport={() => undefined} disabled />
      </DemoSection>
    </DemoPage>
  )
}
