import * as React from "react"
import {
  Button,
  Callout,
  Card,
  Checkbox,
  CopyInput,
  DescriptionList,
  EmailInput,
  FileInput,
  Fieldset,
  Form,
  FormField,
  FormGroup,
  Icon,
  PhoneInput,
  Select,
  ShareButtons,
  SubmitButton,
  Tag,
  TextInput,
  Textarea,
  ThaanaInput,
  toast,
} from "@javaabu/onu"

import { useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import { PortalShell } from "../_shared/shells"
import { jobs, jobTypes } from "./_data"
import { useDates, useL, useMvr, wait } from "./_i18n"
import { Container, PortalPageHeader } from "./_ui"

export const meta = { title: "Job detail and apply", group: "Public portal", layout: "bare", order: 10 }

export default function JobDetailPage() {
  const tr = useTr()
  const l = useL()
  const mvr = useMvr()
  const dates = useDates()
  const job = jobs[0]
  const [reference, setReference] = React.useState<string | null>(null)
  const formRef = React.useRef<HTMLDivElement>(null)

  const list = (items: string[]) => (
    <ul className="mt-3 gap-2 grid">
      {items.map((i) => (
        <li key={i} className="gap-3 flex items-start">
          <Icon name="check" className="mt-1 size-4 shrink-0 text-primary" />
          <span>{i}</span>
        </li>
      ))}
    </ul>
  )

  return (
    <PortalShell>
      <PortalPageHeader
        crumbs={[{ label: tr("Jobs", "ވަޒީފާ"), href: routes.public.jobs }, { label: l(job.title) }]}
        eyebrow={l(job.department)}
        title={l(job.title)}
        description={tr(
          "Build accessible, bilingual online services used by people on every island.",
          "ކޮންމެ ރަށެއްގައި ދިރިއުޅޭ މީހުން ބޭނުންކުރާ، އެކްސެސިބަލް، ދެބަހުގެ އޮންލައިން ޚިދުމަތްތައް ބިނާކުރުން.",
        )}
      >
        <div className="gap-2 flex flex-wrap items-center">
          <Tag variant="outline" icon="map-pin">
            {l(job.location)}
          </Tag>
          <Tag variant="outline">{l(jobTypes.find((t) => t.value === job.type)!.label)}</Tag>
          <Tag variant="outline">{job.grade}</Tag>
          <Button
            size="sm"
            className="sm:ms-2"
            endIcon="arrow-down"
            onClick={() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
          >
            {tr("Apply now", "މިހާރު އެދޭ")}
          </Button>
        </div>
      </PortalPageHeader>

      <Container className="py-10 gap-10 lg:grid-cols-[1fr_20rem] grid items-start">
        <div className="gap-10 min-w-0 grid">
          <section aria-labelledby="role-heading" className="leading-relaxed">
            <h2 id="role-heading" className="text-xl font-semibold">
              {tr("About the role", "މަޤާމާ ބެހޭ")}
            </h2>
            <p className="mt-3 text-muted-foreground">
              {tr(
                "You will join a team of eight designers and engineers building the eServices portal and the services behind it. You will work in React and TypeScript with our design system, and test every screen in Dhivehi and English, on phones and with screen readers.",
                "އީސަރވިސަސް ޕޯޓަލާއި އޭގެ ޚިދުމަތްތައް ބިނާކުރާ އަށް މީހުންގެ ޓީމަކާ ގުޅިވަޑައިގަންނަވާނެ. ރިއެކްޓް އަދި ޓައިޕްސްކްރިޕްޓް ބޭނުންކޮށް، ކޮންމެ ސްކްރީނެއް ދިވެހި އަދި އިނގިރޭސި ބަހުން، ފޯނުތަކާއި ސްކްރީން ރީޑަރުތަކުގައި ޓެސްޓުކުރަންވާނެ.",
              )}
            </p>
            <h3 className="mt-6 font-semibold">{tr("Responsibilities", "ޒިންމާތައް")}</h3>
            {list([
              tr(
                "Build and maintain citizen-facing screens",
                "ރައްޔިތުން ބޭނުންކުރާ ސްކްރީންތައް ބިނާކޮށް ބެލެހެއްޓުން",
              ),
              tr("Meet WCAG 2.2 AA on every release", "ކޮންމެ ރިލީސްއެއްގައި WCAG 2.2 AA ހަމަކުރުން"),
              tr("Review code and mentor junior developers", "ކޯޑު ރިވިއުކޮށް ޖޫނިއަރ ޑިވެލޮޕަރުންނަށް މަގުދެއްކުން"),
            ])}
            <h3 className="mt-6 font-semibold">{tr("Requirements", "ޝަރުޠުތައް")}</h3>
            {list([
              tr(
                "Degree in computer science or 3 years' experience",
                "ކޮމްޕިއުޓަރ ސައިންސްގެ ޑިގްރީ ނުވަތަ 3 އަހަރުގެ ތަޖުރިބާ",
              ),
              tr("Strong React and TypeScript", "ރިއެކްޓް އަދި ޓައިޕްސްކްރިޕްޓްގައި ޤާބިލުކަން"),
              tr("Good written Dhivehi and English", "ދިވެހި އަދި އިނގިރޭސި ބަހުން ރަނގަޅަށް ލިޔެވުން"),
            ])}
          </section>

          <section id="apply" aria-labelledby="apply-heading" className="scroll-mt-24" ref={formRef}>
            <h2 id="apply-heading" className="text-2xl font-semibold tracking-tight">
              {tr("Apply for this job", "މި ވަޒީފާއަށް އެދުން")}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {tr("Fields marked * are required.", "* ޖަހާފައިވާ ބައިތައް ފުރިހަމަކުރަންވާނެ.")}
            </p>

            {reference ? (
              <Callout
                className="mt-6"
                variant="success"
                title={tr("Application received", "އެޕްލިކޭޝަން ލިބިއްޖެ")}
                description={
                  <div className="gap-3 grid">
                    <p>
                      {tr(
                        "We will contact shortlisted candidates within 14 days. Keep your reference number.",
                        "14 ދުވަހުގެ ތެރޭގައި ޝޯޓްލިސްޓްވާ ފަރާތްތަކާ ގުޅާނެ. ރެފަރެންސް ނަންބަރު ރައްކާކުރައްވާ.",
                      )}
                    </p>
                    <CopyInput
                      value={reference}
                      aria-label={tr("Reference number", "ރެފަރެންސް ނަންބަރު")}
                      className="max-w-xs"
                    />
                  </div>
                }
              />
            ) : (
              <Form
                className="mt-6"
                noValidate
                onSubmit={async (values) => {
                  await wait(1200)
                  const errors: Record<string, string[]> = {}
                  const required: [string, string][] = [
                    ["name", tr("The full name field is required.", "ފުރިހަމަ ނަން ލިޔުއްވާ.")],
                    ["name_dv", tr("The name in Dhivehi field is required.", "ދިވެހިން ނަން ލިޔުއްވާ.")],
                    ["email", tr("The email field is required.", "އީމެއިލް ލިޔުއްވާ.")],
                    ["education", tr("Select your highest qualification.", "އެންމެ މަތީ ސަނަދު ޚިޔާރުކުރައްވާ.")],
                  ]
                  for (const [key, message] of required) if (!String(values[key] ?? "").trim()) errors[key] = [message]
                  if (!/^A\d{6}$/i.test(String(values.id_card ?? "")))
                    errors.id_card = [
                      tr("The ID card number must look like A123456.", "ކާޑު ނަންބަރު A123456 ފަދައިން ލިޔުއްވާ."),
                    ]
                  const cv = values.cv as File | File[] | undefined
                  const hasCv = Array.isArray(cv) ? cv.length > 0 : cv instanceof File && cv.size > 0
                  if (!hasCv) errors.cv = [tr("Attach your CV.", "ސީވީ ހުށަހަޅުއްވާ.")]
                  if (!values.consent)
                    errors.consent = [tr("You must confirm the declaration.", "އިޤްރާރު ކަށަވަރުކުރައްވާ.")]
                  if (Object.keys(errors).length) throw { message: "The given data was invalid.", errors }
                  setReference("JOB-2026-114-0087")
                  toast.success(tr("Application submitted", "އެޕްލިކޭޝަން ހުށަހެޅިއްޖެ"), {
                    description: l(job.title),
                  })
                  formRef.current?.scrollIntoView({ block: "start" })
                }}
              >
                <Fieldset legend={tr("About you", "ތިބާގެ މަޢުލޫމާތު")}>
                  <FormGroup columns={2}>
                    <FormField label={tr("Full name (English)", "ފުރިހަމަ ނަން (އިނގިރޭސި)")} name="name" required>
                      <TextInput autoComplete="name" dir="ltr" />
                    </FormField>
                    <FormField label={tr("Full name (Dhivehi)", "ފުރިހަމަ ނަން (ދިވެހި)")} name="name_dv" required>
                      <ThaanaInput />
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
                      <PhoneInput />
                    </FormField>
                    <FormField label={tr("Email", "އީމެއިލް")} name="email" required>
                      <EmailInput dir="ltr" />
                    </FormField>
                    <FormField label={tr("Permanent address (Dhivehi)", "ދާއިމީ އެޑްރެސް (ދިވެހި)")} name="address_dv">
                      <ThaanaInput placeholder="މ. ފެހިވިލާ، މާލެ" />
                    </FormField>
                  </FormGroup>
                </Fieldset>
                <Fieldset legend={tr("Qualifications", "ޤާބިލުކަން")}>
                  <FormGroup>
                    <FormField label={tr("Highest qualification", "އެންމެ މަތީ ސަނަދު")} name="education" required>
                      <Select
                        placeholder={tr("Select a qualification", "ސަނަދެއް ޚިޔާރުކުރައްވާ")}
                        options={[
                          { value: "diploma", label: tr("Diploma", "ޑިޕްލޮމާ") },
                          { value: "bachelor", label: tr("Bachelor's degree", "ފުރަތަމަ ޑިގްރީ") },
                          { value: "master", label: tr("Master's degree", "މާސްޓަރސް ޑިގްރީ") },
                        ]}
                      />
                    </FormField>
                    <FormField
                      label={tr("Why do you want this job?", "މި ވަޒީފާއަށް އެދެނީ ކީއްވެ؟")}
                      name="cover_letter"
                      help={tr(
                        "Up to 1,000 characters. Write in Dhivehi or English.",
                        "1,000 އަކުރު. ދިވެހި ނުވަތަ އިނގިރޭސިން ލިޔުއްވާ.",
                      )}
                    >
                      <Textarea thaanaToggle showCount maxLength={1000} rows={5} />
                    </FormField>
                    <FormField
                      label={tr("CV", "ސީވީ")}
                      name="cv"
                      help={tr("PDF, up to 2 MB.", "PDF، 2 އެމްބީ އަށް.")}
                      required
                    >
                      <FileInput accept=".pdf" maxSize={2 * 1024 * 1024} />
                    </FormField>
                    <FormField
                      label={tr("Certificates", "ސެޓްފިކެޓްތައް")}
                      name="certificates"
                      help={tr("PDF or images, up to 5 files.", "PDF ނުވަތަ ފޮޓޯ، 5 ފައިލު.")}
                    >
                      <FileInput multiple append maxFiles={5} accept=".pdf,image/*" maxSize={5 * 1024 * 1024} />
                    </FormField>
                  </FormGroup>
                </Fieldset>
                <FormField name="consent" label={tr("Declaration", "އިޤްރާރު")} hideLabel>
                  <Checkbox
                    name="consent"
                    value="1"
                    label={tr(
                      "I confirm the information I have given is true and complete.",
                      "ދީފައިވާ މަޢުލޫމާތަކީ ތެދު، ފުރިހަމަ މަޢުލޫމާތު ކަމަށް އިޤްރާރުވަމެވެ.",
                    )}
                  />
                </FormField>
                <div>
                  <SubmitButton size="lg" startIcon="send">
                    {tr("Submit application", "އެޕްލިކޭޝަން ހުށަހަޅާ")}
                  </SubmitButton>
                </div>
              </Form>
            )}
          </section>
        </div>

        <aside className="gap-4 lg:sticky lg:top-20 grid" aria-label={tr("Job summary", "ވަޒީފާގެ ޚުލާޞާ")}>
          <Card title={tr("Summary", "ޚުލާޞާ")} headingLevel={2}>
            <DescriptionList
              layout="stacked"
              items={[
                {
                  label: tr("Reference", "ނަންބަރު"),
                  value: <bdi dir="ltr">{job.reference}</bdi>,
                  copyValue: job.reference,
                  copyable: true,
                },
                { label: tr("Salary", "މުސާރަ"), value: tr(`${mvr(job.salary)} a month`, `މަހަކު ${mvr(job.salary)}`) },
                {
                  label: tr("Allowances", "އެލަވަންސް"),
                  value: tr("Service allowance 20%", "ޚިދުމަތުގެ އެލަވަންސް 20%"),
                },
                { label: tr("Posted", "ޝާއިޢުކުރީ"), value: dates.date(job.posted) },
                { label: tr("Closes", "ބަންދުވާނީ"), value: `${dates.date(job.closes)}, 14:00` },
              ]}
            />
          </Card>
          <ShareButtons
            native="never"
            networks={["copy", "whatsapp", "viber", "email"]}
            iconOnly
            size="sm"
            title={l(job.title)}
          />
        </aside>
      </Container>
    </PortalShell>
  )
}
