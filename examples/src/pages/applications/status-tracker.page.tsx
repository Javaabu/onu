import {
  Callout,
  Card,
  DescriptionList,
  IconText,
  LinkButton,
  PageTitle,
  ProgressBar,
  StatusBadge,
  Timeline,
} from "@javaabu/onu"

import { CitizenShell } from "../_shared/shells"
import { useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import { useApplicationStatuses, useFormat } from "./_data"

export const meta = {
  title: "Application status tracker",
  group: "Applications and workflows",
  layout: "bare",
  order: 3,
}

export default function StatusTrackerPage() {
  const tr = useTr()
  const { money, date } = useFormat()
  const statuses = useApplicationStatuses()

  const stages = [
    {
      id: "submitted",
      title: tr("Application submitted", "އެޕްލިކޭޝަން ހުށަހެޅީ"),
      description: tr("Received online through eServices.", "އީ ސަރވިސަސް މެދުވެރިކޮށް ލިބުނު."),
      time: "2026-09-29T10:12:00",
      status: "success" as const,
    },
    {
      id: "paid",
      title: tr("Fee paid", "ފީ ދެއްކި"),
      description: `${money(350)} · BML Connect · RCT-2026-08841`,
      time: "2026-09-29T10:30:00",
      status: "success" as const,
    },
    {
      id: "review",
      title: tr("Documents reviewed", "ލިޔެކިޔުންތައް ރިވިއުކުރެވުނު"),
      description: tr("Ministry of Economic Development, Malé.", "އިޤްތިޞާދީ ތަރައްޤީއާ ބެހޭ ވުޒާރާ، މާލެ."),
      time: "2026-10-02T11:00:00",
      status: "success" as const,
    },
    {
      id: "changes",
      title: tr("Additional document requested", "އިތުރު ލިޔުމެއް ހުށަހަޅަން އެދިފައި"),
      description: tr(
        "Upload a signed lease agreement for the premises at Hulhumalé.",
        "ހުޅުމާލޭގައިވާ ތަނުގެ ސޮއިކުރެވިފައިވާ ކުލި އެއްބަސްވުން އަޕްލޯޑްކުރައްވާ.",
      ),
      time: "2026-10-05T14:20:00",
      status: "current" as const,
      content: (
        <LinkButton href={routes.applications.documentChecklist} size="sm" startIcon="upload">
          {tr("Upload document", "ލިޔުން އަޕްލޯޑްކުރޭ")}
        </LinkButton>
      ),
    },
    {
      id: "inspection",
      title: tr("Premises inspection", "ތަން ބެލުން"),
      description: tr("We'll call you to arrange a visit.", "ޒިޔާރަތެއް ރާވަން ގުޅާނަން."),
      status: "pending" as const,
    },
    {
      id: "decision",
      title: tr("Decision and licence", "ނިންމުމާއި ލައިސަންސް"),
      description: tr(
        "Usually within 5 working days of inspection.",
        "އާންމުކޮށް ތަން ބެލުމަށްފަހު 5 ބުރަސްފަތި ދުވަހުގެ ތެރޭގައި.",
      ),
      status: "pending" as const,
    },
  ]

  const complete = stages.filter((s) => s.status === "success").length

  return (
    <CitizenShell
      breadcrumbs={[
        { label: tr("My applications", "އަޅުގަނޑުގެ އެޕްލިކޭޝަންތައް"), href: routes.citizen.applications },
        { label: "APP-2026-00412" },
      ]}
    >
      <div className="gap-6 max-w-5xl grid">
        <PageTitle
          title={tr("Business licence (new)", "ވިޔަފާރީގެ ލައިސަންސް (އާ)")}
          description={`APP-2026-00412 · ${tr("Ocean Breeze Café", "އޯޝަން ބްރީޒް ކެފޭ")}`}
          links={[
            {
              label: tr("My applications", "އަޅުގަނޑުގެ އެޕްލިކޭޝަންތައް"),
              href: routes.citizen.applications,
              icon: "back",
            },
          ]}
          actions={<StatusBadge status="needs_info" statusMap={statuses} size="lg" />}
        />

        <Callout
          variant="warning"
          title={tr(
            "Action needed: upload your lease agreement",
            "ޢަމަލެއް ކުރަން ޖެހޭ: ކުލި އެއްބަސްވުން އަޕްލޯޑްކުރައްވާ",
          )}
          description={tr(
            `Upload it by ${date("2026-10-19T00:00:00")} or the application will be closed.`,
            `${date("2026-10-19T00:00:00")} ގެ ކުރިން އަޕްލޯޑް ނުކުރެއްވިއްޔާ އެޕްލިކޭޝަން ބަންދުކުރެވޭނެ.`,
          )}
          actions={
            <LinkButton href={routes.applications.documentChecklist} size="sm" startIcon="upload">
              {tr("Upload now", "މިހާރު އަޕްލޯޑްކުރޭ")}
            </LinkButton>
          }
        />

        <div className="gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] grid items-start">
          <Card headingLevel={2} title={tr("Progress", "ކުރިއެރުން")}>
            <div className="gap-6 grid">
              <ProgressBar
                label={tr("Steps complete", "ނިމިފައިވާ ބައިތައް")}
                value={complete}
                max={stages.length}
                formatValue={(v, max) => tr(`${v} of ${max}`, `${max} ން ${v}`)}
              />
              <Timeline items={stages} />
            </div>
          </Card>

          <div className="gap-6 grid">
            <Card headingLevel={2} title={tr("Next steps", "ކުރިއަށް ހުރި ކަންތައް")}>
              <ol className="gap-3 text-sm ps-5 grid list-decimal">
                <li>
                  {tr("Upload the signed lease agreement.", "ސޮއިކުރެވިފައިވާ ކުލި އެއްބަސްވުން އަޕްލޯޑްކުރައްވާ.")}
                </li>
                <li>{tr("Wait for our call to book the inspection.", "ތަން ބެލުމަށް ގުޅުމަށް އިންތިޒާރުކުރައްވާ.")}</li>
                <li>{tr("Download your licence once approved.", "ފާސްވުމުން ލައިސަންސް ޑައުންލޯޑްކުރައްވާ.")}</li>
              </ol>
            </Card>
            <Card headingLevel={2} title={tr("Summary", "ޚުލާޞާ")}>
              <DescriptionList
                layout="stacked"
                items={[
                  { label: tr("Reference", "ރެފަރެންސް"), value: "APP-2026-00412", copyable: true },
                  { label: tr("Submitted", "ހުށަހެޅީ"), value: date("2026-09-29T10:12:00") },
                  { label: tr("Fee", "ފީ"), value: `${money(350)} · ${tr("Paid", "ދައްކާފައި")}` },
                  {
                    label: tr("Handled by", "ބަލަނީ"),
                    value: tr("Business Registration Section", "ވިޔަފާރި ރަޖިސްޓްރީ ސެކްޝަން"),
                  },
                ]}
              />
              <div className="mt-4 gap-2 flex flex-wrap">
                <LinkButton href={routes.applications.receipt} variant="outline" size="sm" startIcon="file-text">
                  {tr("View receipt", "ރަސީދު ބަލާ")}
                </LinkButton>
              </div>
            </Card>
            <Card headingLevel={2} title={tr("Need help?", "އެހީއަށް ބޭނުންތޯ؟")} size="sm">
              <div className="gap-2 grid">
                <IconText icon="phone" tone="muted">
                  <span dir="ltr">+960 330 0000</span>
                </IconText>
                <IconText icon="mail" tone="muted">
                  business@trade.gov.mv
                </IconText>
                <IconText icon="clock" tone="muted">
                  {tr("Sunday–Thursday, 8:00–14:00", "އާދިއްތަ–ބުރާސްފަތި، 8:00–14:00")}
                </IconText>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </CitizenShell>
  )
}
