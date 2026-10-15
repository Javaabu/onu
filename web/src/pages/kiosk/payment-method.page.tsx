import * as React from "react"
import { useNavigate } from "react-router"
import { BmlConnectLogo, Button, Card, DynamicIcon, FormField, LinkButton, RadioGroup } from "@javaabu/onu"

import { KioskShell } from "../_shared/shells"
import { useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import { useFormat } from "../applications/_data"
import { BIG, kioskBill } from "./_kiosk"

export const meta = { title: "Payment method selection", group: "Kiosk", layout: "bare", order: 2 }

function MethodIcon({ id }: { id: string }) {
  return (
    <span className="size-14 flex shrink-0 items-center justify-center rounded-lg bg-muted">
      <DynamicIcon id={id} className="size-8" />
    </span>
  )
}

export default function KioskPaymentMethodPage() {
  const tr = useTr()
  const { money } = useFormat()
  const navigate = useNavigate()
  const [method, setMethod] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)

  return (
    <KioskShell>
      <div className="gap-8 max-w-3xl p-1 relative grid w-full grid-cols-1 overflow-x-clip">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-center">
          {tr("How would you like to pay?", "ފައިސާ ދައްކާނީ ކިހިނެއް؟")}
        </h1>

        <Card size="sm">
          <div className="gap-4 flex flex-wrap items-center justify-between">
            <div className="gap-1 grid">
              <span className="text-lg font-medium">{tr(...kioskBill.service)}</span>
              <span className="text-muted-foreground">
                {kioskBill.ref} · {tr(...kioskBill.payer)}
              </span>
            </div>
            <div className="text-end">
              <span className="text-sm block text-muted-foreground">{tr("Amount to pay", "ދައްކަންޖެހޭ ޢަދަދު")}</span>
              <span className="text-3xl font-semibold tabular-nums">{money(kioskBill.amount)}</span>
            </div>
          </div>
        </Card>

        <form
          noValidate
          className="gap-8 grid"
          onSubmit={(e) => {
            e.preventDefault()
            if (!method) {
              setError(tr("Choose a payment method.", "ފައިސާ ދައްކާނެ ގޮތެއް ހޮވާ."))
              return
            }
            navigate(routes.kiosk.paymentProgress)
          }}
        >
          <FormField label={tr("Payment method", "ފައިސާ ދައްކާ ގޮތް")} hideLabel error={error}>
            <RadioGroup
              variant="card"
              size="lg"
              value={method}
              onValueChange={(v) => {
                setMethod(v)
                setError(null)
              }}
              classNames={{ item: "min-h-24 p-5 text-lg" }}
              options={[
                {
                  value: "card",
                  label: tr("Bank card", "ބޭންކް ކާޑު"),
                  description: tr(
                    "BML Connect · tap, insert or swipe Visa, Mastercard or Amex",
                    "ބީއެމްއެލް ކަނެކްޓް · ވިސާ، މާސްޓަކާޑް ނުވަތަ އެމެކްސް",
                  ),
                  media: (
                    <BmlConnectLogo
                      decorative
                      className="w-36 sm:w-56 bg-white p-1.5 dark:ring-white/15 h-auto rounded-lg ring-1 ring-border"
                    />
                  ),
                },
                {
                  value: "qr",
                  label: tr("BML MobilePay QR", "ބީއެމްއެލް މޯބައިލްޕޭ ކިއުއާރް"),
                  description: tr("Scan with the BML app on your phone", "ފޯނުގައިވާ ބީއެމްއެލް އެޕުން ސްކޭންކުރޭ"),
                  media: <MethodIcon id="lucide:qr-code" />,
                },
                {
                  value: "cash",
                  label: tr("Cash", "ނަގުދު ފައިސާ"),
                  description: tr("MVR notes only · change is printed as a voucher", "ރުފިޔާ ނޯޓު · ބާކީ ވައުޗަރަކަށް"),
                  media: <MethodIcon id="lucide:banknote" />,
                },
              ]}
            />
          </FormField>

          <div className="gap-4 sm:grid-cols-[1fr_2fr] grid">
            <LinkButton href={routes.kiosk.start} variant="outline" className={BIG} startIcon="back">
              {tr("Back", "ފަހަތަށް")}
            </LinkButton>
            <Button type="submit" className={BIG} endIcon="arrow-right">
              {tr("Continue", "ކުރިއަށް")}
            </Button>
          </div>
        </form>
      </div>
    </KioskShell>
  )
}
