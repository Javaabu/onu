import { Card, DocumentDownload } from "@javaabu/onu"

import { useTr } from "../_shared/i18n"
import { AdminShell } from "../_shared/shells"
import { SAMPLE_FILE, useLabels } from "./_data"
import {
  ActivityCard,
  DetailCards,
  RecordActions,
  RecordNotFound,
  RecordTitle,
  SummaryStrip,
  TrashedNotice,
} from "./_details"
import { recordCrumbs, RecordHeader, recordTabs, useRecord } from "./_ui"

export const meta = {
  title: "Show / detail view",
  group: "Admin: records",
  layout: "bare",
  order: 8,
}

export default function ShowPage() {
  const tr = useTr()
  const labels = useLabels()
  const record = useRecord()
  if (!record) return <RecordNotFound />
  const tabs = recordTabs(record, tr)

  return (
    <AdminShell contentWidth="wide" breadcrumbs={recordCrumbs(tr, record)}>
      <div className="gap-6 grid">
        <RecordHeader
          title={<RecordTitle record={record} />}
          description={`${labels.name(record)} · ${labels.service(record.service)}`}
          actions={<RecordActions record={record} />}
          tabs={tabs}
          currentHref={tabs[0]!.href}
        />
        <TrashedNotice record={record} />
        <SummaryStrip record={record} />
        <div className="gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] grid items-start">
          <div className="gap-6 min-w-0 grid">
            <DetailCards record={record} />
          </div>
          <div className="gap-6 min-w-0 grid">
            <ActivityCard record={record} />
            <Card title={tr("Documents", "ލިޔެކިޔުން")} headingLevel={2}>
              <div className="gap-2 grid">
                <DocumentDownload
                  title={tr("Application form", "އެޕްލިކޭޝަން ފޯމު")}
                  href={SAMPLE_FILE}
                  fileName={`${record.reference}.pdf`}
                  size={182_000}
                />
                <DocumentDownload
                  title={tr("ID card copy", "އައިޑީ ކާޑުގެ ކޮޕީ")}
                  href={SAMPLE_FILE}
                  fileName={`${record.idCard}.jpg`}
                  size={640_000}
                />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AdminShell>
  )
}
