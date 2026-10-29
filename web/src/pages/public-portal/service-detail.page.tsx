import {
  Accordion,
  AttachmentPreview,
  Card,
  Callout,
  DescriptionList,
  Icon,
  IconText,
  LinkButton,
  Rating,
  Section,
  ShareButtons,
  Tag,
  Timeline,
} from "@javaabu/onu"

import { useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import { PortalShell } from "../_shared/shells"
import { services } from "./_data"
import { useL, useMvr } from "./_i18n"
import { Container, PortalPageHeader } from "./_ui"

export const meta = { title: "Service detail", group: "Public portal", layout: "bare", order: 3 }

export default function ServiceDetailPage() {
  const tr = useTr()
  const l = useL()
  const mvr = useMvr()
  const service = services[0]
  const related = services.filter((s) => s.category === "identity" && s.id !== service.id)

  const eligibility = [
    tr("You are a Maldivian citizen.", "ދިވެހި ރައްޔިތެއް ކަމުގައި ވުން."),
    tr(
      "Your current passport expires within 12 months, has expired, or has fewer than 6 blank pages.",
      "މިހާރު ހުރި ޕާސްޕޯޓުގެ މުއްދަތު 12 މަހުގެ ތެރޭގައި ހަމަވުން، ހަމަވެފައިވުން، ނުވަތަ ހުސް ސަފްހާ 6 އަށް ވުރެ މަދުވުން.",
    ),
    tr(
      "Applicants under 18 need a parent or guardian's consent.",
      "18 އަހަރުން ދަށުގެ ފަރާތްތަކަށް ބެލެނިވެރިއެއްގެ ހުއްދަ ބޭނުންވާނެ.",
    ),
  ]
  const documents = [
    { icon: "user", text: tr("National ID card (original)", "ދިވެހި ކާޑު (އަސްލު)") },
    { icon: "globe", text: tr("Current or expired passport", "މިހާރު ހުރި ނުވަތަ މުއްދަތު ހަމަވެފައިވާ ޕާސްޕޯޓް") },
    {
      icon: "image",
      text: tr(
        "Recent passport photo (white background, 35 × 45 mm)",
        "އެންމެ ފަހުން ނެގި ފޮޓޯ (ހުދު ފަސްބިމު، 35 × 45 މމ)",
      ),
    },
    {
      icon: "file-text",
      text: tr("Police report, if the passport was lost", "ޕާސްޕޯޓް ގެއްލިފައިވާނަމަ ފުލުހުންގެ ރިޕޯޓް"),
    },
  ]
  const steps = [
    {
      title: tr("Apply online", "އޮންލައިންކޮށް އެދުން"),
      description: tr(
        "Sign in with eFaas, fill in the form and upload your photo.",
        "އީފާސް މެދުވެރިކޮށް ލޮގިންވެ، ފޯމު ފުރިހަމަކޮށް ފޮޓޯ އަޕްލޯޑްކުރުން.",
      ),
    },
    {
      title: tr("Pay the fee", "ފީ ދެއްކުން"),
      description: tr(
        "Pay by BML card, MIB or a bank transfer.",
        "ބީއެމްއެލް ކާޑު، އެމްއައިބީ ނުވަތަ ޓްރާންސްފަރ މެދުވެރިކޮށް.",
      ),
    },
    {
      title: tr("Biometrics appointment", "ބައޮމެޓްރިކްސް އެޕޮއިންޓްމަންޓް"),
      description: tr(
        "Visit a service centre for fingerprints. Skip this if you gave them in the last 5 years.",
        "އިނގިލީގެ ނިޝާން ނެގުމަށް ސަރވިސް ސެންޓަރަށް ވަޑައިގަތުން. ފާއިތުވި 5 އަހަރުގައި ދީފައިވާނަމަ ނުޖެހޭ.",
      ),
    },
    {
      title: tr("Collect your passport", "ޕާސްޕޯޓް ނެގުން"),
      description: tr(
        "We send an SMS when it is ready, usually within 5 working days.",
        "ތައްޔާރުވުމުން އެސްއެމްއެސް ފޮނުވާނެ، އާންމުކޮށް 5 ބަންދު ނޫން ދުވަހުގެ ތެރޭގައި.",
      ),
    },
  ]

  return (
    <PortalShell>
      <PortalPageHeader
        crumbs={[{ label: tr("Services", "ޚިދުމަތްތައް"), href: routes.public.services }, { label: l(service.title) }]}
        eyebrow={tr("Identity and civil registration", "ޕާސްޕޯޓާއި ރަޖިސްޓްރީ")}
        title={l(service.title)}
        description={l(service.summary)}
      >
        <div className="gap-2 flex flex-wrap items-center">
          <Tag variant="primary" icon="globe">
            {tr("Available online", "އޮންލައިންކޮށް ލިބޭ")}
          </Tag>
          <Tag variant="outline" icon="clock">
            {tr("5 working days", "5 ބަންދު ނޫން ދުވަސް")}
          </Tag>
          <span className="gap-2 text-sm inline-flex items-center text-muted-foreground">
            <Rating readOnly value={4.5} size="sm" aria-label={tr("Rated 4.5 out of 5", "5 އިން 4.5")} />
            <span className="tabular-nums">4.5 · {tr("1,284 reviews", "1,284 ރިވިއު")}</span>
          </span>
        </div>
      </PortalPageHeader>

      <Container className="py-10 gap-10 lg:grid-cols-[1fr_20rem] grid items-start">
        <div className="gap-10 min-w-0 grid">
          <Section title={tr("Who can apply", "އެދެވޭނީ ކާކަށް")} classNames={{ title: "text-xl", content: "mt-4" }}>
            <ul className="gap-3 grid">
              {eligibility.map((e) => (
                <li key={e} className="gap-3 flex items-start">
                  <Icon name="check" className="mt-0.5 size-5 shrink-0 text-success" />
                  <span>{e}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section
            title={tr("Documents you need", "ބޭނުންވާ ލިޔެކިޔުންތައް")}
            description={tr(
              "Scan or photograph each document clearly.",
              "ކޮންމެ ލިޔުމެއް ސާފުކޮށް ސްކޭން ނުވަތަ ފޮޓޯ ނަގާ.",
            )}
            classNames={{ title: "text-xl", content: "mt-4" }}
          >
            <ul className="gap-3 sm:grid-cols-2 grid">
              {documents.map((d) => (
                <li key={d.text} className="gap-3 p-4 flex items-start rounded-lg border bg-card">
                  <Icon name={d.icon} className="mt-0.5 size-5 shrink-0 text-primary" />
                  <span className="text-sm">{d.text}</span>
                </li>
              ))}
            </ul>
            <AttachmentPreview
              className="mt-4"
              name={tr("Passport application form (PA-1)", "ޕާސްޕޯޓަށް އެދޭ ފޯމު (PA-1)")}
              description={tr("For applying in person at a service centre", "ސަރވިސް ސެންޓަރުން އެދުމަށް")}
              versions={[
                { lang: "dv", href: "#pa-1-dv.pdf", size: 184_000, type: "application/pdf" },
                { lang: "en", href: "#pa-1-en.pdf", size: 162_000, type: "application/pdf" },
              ]}
            />
          </Section>

          <Section title={tr("Fees", "ފީ")} classNames={{ title: "text-xl", content: "mt-4" }}>
            <Card size="sm">
              <DescriptionList
                items={[
                  { label: tr("Standard (32 pages)", "ސްޓޭންޑަޑް (32 ސަފްހާ)"), value: mvr(750) },
                  { label: tr("Large (64 pages)", "ބޮޑު (64 ސަފްހާ)"), value: mvr(1000) },
                  { label: tr("Under 16", "16 އަހަރުން ދަށް"), value: mvr(350) },
                  { label: tr("Express (2 days)", "އަވަސް (2 ދުވަސް)"), value: tr(`+ ${mvr(500)}`, `+ ${mvr(500)}`) },
                ]}
              />
            </Card>
            <Callout
              className="mt-4"
              variant="info"
              title={tr("Lost passports", "ގެއްލިފައިވާ ޕާސްޕޯޓް")}
              description={tr(
                `Replacing a lost passport costs an extra ${mvr(250)}.`,
                `ގެއްލިފައިވާ ޕާސްޕޯޓެއް ބަދަލުކުރުމަށް އިތުރު ${mvr(250)} ނަގާނެ.`,
              )}
            />
          </Section>

          <Section title={tr("How it works", "ކުރަންޖެހޭ ކަންތައް")} classNames={{ title: "text-xl", content: "mt-4" }}>
            <Timeline
              items={steps.map((s) => ({ ...s, status: "default" as const }))}
              aria-label={tr("Steps", "ފިޔަވަޅުތައް")}
            />
          </Section>

          <Section title={tr("Questions", "ސުވާލުތައް")} classNames={{ title: "text-xl", content: "mt-4" }}>
            <Accordion
              variant="bordered"
              items={[
                {
                  value: "travel",
                  title: tr(
                    "Can I travel while my passport is being renewed?",
                    "ޕާސްޕޯޓް އާކުރަމުން ދަނިކޮށް ދަތުރުކުރެވޭނެތަ؟",
                  ),
                  content: tr(
                    "No. Your old passport is cancelled when you submit the application. Choose express service if you travel soon.",
                    "ނުކުރެވޭނެ. އެޕްލިކޭޝަން ހުށަހަޅާއިރު ކުރީގެ ޕާސްޕޯޓް ބާތިލުކުރެވޭނެ. ދަތުރު ކައިރިނަމަ އަވަސް ޚިދުމަތް ޚިޔާރުކުރައްވާ.",
                  ),
                },
                {
                  value: "someone-else",
                  title: tr("Can someone else collect it for me?", "އެހެން މީހަކަށް ނަގައިދެވޭނެތަ؟"),
                  content: tr(
                    "Yes, with a signed letter of authorisation and a copy of your ID card.",
                    "އާދެ، ސޮއިކޮށްފައިވާ ހުއްދައެއްގެ ސިޓީއަކާއި ކާޑުގެ ކޮޕީއާއެކު.",
                  ),
                },
                {
                  value: "abroad",
                  title: tr("I live abroad. How do I renew?", "ބޭރުގައި ދިރިއުޅޭނަމަ އާކުރާނީ ކިހިނެއް؟"),
                  content: tr(
                    "Apply online and choose the nearest Maldivian embassy or high commission for collection.",
                    "އޮންލައިންކޮށް އެދި، ނަގާނެ ތަނަކަށް އެންމެ ކައިރި ދިވެހި އެމްބަސީ ޚިޔާރުކުރައްވާ.",
                  ),
                },
              ]}
            />
          </Section>
        </div>

        {/* Sidebar */}
        <aside className="gap-4 lg:sticky lg:top-20 grid" aria-label={tr("Apply", "އެދުން")}>
          <Card
            title={tr("Apply for this service", "މި ޚިދުމަތަށް އެދުން")}
            headingLevel={2}
            footer={
              <div className="gap-2 grid w-full">
                <LinkButton href={routes.applications.wizard} size="lg" endIcon="arrow-right" className="w-full">
                  {tr("Apply online", "އޮންލައިންކޮށް އެދުން")}
                </LinkButton>
                <p className="text-xs text-center text-muted-foreground">
                  {tr("You will sign in with eFaas.", "އީފާސް މެދުވެރިކޮށް ލޮގިންވާނެ.")}
                </p>
              </div>
            }
          >
            <DescriptionList
              layout="inline"
              items={[
                { label: tr("Fee", "ފީ"), value: mvr(service.fee) },
                { label: tr("Takes", "ނިމޭނެ މުއްދަތު"), value: tr("5 working days", "5 ބަންދު ނޫން ދުވަސް") },
                { label: tr("Valid for", "މުއްދަތު"), value: tr("10 years", "10 އަހަރު") },
              ]}
            />
          </Card>
          <Card size="sm" variant="muted" title={tr("Need help?", "އެހީ ބޭނުންތަ؟")} headingLevel={2}>
            <div className="gap-2 px-4 text-sm grid">
              <IconText icon="phone" size="sm" asChild>
                <a href="tel:1500" className="hover:underline">
                  {tr("Call 1500", "1500 އަށް ގުޅުއްވާ")}
                </a>
              </IconText>
              <IconText icon="mail" size="sm" asChild>
                <a href="mailto:passport@services.gov.mv" className="hover:underline" dir="ltr">
                  passport@services.gov.mv
                </a>
              </IconText>
              <IconText icon="map-pin" size="sm" asChild>
                <a href={`#${routes.public.contact}`} className="hover:underline">
                  {tr("Find a service centre", "ސަރވިސް ސެންޓަރެއް ހޯއްދަވާ")}
                </a>
              </IconText>
            </div>
          </Card>
          <ShareButtons
            native="never"
            networks={["copy", "whatsapp", "viber", "email"]}
            iconOnly
            size="sm"
            title={l(service.title)}
          />
        </aside>
      </Container>

      <div className="border-t bg-muted/30">
        <Container className="py-12">
          <h2 className="text-xl font-semibold">{tr("Related services", "ގުޅުންހުރި ޚިދުމަތްތައް")}</h2>
          <ul className="mt-6 gap-4 sm:grid-cols-2 grid">
            {related.map((s) => (
              <li key={s.id}>
                <Card
                  href={routes.public.serviceDetail}
                  className="h-full"
                  title={l(s.title)}
                  description={l(s.summary)}
                  footer={
                    <IconText icon="credit-card" size="sm" tone="muted">
                      {s.fee ? mvr(s.fee) : tr("Free", "ހިލޭ")}
                    </IconText>
                  }
                />
              </li>
            ))}
          </ul>
        </Container>
      </div>
    </PortalShell>
  )
}
