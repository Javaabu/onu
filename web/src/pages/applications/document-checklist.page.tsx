import * as React from "react"
import {
  AttachmentPreview,
  Button,
  Callout,
  Card,
  DropzoneUploader,
  LinkButton,
  PageTitle,
  ProgressBar,
  StatusBadge,
  Tag,
  toast,
  type StatusMap,
} from "@javaabu/onu"

import { CitizenShell } from "../_shared/shells"
import { useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import { fakeUpload, picture, samplePdf, wait, type L } from "./_data"

export const meta = {
  title: "Document upload checklist",
  group: "Applications and workflows",
  layout: "bare",
  order: 4,
}

type DocStatus = "missing" | "requested" | "uploaded" | "verified"

interface ChecklistItem {
  id: string
  title: L
  help: L
  required: boolean
  accept: string
  status: DocStatus
  file?: { name: string; size: number; url?: string }
}

const initial: ChecklistItem[] = [
  {
    id: "id_card",
    title: ["National ID card (both sides)", "ދިވެހި ރައްޔިތެއްކަން އަންގައިދޭ ކާޑު (ދެފަރާތް)"],
    help: ["PDF or image, up to 2 MB.", "PDF ނުވަތަ ފޮޓޯ، 2MB އާ ހަމައަށް."],
    required: true,
    accept: ".pdf,image/*",
    status: "verified",
    file: { name: "id-card.jpg", size: 412_000, url: picture("ID card", 160) },
  },
  {
    id: "photo",
    title: ["Passport photo", "ޕާސްޕޯޓް ފޮޓޯ"],
    help: ["JPG or PNG on a white background.", "ހުދު ފަސްބިމާއެކު JPG ނުވަތަ PNG."],
    required: true,
    accept: "image/*",
    status: "uploaded",
    file: { name: "passport-photo.jpg", size: 186_000, url: picture("Photo", 30, 400, 520) },
  },
  {
    id: "lease",
    title: ["Signed lease agreement", "ސޮއިކުރެވިފައިވާ ކުލި އެއްބަސްވުން"],
    help: ["Requested by the reviewer on 5 Oct.", "ރިވިއުކުރާ މުވައްޒަފު އެދިފައި (5 އޮކްޓޫބަރު)."],
    required: true,
    accept: ".pdf",
    status: "requested",
  },
  {
    id: "tin",
    title: ["MIRA taxpayer registration", "މީރާގެ ޓެކްސް ރަޖިސްޓްރީ"],
    help: ["The TIN certificate from MIRA.", "މީރާއިން ދޫކުރާ ޓީއައިއެން ސެޓްފިކެޓް."],
    required: true,
    accept: ".pdf",
    status: "missing",
  },
  {
    id: "council",
    title: ["Island council approval", "ރަށު ކައުންސިލުގެ ހުއްދަ"],
    help: ["Only for premises outside Malé.", "މާލެއިން ބޭރުގައިވާ ތަންތަނަށް."],
    required: false,
    accept: ".pdf",
    status: "missing",
  },
  {
    id: "premises",
    title: ["Photos of the premises", "ތަނުގެ ފޮޓޯ"],
    help: ["Up to 5 photos.", "5 ފޮޓޯއާ ހަމައަށް."],
    required: false,
    accept: "image/*",
    status: "missing",
  },
]

export default function DocumentChecklistPage() {
  const tr = useTr()
  const [items, setItems] = React.useState(initial)
  const [submitting, setSubmitting] = React.useState(false)
  const [sent, setSent] = React.useState(false)

  const statusMap: StatusMap = {
    missing: { tone: "neutral", label: tr("Not uploaded", "އަޕްލޯޑް ނުކުރޭ") },
    requested: { tone: "warning", label: tr("Requested", "އެދިފައި") },
    uploaded: { tone: "info", label: tr("Uploaded", "އަޕްލޯޑްކުރެވިފައި") },
    verified: { tone: "success", label: tr("Verified", "ޗެކްކުރެވިފައި") },
  }

  const update = (id: string, patch: Partial<ChecklistItem>) =>
    setItems((list) => list.map((i) => (i.id === id ? { ...i, ...patch } : i)))

  const required = items.filter((i) => i.required)
  const requiredDone = required.filter((i) => i.status === "uploaded" || i.status === "verified").length
  const allDone = items.filter((i) => i.status === "uploaded" || i.status === "verified").length
  const ready = requiredDone === required.length

  return (
    <CitizenShell
      breadcrumbs={[
        { label: tr("My applications", "އަޅުގަނޑުގެ އެޕްލިކޭޝަންތައް"), href: routes.citizen.applications },
        { label: "APP-2026-00412", href: routes.applications.statusTracker },
        { label: tr("Documents", "ލިޔެކިޔުންތައް") },
      ]}
    >
      <div className="gap-6 max-w-4xl grid">
        <PageTitle
          title={tr("Documents for your application", "އެޕްލިކޭޝަނަށް ބޭނުންވާ ލިޔެކިޔުން")}
          description={`APP-2026-00412 · ${tr("Business licence (new)", "ވިޔަފާރީގެ ލައިސަންސް (އާ)")}`}
          links={[
            { label: tr("Back to status", "ސްޓޭޓަސްއަށް"), href: routes.applications.statusTracker, icon: "back" },
          ]}
        />

        <Card>
          <div className="gap-3 grid">
            <ProgressBar
              label={tr("Required documents", "ލާޒިމް ލިޔެކިޔުން")}
              value={requiredDone}
              max={required.length}
              color={ready ? "success" : "primary"}
              formatValue={(v, max) => tr(`${v} of ${max} uploaded`, `${max} ން ${v} އަޕްލޯޑްކުރެވިފައި`)}
            />
            <p className="text-sm text-muted-foreground">
              {tr(
                `${allDone} of ${items.length} documents in total, including optional ones.`,
                `ލާޒިމްނޫން ލިޔުންތަކާއެކު ޖުމްލަ ${items.length} ން ${allDone}.`,
              )}
            </p>
          </div>
        </Card>

        <ul className="gap-4 grid" aria-label={tr("Documents", "ލިޔެކިޔުންތައް")}>
          {items.map((item) => (
            <li key={item.id}>
              <Card
                headingLevel={2}
                title={tr(...item.title)}
                description={tr(...item.help)}
                actions={
                  <div className="gap-2 flex flex-wrap items-center">
                    <Tag size="sm" variant={item.required ? "primary" : "outline"}>
                      {item.required ? tr("Required", "ލާޒިމް") : tr("Optional", "ލާޒިމެއް ނޫން")}
                    </Tag>
                    <StatusBadge status={item.status} statusMap={statusMap} />
                  </div>
                }
              >
                {item.file ? (
                  <AttachmentPreview
                    name={item.file.name}
                    size={item.file.size}
                    url={item.file.url}
                    onRemove={
                      item.status === "verified" || sent
                        ? undefined
                        : () =>
                            update(item.id, { status: item.id === "lease" ? "requested" : "missing", file: undefined })
                    }
                  />
                ) : (
                  <DropzoneUploader
                    appearance="input"
                    multiple={false}
                    inputProps={{ "aria-label": tr(...item.title) }}
                    upload={fakeUpload}
                    accept={item.accept}
                    maxSize={5 * 1024 * 1024}
                    disabled={sent}
                    onUploaded={(u) =>
                      update(item.id, {
                        status: "uploaded",
                        file: {
                          name: u.file.name,
                          size: u.file.size,
                          url: u.file.type === "application/pdf" ? samplePdf : picture(u.file.name, 200),
                        },
                      })
                    }
                  />
                )}
              </Card>
            </li>
          ))}
        </ul>

        {sent ? (
          <Callout
            variant="success"
            title={tr("Documents sent for review", "ލިޔެކިޔުން ރިވިއުއަށް ފޮނުވިއްޖެ")}
            description={tr(
              "We'll let you know if anything else is needed.",
              "އިތުރު އެއްޗެއް ބޭނުންވެއްޖެނަމަ އަންގާނަން.",
            )}
            actions={
              <LinkButton href={routes.applications.statusTracker} size="sm" variant="outline">
                {tr("Back to status", "ސްޓޭޓަސްއަށް")}
              </LinkButton>
            }
          />
        ) : (
          <div className="gap-3 flex flex-wrap items-center justify-end">
            {!ready ? (
              <p className="text-sm text-muted-foreground" id="send-hint">
                {tr(
                  "Upload every required document to continue.",
                  "ކުރިއަށް ދިއުމަށް ހުރިހާ ލާޒިމް ލިޔުމެއް އަޕްލޯޑްކުރައްވާ.",
                )}
              </p>
            ) : null}
            <Button
              disabled={!ready}
              aria-describedby={!ready ? "send-hint" : undefined}
              loading={submitting}
              startIcon="send"
              onClick={async () => {
                setSubmitting(true)
                await wait(900)
                setSubmitting(false)
                setSent(true)
                toast.success(tr("Documents sent", "ލިޔެކިޔުން ފޮނުވިއްޖެ"), { description: "APP-2026-00412" })
              }}
            >
              {tr("Send for review", "ރިވިއުއަށް ފޮނުވާ")}
            </Button>
          </div>
        )}
      </div>
    </CitizenShell>
  )
}
