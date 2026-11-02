var e=`import { Button, Card, DescriptionList, LinkButton, Logo, SensitiveInput, toast } from "@javaabu/onu"

import { useDv, useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import { CitizenShell } from "../_shared/shells"
import { useDates, useL } from "../public-portal/_i18n"
import { courses } from "./_data"

export const meta = { title: "Certificate", group: "Learning", layout: "bare", order: 6 }

const logoSrc = \`\${import.meta.env.BASE_URL}favicon.svg\`
const CERT_NO = "CSTI-2026-04817"
const ISSUED = "2026-10-06"
const VERIFY_URL = \`https://learn.services.gov.mv/verify/\${CERT_NO}\`

/** Only the certificate prints: the app chrome around it is hidden on paper. */
const printCss = \`@media print {
  @page { size: A4 landscape; margin: 12mm; }
  body * { visibility: hidden !important; }
  #certificate, #certificate * { visibility: visible !important; }
  #certificate { position: fixed; inset: 0; margin: 0; box-shadow: none; }
}\`

/** A plain SVG copy of the certificate for "Download". */
function certificateSvg(name: string, course: string, date: string) {
  const svg = \`<svg xmlns="http://www.w3.org/2000/svg" width="1123" height="794" viewBox="0 0 1123 794">
<rect width="1123" height="794" fill="#fff"/><rect x="24" y="24" width="1075" height="746" fill="none" stroke="#15803d" stroke-width="4"/>
<text x="561" y="200" font-family="sans-serif" font-size="22" text-anchor="middle" fill="#555">Civil Service Training Institute</text>
<text x="561" y="270" font-family="serif" font-size="48" text-anchor="middle">Certificate of completion</text>
<text x="561" y="360" font-family="sans-serif" font-size="20" text-anchor="middle" fill="#555">This certifies that</text>
<text x="561" y="420" font-family="serif" font-size="40" text-anchor="middle">\${name}</text>
<text x="561" y="480" font-family="sans-serif" font-size="20" text-anchor="middle" fill="#555">has completed</text>
<text x="561" y="530" font-family="sans-serif" font-size="28" text-anchor="middle">\${course}</text>
<text x="561" y="680" font-family="sans-serif" font-size="16" text-anchor="middle" fill="#555">\${CERT_NO} · \${date}</text>
</svg>\`
  return \`data:image/svg+xml;charset=utf-8,\${encodeURIComponent(svg)}\`
}

export default function CertificatePage() {
  const tr = useTr()
  const l = useL()
  const dv = useDv()
  const dates = useDates()
  const course = courses[0]
  const name = tr("Ahmed Ali", "އަޙްމަދު ޢަލީ")

  return (
    <CitizenShell
      breadcrumbs={[
        { label: tr("Learning", "ތަމްރީނު"), href: routes.learning.courses },
        { label: l(course.title), href: routes.learning.courseDetail },
        { label: tr("Certificate", "ސެޓްފިކެޓް") },
      ]}
    >
      <style>{printCss}</style>
      <div className="max-w-5xl gap-6 mx-auto grid">
        <div className="gap-3 flex flex-wrap items-center justify-between">
          <div>
            <LinkButton
              variant="ghost"
              startIcon="back"
              href={routes.learning.quizResult}
              className="-ms-3 print:hidden"
            >
              {tr("Back", "ފަހަތަށް")}
            </LinkButton>
            <h1 className="text-2xl font-semibold tracking-tight">{tr("Your certificate", "ތިބާގެ ސެޓްފިކެޓް")}</h1>
          </div>
          <div className="gap-2 flex flex-wrap">
            <Button asChild variant="outline">
              <a
                href={certificateSvg("Ahmed Ali", course.title.en, dates.date(ISSUED))}
                download={\`\${CERT_NO}.svg\`}
                onClick={() => toast.success(tr("Certificate downloaded", "ސެޓްފިކެޓް ޑައުންލޯޑްކުރެވިއްޖެ"))}
              >
                {tr("Download", "ޑައުންލޯޑް")}
              </a>
            </Button>
            <Button startIcon="print" className="print:hidden" onClick={() => window.print()}>
              {tr("Print", "ޕްރިންޓްކުރޭ")}
            </Button>
          </div>
        </div>

        {/* The certificate */}
        <div>
          <article
            id="certificate"
            aria-label={tr("Certificate of completion", "ކޯސް ނިންމިކަމުގެ ސެޓްފިކެޓް")}
            className="p-4 shadow-sm sm:aspect-[1.414/1] relative rounded-md border bg-card text-card-foreground"
          >
            <div className="gap-6 p-5 sm:p-12 flex h-full flex-col items-center justify-between rounded-sm border-2 border-primary/60 text-center outline-1 outline-offset-4 outline-primary/30">
              <div className="gap-3 flex flex-col items-center">
                <Logo
                  src={logoSrc}
                  alt=""
                  text={tr("Civil Service Training Institute", "ސިވިލް ސަރވިސް ޓްރޭނިންގ އިންސްޓިޓިއުޓް")}
                  href={null}
                />
                <p className="text-sm tracking-[0.2em] text-muted-foreground uppercase">
                  {tr("Certificate of completion", "ކޯސް ނިންމިކަމުގެ ސެޓްފިކެޓް")}
                </p>
              </div>
              <div className="gap-3 grid">
                <p className="text-muted-foreground">{tr("This certifies that", "މިއީ")}</p>
                <p className={dv ? "text-3xl sm:text-4xl" : "text-3xl sm:text-4xl font-serif"}>{name}</p>
                <p className="text-muted-foreground">
                  {tr(
                    "has successfully completed the course",
                    "ތިރީގައިވާ ކޯސް ކާމިޔާބުކަމާއެކު ނިންމާފައިވާކަމުގެ ސެޓްފިކެޓެވެ",
                  )}
                </p>
                <p className="text-2xl font-semibold text-primary">{l(course.title)}</p>
                <p className="text-sm text-muted-foreground">
                  {tr("12 lessons · 4 hours · Final score 80%", "12 ފިލާވަޅު · 4 ގަޑި · ފައިނަލް ޕޮއިންޓް 80%")}
                </p>
              </div>
              <div className="gap-6 sm:gap-8 text-sm sm:grid-cols-3 grid w-full items-end">
                <div className="gap-1 grid">
                  <span className="text-xl font-[cursive]" aria-hidden>
                    A. Shiuna
                  </span>
                  <span className="pt-1 border-t">
                    {tr("Aishath Shiuna, Instructor", "އައިޝަތު ޝިއުނާ، އިންސްޓްރަކްޓަރ")}
                  </span>
                </div>
                <div className="gap-0.5 grid">
                  <span className="font-medium">{dates.date(ISSUED)}</span>
                  <span className="text-muted-foreground">{tr("Date issued", "ދޫކުރި ތާރީޚު")}</span>
                </div>
                <div className="gap-1 grid">
                  <span className="text-xl font-[cursive]" aria-hidden>
                    M. Zahira
                  </span>
                  <span className="pt-1 border-t">{tr("Mariyam Zahira, Director", "މަރިޔަމް ޒާހިރާ، ޑިރެކްޓަރ")}</span>
                </div>
              </div>
              <p className="text-xs font-mono text-muted-foreground" dir="ltr">
                {CERT_NO}
              </p>
            </div>
          </article>
        </div>

        <Card title={tr("Verify this certificate", "ސެޓްފިކެޓް ޔަގީންކުރުން")} headingLevel={2}>
          <div className="gap-4 px-6 md:grid-cols-2 grid">
            <DescriptionList
              layout="stacked"
              divided={false}
              items={[
                { label: tr("Certificate number", "ސެޓްފިކެޓް ނަންބަރު"), value: CERT_NO, copyable: true },
                { label: tr("Issued to", "ދޫކުރީ"), value: \`\${name} (A123456)\` },
              ]}
            />
            <div className="gap-2 grid content-start">
              <span id="verify-label" className="text-sm font-medium">
                {tr("Verification link", "ޔަގީންކުރާ ލިންކް")}
              </span>
              <SensitiveInput masked={false} mono={false} value={VERIFY_URL} aria-labelledby="verify-label" dir="ltr" />
              <p className="text-sm text-muted-foreground">
                {tr(
                  "Employers can check this certificate online with the link.",
                  "މި ލިންކުން ސެޓްފިކެޓް އޮންލައިންކޮށް ޔަގީންކުރެވޭނެ.",
                )}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </CitizenShell>
  )
}
`;export{e as default};