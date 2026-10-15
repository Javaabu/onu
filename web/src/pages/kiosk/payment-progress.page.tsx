import * as React from "react"
import { useNavigate } from "react-router"
import { Button, Card, ConfirmDialog, DynamicIcon, LinkButton, ProgressBar, Timeline } from "@javaabu/onu"

import { KioskShell } from "../_shared/shells"
import { useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import { useFormat } from "../applications/_data"
import { BIG, kioskBill } from "./_kiosk"

export const meta = { title: "Payment in progress", group: "Kiosk", layout: "bare", order: 3 }

/** Progress (0–100) at which each stage starts. */
const STAGES = [0, 15, 45, 75, 100]
const ICONS = ["lucide:plug-zap", "lucide:nfc", "lucide:keyboard", "lucide:landmark", "lucide:circle-check-big"]

export default function KioskPaymentProgressPage() {
  const tr = useTr()
  const { money } = useFormat()
  const navigate = useNavigate()
  const [progress, setProgress] = React.useState(0)
  const [paused, setPaused] = React.useState(false)

  React.useEffect(() => {
    if (paused) return
    if (progress >= 100) {
      const done = setTimeout(() => navigate(routes.kiosk.paymentSuccess), 1500)
      return () => clearTimeout(done)
    }
    const timer = setTimeout(() => setProgress((p) => Math.min(100, p + 3)), 350)
    return () => clearTimeout(timer)
  }, [progress, paused, navigate])

  const stage = STAGES.filter((s) => progress >= s).length - 1
  const steps = [
    tr("Connecting to the card reader", "ކާޑު ރީޑަރާ ގުޅެނީ"),
    tr("Tap, insert or swipe your card", "ކާޑު ޓެޕްކުރޭ، ވައްދާ ނުވަތަ ސްވައިޕްކުރޭ"),
    tr("Enter your PIN on the card reader", "ކާޑު ރީޑަރުގައި ޕިން ޖައްސަވާ"),
    tr("Waiting for your bank to approve", "ބޭންކުން ހުއްދަ ދިނުމަށް އިންތިޒާރުކުރަނީ"),
    tr("Payment approved", "ފައިސާ ދެއްކުން ކާމިޔާބު"),
  ]

  return (
    <KioskShell>
      <div className="gap-8 max-w-2xl grid w-full">
        <div className="gap-4 grid justify-items-center text-center">
          <span className="size-24 flex items-center justify-center rounded-full bg-primary/10 text-primary">
            <DynamicIcon id={ICONS[stage] ?? ICONS[0]!} className="size-12" />
          </span>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            {tr("Paying by card", "ކާޑުން ފައިސާ ދައްކަނީ")}
          </h1>
          <p role="status" aria-live="polite" className="text-2xl">
            {steps[stage]}
          </p>
          <p className="text-xl text-muted-foreground tabular-nums">
            {money(kioskBill.amount)} · {kioskBill.ref}
          </p>
        </div>

        <ProgressBar
          label={tr("Payment progress", "ފައިސާ ދެއްކުން")}
          value={progress}
          size="lg"
          color={progress >= 100 ? "success" : "primary"}
        />

        <Card size="sm">
          <Timeline
            aria-label={tr("Steps", "ބައިތައް")}
            items={steps.slice(0, 4).map((title, i) => ({
              id: String(i),
              title: <span className="text-lg">{title}</span>,
              textTitle: title,
              status: i < stage ? "success" : i === stage ? "current" : "pending",
            }))}
          />
        </Card>

        <div className="gap-4 sm:grid-cols-2 grid">
          <ConfirmDialog
            trigger={
              <Button variant="outline" className={BIG} startIcon="close" disabled={progress >= 75}>
                {tr("Cancel payment", "ފައިސާ ދެއްކުން ކެންސަލްކުރޭ")}
              </Button>
            }
            onOpenChange={setPaused}
            title={tr("Cancel this payment?", "މި ފައިސާ ދެއްކުން ކެންސަލްކުރަންވީތޯ؟")}
            description={tr("No money has been taken from your card.", "ކާޑުން އެއްވެސް ފައިސާއެއް ނުކެނޑޭ.")}
            confirmLabel={tr("Yes, cancel", "އާން، ކެންސަލްކުރޭ")}
            cancelLabel={tr("Keep paying", "ކުރިއަށް ގެންދާ")}
            variant="destructive"
            onConfirm={() => navigate(routes.kiosk.paymentMethod)}
          />
          <LinkButton href={routes.kiosk.paymentFailed} variant="ghost" className={BIG}>
            {tr("Simulate a declined card", "ކާޑު ގަބޫލުނުކުރުން ސިމިއުލޭޓްކުރޭ")}
          </LinkButton>
        </div>
      </div>
    </KioskShell>
  )
}
