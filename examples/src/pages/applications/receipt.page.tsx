import {
  BackButton,
  Card,
  DescriptionList,
  Divider,
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
} from "@javaabu/onu"

import { CitizenShell } from "../_shared/shells"
import { useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import { applicant, order, useFormat } from "./_data"
import { PrintOnlyContent } from "./_print"

export const meta = { title: "Payment receipt", group: "Applications and workflows", layout: "bare", order: 6 }

const logoSrc = `${import.meta.env.BASE_URL}favicon.svg`

export default function ReceiptPage() {
  const tr = useTr()
  const { money, dateTime } = useFormat()

  return (
    <CitizenShell
      breadcrumbs={[
        { label: tr("My payments", "ފައިސާ ދެއްކުންތައް"), href: routes.citizen.payments },
        { label: order.receipt },
      ]}
    >
      <PrintOnlyContent />
      <div className="gap-4 max-w-3xl mx-auto grid w-full">
        <div className="gap-2 flex flex-wrap items-center justify-between" data-print="hide">
          <BackButton fallbackHref={routes.citizen.payments}>{tr("Back", "ފަހަތަށް")}</BackButton>
          <PrintButton variant="default">{tr("Print receipt", "ރަސީދު ޕްރިންޓްކުރޭ")}</PrintButton>
        </div>

        <Card className="print:border-0 print:shadow-none">
          <article className="gap-6 grid" aria-labelledby="receipt-title">
            <header className="gap-4 flex flex-wrap items-start justify-between">
              <Logo
                src={logoSrc}
                alt=""
                text={tr("Ministry of Economic Development", "އިޤްތިޞާދީ ތަރައްޤީއާ ބެހޭ ވުޒާރާ")}
                href={null}
              />
              <div className="text-end">
                <h1 id="receipt-title" className="text-2xl font-semibold">
                  {tr("Payment receipt", "ފައިސާ ލިބުނު ރަސީދު")}
                </h1>
                <p className="text-sm text-muted-foreground tabular-nums">{order.receipt}</p>
              </div>
            </header>

            <div className="gap-6 sm:grid-cols-2 grid">
              <section aria-labelledby="receipt-payer">
                <h2 id="receipt-payer" className="mb-2 text-sm font-medium text-muted-foreground">
                  {tr("Received from", "ލިބުނީ")}
                </h2>
                <p className="font-medium">{tr(...applicant.name)}</p>
                <p className="text-sm">{applicant.idCard}</p>
                <p className="text-sm">{tr(...applicant.house)}</p>
                <p className="text-sm">{tr("Hulhumalé, Kaafu Atoll", "ހުޅުމާލެ، ކ. އަތޮޅު")}</p>
              </section>
              <section aria-labelledby="receipt-details">
                <h2 id="receipt-details" className="sr-only">
                  {tr("Payment details", "ފައިސާގެ ތަފްސީލު")}
                </h2>
                <DescriptionList
                  layout="inline"
                  items={[
                    { label: tr("Date", "ތާރީޚު"), value: dateTime(order.paidAt) },
                    { label: tr("Invoice", "އިންވޮއިސް"), value: order.ref },
                    { label: tr("Application", "އެޕްލިކޭޝަން"), value: order.application },
                    {
                      label: tr("Method", "ދެއްކި ގޮތް"),
                      value: tr("BML Connect (Visa •••• 4242)", "ބީއެމްއެލް ކަނެކްޓް (ވިސާ 4242)"),
                    },
                    { label: tr("Transaction", "ޓްރާންޒެކްޝަން"), value: order.transaction },
                    {
                      label: tr("Status", "ހާލަތު"),
                      value: <StatusBadge status="success">{tr("Paid", "ދައްކާފައި")}</StatusBadge>,
                    },
                  ]}
                />
              </section>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{tr("Description", "ތަފްސީލު")}</TableHead>
                    <TableHead className="text-end">{tr("Amount", "ޢަދަދު")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item.label[0]}>
                      <TableCell className="whitespace-normal">{tr(...item.label)}</TableCell>
                      <TableCell className="text-end tabular-nums">{money(item.amount)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell>{tr("GST (exempt)", "ޖީއެސްޓީ (އިސްތިސްނާ)")}</TableCell>
                    <TableCell className="text-end tabular-nums">{money(0)}</TableCell>
                  </TableRow>
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell className="font-semibold">{tr("Total paid", "ޖުމްލަ ދެއްކި")}</TableCell>
                    <TableCell className="font-semibold text-end tabular-nums">{money(order.total)}</TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>

            <Divider />
            <footer className="gap-1 text-xs grid text-muted-foreground">
              <p>
                {tr(
                  "This receipt was generated electronically and is valid without a signature.",
                  "މި ރަސީދު ހެދިފައިވަނީ އިލެކްޓްރޯނިކްކޮށް، ސޮއި ނެތިއެވެސް ޞައްޙަ.",
                )}
              </p>
              <p>
                {tr(
                  "Ministry of Economic Development, Malé · +960 330 0000 · trade.gov.mv",
                  "އިޤްތިޞާދީ ތަރައްޤީއާ ބެހޭ ވުޒާރާ، މާލެ · ‎+960 330 0000 · trade.gov.mv",
                )}
              </p>
            </footer>
          </article>
        </Card>
      </div>
    </CitizenShell>
  )
}
