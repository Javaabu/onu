var e=`import * as React from "react"
import {
  Button,
  Card,
  Countdown,
  DescriptionList,
  EmailInput,
  Form,
  FormField,
  FormGroup,
  Icon,
  Modal,
  PhoneInput,
  ProgressBar,
  ShareButtons,
  StatusBadge,
  SubmitButton,
  Tag,
  TextInput,
  toast,
} from "@javaabu/onu"
import { LocationCard } from "@javaabu/onu/maps"

import { useDv, useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import { PortalShell } from "../_shared/shells"
import { events } from "./_data"
import { scene, useDates, useL, wait } from "./_i18n"
import { Container, PortalPageHeader } from "./_ui"

export const meta = { title: "Event detail", group: "Public portal", layout: "bare", order: 8 }

/** An .ics file for "Add to calendar", as a data URI. */
function icsHref(title: string, start: string, end: string, location: string) {
  const stamp = (s: string) => s.replace(/[-:]/g, "") + "00"
  const body = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Ministry of Services//Events//EN",
    "BEGIN:VEVENT",
    "UID:digital-services-expo-2026@services.gov.mv",
    \`DTSTART;TZID=Indian/Maldives:\${stamp(start)}\`,
    \`DTEND;TZID=Indian/Maldives:\${stamp(end)}\`,
    \`SUMMARY:\${title}\`,
    \`LOCATION:\${location}\`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\\r\\n")
  return \`data:text/calendar;charset=utf-8,\${encodeURIComponent(body)}\`
}

export default function EventDetailPage() {
  const tr = useTr()
  const l = useL()
  const dv = useDv()
  const dates = useDates()
  const event = events[0]
  const [open, setOpen] = React.useState(false)
  const [registered, setRegistered] = React.useState(312)
  const [done, setDone] = React.useState(false)

  const program = [
    { time: "09:00", title: tr("Opening and welcome", "ހުޅުވުމާއި މަރުޙަބާ") },
    { time: "10:00", title: tr("eFaas help desk opens", "އީފާސް އެހީތެރިކަމުގެ ޑެސްކް ހުޅުވުން") },
    { time: "11:30", title: tr("Panel: services for every island", "ޕެނަލް: ކޮންމެ ރަށަކަށް ޚިދުމަތް") },
    { time: "14:00", title: tr("Workshops and demos", "ވޯކްޝޮޕްތަކާއި ޑެމޯތައް") },
    { time: "16:30", title: tr("Awards and closing", "އިނާމު ދިނުމާއި ނިންމުން") },
  ]

  return (
    <PortalShell>
      <PortalPageHeader
        crumbs={[{ label: tr("Events", "ހަރަކާތްތައް"), href: routes.public.events }, { label: l(event.title) }]}
        eyebrow={tr("Expo · Free entry", "އެކްސްޕޯ · ހިލޭ")}
        title={l(event.title)}
        description={l(event.summary)}
      >
        <div className="gap-3 flex flex-wrap">
          <Button size="lg" startIcon="check" onClick={() => setOpen(true)} disabled={done}>
            {done ? tr("You are registered", "ރަޖިސްޓަރީ ވެއްޖެ") : tr("Register", "ރަޖިސްޓަރީ ވުން")}
          </Button>
          <Button asChild size="lg" variant="outline">
            <a
              href={icsHref(event.title.en, event.start, event.end, event.address.en)}
              download="digital-services-expo.ics"
            >
              <Icon name="calendar" />
              {tr("Add to calendar", "ކެލެންޑަރަށް އިތުރުކުރޭ")}
            </a>
          </Button>
        </div>
      </PortalPageHeader>

      <Container className="py-10 gap-10 lg:grid-cols-[1fr_22rem] grid items-start">
        <div className="gap-10 min-w-0 grid">
          <img
            src={scene("", 225, 1600, 800)}
            alt={tr(
              "Visitors at last year's expo in Dharubaaruge",
              "ދަރުބާރުގޭގައި ކުރީ އަހަރުގެ އެކްސްޕޯއަށް ޒިޔާރަތްކުރި މީހުން",
            )}
            className="aspect-[2/1] w-full rounded-2xl border object-cover"
          />
          <section aria-labelledby="about-heading">
            <h2 id="about-heading" className="text-xl font-semibold">
              {tr("About the event", "ހަރަކާތުގެ ތަފްޞީލު")}
            </h2>
            <div className="mt-3 gap-3 leading-relaxed grid text-muted-foreground">
              <p>
                {tr(
                  "Over two days, more than 40 government offices show the services they offer online. Bring your ID card and phone: staff will help you set up eFaas, link your accounts and try services such as passport renewal and business registration.",
                  "ދެ ދުވަހުގެ ތެރޭގައި ސަރުކާރުގެ 40 އަށް ވުރެ ގިނަ އޮފީސްތަކުން އޮންލައިންކޮށް ދޭ ޚިދުމަތްތައް ދައްކާނެ. ކާޑާއި ފޯނު ގެންނަވާ: އީފާސް ހެދުމާއި، އެކައުންޓްތައް ގުޅުވުމާއި، ޕާސްޕޯޓް އާކުރުމާއި ވިޔަފާރި ރަޖިސްޓްރީ ފަދަ ޚިދުމަތްތައް ބޭނުންކޮށްލުމަށް މުވައްޒަފުން އެހީތެރިވެދޭނެ.",
                )}
              </p>
              <p>
                {tr(
                  "The venue is wheelchair accessible. Sign language interpretation is available for the opening and the panel.",
                  "ތަނަށް ވީލްޗެއާގައި ވަދެވޭނެ. ހުޅުވުމާއި ޕެނަލްގައި އިޝާރާތުގެ ބަހުން ތަރުޖަމާ ކުރެވޭނެ.",
                )}
              </p>
            </div>
          </section>
          <section aria-labelledby="program-heading">
            <h2 id="program-heading" className="text-xl font-semibold">
              {tr("Programme, day 1", "ޕްރޮގްރާމް، ފުރަތަމަ ދުވަސް")}
            </h2>
            <ol className="mt-4 divide-y rounded-xl border">
              {program.map((p) => (
                <li key={p.time} className="gap-4 px-4 py-3 flex items-baseline">
                  <time className="w-14 text-sm shrink-0 font-mono text-muted-foreground tabular-nums" dir="ltr">
                    {p.time}
                  </time>
                  <span>{p.title}</span>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <aside className="gap-4 lg:sticky lg:top-20 grid" aria-label={tr("Event details", "ހަރަކާތުގެ މަޢުލޫމާތު")}>
          <Card title={tr("When", "ކޮންއިރަކު")} headingLevel={2} size="sm">
            <div className="gap-4 px-4 grid">
              <div className="gap-3 flex items-start">
                <Icon name="calendar" className="mt-0.5 size-5 text-primary" />
                <div>
                  <div className="font-medium">
                    {dates.date(event.start, "abbreviated")} – {dates.date(event.end, "abbreviated")}
                  </div>
                  <div className="text-sm text-muted-foreground tabular-nums">
                    {dates.time(event.start)} – {dates.time(event.end)}
                  </div>
                </div>
              </div>
              <div>
                <div className="mb-2 text-sm text-muted-foreground">{tr("Starts in", "ފެށޭނީ")}</div>
                <Countdown
                  to={event.start}
                  size="sm"
                  showSeconds={false}
                  completeText={tr("Happening now", "މިހާރު ކުރިއަށްދަނީ")}
                />
              </div>
            </div>
          </Card>
          <LocationCard
            position={event.position}
            title={l(event.venue)}
            address={l(event.address)}
            lang={dv ? "dv" : "en"}
          />
          <Card title={tr("Registration", "ރަޖިސްޓްރޭޝަން")} headingLevel={2} size="sm">
            <div className="gap-3 px-4 grid">
              <ProgressBar
                label={tr("Seats taken", "ބުކްވެފައިވާ ގޮނޑި")}
                value={registered}
                max={event.seats}
                formatValue={(v, max) => \`\${v} / \${max}\`}
              />
              <DescriptionList
                layout="inline"
                divided={false}
                items={[
                  { label: tr("Entry", "ވަނުން"), value: tr("Free", "ހިލޭ") },
                  {
                    label: tr("Status", "ހާލަތު"),
                    value: <StatusBadge status="success">{tr("Open", "ހުޅުވިފައި")}</StatusBadge>,
                  },
                ]}
              />
            </div>
          </Card>
          <ShareButtons
            native="never"
            networks={["copy", "whatsapp", "viber", "email"]}
            iconOnly
            size="sm"
            title={l(event.title)}
          />
        </aside>
      </Container>

      <Modal
        open={open}
        onOpenChange={setOpen}
        title={tr("Register for the expo", "އެކްސްޕޯއަށް ރަޖިސްޓަރީ ވުން")}
        description={tr("We will text you a QR code for entry.", "ވަނުމަށް ކިއުއާރް ކޯޑެއް އެސްއެމްއެސް ކުރާނެ.")}
      >
        <Form
          noValidate
          onSubmit={async (values) => {
            await wait(900)
            const errors: Record<string, string[]> = {}
            if (!String(values.name ?? "").trim()) errors.name = [tr("The name field is required.", "ނަން ލިޔުއްވާ.")]
            if (!/^[A-Z]\\d{6}$/i.test(String(values.id_card ?? "")))
              errors.id_card = [tr("Enter an ID card number like A123456.", "A123456 ފަދަ ކާޑު ނަންބަރެއް ލިޔުއްވާ.")]
            if (Object.keys(errors).length) throw { message: "The given data was invalid.", errors }
            setRegistered((r) => r + 1)
            setDone(true)
            setOpen(false)
            toast.success(tr("You are registered", "ރަޖިސްޓަރީ ވެއްޖެ"), {
              description: tr("Your entry code is on its way by SMS.", "ވަނުމުގެ ކޯޑު އެސްއެމްއެސް ކުރެވޭނެ."),
            })
          }}
        >
          <FormGroup>
            <FormField label={tr("Full name", "ފުރިހަމަ ނަން")} name="name" required>
              <TextInput thaana={dv} autoComplete="name" />
            </FormField>
            <FormField
              label={tr("ID card number", "ކާޑު ނަންބަރު")}
              name="id_card"
              help={tr("For example A123456", "މިސާލަކަށް A123456")}
              required
            >
              <TextInput dir="ltr" autoCapitalize="characters" />
            </FormField>
            <FormField label={tr("Mobile number", "މޯބައިލް ނަންބަރު")} name="phone">
              <PhoneInput defaultValue="+9607771234" />
            </FormField>
            <FormField label={tr("Email", "އީމެއިލް")} name="email">
              <EmailInput dir="ltr" />
            </FormField>
          </FormGroup>
          <div className="gap-2 flex flex-wrap items-center justify-end">
            <Tag size="sm" variant="outline" className="me-auto">
              {tr("Free entry", "ހިލޭ")}
            </Tag>
            <SubmitButton startIcon="check">{tr("Register", "ރަޖިސްޓަރީ ވުން")}</SubmitButton>
          </div>
        </Form>
      </Modal>
    </PortalShell>
  )
}
`;export{e as default};