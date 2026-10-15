import * as React from "react"
import { useSearchParams } from "react-router"
import {
  ActivityFeed,
  Card,
  DocumentDownload,
  DropzoneUploader,
  FormField,
  LinkButton,
  Notes,
  Timeline,
  toast,
  type NoteData,
} from "@javaabu/onu"

import { useTr } from "../_shared/i18n"
import { AdminShell } from "../_shared/shells"
import { editHref, recordActivity, SAMPLE_FILE, showTabsHref, STAFF, useLabels, wait, type Application } from "./_data"
import { DetailCards, RecordActions, RecordNotFound, RecordTitle, SummaryStrip, TrashedNotice } from "./_details"
import { recordCrumbs, RecordHeader, useRecord, type Tr } from "./_ui"

export const meta = {
  title: "Show with tabs",
  group: "Admin: records",
  layout: "bare",
  order: 9,
}

const TABS = ["details", "documents", "history", "notes"] as const
type Tab = (typeof TABS)[number]

function documentsOf(record: Application, tr: Tr) {
  const all = [
    { id: "form", title: tr("Application form", "އެޕްލިކޭޝަން ފޯމު"), file: `${record.reference}.pdf`, size: 182_000 },
    { id: "id", title: tr("ID card copy", "އައިޑީ ކާޑުގެ ކޮޕީ"), file: `${record.idCard}.jpg`, size: 640_000 },
    {
      id: "land",
      title: tr("Land ownership document", "ބިމުގެ މިލްކިއްޔާތުގެ ލިޔުން"),
      file: "land-deed.pdf",
      size: 1_240_000,
    },
    { id: "plan", title: tr("Site plan", "ސައިޓް ޕްލޭން"), file: "site-plan.pdf", size: 2_310_000 },
    { id: "receipt", title: tr("Payment receipt", "ފައިސާ ދެއްކި ރަސީދު"), file: "receipt.pdf", size: 96_000 },
  ]
  return all.slice(0, record.documents)
}

function initialNotes(record: Application, tr: Tr): NoteData[] {
  const staff = STAFF.find((s) => s.value === record.assignee) ?? STAFF[1]!
  return [
    {
      id: "n2",
      author: { id: "shifa", name: tr("Aishath Shifa", "އައިޝަތު ޝިފާ") },
      body: tr(
        "Called the applicant; the site plan will be resubmitted.",
        "އެޕްލިކަންޓާ ގުޅީމު. ސައިޓް ޕްލޭން އަލުން ހުށަހަޅާނެ.",
      ),
      createdAt: `${record.updated}T13:20:00`,
    },
    {
      id: "n1",
      author: { id: staff.value, name: tr(staff.en, staff.dv) },
      body: tr("Site visit requested before approval.", "ފާސްކުރުމުގެ ކުރިން ސައިޓް ވިޒިޓެއް ބޭނުންވޭ."),
      createdAt: `${record.submitted}T15:05:00`,
    },
  ]
}

export default function ShowTabsPage() {
  const tr = useTr()
  const labels = useLabels()
  const record = useRecord()
  const [params] = useSearchParams()
  const tab: Tab = (TABS as readonly string[]).includes(params.get("tab") ?? "")
    ? (params.get("tab") as Tab)
    : "details"
  const [notes, setNotes] = React.useState<NoteData[] | null>(null)
  if (!record) return <RecordNotFound />

  const noteList = notes ?? initialNotes(record, tr)
  const docs = documentsOf(record, tr)
  const activity = recordActivity(record, labels, tr)
  const tabLabels: Record<Tab, string> = {
    details: tr("Details", "ތަފްޞީލު"),
    documents: tr("Documents", "ލިޔެކިޔުން"),
    history: tr("History", "ތާރީޚު"),
    notes: tr("Notes", "ނޯޓު"),
  }
  const counts: Partial<Record<Tab, number>> = {
    documents: docs.length,
    history: activity.length,
    notes: noteList.length,
  }
  const tabs = TABS.map((t) => ({ label: tabLabels[t], href: showTabsHref(record.id, t), count: counts[t] }))

  return (
    <AdminShell contentWidth="wide" breadcrumbs={recordCrumbs(tr, record, tabLabels[tab])}>
      <div className="gap-6 grid">
        <RecordHeader
          title={<RecordTitle record={record} />}
          description={`${labels.name(record)} · ${labels.service(record.service)}`}
          actions={
            <>
              <LinkButton href={editHref(record.id)} variant="outline" startIcon="edit">
                {tr("Edit", "އެޑިޓް")}
              </LinkButton>
              <RecordActions record={record} />
            </>
          }
          tabs={tabs}
          currentHref={showTabsHref(record.id, tab)}
        />
        <TrashedNotice record={record} />

        {tab === "details" ? (
          <>
            <SummaryStrip record={record} />
            <div className="gap-6 lg:grid-cols-2 grid items-start">
              <DetailCards record={record} />
            </div>
          </>
        ) : null}

        {tab === "documents" ? (
          <div className="gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] grid items-start">
            <Card title={tr("Submitted documents", "ހުށަހެޅި ލިޔެކިޔުން")} headingLevel={2}>
              <div className="gap-3 sm:grid-cols-2 grid">
                {docs.map((d) => (
                  <DocumentDownload key={d.id} title={d.title} href={SAMPLE_FILE} fileName={d.file} size={d.size} />
                ))}
              </div>
            </Card>
            <Card
              title={tr("Add a document", "ލިޔުމެއް އިތުރުކުރޭ")}
              description={tr(
                "Staff uploads are visible to the applicant.",
                "މުވައްޒަފުން އަޕްލޯޑްކުރާ ލިޔުން އެޕްލިކަންޓަށް ފެންނާނެ.",
              )}
              headingLevel={2}
            >
              <FormField label={tr("Files", "ފައިލްތައް")} name="files" hideLabel>
                <DropzoneUploader
                  multiple
                  accept=".pdf,image/*"
                  maxSize={8 * 1024 * 1024}
                  description={tr("PDF or images, up to 8 MB each", "PDF ނުވަތަ ފޮޓޯ، ކޮންމެ އެއްޗެއް 8 MB އަށް")}
                  onChange={(files) => {
                    if (files.length) toast.success(tr("Document added", "ލިޔުން އިތުރުކުރެވިއްޖެ"))
                  }}
                />
              </FormField>
            </Card>
          </div>
        ) : null}

        {tab === "history" ? (
          <div className="gap-6 lg:grid-cols-[20rem_minmax(0,1fr)] grid items-start">
            <Card title={tr("Progress", "ކުރިއެރުން")} headingLevel={2}>
              <Timeline
                items={[
                  { title: tr("Submitted", "ހުށަހެޅި"), time: `${record.submitted}T11:02:00`, status: "success" },
                  {
                    title: tr("Payment received", "ފައިސާ ލިބިއްޖެ"),
                    time: `${record.submitted}T11:15:00`,
                    status: "success",
                  },
                  {
                    title: tr("Review", "ރިވިއު"),
                    status: record.status === "in_review" || record.status === "submitted" ? "current" : "success",
                  },
                  {
                    title: tr("Decision", "ނިންމުން"),
                    status:
                      record.status === "approved"
                        ? "success"
                        : record.status === "rejected" || record.status === "suspended"
                          ? "warning"
                          : "pending",
                    content: record.status === "approved" ? labels.status("approved") : undefined,
                  },
                ]}
              />
            </Card>
            <Card title={tr("All activity", "ހުރިހާ ހަރަކާތެއް")} headingLevel={2}>
              <ActivityFeed title={null} items={activity} />
            </Card>
          </div>
        ) : null}

        {tab === "notes" ? (
          <Card>
            <Notes
              title={tr("Internal notes", "އެތެރޭގެ ނޯޓުތައް")}
              notes={noteList}
              currentUserId="shifa"
              thaana={labels.dv}
              onAdd={async (body) => {
                await wait(400)
                setNotes([
                  {
                    id: `n${Date.now()}`,
                    author: { id: "shifa", name: tr("Aishath Shifa", "އައިޝަތު ޝިފާ") },
                    body,
                    createdAt: new Date(),
                  },
                  ...noteList,
                ])
              }}
              onDelete={async (id) => {
                await wait(300)
                setNotes(noteList.filter((n) => n.id !== id))
              }}
            />
          </Card>
        ) : null}
      </div>
    </AdminShell>
  )
}
