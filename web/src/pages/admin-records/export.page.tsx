import * as React from "react"
import {
  AttachmentPreview,
  Button,
  Callout,
  Card,
  DateRangePicker,
  DualListbox,
  FormField,
  FormGroup,
  Icon,
  PageTitle,
  ProgressBar,
  RadioGroup,
  SearchableSelect,
  toast,
  type DateRangeValue,
} from "@javaabu/onu"

import { useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import { AdminShell } from "../_shared/shells"
import { useApplications, useLabels, wait, type Application } from "./_data"

export const meta = {
  title: "Export",
  group: "Admin: records",
  layout: "bare",
  order: 13,
}

type Column = keyof Pick<
  Application,
  | "reference"
  | "name"
  | "nameDv"
  | "idCard"
  | "phone"
  | "email"
  | "island"
  | "service"
  | "status"
  | "amount"
  | "submitted"
  | "assignee"
>

const ymd = (d: Date | null) =>
  d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}` : ""

export default function ExportPage() {
  const tr = useTr()
  const labels = useLabels()
  const apps = useApplications()
  const [format, setFormat] = React.useState("csv")
  const [statuses, setStatuses] = React.useState<string[]>([])
  const [islands, setIslands] = React.useState<string[]>([])
  const [range, setRange] = React.useState<DateRangeValue>({ from: null, to: null })
  const [columns, setColumns] = React.useState<string[]>([
    "reference",
    "name",
    "service",
    "status",
    "amount",
    "submitted",
  ])
  const [progress, setProgress] = React.useState<number | null>(null)
  const [file, setFile] = React.useState<{ name: string; href: string; size: number; rows: number } | null>(null)
  const [error, setError] = React.useState<string>()

  const columnLabels: Record<Column, string> = {
    reference: tr("Reference", "ރެފަރެންސް"),
    name: tr("Applicant (English)", "އެޕްލިކަންޓް (އިނގިރޭސި)"),
    nameDv: tr("Applicant (Dhivehi)", "އެޕްލިކަންޓް (ދިވެހި)"),
    idCard: tr("ID card", "އައިޑީ ކާޑު"),
    phone: tr("Phone", "ފޯނު"),
    email: tr("Email", "އީމެއިލް"),
    island: tr("Island", "ރަށް"),
    service: tr("Service", "ޚިދުމަތް"),
    status: tr("Status", "ސްޓޭޓަސް"),
    amount: tr("Fee (MVR)", "ފީ (ރުފިޔާ)"),
    submitted: tr("Submitted", "ހުށަހެޅި"),
    assignee: tr("Assignee", "ޙަވާލުވި"),
  }

  const from = ymd(range.from)
  const to = ymd(range.to)
  const matching = apps.filter(
    (a) =>
      (!statuses.length || statuses.includes(a.status)) &&
      (!islands.length || islands.includes(a.island)) &&
      (!from || a.submitted >= from) &&
      (!to || a.submitted <= to),
  )

  const cell = (a: Application, c: Column) => {
    switch (c) {
      case "island":
        return labels.island(a.island)
      case "service":
        return labels.service(a.service)
      case "status":
        return labels.status(a.status)
      case "assignee":
        return labels.staff(a.assignee)
      default:
        return String(a[c] ?? "")
    }
  }

  const run = async () => {
    if (!columns.length) {
      setError(tr("Choose at least one column.", "މަދުވެގެން އެއް ކޮލަމެއް އިޚްތިޔާރުކުރައްވާ."))
      return
    }
    setError(undefined)
    setFile(null)
    for (let p = 0; p <= 100; p += 10) {
      setProgress(p)
      await wait(120)
    }
    const cols = columns as Column[]
    const escape = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v)
    const text =
      format === "json"
        ? JSON.stringify(
            matching.map((a) => Object.fromEntries(cols.map((c) => [c, cell(a, c)]))),
            null,
            2,
          )
        : [cols.map((c) => escape(columnLabels[c])), ...matching.map((a) => cols.map((c) => escape(cell(a, c))))]
            .map((r) => r.join(","))
            .join("\n")
    const type = format === "json" ? "application/json" : "text/csv"
    setFile({
      name: `applications-2026-10-07.${format}`,
      href: `data:${type};charset=utf-8,${encodeURIComponent(text)}`,
      size: new Blob([text]).size,
      rows: matching.length,
    })
    setProgress(null)
    toast.success(tr("Export ready", "އެކްސްޕޯޓް ތައްޔާރު"))
  }

  return (
    <AdminShell
      breadcrumbs={[
        { label: tr("Applications", "އެޕްލިކޭޝަންތައް"), href: routes.adminRecords.indexTable },
        { label: tr("Export", "އެކްސްޕޯޓް") },
      ]}
    >
      <div className="gap-6 grid">
        <PageTitle
          title={tr("Export applications", "އެޕްލިކޭޝަން އެކްސްޕޯޓްކުރޭ")}
          description={tr(
            "Download applications as a file for reports or other systems.",
            "ރިޕޯޓުތަކަށް ނުވަތަ އެހެން ސިސްޓަމްތަކަށް އެޕްލިކޭޝަންތައް ފައިލަކަށް ޑައުންލޯޑްކުރޭ.",
          )}
          links={[
            {
              label: tr("All applications", "ހުރިހާ އެޕްލިކޭޝަނެއް"),
              href: routes.adminRecords.indexTable,
              icon: "back",
            },
          ]}
        />

        <Card headingLevel={2} title={tr("1. Format", "1. ފޯމެޓް")}>
          <FormField label={tr("File format", "ފައިލްގެ ފޯމެޓް")} name="format" hideLabel>
            <RadioGroup
              variant="card"
              value={format}
              onValueChange={setFormat}
              className="sm:grid-cols-2"
              options={[
                {
                  value: "csv",
                  label: "CSV",
                  description: tr(
                    "Opens in Excel, Numbers or Google Sheets",
                    "އެކްސެލް، ނަމްބަރސް ނުވަތަ ގޫގުލް ޝީޓްސްގައި ހުޅުވޭ",
                  ),
                  icon: <Icon name="file-spreadsheet" />,
                },
                {
                  value: "json",
                  label: "JSON",
                  description: tr("For developers and other systems", "ޑިވެލޮޕަރުންނާއި އެހެން ސިސްޓަމްތަކަށް"),
                  icon: <Icon name="code" />,
                },
              ]}
            />
          </FormField>
        </Card>

        <Card
          headingLevel={2}
          title={tr("2. Which applications", "2. ކޮން އެޕްލިކޭޝަންތަކެއް")}
          description={tr(
            `${matching.length} of ${apps.length} applications match`,
            `${apps.length} އިން ${matching.length} އެޕްލިކޭޝަން ދިމާވޭ`,
          )}
        >
          <FormGroup columns={2}>
            <FormField
              label={tr("Status", "ސްޓޭޓަސް")}
              name="status"
              help={tr("Leave empty for all", "ހުރިހާ އެއްޗަކަށް ހުސްކޮށް ބާއްވާ")}
            >
              <SearchableSelect
                multiple
                options={labels.options.statuses}
                value={statuses}
                onValueChange={(v) => setStatuses(v)}
                placeholder={tr("All statuses", "ހުރިހާ ސްޓޭޓަހެއް")}
              />
            </FormField>
            <FormField
              label={tr("Island", "ރަށް")}
              name="island"
              help={tr("Leave empty for all", "ހުރިހާ އެއްޗަކަށް ހުސްކޮށް ބާއްވާ")}
            >
              <SearchableSelect
                multiple
                options={labels.options.islands}
                value={islands}
                onValueChange={(v) => setIslands(v)}
                placeholder={tr("All islands", "ހުރިހާ ރަށެއް")}
              />
            </FormField>
          </FormGroup>
          <FormField label={tr("Submitted between", "ހުށަހެޅި މުއްދަތު")} name="submitted" className="mt-4">
            <DateRangePicker value={range} onChange={setRange} />
          </FormField>
        </Card>

        <Card headingLevel={2} title={tr("3. Columns", "3. ކޮލަމްތައް")}>
          <FormField label={tr("Columns to include", "ހިމަނާ ކޮލަމްތައް")} name="columns" hideLabel error={error}>
            <DualListbox
              options={(Object.keys(columnLabels) as Column[]).map((c) => ({ value: c, label: columnLabels[c] }))}
              value={columns}
              onValueChange={(v) => setColumns(v)}
              availableLabel={tr("Available", "ލިބެން ހުރި")}
              selectedLabel={tr("In the file", "ފައިލުގައި")}
            />
          </FormField>
        </Card>

        <Card headingLevel={2} title={tr("4. Export", "4. އެކްސްޕޯޓް")}>
          <div className="gap-4 grid">
            <div className="gap-3 flex flex-wrap items-center">
              <Button startIcon="download" loading={progress !== null} onClick={run} disabled={!matching.length}>
                {tr(`Export ${matching.length} applications`, `${matching.length} އެޕްލިކޭޝަން އެކްސްޕޯޓްކުރޭ`)}
              </Button>
              {!matching.length ? (
                <span className="text-sm text-muted-foreground">
                  {tr("No applications match these filters.", "މި ފިލްޓަރުތަކަށް ދިމާވާ އެޕްލިކޭޝަނެއް ނެތް.")}
                </span>
              ) : null}
            </div>
            {progress !== null ? (
              <ProgressBar label={tr("Preparing the file…", "ފައިލް ތައްޔާރުކުރަނީ…")} value={progress} />
            ) : null}
            {file ? (
              <>
                <Callout
                  variant="success"
                  title={tr("Your file is ready", "ފައިލް ތައްޔާރު")}
                  description={tr(
                    `${file.rows} applications, ${columns.length} columns.`,
                    `${file.rows} އެޕްލިކޭޝަން، ${columns.length} ކޮލަމް.`,
                  )}
                />
                <AttachmentPreview name={file.name} downloadUrl={file.href} size={file.size} />
              </>
            ) : null}
          </div>
        </Card>
      </div>
    </AdminShell>
  )
}
