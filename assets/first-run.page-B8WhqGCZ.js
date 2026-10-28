var e=`import * as React from "react"
import {
  Button,
  Card,
  EmptyState,
  Icon,
  LinkButton,
  PageTitle,
  ProgressBar,
  StatusBadge,
  cn,
  toast,
} from "@javaabu/onu"

import { useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import { AdminShell } from "../_shared/shells"

export const meta = { title: "Empty first-run state", group: "System", layout: "bare", order: 5 }

interface Step {
  id: string
  icon: string
  title: string
  description: string
  action: string
  href: string
}

export default function FirstRunPage() {
  const tr = useTr()
  const [done, setDone] = React.useState<string[]>([])

  const steps: Step[] = [
    {
      id: "profile",
      icon: "building",
      title: tr("Set up your office", "އޮފީހުގެ މައުލޫމާތު"),
      description: tr(
        "Add the office name, logo, address and working hours shown on receipts.",
        "ރަސީދުތަކުގައި ފެންނާނެ އޮފީހުގެ ނަން، ލޯގޯ، އެޑްރެސް އަދި ގަޑިތައް ލިޔުއްވާ.",
      ),
      action: tr("Open settings", "ސެޓިންގްސް"),
      href: routes.adminSettings.settings,
    },
    {
      id: "roles",
      icon: "lock",
      title: tr("Review roles", "ރޯލްތައް ބައްލަވާ"),
      description: tr(
        "Decide who can approve, edit or only view applications.",
        "އެޕްލިކޭޝަން އެޕްރޫވް، އެޑިޓް ނުވަތަ ހަމައެކަނި ބަލާނީ ކާކުކަން ކަނޑައަޅުއްވާ.",
      ),
      action: tr("Manage roles", "ރޯލްތައް"),
      href: routes.adminSettings.roles,
    },
    {
      id: "team",
      icon: "users",
      title: tr("Invite your team", "ޓީމު ހިމަނުއްވާ"),
      description: tr(
        "Send invitations to counter staff and supervisors.",
        "ކައުންޓަރު މުވައްޒަފުންނާއި ސުޕަވައިޒަރުންނަށް ދައުވަތު ފޮނުއްވާ.",
      ),
      action: tr("Invite people", "ދައުވަތު ފޮނުއްވާ"),
      href: routes.adminSettings.users,
    },
    {
      id: "import",
      icon: "upload",
      title: tr("Bring in existing records", "ކުރީގެ ރެކޯޑުތައް"),
      description: tr(
        "Import applications from a spreadsheet, or create the first one by hand.",
        "ސްޕްރެޑްޝީޓަކުން އިމްޕޯޓް ކުރައްވާ، ނުވަތަ ފުރަތަމަ އެޕްލިކޭޝަން އަތުން ހައްދަވާ.",
      ),
      action: tr("Import records", "އިމްޕޯޓް"),
      href: routes.adminRecords.import,
    },
  ]

  const toggle = (id: string) => {
    const wasDone = done.includes(id)
    setDone((d) => (wasDone ? d.filter((x) => x !== id) : [...d, id]))
    if (!wasDone && done.length + 1 === steps.length) {
      toast.success(tr("All set!", "ހުރިހާ ކަމެއް ނިމިއްޖެ!"), {
        description: tr("Your workspace is ready to take applications.", "އެޕްލިކޭޝަން ބަލައިގަތުމަށް ތައްޔާރު."),
      })
    }
  }

  return (
    <AdminShell breadcrumbs={[{ label: tr("Dashboard", "ޑޭޝްބޯޑް") }]}>
      <div className="gap-6 grid">
        <PageTitle
          title={tr("Welcome to Onu Admin, Shifa", "އޮނު އެޑްމިންއަށް މަރުޙަބާ، ޝިފާ")}
          description={tr(
            "Nothing here yet. A few steps and your office is ready to take applications.",
            "އަދި އެއްވެސް ރެކޯޑެއް ނެތް. މި ފިޔަވަޅުތައް ނިންމުމުން އެޕްލިކޭޝަން ބަލައިގަނެވޭނެ.",
          )}
          headingLevel={1}
        />

        <div className="gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start grid">
          <Card
            title={tr("Getting started", "ފެށުމަށް")}
            description={tr("Do these in any order.", "ކޮންމެ ތަރުތީބަކުން ވެސް ނިންމެވޭނެ.")}
            headingLevel={2}
            actions={
              <StatusBadge status={done.length === steps.length ? "success" : "info"}>
                {tr(\`\${done.length} of \${steps.length} done\`, \`\${steps.length} ން \${done.length} ނިމިއްޖެ\`)}
              </StatusBadge>
            }
          >
            <div className="gap-4 grid">
              <ProgressBar
                value={done.length}
                max={steps.length}
                aria-label={tr("Setup progress", "ތައްޔާރުވުމުގެ މިންވަރު")}
              />
              <ol className="grid divide-y rounded-lg border">
                {steps.map((step, i) => {
                  const complete = done.includes(step.id)
                  return (
                    <li key={step.id} className="gap-3 p-4 sm:flex-row sm:items-center flex flex-col">
                      <div className="gap-3 min-w-0 flex flex-1 items-start">
                        <span
                          className={cn(
                            "size-9 grid shrink-0 place-items-center rounded-full",
                            complete ? "bg-success/15 text-success" : "bg-muted text-muted-foreground",
                          )}
                        >
                          {complete ? (
                            <Icon name="check" className="size-4" />
                          ) : (
                            <Icon name={step.icon} className="size-4" />
                          )}
                        </span>
                        <div className="min-w-0">
                          <h3 className={cn("font-medium", complete && "text-muted-foreground line-through")}>
                            <span className="sr-only">{tr(\`Step \${i + 1}: \`, \`ފިޔަވަޅު \${i + 1}: \`)}</span>
                            {step.title}
                            {complete ? <span className="sr-only"> ({tr("done", "ނިމިއްޖެ")})</span> : null}
                          </h3>
                          <p className="text-sm text-muted-foreground">{step.description}</p>
                        </div>
                      </div>
                      <div className="gap-2 sm:ms-auto flex shrink-0 flex-wrap">
                        <LinkButton href={step.href} variant="outline" size="sm" className="touch:min-h-11">
                          {step.action}
                        </LinkButton>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="touch:min-h-11"
                          aria-pressed={complete}
                          onClick={() => toggle(step.id)}
                        >
                          {complete ? tr("Undo", "ބާޠިލް") : tr("Mark done", "ނިމިއްޖެ")}
                        </Button>
                      </div>
                    </li>
                  )
                })}
              </ol>
            </div>
          </Card>

          <Card title={tr("Need a hand?", "އެހީއަށް")} headingLevel={2} size="sm">
            <div className="gap-3 text-sm grid text-muted-foreground">
              <p>
                {tr(
                  "Watch the 5-minute tour or read the setup guide. Our team can also set things up with you.",
                  "5 މިނިޓުގެ ޓުއަރ ބައްލަވާ ނުވަތަ ގައިޑް ކިޔުއްވާ. ޓީމުން އެހީތެރިވެދެވިދާނެ.",
                )}
              </p>
              <LinkButton href={routes.public.contact} variant="outline" startIcon="help" className="touch:min-h-11">
                {tr("Contact support", "ސަޕޯޓް")}
              </LinkButton>
            </div>
          </Card>
        </div>

        <Card title={tr("Recent applications", "ފަހުގެ އެޕްލިކޭޝަންތައް")} headingLevel={2}>
          <EmptyState
            noun={{ one: tr("application", "އެޕްލިކޭޝަން"), other: tr("applications", "އެޕްލިކޭޝަންތައް") }}
            icon="file-text"
            description={tr(
              "Applications from the portal and counters will show up here. Create one to see how it works.",
              "ޕޯޓަލާއި ކައުންޓަރުން ލިބޭ އެޕްލިކޭޝަންތައް މިތާ ފެންނާނެ. ތަޖުރިބާކޮށްލުމަށް އެކެއް ހައްދަވާ.",
            )}
            action={
              <LinkButton href={routes.adminRecords.create} startIcon="add" className="touch:min-h-11">
                {tr("New application", "އައު އެޕްލިކޭޝަން")}
              </LinkButton>
            }
          >
            <LinkButton
              href={routes.adminRecords.import}
              variant="outline"
              startIcon="upload"
              className="touch:min-h-11"
            >
              {tr("Import from a spreadsheet", "ސްޕްރެޑްޝީޓުން")}
            </LinkButton>
          </EmptyState>
        </Card>
      </div>
    </AdminShell>
  )
}
`;export{e as default};