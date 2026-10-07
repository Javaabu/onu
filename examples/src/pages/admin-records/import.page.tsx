import * as React from "react"
import {
  Button,
  Callout,
  Card,
  DataTable,
  DescriptionList,
  DropzoneUploader,
  FormField,
  LinkButton,
  PageTitle,
  ProgressBar,
  RadioGroup,
  Select,
  Switch,
  Wizard,
  type DataTableColumn,
} from "@javaabu/onu"

import { useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import { AdminShell } from "../_shared/shells"
import { addApplication, ISLANDS, SERVICES, TODAY, useApplications, useLabels, wait } from "./_data"
import type { Tr } from "./_ui"

export const meta = {
  title: "Import",
  group: "Admin: records",
  layout: "bare",
  order: 12,
}

const SAMPLE_CSV = `Full name,ID card,Mobile,E-mail,Island,Service,Fee (MVR)
Hassan Moosa,A301122,7712345,hassan.moosa@gmail.com,Hulhumalé,Building permit,2500
Aminath Shiyama,A301123,9601234,shiyama@gmail.com,Addu City,Trade licence,1000
Mohamed Rasheed,A30112,7723456,mrasheed@gmail.com,Malé,Event permit,250
Fathimath Zahir,A301125,7734567,,Naifaru,Business registration,500
Ibrahim Waheed,A301126,7745678,iwaheed@gmail.com,Kaashidhoo,Land lease,7500
Hawwa Latheef,A301127,7756789,hawwa.l@gmail.com,Fuvahmulah,Vessel registration,1200
Ali Shareef,A301128,7767890,ali.shareef@gmail.com,Thinadhoo,Building permit,2750
Mariyam Saeed,A301129,7778901,mariyam.saeed@gmail.com,Eydhafushi,Event permit,abc
Ahmed Didi,A301130,7789012,ahmed.didi@gmail.com,Villimalé,Trade licence,1000
Aishath Nazeer,A301131,7790123,aishath.n@gmail.com,Kulhudhuffushi,Business registration,500`

type FieldKey = "name" | "idCard" | "phone" | "email" | "island" | "service" | "amount"
const REQUIRED: FieldKey[] = ["name", "idCard", "email", "island", "service"]
const GUESS: Record<string, FieldKey> = {
  "full name": "name",
  name: "name",
  "id card": "idCard",
  mobile: "phone",
  phone: "phone",
  "e-mail": "email",
  email: "email",
  island: "island",
  service: "service",
  "fee (mvr)": "amount",
  fee: "amount",
}

function parseCsv(text: string) {
  const lines = text.trim().split(/\r?\n/)
  const split = (line: string) => line.split(",").map((c) => c.trim())
  return { headers: split(lines[0] ?? ""), rows: lines.slice(1).filter(Boolean).map(split) }
}

interface PreviewRow {
  id: string
  row: number
  values: Record<FieldKey, string>
  errors: string[]
}

function validateRows(
  rows: string[][],
  headers: string[],
  mapping: Record<string, string>,
  existingIds: Set<string>,
  tr: Tr,
): PreviewRow[] {
  const col = (field: FieldKey) => headers.findIndex((h) => mapping[h] === field)
  return rows.map((cells, i) => {
    const get = (f: FieldKey) => (col(f) >= 0 ? (cells[col(f)] ?? "") : "")
    const values = Object.fromEntries(
      (["name", "idCard", "phone", "email", "island", "service", "amount"] as FieldKey[]).map((f) => [f, get(f)]),
    ) as Record<FieldKey, string>
    const errors: string[] = []
    if (!values.name) errors.push(tr("Name is missing", "ނަން ނެތް"))
    if (!/^A\d{6}$/.test(values.idCard))
      errors.push(
        tr(`"${values.idCard}" is not an ID card number`, `"${values.idCard}" އަކީ އައިޑީ ކާޑު ނަންބަރެއް ނޫން`),
      )
    else if (existingIds.has(values.idCard))
      errors.push(tr("ID card already has an application", "މި އައިޑީ ކާޑުގައި އެޕްލިކޭޝަނެއް އެބަހުރި"))
    if (!values.email) errors.push(tr("Email is missing", "އީމެއިލް ނެތް"))
    if (!ISLANDS.some((x) => x.en === values.island))
      errors.push(tr(`Unknown island "${values.island}"`, `"${values.island}" ނޭނގޭ ރަށެއް`))
    if (!SERVICES.some((x) => x.en === values.service))
      errors.push(tr(`Unknown service "${values.service}"`, `"${values.service}" ނޭނގޭ ޚިދުމަތެއް`))
    if (values.amount && Number.isNaN(Number(values.amount)))
      errors.push(tr("Fee is not a number", "ފީ އަކީ އަދަދެއް ނޫން"))
    return { id: String(i + 2), row: i + 2, values, errors }
  })
}

export default function ImportPage() {
  const tr = useTr()
  const labels = useLabels()
  const apps = useApplications()
  const [csv, setCsv] = React.useState<{ name: string; headers: string[]; rows: string[][] } | null>(null)
  const [uploadError, setUploadError] = React.useState<string>()
  const [mapping, setMapping] = React.useState<Record<string, string>>({})
  const [mapError, setMapError] = React.useState<string>()
  const [onlyErrors, setOnlyErrors] = React.useState(false)
  const [onInvalid, setOnInvalid] = React.useState("skip")
  const [progress, setProgress] = React.useState<number | null>(null)
  const [result, setResult] = React.useState<{ imported: number; skipped: number } | null>(null)

  const fieldLabels: Record<FieldKey, string> = {
    name: tr("Applicant name", "އެޕްލިކަންޓްގެ ނަން"),
    idCard: tr("ID card", "އައިޑީ ކާޑު"),
    phone: tr("Phone", "ފޯނު"),
    email: tr("Email", "އީމެއިލް"),
    island: tr("Island", "ރަށް"),
    service: tr("Service", "ޚިދުމަތް"),
    amount: tr("Fee", "ފީ"),
  }

  const load = (name: string, text: string) => {
    const parsed = parseCsv(text)
    setCsv({ name, ...parsed })
    setMapping(Object.fromEntries(parsed.headers.map((h) => [h, GUESS[h.toLowerCase()] ?? "skip"])))
    setUploadError(undefined)
  }

  const preview = React.useMemo(
    () =>
      csv ? validateRows(csv.rows, csv.headers, mapping, new Set(apps.map((a) => a.idCard)), tr) : ([] as PreviewRow[]),
    [csv, mapping, apps, tr],
  )
  const invalid = preview.filter((r) => r.errors.length)
  const valid = preview.filter((r) => !r.errors.length)

  const columns: DataTableColumn<PreviewRow>[] = [
    { id: "row", header: tr("Row", "ލައިން"), numeric: true },
    { id: "name", header: fieldLabels.name, primary: true, accessor: (r) => r.values.name },
    { id: "idCard", header: fieldLabels.idCard, accessor: (r) => r.values.idCard, className: "font-mono text-xs" },
    { id: "island", header: fieldLabels.island, accessor: (r) => r.values.island },
    { id: "service", header: fieldLabels.service, accessor: (r) => r.values.service },
    {
      id: "problems",
      header: tr("Problems", "މައްސަލަތައް"),
      cell: (r) =>
        r.errors.length ? (
          <ul className="text-xs text-destructive">
            {r.errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        ) : (
          <span className="text-xs text-success">{tr("Ready", "ތައްޔާރު")}</span>
        ),
    },
  ]

  const runImport = async () => {
    const rows = onInvalid === "skip" ? valid : invalid.length ? [] : valid
    if (onInvalid === "stop" && invalid.length) {
      setResult({ imported: 0, skipped: preview.length })
      return
    }
    for (let i = 0; i <= rows.length; i++) {
      setProgress(rows.length ? Math.round((i / rows.length) * 100) : 100)
      await wait(150)
    }
    for (const r of rows) {
      const service = SERVICES.find((s) => s.en === r.values.service)!
      addApplication({
        name: r.values.name,
        nameDv: r.values.name,
        idCard: r.values.idCard,
        phone: r.values.phone ? `+960 ${r.values.phone.slice(0, 3)}-${r.values.phone.slice(3)}` : "",
        email: r.values.email,
        island: ISLANDS.find((x) => x.en === r.values.island)!.value,
        service: service.value,
        status: "submitted",
        amount: Number(r.values.amount) || service.fee,
        submitted: TODAY,
        updated: TODAY,
        assignee: null,
        address: null,
        remarks: null,
        documents: 0,
        deletedAt: null,
      })
    }
    setResult({ imported: rows.length, skipped: preview.length - rows.length })
  }

  const reset = () => {
    setCsv(null)
    setProgress(null)
    setResult(null)
  }

  return (
    <AdminShell
      breadcrumbs={[
        { label: tr("Applications", "އެޕްލިކޭޝަންތައް"), href: routes.adminRecords.indexTable },
        { label: tr("Import", "އިމްޕޯޓް") },
      ]}
    >
      <div className="gap-6 grid">
        <PageTitle
          title={tr("Import applications", "އެޕްލިކޭޝަން އިމްޕޯޓްކުރޭ")}
          description={tr(
            "Bring in applications received on paper from a CSV file.",
            "ކަރުދާހުން ލިބުނު އެޕްލިކޭޝަންތައް CSV ފައިލަކުން ވައްދާ.",
          )}
          links={[
            {
              label: tr("All applications", "ހުރިހާ އެޕްލިކޭޝަނެއް"),
              href: routes.adminRecords.indexTable,
              icon: "back",
            },
          ]}
        />

        {result ? (
          <Callout
            variant={result.imported ? "success" : "warning"}
            title={
              result.imported
                ? tr(`${result.imported} applications imported`, `${result.imported} އެޕްލިކޭޝަން އިމްޕޯޓްކުރެވިއްޖެ`)
                : tr("Nothing was imported", "އެއްވެސް އެއްޗެއް އިމްޕޯޓެއް ނުކުރެވުނު")
            }
            description={
              result.skipped
                ? tr(
                    `${result.skipped} rows were skipped because of errors.`,
                    `މައްސަލަ ހުރުމުން ${result.skipped} ލައިން ދޫކޮށްލެވުނު.`,
                  )
                : undefined
            }
            actions={
              <div className="gap-2 flex flex-wrap">
                <LinkButton href={routes.adminRecords.indexTable} size="sm">
                  {tr("View applications", "އެޕްލިކޭޝަންތައް ބައްލަވާ")}
                </LinkButton>
                <Button size="sm" variant="outline" onClick={reset}>
                  {tr("Import another file", "އެހެން ފައިލެއް")}
                </Button>
              </div>
            }
          />
        ) : (
          <Card className="px-4">
            <Wizard
              finishLabel={tr("Import", "އިމްޕޯޓްކުރޭ")}
              onComplete={runImport}
              steps={[
                {
                  id: "upload",
                  title: tr("Upload", "އަޕްލޯޑް"),
                  description: tr("Choose a CSV file", "CSV ފައިލެއް"),
                  validate: () => {
                    if (!csv)
                      setUploadError(
                        tr("Choose a CSV file to import.", "އިމްޕޯޓްކުރާނެ CSV ފައިލެއް އިޚްތިޔާރުކުރައްވާ."),
                      )
                    return !!csv
                  },
                  content: (
                    <div className="gap-4 grid">
                      <FormField
                        label={tr("CSV file", "CSV ފައިލް")}
                        name="file"
                        error={uploadError}
                        help={tr(
                          "The first row must hold the column names. Up to 5 MB.",
                          "ފުރަތަމަ ލައިނުގައި ކޮލަމްގެ ނަންތައް. 5 MB އަށް.",
                        )}
                      >
                        <DropzoneUploader
                          accept=".csv,text/csv"
                          maxFiles={1}
                          maxSize={5 * 1024 * 1024}
                          onChange={async (next) => {
                            const file = next[0]
                            if (file) load(file.name, await file.text())
                            else setCsv(null)
                          }}
                        />
                      </FormField>
                      <div className="gap-2 flex flex-wrap items-center">
                        <Button
                          variant="outline"
                          size="sm"
                          startIcon="file-spreadsheet"
                          onClick={() => load("applications-sample.csv", SAMPLE_CSV)}
                        >
                          {tr("Use the sample file", "ނަމޫނާ ފައިލް ބޭނުންކުރޭ")}
                        </Button>
                        {csv ? (
                          <span className="text-sm text-muted-foreground">
                            {tr(`${csv.name}: ${csv.rows.length} rows`, `${csv.name}: ${csv.rows.length} ލައިން`)}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  ),
                },
                {
                  id: "map",
                  title: tr("Map columns", "ކޮލަމް ގުޅާ"),
                  description: tr("Match file columns to fields", "ފައިލުގެ ކޮލަމްތައް ފީލްޑުތަކާ"),
                  validate: () => {
                    const mapped = Object.values(mapping)
                    const missing = REQUIRED.filter((f) => !mapped.includes(f))
                    const dupes = mapped.filter((v, i) => v !== "skip" && mapped.indexOf(v) !== i)
                    const error = missing.length
                      ? tr(
                          `Map a column to: ${missing.map((f) => fieldLabels[f]).join(", ")}.`,
                          `މި ފީލްޑުތަކަށް ކޮލަމެއް ގުޅާ: ${missing.map((f) => fieldLabels[f]).join("، ")}.`,
                        )
                      : dupes.length
                        ? tr("Each field can only be used once.", "ކޮންމެ ފީލްޑެއް ބޭނުންކުރެވޭނީ އެއްފަހަރު.")
                        : undefined
                    setMapError(error)
                    return !error
                  },
                  content: (
                    <div className="gap-4 grid">
                      {mapError ? <Callout variant="destructive" title={mapError} /> : null}
                      <div className="gap-4 sm:grid-cols-2 grid">
                        {csv?.headers.map((h) => (
                          <FormField
                            key={h}
                            label={h}
                            name={`map_${h}`}
                            help={tr(
                              `e.g. ${csv.rows[0]?.[csv.headers.indexOf(h)] ?? ""}`,
                              `މިސާލު: ${csv.rows[0]?.[csv.headers.indexOf(h)] ?? ""}`,
                            )}
                          >
                            <Select
                              value={mapping[h] ?? "skip"}
                              onValueChange={(v) => setMapping((m) => ({ ...m, [h]: v }))}
                              options={[
                                { value: "skip", label: tr("Don't import", "އިމްޕޯޓް ނުކުރާ") },
                                ...(Object.keys(fieldLabels) as FieldKey[]).map((f) => ({
                                  value: f,
                                  label: `${fieldLabels[f]}${REQUIRED.includes(f) ? " *" : ""}`,
                                })),
                              ]}
                            />
                          </FormField>
                        ))}
                      </div>
                    </div>
                  ),
                },
                {
                  id: "preview",
                  title: tr("Preview", "ޕްރިވިއު"),
                  description: tr("Check for errors", "މައްސަލަ ބަލާ"),
                  content: (
                    <div className="gap-4 grid">
                      <Callout
                        variant={invalid.length ? "warning" : "success"}
                        title={tr(
                          `${valid.length} rows ready, ${invalid.length} with errors`,
                          `${valid.length} ލައިން ތައްޔާރު، ${invalid.length} ލައިނުގައި މައްސަލަ`,
                        )}
                        description={
                          invalid.length
                            ? tr(
                                "Fix the file and upload it again, or skip these rows in the next step.",
                                "ފައިލް ރަނގަޅުކޮށް އަލުން އަޕްލޯޑްކުރައްވާ، ނުވަތަ ދެން އޮތް ބައިގައި މި ލައިންތައް ދޫކޮށްލައްވާ.",
                              )
                            : undefined
                        }
                      />
                      <Switch
                        label={tr("Only rows with errors", "މައްސަލަ ހުރި ލައިންތައް އެކަނި")}
                        checked={onlyErrors}
                        onCheckedChange={setOnlyErrors}
                      />
                      <DataTable
                        caption={tr("Rows to import", "އިމްޕޯޓްކުރާ ލައިންތައް")}
                        columns={columns}
                        data={onlyErrors ? invalid : preview}
                        noun={labels.dv ? { one: "ލައިން", other: "ލައިން" } : { one: "row", other: "rows" }}
                      />
                    </div>
                  ),
                },
                {
                  id: "confirm",
                  title: tr("Confirm", "ކަށަވަރުކުރޭ"),
                  description: tr("Import the rows", "ލައިންތައް ވައްދާ"),
                  content: (
                    <div className="gap-6 grid">
                      <DescriptionList
                        items={[
                          { label: tr("File", "ފައިލް"), value: csv?.name },
                          { label: tr("Rows ready", "ތައްޔާރު ލައިން"), value: String(valid.length) },
                          { label: tr("Rows with errors", "މައްސަލަ ހުރި ލައިން"), value: String(invalid.length) },
                          { label: tr("New status", "ސްޓޭޓަސް"), value: labels.status("submitted") },
                        ]}
                      />
                      <FormField label={tr("Rows with errors", "މައްސަލަ ހުރި ލައިންތައް")} name="on_invalid">
                        <RadioGroup
                          value={onInvalid}
                          onValueChange={setOnInvalid}
                          options={[
                            {
                              value: "skip",
                              label: tr("Skip them and import the rest", "އެ ލައިންތައް ދޫކޮށް ބާކީ އެއްޗެހި ވައްދާ"),
                            },
                            {
                              value: "stop",
                              label: tr("Don't import anything", "އެއްވެސް އެއްޗެއް ނުވައްދާ"),
                            },
                          ]}
                        />
                      </FormField>
                      {progress !== null ? (
                        <ProgressBar label={tr("Importing…", "އިމްޕޯޓްކުރަނީ…")} value={progress} />
                      ) : null}
                    </div>
                  ),
                },
              ]}
            />
          </Card>
        )}
      </div>
    </AdminShell>
  )
}
