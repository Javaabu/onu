import { BackButton, Button, Icon, Logo, PrintButton, StatusBadge, toast } from "@javaabu/onu"

import { CitizenShell } from "../_shared/shells"
import { useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import { applicant, useFormat } from "./_data"
import { PrintOnlyContent } from "./_print"

export const meta = { title: "Certificate / licence", group: "Applications and workflows", layout: "bare", order: 7 }

const logoSrc = `${import.meta.env.BASE_URL}favicon.svg`
const LICENCE = "BL-2026-04417"

export default function CertificatePage() {
  const tr = useTr()
  const { date } = useFormat()

  const rows = [
    {
      label: tr("Licence holder", "ލައިސަންސް ލިބިފައިވާ ފަރާތް"),
      value: `${tr(...applicant.name)} (${applicant.idCard})`,
    },
    { label: tr("Business name", "ވިޔަފާރީގެ ނަން"), value: tr("Ocean Breeze Café", "އޯޝަން ބްރީޒް ކެފޭ") },
    { label: tr("Activity", "ވިޔަފާރީގެ ބާވަތް"), value: tr("Café or restaurant", "ކެފޭ ނުވަތަ ރެސްޓޯރަންޓް") },
    {
      label: tr("Premises", "ތަން"),
      value: tr("Lot 10234, Nirolhu Magu, Hulhumalé, Kaafu Atoll", "ލޮޓް 10234، ނިރޮޅު މަގު، ހުޅުމާލެ، ކ. އަތޮޅު"),
    },
    { label: tr("Valid from", "ފެށޭ ތާރީޚު"), value: date("2026-10-07T00:00:00") },
    { label: tr("Valid until", "ހަމަވާ ތާރީޚު"), value: date("2027-10-06T00:00:00") },
  ]

  return (
    <CitizenShell
      breadcrumbs={[
        { label: tr("My documents", "ލިޔެކިޔުންތައް"), href: routes.citizen.documents },
        { label: LICENCE },
      ]}
    >
      <PrintOnlyContent />
      <div className="gap-4 max-w-4xl mx-auto grid w-full grid-cols-1">
        <div className="gap-2 flex flex-wrap items-center justify-between" data-print="hide">
          <BackButton fallbackHref={routes.citizen.documents}>{tr("Back", "ފަހަތަށް")}</BackButton>
          <div className="gap-2 flex flex-wrap items-center">
            <StatusBadge status="success">{tr("Valid", "ޞައްޙަ")}</StatusBadge>
            <Button
              variant="outline"
              startIcon="download"
              onClick={() =>
                toast.success(tr("Download started", "ޑައުންލޯޑް ފެށިއްޖެ"), { description: `${LICENCE}.pdf` })
              }
            >
              {tr("Download PDF", "PDF ޑައުންލޯޑްކުރޭ")}
            </Button>
            <PrintButton variant="default">{tr("Print", "ޕްރިންޓްކުރޭ")}</PrintButton>
          </div>
        </div>

        <article
          aria-labelledby="certificate-title"
          className="p-2 sm:p-3 shadow-sm rounded-lg border bg-card text-card-foreground print:break-inside-avoid print:rounded-none print:shadow-none"
        >
          <div className="gap-6 px-4 py-8 sm:px-10 sm:py-12 grid rounded-md border-4 border-double border-primary/60 text-center">
            <header className="gap-3 grid justify-items-center">
              <Logo src={logoSrc} alt="" text={null} href={null} className="[&_img]:size-14" />
              <p className="text-sm tracking-wide text-muted-foreground uppercase">
                {tr(
                  "Republic of Maldives · Ministry of Economic Development",
                  "ދިވެހިރާއްޖޭގެ ޖުމްހޫރިއްޔާ · އިޤްތިޞާދީ ތަރައްޤީއާ ބެހޭ ވުޒާރާ",
                )}
              </p>
              <h1 id="certificate-title" className="text-3xl sm:text-4xl font-semibold tracking-tight">
                {tr("Business Licence", "ވިޔަފާރީގެ ލައިސަންސް")}
              </h1>
              <p className="text-sm font-mono tabular-nums">{LICENCE}</p>
            </header>

            <p className="max-w-xl mx-auto text-muted-foreground">
              {tr(
                "This is to certify that the business below is licensed to operate under the Business Registration Act (Law No. 18/2014).",
                "ތިރީގައިވާ ވިޔަފާރި ހިންގުމުގެ ހުއްދަ ވިޔަފާރި ރަޖިސްޓްރީކުރުމުގެ ޤާނޫނު (ޤާނޫނު ނަންބަރު 18/2014) ގެ ދަށުން ދޫކޮށްފައިވާކަމުގެ ލިޔުމެވެ.",
              )}
            </p>

            <dl className="gap-x-6 gap-y-4 sm:grid-cols-2 max-w-2xl mx-auto grid w-full text-start">
              {rows.map((row) => (
                <div key={row.label} className="pb-2 border-b">
                  <dt className="text-xs text-muted-foreground">{row.label}</dt>
                  <dd className="font-medium">{row.value}</dd>
                </div>
              ))}
            </dl>

            <footer className="gap-8 pt-4 sm:grid-cols-[1fr_auto] grid items-end text-start">
              <div className="gap-1 grid">
                <div className="h-12 w-48 border-b border-foreground/60" aria-hidden="true" />
                <p className="font-medium">{tr("Mariyam Nisha", "މަރިޔަމް ނިޝާ")}</p>
                <p className="text-sm text-muted-foreground">
                  {tr("Registrar of Businesses", "ވިޔަފާރި ރަޖިސްޓްރާރު")} · {date("2026-10-07T00:00:00")}
                </p>
              </div>
              <figure className="gap-1 grid justify-items-center">
                <div
                  role="img"
                  aria-label={tr(
                    `QR code to verify licence ${LICENCE}`,
                    `ލައިސަންސް ${LICENCE} ޗެކްކުރާ ކިއުއާރް ކޯޑު`,
                  )}
                  className="size-28 flex items-center justify-center rounded-md border-2 border-dashed border-foreground/40 bg-muted"
                >
                  <Icon name="qr-code" className="size-16 text-foreground/70" />
                </div>
                <figcaption className="text-xs text-muted-foreground">
                  {tr("Scan to verify", "ޗެކްކުރުމަށް ސްކޭންކުރޭ")}
                  <br />
                  <span dir="ltr">verify.trade.gov.mv</span>
                </figcaption>
              </figure>
            </footer>
          </div>
        </article>
      </div>
    </CitizenShell>
  )
}
