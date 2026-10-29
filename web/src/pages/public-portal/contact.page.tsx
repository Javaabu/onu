import * as React from "react"
import {
  Button,
  Callout,
  Card,
  DescriptionList,
  Form,
  FormField,
  FormGroup,
  Icon,
  PhoneInput,
  Select,
  StatusBadge,
  SubmitButton,
  TextInput,
  Textarea,
  toast,
} from "@javaabu/onu"
import { LocationCard } from "@javaabu/onu/maps"

import { useDv, useTr } from "../_shared/i18n"
import { PortalShell } from "../_shared/shells"
import { offices } from "./_data"
import { useL, wait } from "./_i18n"
import { Container, PortalPageHeader } from "./_ui"

export const meta = { title: "Contact", group: "Public portal", layout: "bare", order: 12 }

export default function ContactPage() {
  const tr = useTr()
  const l = useL()
  const dv = useDv()
  const [sent, setSent] = React.useState<string | null>(null)

  const channels = [
    {
      icon: "phone",
      title: tr("Call 1500", "1500 އަށް ގުޅުއްވާ"),
      text: tr("Sunday–Thursday, 8:00–20:00", "އާދިއްތަ–ބުރާސްފަތި، 8:00–20:00"),
      href: "tel:1500",
      value: "1500",
    },
    {
      icon: "mail",
      title: tr("Email", "އީމެއިލް"),
      text: tr("We reply within 2 working days", "2 ބަންދު ނޫން ދުވަހުގެ ތެރޭގައި ޖަވާބު"),
      href: "mailto:info@services.gov.mv",
      value: "info@services.gov.mv",
    },
    {
      icon: "message",
      title: tr("Viber", "ވައިބަރ"),
      text: tr("Chat with an officer", "އޮފިސަރަކާ ޗެޓްކުރައްވާ"),
      href: "viber://chat?number=%2B9607901500",
      value: "+960 790 1500",
    },
  ]

  return (
    <PortalShell>
      <PortalPageHeader
        crumbs={[{ label: tr("Contact", "ގުޅުއްވާ") }]}
        title={tr("Contact us", "އަޅުގަނޑުމެންނާ ގުޅުއްވާ")}
        description={tr(
          "Ask a question, report a problem or tell us how we can do better.",
          "ސުވާލެއް ކުރައްވާ، މައްސަލައެއް ހުށަހަޅުއްވާ، ނުވަތަ ރަނގަޅުކުރެވޭނެ ގޮތެއް ބުނެދެއްވާ.",
        )}
      />

      <Container className="py-10">
        <ul className="gap-4 sm:grid-cols-3 grid">
          {channels.map((c) => (
            <li key={c.icon}>
              <Card size="sm" className="h-full">
                <div className="gap-4 flex items-start">
                  <span className="size-10 grid shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                    <Icon name={c.icon} className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <h2 className="font-medium">{c.title}</h2>
                    <a
                      href={c.href}
                      dir="ltr"
                      className="font-medium break-all text-primary underline-offset-4 hover:underline"
                    >
                      {c.value}
                    </a>
                    <p className="mt-0.5 text-sm text-muted-foreground">{c.text}</p>
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      </Container>

      <Container className="pb-12 gap-10 lg:grid-cols-[1fr_22rem] grid items-start">
        <section aria-labelledby="form-heading">
          <h2 id="form-heading" className="text-2xl font-semibold tracking-tight">
            {tr("Send us a message", "މެސެޖެއް ފޮނުއްވާ")}
          </h2>
          {sent ? (
            <Callout
              className="mt-6"
              variant="success"
              title={tr("Message sent", "މެސެޖް ފޮނުވިއްޖެ")}
              description={tr(
                `Your ticket number is ${sent}. We have emailed you a copy.`,
                `ޓިކެޓް ނަންބަރަކީ ${sent}. އީމެއިލް މެދުވެރިކޮށް ކޮޕީއެއް ފޮނުވިއްޖެ.`,
              )}
              actions={
                <Button variant="outline" size="sm" onClick={() => setSent(null)}>
                  {tr("Send another message", "އެހެން މެސެޖެއް ފޮނުވާ")}
                </Button>
              }
            />
          ) : (
            <Card className="mt-6">
              <div>
                <Form
                  noValidate
                  onSubmit={async (values) => {
                    await wait(1000)
                    const errors: Record<string, string[]> = {}
                    if (!String(values.name ?? "").trim())
                      errors.name = [tr("The name field is required.", "ނަން ލިޔުއްވާ.")]
                    const email = String(values.email ?? "")
                    if (!/^\S+@\S+\.\S+$/.test(email))
                      errors.email = [tr("Enter a valid email address.", "ރަނގަޅު އީމެއިލް އެޑްރެހެއް ލިޔުއްވާ.")]
                    if (!values.topic) errors.topic = [tr("Choose a topic.", "މައުޟޫޢެއް ޚިޔާރުކުރައްވާ.")]
                    if (String(values.message ?? "").trim().length < 20)
                      errors.message = [
                        tr("The message must be at least 20 characters.", "މެސެޖް 20 އަކުރަށް ވުރެ ދިގުކުރައްވާ."),
                      ]
                    if (Object.keys(errors).length) throw { message: "The given data was invalid.", errors }
                    setSent("TKT-58214")
                    toast.success(tr("Message sent", "މެސެޖް ފޮނުވިއްޖެ"))
                  }}
                >
                  <FormGroup columns={2}>
                    <FormField label={tr("Your name", "ނަން")} name="name" required>
                      <TextInput thaana={dv} autoComplete="name" />
                    </FormField>
                    <FormField label={tr("Email", "އީމެއިލް")} name="email" required>
                      <TextInput type="email" />
                    </FormField>
                    <FormField label={tr("Phone", "ފޯނު")} name="phone">
                      <PhoneInput />
                    </FormField>
                    <FormField label={tr("Topic", "މައުޟޫޢު")} name="topic" required>
                      <Select
                        placeholder={tr("Choose a topic", "މައުޟޫޢެއް ޚިޔާރުކުރައްވާ")}
                        options={[
                          {
                            value: "service",
                            label: tr("A service or application", "ޚިދުމަތެއް ނުވަތަ އެޕްލިކޭޝަނެއް"),
                          },
                          { value: "payment", label: tr("A payment", "ފައިސާ ދެއްކުމެއް") },
                          { value: "website", label: tr("This website", "މި ވެބްސައިޓް") },
                          { value: "complaint", label: tr("A complaint", "ޝަކުވާއެއް") },
                        ]}
                      />
                    </FormField>
                    <FormField
                      className="col-span-full"
                      label={tr("Message", "މެސެޖް")}
                      name="message"
                      help={tr(
                        "Write in Dhivehi or English. Use the ތ button to type Thaana.",
                        "ދިވެހި ނުވަތަ އިނގިރޭސިން ލިޔުއްވާ.",
                      )}
                      required
                    >
                      <Textarea thaana={dv} thaanaToggle rows={6} showCount maxLength={2000} />
                    </FormField>
                  </FormGroup>
                  <div>
                    <SubmitButton startIcon="send">{tr("Send message", "މެސެޖް ފޮނުވާ")}</SubmitButton>
                  </div>
                </Form>
              </div>
            </Card>
          )}
        </section>

        <aside aria-labelledby="hours-heading" className="gap-4 grid">
          <Card
            title={<span id="hours-heading">{tr("Opening hours", "ހުޅުވާ ގަޑިތައް")}</span>}
            headingLevel={2}
            actions={
              <StatusBadge status="success" size="sm">
                {tr("Open now", "މިހާރު ހުޅުވާފައި")}
              </StatusBadge>
            }
          >
            <DescriptionList
              layout="inline"
              items={[
                { label: tr("Sunday–Thursday", "އާދިއްތަ–ބުރާސްފަތި"), value: "08:00–14:00" },
                { label: tr("Evening counter", "ރޭގަނޑު ކައުންޓަރު"), value: "20:00–22:00" },
                { label: tr("Friday–Saturday", "ހުކުރު–ހޮނިހިރު"), value: tr("Closed", "ބަންދު") },
              ]}
            />
          </Card>
        </aside>
      </Container>

      <div className="border-t bg-muted/30">
        <Container className="py-12">
          <h2 className="text-2xl font-semibold tracking-tight">{tr("Our offices", "އޮފީސްތައް")}</h2>
          <ul className="mt-6 gap-6 md:grid-cols-3 grid">
            {offices.map((o) => (
              <li key={o.id}>
                <LocationCard
                  className="h-full"
                  position={o.position}
                  title={l(o.name)}
                  showCoordinates={false}
                  address={l(o.address)}
                  actions={
                    <div className="gap-1 text-sm grid">
                      <a href={`tel:${o.phone.replace(/\s/g, "")}`} dir="ltr" className="text-primary hover:underline">
                        {o.phone}
                      </a>
                      <a href={`mailto:${o.email}`} dir="ltr" className="text-primary hover:underline">
                        {o.email}
                      </a>
                    </div>
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
