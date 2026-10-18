var e=`import * as React from "react"
import {
  Button,
  Card,
  ConfirmDialog,
  DescriptionList,
  DynamicIcon,
  FormField,
  LinkButton,
  Notice,
  OtpInput,
  ProgressBar,
  StatusBadge,
  Switch,
  Timeline,
  toast,
  type StatusTone,
} from "@javaabu/onu"

import { KioskShell } from "../_shared/shells"
import { useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import { wait } from "../applications/_data"
import { BIG, kioskBill } from "./_kiosk"

export const meta = { title: "Maintenance panel", group: "Kiosk", layout: "bare", order: 6 }

const PIN = "246810"
const MAX_ATTEMPTS = 3
// Fixed at load, not during render.
const SIGNED_IN = new Date()

type Device = "printer" | "reader" | "network"

export default function KioskMaintenancePage() {
  const tr = useTr()
  const [unlocked, setUnlocked] = React.useState(false)
  const [pin, setPin] = React.useState("")
  const [attempts, setAttempts] = React.useState(0)
  const [pinError, setPinError] = React.useState<string | null>(null)
  const [checking, setChecking] = React.useState(false)

  const [busy, setBusy] = React.useState<Device | "kiosk" | null>(null)
  const [paper, setPaper] = React.useState(12)
  const [offline, setOffline] = React.useState(false)
  const [latency, setLatency] = React.useState(42)

  const locked = attempts >= MAX_ATTEMPTS

  const verify = async (code: string) => {
    if (locked || checking) return
    setChecking(true)
    await wait(600)
    setChecking(false)
    if (code === PIN) {
      setUnlocked(true)
      setPin("")
      setAttempts(0)
      setPinError(null)
      return
    }
    const left = MAX_ATTEMPTS - attempts - 1
    setAttempts((a) => a + 1)
    setPin("")
    setPinError(
      left > 0
        ? tr(\`Incorrect PIN. \${left} attempts left.\`, \`ޕިން ރަނގަޅެއް ނޫން. \${left} ފަހަރު ބާކީ.\`)
        : tr(
            "Too many attempts. Ask a supervisor to unlock the panel.",
            "ގިނަ ފަހަރު މަސައްކަތްކުރެވިއްޖެ. ސުޕަވައިޒަރަކާ ގުޅުއްވާ.",
          ),
    )
  }

  const run = async (device: Device | "kiosk", message: string, after?: () => void) => {
    setBusy(device)
    await wait(1500)
    after?.()
    setBusy(null)
    toast.success(message)
  }

  if (!unlocked) {
    return (
      <KioskShell>
        <div className="gap-8 max-w-lg grid w-full text-center">
          <div className="gap-3 grid justify-items-center">
            <span className="size-20 flex items-center justify-center rounded-full bg-muted">
              <DynamicIcon id="lucide:lock-keyhole" className="size-10" />
            </span>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
              {tr("Staff maintenance", "މުވައްޒަފުންގެ މެއިންޓެނަންސް")}
            </h1>
            <p className="text-lg text-muted-foreground">
              {tr("Enter your 6-digit staff PIN.", "6 ޑިޖިޓްގެ މުވައްޒަފު ޕިން ޖައްސަވާ.")}
            </p>
          </div>
          <form
            noValidate
            className="gap-6 grid justify-items-center"
            onSubmit={(e) => {
              e.preventDefault()
              void verify(pin)
            }}
          >
            <FormField
              label={tr("Staff PIN", "މުވައްޒަފު ޕިން")}
              hideLabel
              error={pinError}
              help={tr(\`For this demo the PIN is \${PIN}.\`, \`މި ޑެމޯގައި ޕިން އަކީ \${PIN}\`)}
              disabled={locked}
              classNames={{ control: "justify-items-center" }}
            >
              <OtpInput length={6} value={pin} onValueChange={setPin} onComplete={(code) => void verify(code)} />
            </FormField>
            <div className="gap-4 sm:grid-cols-2 grid w-full">
              <LinkButton href={routes.kiosk.start} variant="outline" className={BIG} startIcon="back">
                {tr("Back", "ފަހަތަށް")}
              </LinkButton>
              <Button
                type="submit"
                className={BIG}
                loading={checking}
                disabled={locked || pin.length < 6}
                startIcon="unlock"
              >
                {tr("Unlock", "ހުޅުވާ")}
              </Button>
            </div>
          </form>
        </div>
      </KioskShell>
    )
  }

  const devices: {
    id: Device
    icon: string
    title: string
    tone: StatusTone
    status: string
    detail: React.ReactNode
    action: string
    done: string
    after?: () => void
  }[] = [
    {
      id: "printer",
      icon: "lucide:printer",
      title: tr("Receipt printer", "ރަސީދު ޕްރިންޓަރ"),
      tone: paper < 20 ? "warning" : "success",
      status: paper < 20 ? tr("Paper low", "ކަރުދާސް މަދު") : tr("Ready", "ތައްޔާރު"),
      detail: (
        <ProgressBar
          label={tr("Paper roll", "ކަރުދާސް ރޯލް")}
          value={paper}
          color={paper < 20 ? "warning" : "success"}
          size="sm"
        />
      ),
      action: tr("Paper replaced", "ކަރުދާސް ބަދަލުކުރީ"),
      done: tr("Paper level reset to 100%", "ކަރުދާސް 100% އަށް"),
      after: () => setPaper(100),
    },
    {
      id: "reader",
      icon: "lucide:credit-card",
      title: tr("Card reader", "ކާޑު ރީޑަރ"),
      tone: "success",
      status: tr("Connected", "ގުޅިފައި"),
      detail: <span className="text-muted-foreground">BML Connect · Verifone P400 · fw 4.2.1</span>,
      action: tr("Restart reader", "ރީޑަރ ރީސްޓާޓްކުރޭ"),
      done: tr("Card reader restarted", "ކާޑު ރީޑަރ ރީސްޓާޓްކުރެވިއްޖެ"),
    },
    {
      id: "network",
      icon: "lucide:wifi",
      title: tr("Network", "ނެޓްވޯކް"),
      tone: "success",
      status: tr("Online", "އޮންލައިން"),
      detail: (
        <span className="text-muted-foreground tabular-nums">
          {tr("Latency", "ލޭޓެންސީ")} {latency} ms · 10.20.4.17
        </span>
      ),
      action: tr("Run network test", "ނެޓްވޯކް ޓެސްޓްކުރޭ"),
      done: tr("Network test passed", "ނެޓްވޯކް ޓެސްޓް ފާސް"),
      after: () => setLatency(38),
    },
  ]

  return (
    <KioskShell className="justify-start">
      <div className="gap-6 max-w-5xl grid w-full">
        <div className="gap-4 flex flex-wrap items-center justify-between">
          <div className="gap-1 grid">
            <h1 className="text-3xl font-semibold tracking-tight">
              {tr("Maintenance panel", "މެއިންޓެނަންސް ޕެނަލް")}
            </h1>
            <p className="text-muted-foreground">
              {kioskBill.kiosk} ·{" "}
              {tr("Hulhumalé service centre, ground floor", "ހުޅުމާލޭ ސަރވިސް ސެންޓަރ، ބިންގަނޑު ފަންގިފިލާ")}
            </p>
          </div>
          <StatusBadge status={offline ? "warning" : "success"} size="lg">
            {offline ? tr("Out of service", "ޚިދުމަތް ހުއްޓާފައި") : tr("In service", "ޚިދުމަތް ދެނީ")}
          </StatusBadge>
        </div>

        <div className="gap-4 md:grid-cols-3 grid">
          {devices.map((d) => (
            <Card
              key={d.id}
              headingLevel={2}
              title={
                <span className="gap-2 flex items-center">
                  <DynamicIcon id={d.icon} className="size-6" />
                  {d.title}
                </span>
              }
              actions={<StatusBadge status={d.tone}>{d.status}</StatusBadge>}
              footer={
                <Button
                  variant="outline"
                  className="h-14 text-base w-full"
                  loading={busy === d.id}
                  disabled={busy !== null && busy !== d.id}
                  onClick={() => run(d.id, d.done, d.after)}
                >
                  {d.action}
                </Button>
              }
            >
              {d.detail}
            </Card>
          ))}
        </div>

        <div className="gap-4 lg:grid-cols-2 grid items-start">
          <Card headingLevel={2} title={tr("Kiosk", "ކިއޮސްކް")}>
            <div className="gap-5 grid">
              <DescriptionList
                layout="inline"
                items={[
                  { label: tr("App version", "އެޕް ވަރޝަން"), value: "2.8.0 (build 1142)" },
                  { label: tr("Last sync", "ފަހުން ސިންކްކުރީ"), value: tr("2 minutes ago", "2 މިނެޓް ކުރިން") },
                  {
                    label: tr("Payments today", "މިއަދުގެ ފައިސާ"),
                    value: tr("37 · MVR 11,420.00", "37 · ރ. 11,420.00"),
                  },
                  { label: tr("Uptime", "ހިނގާތާ"), value: tr("6 days, 4 hours", "6 ދުވަސް، 4 ގަޑިއިރު") },
                ]}
              />
              <Switch
                checked={offline}
                onCheckedChange={(on) => {
                  setOffline(on)
                  toast.info(
                    on
                      ? tr("Kiosk taken out of service", "ކިއޮސްކް ހުއްޓާލެވިއްޖެ")
                      : tr("Kiosk back in service", "ކިއޮސްކް އަލުން ހުޅުވިއްޖެ"),
                  )
                }}
                label={tr("Out of service", "ޚިދުމަތް ހުއްޓާލާ")}
                description={tr(
                  "Shows a “temporarily unavailable” screen to customers.",
                  "ކަސްޓަމަރުންނަށް “ވަގުތީގޮތުން ނުލިބޭ” ސްކްރީން ދައްކާނެ.",
                )}
              />
              {offline ? (
                <Notice tone="warning">
                  {tr("Customers can't pay at this kiosk.", "މި ކިއޮސްކުން ފައިސާ ނުދެއްކޭނެ.")}
                </Notice>
              ) : null}
              <div className="gap-3 sm:grid-cols-2 grid">
                <ConfirmDialog
                  trigger={
                    <Button
                      variant="destructive"
                      className="h-14 text-base"
                      startIcon="refresh"
                      loading={busy === "kiosk"}
                    >
                      {tr("Restart kiosk", "ކިއޮސްކް ރީސްޓާޓްކުރޭ")}
                    </Button>
                  }
                  variant="destructive"
                  title={tr("Restart the kiosk?", "ކިއޮސްކް ރީސްޓާޓްކުރަންވީތޯ؟")}
                  description={tr("It will be unavailable for about 2 minutes.", "2 މިނެޓް ހާއިރު ބޭނުން ނުކުރެވޭނެ.")}
                  confirmLabel={tr("Restart", "ރީސްޓާޓްކުރޭ")}
                  onConfirm={() => run("kiosk", tr("Restart scheduled", "ރީސްޓާޓް ރާވައިފި"))}
                />
                <Button
                  variant="outline"
                  className="h-14 text-base"
                  startIcon="lock"
                  onClick={() => setUnlocked(false)}
                >
                  {tr("Lock panel", "ޕެނަލް ބަންދުކުރޭ")}
                </Button>
              </div>
            </div>
          </Card>

          <Card headingLevel={2} title={tr("Recent events", "ފަހުގެ ހާދިސާތައް")}>
            <Timeline
              size="sm"
              items={[
                { id: "1", title: tr("Staff signed in", "މުވައްޒަފު ވަދެއްޖެ"), time: SIGNED_IN, status: "info" },
                {
                  id: "2",
                  title: tr("Printer paper below 20%", "ޕްރިންޓަރުގެ ކަރުދާސް 20% އަށްވުރެ މަދު"),
                  time: "2026-10-07T08:55:00",
                  status: "warning",
                },
                {
                  id: "3",
                  title: tr("Card declined (code 05)", "ކާޑު ގަބޫލުނުކުރި (ކޯޑު 05)"),
                  time: "2026-10-07T08:31:00",
                  status: "error",
                },
                {
                  id: "4",
                  title: tr("Daily settlement sent", "ދުވަހުގެ ސެޓްލްމަންޓް ފޮނުވައިފި"),
                  time: "2026-10-06T23:00:00",
                  status: "success",
                },
              ]}
            />
          </Card>
        </div>

        <div>
          <LinkButton href={routes.kiosk.start} variant="ghost" className={BIG} startIcon="back">
            {tr("Exit to start screen", "ފެށޭ ސްކްރީނަށް")}
          </LinkButton>
        </div>
      </div>
    </KioskShell>
  )
}
`;export{e as default};