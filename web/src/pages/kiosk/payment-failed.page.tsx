import { Callout, Icon, LinkButton } from "@javaabu/onu"

import { KioskShell } from "../_shared/shells"
import { useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import { useFormat } from "../applications/_data"
import { BIG, kioskBill } from "./_kiosk"

export const meta = { title: "Payment failed", group: "Kiosk", layout: "bare", order: 5 }

export default function KioskPaymentFailedPage() {
  const tr = useTr()
  const { money } = useFormat()

  return (
    <KioskShell>
      <div className="gap-8 max-w-2xl grid w-full">
        <div className="gap-4 grid justify-items-center text-center">
          <span className="size-24 flex items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <Icon name="error" className="size-14" />
          </span>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            {tr("Payment failed", "ފައިސާ ނުދެއްކުނު")}
          </h1>
          <p className="text-xl text-muted-foreground tabular-nums">
            {money(kioskBill.amount)} · {kioskBill.ref}
          </p>
        </div>

        <Callout
          variant="destructive"
          className="text-lg"
          title={tr("Your card was declined", "ކާޑު ގަބޫލެއް ނުކުރި")}
          description={tr(
            "The bank declined the payment (code 05: do not honour). No money was taken from your card.",
            "ބޭންކުން ފައިސާ ދެއްކުން ގަބޫލެއް ނުކުރި (ކޯޑު 05). ކާޑުން އެއްވެސް ފައިސާއެއް ނުކެނޑޭ.",
          )}
        />

        <ul className="gap-2 text-lg ps-6 grid list-disc text-muted-foreground">
          <li>{tr("Check that your card has enough balance.", "ކާޑުގައި ފުދޭވަރަށް ފައިސާ އޮތްތޯ ބައްލަވާ.")}</li>
          <li>
            {tr(
              "Try again, or use another card or cash.",
              "އަލުން މަސައްކަތްކުރައްވާ، ނުވަތަ އެހެން ކާޑެއް ނުވަތަ ނަގުދު ބޭނުންކުރައްވާ.",
            )}
          </li>
        </ul>

        <div className="gap-4 grid">
          <LinkButton href={routes.kiosk.paymentProgress} className={BIG} startIcon="refresh">
            {tr("Try again", "އަލުން މަސައްކަތްކުރޭ")}
          </LinkButton>
          <div className="gap-4 sm:grid-cols-2 grid">
            <LinkButton href={routes.kiosk.paymentMethod} variant="outline" className={BIG} startIcon="credit-card">
              {tr("Use another method", "އެހެން ގޮތެއް ހޮވާ")}
            </LinkButton>
            <LinkButton href={routes.kiosk.start} variant="ghost" className={BIG} startIcon="close">
              {tr("Cancel", "ކެންސަލް")}
            </LinkButton>
          </div>
        </div>
      </div>
    </KioskShell>
  )
}
