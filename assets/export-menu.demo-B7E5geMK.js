var e=`import { ExportMenu, useTranslation } from "@javaabu/onu"
import { useExportRows, type ExportColumn } from "@javaabu/onu/export"

import { DemoPage, DemoSection } from "../../components/demo"
import { people, statusLabel, wait, type Person } from "./_data"

export const meta = { title: "Export menu", group: "Listing pages", order: 16 }

export default function ExportMenuDemo() {
  const { locale } = useTranslation()
  const dv = locale.code === "dv"
  const exportRows = useExportRows()
  const rows = people.slice(0, 40)
  const columns: ExportColumn<Person>[] = [
    { header: dv ? "ނަން" : "Name", accessor: (p) => (dv ? p.nameDv : p.name) },
    { header: dv ? "އީމެއިލް" : "Email", accessor: "email" },
    { header: dv ? "ރަށް" : "Island", accessor: "island" },
    { header: dv ? "ހާލަތު" : "Status", accessor: (p) => statusLabel[p.status] },
    { header: dv ? "ބާކީ" : "Balance", accessor: "balance", type: "currency" },
    { header: dv ? "ހެދި ތާރީޚް" : "Created", accessor: "created", type: "date" },
  ]

  return (
    <DemoPage>
      <DemoSection
        title="Built in the browser"
        description="exportRows from @javaabu/onu/export builds the file from the rows you have: CSV (UTF-8 with BOM), Excel (.xlsx, right to left in Dhivehi) or PDF through the print dialog."
      >
        <ExportMenu
          scopeLabel={dv ? "40 މީހުން" : "40 users"}
          onExport={(format) =>
            exportRows({
              format,
              rows,
              columns,
              filename: "users",
              title: dv ? "މެމްބަރުން" : "Users",
              scope: dv ? "ހުރިހާ މެމްބަރުން" : "All users",
            })
          }
        />
      </DemoSection>
      <DemoSection
        title="Server export"
        description="onExport builds the file (for example on the server); the button shows a spinner meanwhile."
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
`;export{e as default};