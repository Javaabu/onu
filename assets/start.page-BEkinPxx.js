var e=`import * as React from "react"
import { useNavigate } from "react-router"
import { Button, Icon, LinkButton, Modal, toast } from "@javaabu/onu"
import { QrCodeScanner } from "@javaabu/onu/media"

import { KioskShell } from "../_shared/shells"
import { useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import { BIG, HUGE, useKioskLanguage } from "./_kiosk"

export const meta = { title: "Start screen", group: "Kiosk", layout: "bare", order: 1 }

export default function KioskStartPage() {
  const tr = useTr()
  const navigate = useNavigate()
  const { locale, setLocale } = useKioskLanguage()
  const [scanning, setScanning] = React.useState(false)

  return (
    <KioskShell>
      <div className="gap-10 max-w-3xl grid w-full text-center">
        <div className="gap-3 grid">
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight">
            <span lang="en">Welcome</span>
            <span aria-hidden="true"> · </span>
            <span lang="dv" className="font-thaana">
              މަރުޙަބާ
            </span>
          </h1>
          <p className="text-xl text-muted-foreground">
            {tr("Pay bills and fees, and print receipts.", "ބިލާއި ފީ ދައްކައި، ރަސީދު ޕްރިންޓްކުރެވޭނެ.")}
          </p>
        </div>

        <section aria-labelledby="language-heading" className="gap-4 grid">
          <h2 id="language-heading" className="text-lg font-medium text-muted-foreground">
            <span lang="en">Choose your language</span> · <span lang="dv">ބަސް ހޮވާ</span>
          </h2>
          <div className="gap-4 sm:grid-cols-2 grid">
            <Button
              variant={locale === "en" ? "default" : "outline"}
              aria-pressed={locale === "en"}
              className={HUGE}
              onClick={() => setLocale("en")}
              lang="en"
            >
              English
            </Button>
            <Button
              variant={locale === "dv" ? "default" : "outline"}
              aria-pressed={locale === "dv"}
              className={HUGE}
              onClick={() => setLocale("dv")}
              lang="dv"
            >
              ދިވެހި
            </Button>
          </div>
        </section>

        <div className="gap-4 sm:grid-cols-2 grid">
          <LinkButton href={routes.kiosk.paymentMethod} className={BIG} endIcon="arrow-right">
            {tr("Start", "ފަށާ")}
          </LinkButton>
          <Button variant="secondary" className={BIG} startIcon="qr-code" onClick={() => setScanning(true)}>
            {tr("Scan bill QR code", "ބިލުގެ ކިއުއާރް ސްކޭންކުރޭ")}
          </Button>
        </div>

        <p className="gap-2 text-lg flex items-center justify-center text-muted-foreground">
          <Icon name="help" className="size-5" />
          {tr("Need help? Ask staff at counter 3.", "އެހީއަށް ކައުންޓަރ 3 ގެ މުވައްޒަފަކާ ސުވާލުކުރައްވާ.")}
        </p>

        <div>
          <LinkButton href={routes.kiosk.maintenance} variant="ghost" startIcon="lock">
            {tr("Staff", "މުވައްޒަފުން")}
          </LinkButton>
        </div>
      </div>

      <Modal
        open={scanning}
        onOpenChange={setScanning}
        title={tr("Scan the QR code on your bill", "ބިލުގައިވާ ކިއުއާރް ކޯޑު ސްކޭންކުރޭ")}
        description={tr(
          "Hold the bill in front of the camera, or type the invoice number.",
          "ބިލު ކެމެރާގެ ކުރިމަތީގައި ހިފައްޓަވާ، ނުވަތަ އިންވޮއިސް ނަންބަރު ލިޔުއްވާ.",
        )}
        size="lg"
        mobile="fullscreen"
      >
        <QrCodeScanner
          manualEntry
          onScan={(value) => {
            setScanning(false)
            toast.success(tr("Bill found", "ބިލު ފެނިއްޖެ"), { description: value })
            navigate(routes.kiosk.paymentMethod)
          }}
        />
      </Modal>
    </KioskShell>
  )
}
`;export{e as default};