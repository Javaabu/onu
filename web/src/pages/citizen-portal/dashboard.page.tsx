import { Callout, Card, Icon, LinkButton, ListView, PageTitle, StatusBadge } from "@javaabu/onu"

import { CitizenShell } from "../_shared/shells"
import { useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import {
  applicant,
  applications,
  notifications,
  payments,
  useApplicationStatuses,
  useFormat,
  usePaymentStatuses,
} from "../applications/_data"

export const meta = { title: "Portal dashboard", group: "Citizen portal", layout: "bare", order: 1 }

export default function PortalDashboardPage() {
  const tr = useTr()
  const { money, date } = useFormat()
  const appStatuses = useApplicationStatuses()
  const payStatuses = usePaymentStatuses()

  const active = applications.filter((a) => a.status !== "approved" && a.status !== "rejected").slice(0, 4)
  const due = payments.filter((p) => p.status === "due" || p.status === "overdue")
  const notices = notifications.filter((n) => n.category === "announcements")

  const quickActions = [
    {
      href: routes.applications.wizard,
      icon: "add",
      title: tr("New application", "އައު އެޕްލިކޭޝަނެއް"),
      description: tr("Apply for a licence or permit", "ލައިސަންސް ނުވަތަ ހުއްދައަށް އެދުން"),
    },
    {
      href: routes.applications.checkout,
      icon: "credit-card",
      title: tr("Pay a bill", "ބިލެއް ދެއްކުން"),
      description: tr("BML Transfer or card", "ބީއެމްއެލް ޓްރާންސްފަރ ނުވަތަ ކާޑު"),
    },
    {
      href: routes.applications.documentChecklist,
      icon: "upload",
      title: tr("Upload documents", "ލިޔެކިޔުން އަޕްލޯޑްކުރުން"),
      description: tr("For applications in progress", "ކުރިއަށް ދާ އެޕްލިކޭޝަންތަކަށް"),
    },
    {
      href: routes.applications.statusTracker,
      icon: "history",
      title: tr("Track an application", "އެޕްލިކޭޝަނެއް ބެލުން"),
      description: tr("See where it is and what's next", "ހުރި ހާލަތާއި ކުރިއަށް ހުރި ކަންތައް"),
    },
  ]

  return (
    <CitizenShell>
      <div className="gap-6 grid">
        <PageTitle
          title={tr(`Good morning, ${applicant.firstName[0]}`, `ބާއްޖަވެރި ހެނދުނެއް، ${applicant.firstName[1]}`)}
          description={tr("Wednesday, 7 October 2026", "ބުދަ، 7 އޮކްޓޫބަރު 2026")}
          action={
            <LinkButton href={routes.applications.wizard} startIcon="add">
              {tr("New application", "އައު އެޕްލިކޭޝަން")}
            </LinkButton>
          }
        />

        <Callout
          variant="warning"
          title={tr("1 application needs your attention", "1 އެޕްލިކޭޝަނަކަށް ތިބާގެ ޢަމަލެއް ބޭނުންވޭ")}
          description={tr(
            "Upload a lease agreement for APP-2026-00412 by 19 October.",
            "19 އޮކްޓޫބަރުގެ ކުރިން APP-2026-00412 އަށް ކުލި އެއްބަސްވުން އަޕްލޯޑްކުރައްވާ.",
          )}
          actions={
            <LinkButton href={routes.applications.documentChecklist} size="sm">
              {tr("Upload now", "މިހާރު އަޕްލޯޑްކުރޭ")}
            </LinkButton>
          }
        />

        <section aria-labelledby="quick-actions">
          <h2 id="quick-actions" className="mb-3 text-lg font-semibold">
            {tr("Quick actions", "އަވަސް ޢަމަލުތައް")}
          </h2>
          <ul className="gap-3 sm:grid-cols-2 xl:grid-cols-4 grid">
            {quickActions.map((a) => (
              <li key={a.href + a.icon}>
                <Card
                  href={a.href}
                  size="sm"
                  className="h-full"
                  title={
                    <span className="gap-2 flex items-center">
                      <Icon name={a.icon} className="size-4 text-primary" />
                      {a.title}
                    </span>
                  }
                  description={a.description}
                />
              </li>
            ))}
          </ul>
        </section>

        <div className="gap-6 lg:grid-cols-2 grid items-start">
          <Card
            headingLevel={2}
            title={tr("My applications", "އަޅުގަނޑުގެ އެޕްލިކޭޝަންތައް")}
            description={tr(`${active.length} in progress`, `${active.length} ކުރިއަށް ދަނީ`)}
            footer={
              <LinkButton href={routes.citizen.applications} variant="outline" size="sm">
                {tr("View all", "ހުރިހާ އެއްޗެއް ބަލާ")}
              </LinkButton>
            }
          >
            <ListView
              aria-label={tr("Applications in progress", "ކުރިއަށް ދާ އެޕްލިކޭޝަންތައް")}
              items={active}
              getId={(a) => a.id}
              getName={(a) => tr(...a.service)}
              title={(a) => tr(...a.service)}
              description={(a) => `${a.ref} · ${tr("Updated", "އަޕްޑޭޓްކުރީ")} ${date(a.updated)}`}
              meta={(a) => <StatusBadge status={a.status} statusMap={appStatuses} size="sm" />}
              getHref={(a) => (a.status === "draft" ? routes.applications.wizard : routes.applications.statusTracker)}
            />
          </Card>

          <div className="gap-6 grid">
            <Card
              headingLevel={2}
              title={tr("Payments due", "ދައްކަން ޖެހޭ ފައިސާ")}
              description={money(due.reduce((sum, p) => sum + p.amount, 0))}
              footer={
                <LinkButton href={routes.citizen.payments} variant="outline" size="sm">
                  {tr("All payments", "ހުރިހާ ފައިސާ")}
                </LinkButton>
              }
            >
              <ul className="gap-3 grid">
                {due.map((p) => (
                  <li key={p.id} className="gap-3 flex flex-wrap items-center justify-between">
                    <div className="min-w-0 gap-0.5 grid">
                      <span className="font-medium truncate">{tr(...p.description)}</span>
                      <span className="text-sm text-muted-foreground">
                        {tr("Due", "ހަމަވާ")} {date(p.due)}
                      </span>
                    </div>
                    <div className="gap-3 flex items-center">
                      <StatusBadge status={p.status} statusMap={payStatuses} size="sm" />
                      <span className="font-medium tabular-nums">{money(p.amount)}</span>
                      <LinkButton
                        href={routes.applications.checkout}
                        size="sm"
                        aria-label={tr(`Pay ${p.ref}`, `${p.ref} ދައްކާ`)}
                      >
                        {tr("Pay now", "ދައްކާ")}
                      </LinkButton>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>

            <Card
              headingLevel={2}
              title={tr("Notices", "ނޯޓިސްތައް")}
              footer={
                <LinkButton href={routes.citizen.notifications} variant="outline" size="sm">
                  {tr("All notifications", "ހުރިހާ ނޮޓިފިކޭޝަނެއް")}
                </LinkButton>
              }
            >
              <ul className="gap-4 grid">
                {notices.map((n) => (
                  <li key={n.id} className="gap-1 grid">
                    <span className="font-medium">{tr(...n.title)}</span>
                    <span className="text-sm text-muted-foreground">{tr(...n.body)}</span>
                    <span className="text-xs text-muted-foreground">{date(n.time)}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </CitizenShell>
  )
}
