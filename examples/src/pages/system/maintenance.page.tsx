import * as React from "react"
import { Card, Countdown, LinkButton, MaintenancePage, Timeline, toast } from "@javaabu/onu"

import { useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import { SystemShell } from "./_shell"

export const meta = { title: "503 Maintenance", group: "System", layout: "bare", order: 4 }

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

export default function MaintenanceSamplePage() {
  const tr = useTr()
  // Back in 45 minutes from when the page opened.
  const [until] = React.useState(() => Date.now() + 45 * 60 * 1000)
  const [checking, setChecking] = React.useState(false)
  const [started] = React.useState(() => Date.now() - 75 * 60 * 1000)

  return (
    <SystemShell>
      <MaintenancePage
        as="div"
        homeHref={null}
        showBack={false}
        className="pb-6"
        title={tr("We're upgrading eServices", "އީ ސަރވިސަސް އަޕްގްރޭޑް ކުރަނީ")}
        message={tr(
          "Scheduled maintenance is under way to move eServices to a faster data centre. Your saved applications and payments are safe.",
          "އީ ސަރވިސަސް ހަލުވި ޑޭޓާ ސެންޓަރަކަށް ބަދަލުކުރުމުގެ މަސައްކަތް ކުރަމުންދަނީ. ރައްކާކުރެވިފައިވާ އެޕްލިކޭޝަންތަކާއި ފައިސާ ދެއްކުންތައް ރައްކާތެރި.",
        )}
        onRetry={async () => {
          if (checking) return
          setChecking(true)
          await wait(900)
          setChecking(false)
          toast.info(tr("Still under maintenance", "އަދިވެސް މަސައްކަތް ކުރަނީ"), {
            description: tr("Please check back after the time shown.", "ދައްކާފައިވާ ވަގުތަށްފަހު އަލުން ބައްލަވާ."),
          })
        }}
      />
      <div className="max-w-xl gap-4 mx-auto grid w-full">
        <Card
          title={tr("Expected back in", "އަނބުރާ ހުޅުވޭނެ ވަގުތު")}
          headingLevel={2}
          classNames={{ content: "flex justify-center" }}
        >
          <Countdown to={until} showSeconds completeText={tr("Any moment now", "ވަރަށް އަވަހަށް")} />
        </Card>
        <Card title={tr("Status updates", "ހާލަތު")} headingLevel={2}>
          <Timeline
            items={[
              {
                id: "3",
                title: tr("Moving data to the new servers", "ޑޭޓާ އާ ސާވަރުތަކަށް ބަދަލުކުރަނީ"),
                time: new Date(started + 60 * 60 * 1000),
                status: "current",
              },
              {
                id: "2",
                title: tr("Backups verified", "ބެކަޕް ޗެކްކޮށްފި"),
                time: new Date(started + 25 * 60 * 1000),
                status: "success",
              },
              {
                id: "1",
                title: tr("Maintenance started", "މަސައްކަތް ފެށީ"),
                description: tr(
                  "Counter services at island councils are open as usual.",
                  "ރަށު ކައުންސިލްތަކުގެ ކައުންޓަރު ޚިދުމަތްތައް ހުޅުވިފައި.",
                ),
                time: new Date(started),
                status: "success",
              },
            ]}
          />
        </Card>
        <p className="text-sm text-center text-muted-foreground">
          {tr("Urgent? Call 1500 or visit", "ކުއްލި ކަމެއްތޯ؟ 1500 އަށް ގުޅުއްވާ ނުވަތަ ވަޑައިގަންނަވާ")}{" "}
          <LinkButton variant="link" className="h-auto p-0" href={routes.public.contact}>
            {tr("a service centre", "ސަރވިސް ސެންޓަރަކަށް")}
          </LinkButton>
          .
        </p>
      </div>
    </SystemShell>
  )
}
