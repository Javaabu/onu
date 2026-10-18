var e=`import {
  BackButton,
  Button,
  DescriptionList,
  DescriptionListItem,
  Icon,
  Logo,
  PrintButton,
  StatusBadge,
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
  toast,
} from "@javaabu/onu"

import { useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import { useFormatDate, useFormatMoney } from "./_format"

export const meta = { title: "Print layout", group: "System", layout: "bare", order: 6 }

const logoSrc = \`\${import.meta.env.BASE_URL}favicon.svg\`

export default function PrintLayoutPage() {
  const tr = useTr()
  const money = useFormatMoney()
  const date = useFormatDate()

  const fees = [
    { item: tr("Trade licence, new (1 year)", "ވިޔަފާރީގެ ލައިސަންސް، އައު (1 އަހަރު)"), qty: 1, amount: 1500 },
    { item: tr("Premises inspection", "ތަން ބެލުން"), qty: 1, amount: 250 },
    { item: tr("Signboard permit", "ސައިންބޯޑުގެ ހުއްދަ"), qty: 2, amount: 100 },
  ]
  const subtotal = fees.reduce((sum, f) => sum + f.qty * f.amount, 0)
  const gst = subtotal * 0.08
  const total = subtotal + gst

  return (
    <div className="print:bg-white min-h-svh bg-muted/40">
      {/* Screen-only chrome. */}
      <div
        data-print="hide"
        className="top-0 gap-2 px-4 py-2 backdrop-blur sticky z-20 flex flex-wrap items-center justify-between border-b bg-background/95"
      >
        <BackButton fallbackHref={routes.applications.statusTracker} />
        <div className="gap-2 flex flex-wrap">
          <Button
            variant="outline"
            className="touch:min-h-11"
            onClick={() => toast.success(tr("PDF downloaded", "PDF ޑައުންލޯޑް ކުރެވިއްޖެ"))}
          >
            <Icon name="download" data-icon="inline-start" />
            {tr("Download PDF", "PDF ޑައުންލޯޑް")}
          </Button>
          <PrintButton variant="default" />
        </div>
      </div>

      <main id="main" className="px-4 py-8 print:p-0">
        <article
          aria-labelledby="doc-title"
          className="max-w-3xl gap-8 p-6 sm:p-10 shadow-sm print:p-0 mx-auto grid rounded-xl border bg-card text-card-foreground print:max-w-none print:rounded-none print:border-0 print:shadow-none"
        >
          <header className="gap-4 sm:flex-row sm:items-start pb-6 flex flex-col justify-between border-b">
            <div className="gap-3 flex items-center">
              <Logo src={logoSrc} alt="" href={null} />
              <div>
                <p className="font-semibold">{tr("Ministry of Services", "ޚިދުމަތްތަކުގެ ވުޒާރާ")}</p>
                <p className="text-sm text-muted-foreground">
                  {tr("Ameenee Magu, Malé 20026, Maldives", "އަމީނީ މަގު، މާލެ 20026، ދިވެހިރާއްޖެ")}
                </p>
              </div>
            </div>
            <div className="sm:text-end">
              <h1 id="doc-title" className="text-xl font-semibold tracking-tight">
                {tr("Application summary and receipt", "އެޕްލިކޭޝަންގެ ޚުލާސާ އަދި ރަސީދު")}
              </h1>
              <p className="text-sm text-muted-foreground">
                {tr("Reference", "ރެފަރެންސް")}{" "}
                <bdi dir="ltr" className="font-mono text-foreground">
                  TL-2026-004318
                </bdi>
              </p>
            </div>
          </header>

          <section aria-labelledby="applicant-heading" className="gap-6 sm:grid-cols-2 grid print:grid-cols-2">
            <div className="gap-3 grid content-start">
              <h2
                id="applicant-heading"
                className="text-sm font-semibold tracking-wide text-muted-foreground uppercase"
              >
                {tr("Applicant", "އެދޭ ފަރާތް")}
              </h2>
              <DescriptionList layout="stacked" divided={false}>
                <DescriptionListItem label={tr("Name", "ނަން")}>{tr("Ahmed Ali", "އަޙްމަދު ޢަލީ")}</DescriptionListItem>
                <DescriptionListItem label={tr("ID card", "އައިޑީ ކާޑު")}>
                  <bdi dir="ltr">A123456</bdi>
                </DescriptionListItem>
                <DescriptionListItem label={tr("Phone", "ފޯނު")}>
                  <bdi dir="ltr">+960 777‑4821</bdi>
                </DescriptionListItem>
                <DescriptionListItem label={tr("Address", "އެޑްރެސް")}>
                  {tr("H. Blue Lagoon, Majeedhee Magu, Malé", "ހ. ބްލޫ ލަގޫން، މަޖީދީ މަގު، މާލެ")}
                </DescriptionListItem>
              </DescriptionList>
            </div>
            <div className="gap-3 grid content-start">
              <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                {tr("Application", "އެޕްލިކޭޝަން")}
              </h2>
              <DescriptionList layout="stacked" divided={false}>
                <DescriptionListItem label={tr("Service", "ޚިދުމަތް")}>
                  {tr("Trade licence (new)", "ވިޔަފާރީގެ ލައިސަންސް (އައު)")}
                </DescriptionListItem>
                <DescriptionListItem label={tr("Business", "ވިޔަފާރި")}>
                  {tr("Lagoon Café, Hulhumalé", "ލަގޫން ކެފޭ، ހުޅުމާލެ")}
                </DescriptionListItem>
                <DescriptionListItem label={tr("Submitted", "ހުށަހެޅި")}>
                  {date(new Date(2026, 9, 5, 10, 42), true)}
                </DescriptionListItem>
                <DescriptionListItem label={tr("Status", "ހާލަތު")}>
                  <StatusBadge status="success">
                    {tr("Paid, under review", "ފައިސާ ދައްކާފައި، ބަލަމުންދަނީ")}
                  </StatusBadge>
                </DescriptionListItem>
              </DescriptionList>
            </div>
          </section>

          <section aria-labelledby="fees-heading" className="gap-3 grid">
            <h2 id="fees-heading" className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
              {tr("Fees", "ފީ")}
            </h2>
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{tr("Item", "ތަފްޞީލު")}</TableHead>
                    <TableHead className="text-end">{tr("Qty", "އަދަދު")}</TableHead>
                    <TableHead className="text-end">{tr("Amount", "އަގު")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fees.map((f) => (
                    <TableRow key={f.item}>
                      <TableCell className="whitespace-normal">{f.item}</TableCell>
                      <TableCell className="text-end tabular-nums">{f.qty}</TableCell>
                      <TableCell className="text-end tabular-nums">{money(f.qty * f.amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={2}>{tr("Subtotal", "ޖުމްލަ")}</TableCell>
                    <TableCell className="text-end tabular-nums">{money(subtotal)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={2}>{tr("GST (8%)", "ޖީއެސްޓީ (8%)")}</TableCell>
                    <TableCell className="text-end tabular-nums">{money(gst)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={2} className="font-semibold">
                      {tr("Total paid", "ދެއްކި ޖުމްލަ")}
                    </TableCell>
                    <TableCell className="font-semibold text-end tabular-nums">{money(total)}</TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
            <p className="text-sm text-muted-foreground">
              {tr("Paid by BML card ending 4417 on", "ބީއެމްއެލް ކާޑު (ނިމޭ ނަންބަރު 4417) އިން ދެއްކީ")}{" "}
              {date(new Date(2026, 9, 5, 10, 44))}. {tr("Transaction", "ޓްރާންޒެކްޝަން")}{" "}
              <bdi dir="ltr" className="font-mono">
                BML-88213094
              </bdi>
            </p>
          </section>

          <section aria-labelledby="declaration-heading" className="gap-3 grid break-inside-avoid">
            <h2
              id="declaration-heading"
              className="text-sm font-semibold tracking-wide text-muted-foreground uppercase"
            >
              {tr("Declaration", "އިޤްރާރު")}
            </h2>
            <p className="text-sm">
              {tr(
                "I confirm that the information given in this application is true and complete.",
                "މި އެޕްލިކޭޝަންގައި ދީފައިވާ މައުލޫމާތަކީ ތެދު އަދި ފުރިހަމަ މައުލޫމާތުކަން ކަށަވަރުކުރަމެވެ.",
              )}
            </p>
            <div className="gap-8 pt-10 sm:grid-cols-2 grid print:grid-cols-2">
              {[
                tr("Applicant's signature", "އެދޭ ފަރާތުގެ ސޮއި"),
                tr("Officer's signature and stamp", "މުވައްޒަފުގެ ސޮއި އަދި ތައްގަނޑު"),
              ].map((label) => (
                <div key={label} className="pt-2 text-sm border-t border-dashed text-muted-foreground">
                  {label}
                </div>
              ))}
            </div>
          </section>

          <footer className="gap-1 pt-4 text-xs grid border-t text-muted-foreground">
            <p>
              {tr("Generated on", "ތައްޔާރުކުރީ")} {date(new Date(2026, 9, 7, 9, 15), true)} ·{" "}
              {tr("Verify at", "ޗެކްކުރައްވާ")}{" "}
              <bdi dir="ltr" className="font-mono">
                services.example.mv/verify/TL-2026-004318
              </bdi>
            </p>
            <p>
              {tr(
                "This is a computer-generated document and is valid without a signature for payment purposes.",
                "މިއީ ކޮމްޕިއުޓަރުން ތައްޔާރުކުރާ ލިޔުމެއް. ފައިސާ ދެއްކި ކަމުގެ ހެކިއަކަށް ސޮއި ނެތިއެއް ބޭނުންކުރެވޭނެ.",
              )}
            </p>
          </footer>
        </article>
      </main>
    </div>
  )
}
`;export{e as default};