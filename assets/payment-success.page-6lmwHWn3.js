var e=`import * as React from "react"
import { useNavigate } from "react-router"
import { Button, Card, Countdown, DescriptionList, Icon, LinkButton } from "@javaabu/onu"

import { KioskShell } from "../_shared/shells"
import { useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import { useFormat } from "../applications/_data"
import { BIG, kioskBill } from "./_kiosk"

export const meta = { title: "Payment success", group: "Kiosk", layout: "bare", order: 4 }

const RETURN_AFTER = 30_000

export default function KioskPaymentSuccessPage() {
  const tr = useTr()
  const { money, dateTime } = useFormat()
  const navigate = useNavigate()
  const [returnAt] = React.useState(() => new Date(Date.now() + RETURN_AFTER))

  return (
    <KioskShell>
      <div className="gap-8 max-w-2xl grid w-full">
        <div className="gap-4 grid justify-items-center text-center">
          <span className="size-24 flex items-center justify-center rounded-full bg-success/15 text-success">
            <Icon name="success" className="size-14" />
          </span>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            {tr("Payment successful", "ފައިސާ ދެއްކުން ކާމިޔާބު")}
          </h1>
          <p className="text-xl text-muted-foreground">
            {tr("Thank you. Your parking permit is now active.", "ޝުކުރިއްޔާ. ޕާކިންގ ހުއްދަ މިހާރު ހުޅުވިއްޖެ.")}
          </p>
        </div>

        <Card headingLevel={2} title={tr("Receipt", "ރަސީދު")} className="text-lg">
          <DescriptionList
            layout="inline"
            items={[
              {
                label: tr("Amount paid", "ދެއްކި ޢަދަދު"),
                value: <strong className="text-2xl tabular-nums">{money(kioskBill.amount)}</strong>,
              },
              { label: tr("For", "ސަބަބު"), value: tr(...kioskBill.service) },
              { label: tr("Invoice", "އިންވޮއިސް"), value: kioskBill.ref },
              { label: tr("Receipt", "ރަސީދު"), value: kioskBill.receipt },
              { label: tr("Card", "ކާޑު"), value: <span dir="ltr">Visa •••• 4242</span> },
              { label: tr("Transaction", "ޓްރާންޒެކްޝަން"), value: kioskBill.transaction },
              { label: tr("Date", "ތާރީޚު"), value: dateTime("2026-10-07T09:42:00") },
            ]}
          />
        </Card>

        <div className="gap-4 sm:grid-cols-2 grid">
          <Button variant="outline" startIcon="print" className={\`\${BIG} print:hidden\`} onClick={() => window.print()}>
            {tr("Print receipt", "ރަސީދު ޕްރިންޓްކުރޭ")}
          </Button>
          <LinkButton href={routes.kiosk.start} className={BIG} startIcon="check">
            {tr("Done", "ނިމުނީ")}
          </LinkButton>
        </div>

        <p className="text-lg text-center text-muted-foreground">
          {tr("Returning to the start screen in", "ފެށޭ ސްކްރީނަށް ދާނީ")}{" "}
          <Countdown
            to={returnAt}
            variant="inline"
            showDays={false}
            onComplete={() => navigate(routes.kiosk.start)}
            className="font-medium text-foreground"
          />
        </p>
      </div>
    </KioskShell>
  )
}
`;export{e as default};