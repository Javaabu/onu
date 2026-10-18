var e=`import * as React from "react"
import {
  AttachmentPreview,
  Button,
  Callout,
  Card,
  Checkbox,
  ConfirmDialog,
  DescriptionList,
  FormField,
  PageTitle,
  ProgressBar,
  RadioGroup,
  StatusBadge,
  Textarea,
  Timeline,
  toast,
  type TimelineItem,
} from "@javaabu/onu"

import { AdminShell } from "../_shared/shells"
import { useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import { applicant, picture, samplePdf, useApplicationStatuses, useFormat, type ApplicationStatus, wait } from "./_data"

export const meta = { title: "Application review", group: "Applications and workflows", layout: "bare", order: 2 }

type Decision = "approve" | "changes" | "reject"

const CHECKS = ["id", "photo", "name", "premises", "fee"] as const

export default function ApplicationReviewPage() {
  const tr = useTr()
  const { money, dateTime } = useFormat()
  const statuses = useApplicationStatuses()

  const [status, setStatus] = React.useState<ApplicationStatus>("in_review")
  const [checked, setChecked] = React.useState<Record<string, boolean>>({ id: true, fee: true })
  const [decision, setDecision] = React.useState<Decision | "">("")
  const [remarks, setRemarks] = React.useState("")
  const [errors, setErrors] = React.useState<{ decision?: string; remarks?: string; checklist?: string }>({})
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [history, setHistory] = React.useState<TimelineItem[]>([])

  const checkLabels: Record<(typeof CHECKS)[number], string> = {
    id: tr("ID card matches the National Registration Bureau", "އައިޑީ ކާޑު ނޭޝަނަލް ރަޖިސްޓްރޭޝަން ބިއުރޯއާ ދިމާވޭ"),
    photo: tr("Photo meets the requirements", "ފޮޓޯ ޝަރުތުތަކާ އެއްގޮތް"),
    name: tr("Business name is available", "ވިޔަފާރީގެ ނަން ލިބެން ހުރި"),
    premises: tr("Premises inspected", "ތަން ބަލައިފި"),
    fee: tr("Fee paid", "ފީ ދައްކާފައި"),
  }
  const done = CHECKS.filter((c) => checked[c]).length

  const decisionText: Record<Decision, { label: string; confirm: string; toast: string; status: ApplicationStatus }> = {
    approve: {
      label: tr("Approve", "ފާސްކުރޭ"),
      confirm: tr("Approve this application?", "މި އެޕްލިކޭޝަން ފާސްކުރަންވީތޯ؟"),
      toast: tr("Application approved", "އެޕްލިކޭޝަން ފާސްކުރެވިއްޖެ"),
      status: "approved",
    },
    changes: {
      label: tr("Request changes", "ބަދަލަށް އެދޭ"),
      confirm: tr("Send this application back for changes?", "ބަދަލުތަކަށް އެދި އެޕްލިކޭޝަން ފޮނުވަންވީތޯ؟"),
      toast: tr("Changes requested", "ބަދަލަށް އެދިއްޖެ"),
      status: "needs_info",
    },
    reject: {
      label: tr("Reject", "ރިޖެކްޓްކުރޭ"),
      confirm: tr("Reject this application?", "މި އެޕްލިކޭޝަން ރިޖެކްޓްކުރަންވީތޯ؟"),
      toast: tr("Application rejected", "އެޕްލިކޭޝަން ރިޖެކްޓްކުރެވިއްޖެ"),
      status: "rejected",
    },
  }

  const validate = () => {
    const e: typeof errors = {}
    if (!decision) e.decision = tr("Choose a decision.", "ނިންމުމެއް ހޮވާ.")
    if ((decision === "reject" || decision === "changes") && remarks.trim().length < 10)
      e.remarks = tr(
        "Explain the reason to the applicant (at least 10 characters).",
        "ސަބަބު އެޕްލިކަންޓަށް ބަޔާންކުރައްވާ (މަދުވެގެން 10 އަކުރު).",
      )
    if (decision === "approve" && done < CHECKS.length)
      e.checklist = tr(
        "Complete every checklist item before approving.",
        "ފާސްކުރުމުގެ ކުރިން ހުރިހާ ޗެކްލިސްޓެއް ފުރިހަމަކުރޭ.",
      )
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const apply = async () => {
    if (!decision) return
    await wait(1000)
    const d = decisionText[decision]
    setStatus(d.status)
    setHistory((h) => [
      {
        id: \`decision-\${h.length}\`,
        title: d.toast,
        description: remarks.trim() ? (
          <span lang="dv" dir="auto">
            {remarks.trim()}
          </span>
        ) : (
          tr("By Aishath Shifa", "އައިޝަތު ޝިފާ")
        ),
        time: new Date(),
        status: decision === "approve" ? "success" : decision === "reject" ? "error" : "warning",
      },
      ...h,
    ])
    toast.success(d.toast, { description: "APP-2026-00412" })
    setDecision("")
    setRemarks("")
  }

  const decided = status !== "in_review"

  const timeline: TimelineItem[] = [
    ...history,
    {
      id: "review",
      title: tr("Review started", "ރިވިއު ފެށީ"),
      description: tr("Assigned to Aishath Shifa", "އައިޝަތު ޝިފާއަށް ހަވާލުކުރެވުނު"),
      time: "2026-10-02T11:00:00",
      status: decided ? "success" : "current",
    },
    {
      id: "paid",
      title: tr("Fee paid", "ފީ ދެއްކި"),
      description: \`\${money(350)} · BML Connect\`,
      time: "2026-09-29T10:30:00",
      status: "success",
    },
    {
      id: "submitted",
      title: tr("Application submitted", "އެޕްލިކޭޝަން ހުށަހެޅީ"),
      description: tr("Online through eServices", "އީ ސަރވިސަސް މެދުވެރިކޮށް"),
      time: "2026-09-29T10:12:00",
      status: "success",
    },
  ]

  return (
    <AdminShell
      breadcrumbs={[
        { label: tr("Applications", "އެޕްލިކޭޝަންތައް"), href: routes.adminRecords.indexTable },
        { label: "APP-2026-00412" },
      ]}
      contentWidth="wide"
    >
      <div className="gap-6 grid">
        <PageTitle
          title={tr("Business licence: Ahmed Ali", "ވިޔަފާރީގެ ލައިސަންސް: އަޙްމަދު ޢަލީ")}
          description={\`APP-2026-00412 · \${tr("Submitted", "ހުށަހެޅީ")} \${dateTime("2026-09-29T10:12:00")}\`}
          links={[
            {
              label: tr("All applications", "ހުރިހާ އެޕްލިކޭޝަނެއް"),
              href: routes.adminRecords.indexTable,
              icon: "back",
            },
          ]}
          actions={<StatusBadge status={status} statusMap={statuses} size="lg" />}
        />

        <div className="gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] grid items-start">
          <div className="gap-6 min-w-0 grid">
            <Card headingLevel={2} title={tr("Application details", "އެޕްލިކޭޝަންގެ ތަފްސީލު")}>
              <DescriptionList
                items={[
                  { label: tr("Applicant", "އެޕްލިކަންޓް"), value: tr(...applicant.name) },
                  { label: tr("ID card", "އައިޑީ ކާޑު"), value: applicant.idCard, copyable: true },
                  { label: tr("Mobile", "މޯބައިލް"), value: <span dir="ltr">+960 777 1234</span> },
                  { label: tr("Email", "އީމެއިލް"), value: applicant.email },
                  {
                    label: tr("Address", "އެޑްރެސް"),
                    value: tr("Lot 10234, Nirolhu Magu, Hulhumalé", "ލޮޓް 10234، ނިރޮޅު މަގު، ހުޅުމާލެ"),
                  },
                  {
                    label: tr("Business name", "ވިޔަފާރީގެ ނަން"),
                    value: tr("Ocean Breeze Café", "އޯޝަން ބްރީޒް ކެފޭ"),
                  },
                  { label: tr("Activity", "ބާވަތް"), value: tr("Café or restaurant", "ކެފޭ ނުވަތަ ރެސްޓޯރަންޓް") },
                  { label: tr("Period", "މުއްދަތު"), value: tr("1 year, express", "1 އަހަރު، އަވަސް ޚިދުމަތް") },
                  { label: tr("Fee", "ފީ"), value: money(350) },
                  { label: tr("Previous licences", "ކުރީގެ ލައިސަންސް"), value: null },
                ]}
              />
            </Card>

            <Card
              headingLevel={2}
              title={tr("Documents", "ލިޔެކިޔުންތައް")}
              description={tr("Select a document to preview it.", "ބެލުމަށް ލިޔުމަކަށް ފިތާލާ.")}
            >
              <div className="gap-2 grid">
                <AttachmentPreview
                  name="id-card-front.jpg"
                  url={picture("ID card (front)", 160)}
                  size={412_000}
                  alt={tr("ID card, front", "އައިޑީ ކާޑު، ކުރިމަތި")}
                />
                <AttachmentPreview
                  name="id-card-back.jpg"
                  url={picture("ID card (back)", 160)}
                  size={398_000}
                  alt={tr("ID card, back", "އައިޑީ ކާޑު، ފަހަތް")}
                />
                <AttachmentPreview
                  name="passport-photo.jpg"
                  url={picture("Photo", 30, 400, 520)}
                  size={186_000}
                  alt={tr("Passport photo", "ޕާސްޕޯޓް ފޮޓޯ")}
                />
                <AttachmentPreview name="lease-agreement.pdf" url={samplePdf} size={240_000} />
              </div>
            </Card>

            <Card headingLevel={2} title={tr("Timeline", "ޓައިމްލައިން")}>
              <Timeline items={timeline} />
            </Card>
          </div>

          <div className="gap-6 min-w-0 lg:sticky lg:top-20 grid">
            <Card
              headingLevel={2}
              title={tr("Checklist", "ޗެކްލިސްޓް")}
              description={tr(\`\${done} of \${CHECKS.length} done\`, \`\${CHECKS.length} ން \${done} ނިމިފައި\`)}
            >
              <div className="gap-4 grid">
                <ProgressBar
                  aria-label={tr("Checklist progress", "ޗެކްލިސްޓް")}
                  value={done}
                  max={CHECKS.length}
                  size="sm"
                  color={done === CHECKS.length ? "success" : "primary"}
                />
                <div className="gap-3 grid" role="group" aria-label={tr("Checklist", "ޗެކްލިސްޓް")}>
                  {CHECKS.map((c) => (
                    <Checkbox
                      key={c}
                      label={checkLabels[c]}
                      checked={!!checked[c]}
                      disabled={decided}
                      onCheckedChange={(v) => {
                        setChecked((s) => ({ ...s, [c]: v === true }))
                        setErrors((e) => ({ ...e, checklist: undefined }))
                      }}
                    />
                  ))}
                </div>
                {errors.checklist ? (
                  <p role="alert" className="text-sm text-destructive">
                    {errors.checklist}
                  </p>
                ) : null}
              </div>
            </Card>

            <Card headingLevel={2} title={tr("Decision", "ނިންމުން")}>
              {decided ? (
                <div className="gap-4 grid">
                  <Callout
                    variant={status === "approved" ? "success" : status === "rejected" ? "destructive" : "warning"}
                    title={timeline[0]?.title}
                    description={tr(
                      "The applicant has been notified by SMS and email.",
                      "އެޕްލިކަންޓަށް އެސްއެމްއެސް އާއި އީމެއިލް ފޮނުވިއްޖެ.",
                    )}
                  />
                  <Button variant="outline" onClick={() => setStatus("in_review")} startIcon="undo">
                    {tr("Reopen review", "ރިވިއު އަލުން ފަށާ")}
                  </Button>
                </div>
              ) : (
                <form
                  noValidate
                  className="gap-4 grid"
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (validate()) setConfirmOpen(true)
                  }}
                >
                  <FormField label={tr("Outcome", "ނަތީޖާ")} error={errors.decision} required>
                    <RadioGroup
                      value={decision}
                      onValueChange={(v) => {
                        setDecision(v as Decision)
                        setErrors({})
                      }}
                      options={[
                        { value: "approve", label: tr("Approve", "ފާސްކުރޭ") },
                        { value: "changes", label: tr("Request changes", "ބަދަލަށް އެދޭ") },
                        { value: "reject", label: tr("Reject", "ރިޖެކްޓްކުރޭ") },
                      ]}
                    />
                  </FormField>
                  <FormField
                    label={tr("Remarks to the applicant", "އެޕްލިކަންޓަށް ރިމާކްސް")}
                    help={tr(
                      "Required when rejecting or requesting changes.",
                      "ރިޖެކްޓްކުރާއިރު ނުވަތަ ބަދަލަށް އެދޭއިރު ލާޒިމް.",
                    )}
                    error={errors.remarks}
                    required={decision === "reject" || decision === "changes"}
                  >
                    <Textarea
                      thaana
                      thaanaToggle
                      showCount
                      maxLength={500}
                      value={remarks}
                      onChange={(e) => {
                        setRemarks(e.target.value)
                        setErrors((x) => ({ ...x, remarks: undefined }))
                      }}
                      placeholder="ސަބަބު ލިޔުއްވާ"
                    />
                  </FormField>
                  <Button
                    type="submit"
                    variant={decision === "reject" ? "destructive" : "default"}
                    startIcon={decision === "reject" ? "close" : decision === "changes" ? "reply" : "check"}
                  >
                    {decision ? decisionText[decision].label : tr("Submit decision", "ނިންމުން ހުށަހަޅާ")}
                  </Button>
                </form>
              )}
            </Card>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={decision ? decisionText[decision].confirm : ""}
        description={
          decision === "approve"
            ? tr(
                "The licence is issued straight away and the applicant is notified.",
                "ލައިސަންސް ވަގުތުން ދޫކުރެވި، އެޕްލިކަންޓަށް އަންގާނެ.",
              )
            : tr("The applicant will see your remarks.", "ތިޔަ ރިމާކްސް އެޕްލިކަންޓަށް ފެންނާނެ.")
        }
        confirmLabel={decision ? decisionText[decision].label : undefined}
        variant={decision === "reject" ? "destructive" : "default"}
        icon={decision === "approve" ? "success" : decision === "reject" ? "error" : "warning"}
        onConfirm={apply}
      />
    </AdminShell>
  )
}
`;export{e as default};