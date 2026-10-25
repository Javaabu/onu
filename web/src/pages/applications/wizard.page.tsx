import * as React from "react"
import {
  AutosaveIndicator,
  Button,
  Callout,
  Card,
  Checkbox,
  DescriptionList,
  FileInput,
  FormErrorsProvider,
  FormField,
  FormGroup,
  LinkButton,
  PageTitle,
  PhoneInput,
  RadioGroup,
  SearchableSelect,
  Select,
  TextInput,
  ThaanaInput,
  Wizard,
  toast,
  type AutosaveStatus,
  type FormErrors,
} from "@javaabu/onu"

import { CitizenShell } from "../_shared/shells"
import { useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import { applicant, throwIfInvalid, useFormat, usePlaces, wait } from "./_data"

export const meta = { title: "Application wizard", group: "Applications and workflows", layout: "bare", order: 1 }

const ID_CARD = /^A\d{6}$/i
const FEE_PER_YEAR = 300
const EXPRESS_FEE = 50

interface Values {
  name: string
  name_dv: string
  id_card: string
  phone: string | undefined
  email: string
  atoll: string
  island: string | null
  house: string
  licence_type: string
  business_name: string
  activity: string
  duration: string
  express: boolean
  id_copy: File[]
  photo: File[]
  lease: File[]
  declaration: boolean
}

export default function ApplicationWizardPage() {
  const tr = useTr()
  const { money } = useFormat()
  const { atollOptions, islandOptions, islandName, atollName } = usePlaces()

  const [values, setValues] = React.useState<Values>({
    name: tr(...applicant.name),
    name_dv: applicant.name[1],
    id_card: applicant.idCard,
    phone: applicant.phone,
    email: applicant.email,
    atoll: applicant.atoll,
    island: applicant.island,
    house: tr(...applicant.house),
    licence_type: "new",
    business_name: "",
    activity: "",
    duration: "1",
    express: false,
    id_copy: [],
    photo: [],
    lease: [],
    declaration: false,
  })
  const [errors, setErrors] = React.useState<FormErrors>({})
  const [step, setStep] = React.useState(0)
  const [errorSteps, setErrorSteps] = React.useState<string[]>([])
  const [draft, setDraft] = React.useState<{ status: AutosaveStatus; at: number | null }>({ status: "idle", at: null })
  const [submitted, setSubmitted] = React.useState<string | null>(null)

  const set = <K extends keyof Values>(key: K, value: Values[K]) => {
    setValues((v) => ({ ...v, [key]: value }))
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e))
  }

  const fee = Number(values.duration) * FEE_PER_YEAR + (values.express ? EXPRESS_FEE : 0)

  const activities = [
    { value: "retail", label: tr("Retail shop", "ފިހާރަ") },
    { value: "cafe", label: tr("Café or restaurant", "ކެފޭ ނުވަތަ ރެސްޓޯރަންޓް") },
    { value: "workshop", label: tr("Repair workshop", "މަރާމާތު ވަރކްޝޮޕް") },
    { value: "tourism", label: tr("Tour operator", "ޓުއަރ އޮޕަރޭޓަރ") },
  ]

  /** Client-side checks per step, in Laravel's 422 error shape. */
  const validateStep = async (id: string) => {
    await wait(300)
    const e: Record<string, string[]> = {}
    if (id === "applicant") {
      if (!values.name.trim()) e.name = [tr("Enter your full name.", "ފުރިހަމަ ނަން ލިޔުއްވާ.")]
      if (!ID_CARD.test(values.id_card.trim()))
        e.id_card = [tr("Enter an ID card number like A123456.", "A123456 ފަދަ އައިޑީ ކާޑު ނަންބަރެއް ލިޔުއްވާ.")]
      if (!values.phone) e.phone = [tr("Enter a mobile number.", "މޯބައިލް ނަންބަރު ލިޔުއްވާ.")]
      if (!/^\S+@\S+\.\S+$/.test(values.email))
        e.email = [tr("Enter a valid email address.", "ރަނގަޅު އީމެއިލް އެޑްރެހެއް ލިޔުއްވާ.")]
      if (!values.atoll) e.atoll = [tr("Choose an atoll.", "އަތޮޅެއް ހޮވާ.")]
      if (!values.island) e.island = [tr("Choose an island.", "ރަށެއް ހޮވާ.")]
      if (!values.house.trim()) e.house = [tr("Enter your address.", "އެޑްރެސް ލިޔުއްވާ.")]
    }
    if (id === "service") {
      if (!values.business_name.trim()) e.business_name = [tr("Enter the business name.", "ވިޔަފާރީގެ ނަން ލިޔުއްވާ.")]
      if (!values.activity) e.activity = [tr("Choose a business activity.", "ވިޔަފާރީގެ ބާވަތެއް ހޮވާ.")]
    }
    if (id === "documents") {
      if (!values.id_copy.length) e.id_copy = [tr("Attach a copy of your ID card.", "އައިޑީ ކާޑުގެ ކޮޕީ ހުށަހަޅާ.")]
      if (!values.photo.length) e.photo = [tr("Attach a passport photo.", "ޕާސްޕޯޓް ފޮޓޯ ހުށަހަޅާ.")]
    }
    if (id === "review" && !values.declaration)
      e.declaration = [tr("Confirm the declaration to submit.", "ހުށަހެޅުމަށް އިޤްރާރަށް އެއްބަސްވާ.")]
    setErrors((prev) => ({ ...prev, ...e }))
    const ok = Object.keys(e).length === 0
    if (ok) setErrorSteps((s) => s.filter((x) => x !== id))
    return ok
  }

  const saveDraft = async () => {
    setDraft((d) => ({ ...d, status: "saving" }))
    await wait(800)
    setDraft({ status: "saved", at: Date.now() })
    toast.success(tr("Draft saved", "ޑްރާފްޓް ސޭވްކުރެވިއްޖެ"), {
      description: tr(
        "You can continue later from My applications.",
        "އަޅުގަނޑުގެ އެޕްލިކޭޝަންތަކުން ކުރިއަށް ގެންދެވޭނެ.",
      ),
    })
  }

  const submit = async () => {
    await wait(1200)
    try {
      // The server says this ID card already has an open application for the same business.
      throwIfInvalid(
        values.business_name.trim().toLowerCase() === "taken"
          ? {
              business_name: [
                tr(
                  "A business with this name is already registered.",
                  "މި ނަމުގައި ވިޔަފާރިއެއް ކުރިން ރަޖިސްޓްރީކުރެވިފައިވޭ.",
                ),
              ],
            }
          : {},
      )
      setSubmitted("APP-2026-00438")
      toast.success(tr("Application submitted", "އެޕްލިކޭޝަން ހުށަހެޅިއްޖެ"), { description: "APP-2026-00438" })
    } catch (err) {
      const payload = err as { errors: Record<string, string[]> }
      setErrors(payload.errors)
      setErrorSteps(["service"])
      setStep(1)
      toast.error(tr("The application wasn't submitted", "އެޕްލިކޭޝަން ހުށަނާޅުނު"), {
        description: tr("Fix the highlighted fields and try again.", "ފާހަގަކޮށްފައިވާ ބައިތައް ރަނގަޅުކުރައްވާ."),
      })
    }
  }

  const steps = [
    {
      id: "applicant",
      title: tr("Applicant", "އެޕްލިކަންޓް"),
      description: tr("Your details", "ތިބާގެ މަޢުލޫމާތު"),
      validate: () => validateStep("applicant"),
      content: (
        <FormGroup columns={2}>
          <FormField label={tr("Full name (English)", "ފުރިހަމަ ނަން (އިނގިރޭސިން)")} name="name" required>
            <TextInput value={values.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" />
          </FormField>
          <FormField label={tr("Full name (Dhivehi)", "ފުރިހަމަ ނަން (ދިވެހިން)")} name="name_dv">
            <ThaanaInput value={values.name_dv} onChange={(e) => set("name_dv", e.target.value)} />
          </FormField>
          <FormField
            label={tr("ID card number", "އައިޑީ ކާޑު ނަންބަރު")}
            name="id_card"
            help={tr("As printed on your national ID card, e.g. A123456.", "ކާޑުގައިވާ ގޮތަށް، މިސާލަކަށް A123456")}
            required
          >
            <TextInput
              value={values.id_card}
              onChange={(e) => set("id_card", e.target.value.toUpperCase())}
              dir="ltr"
              maxLength={7}
              autoComplete="off"
            />
          </FormField>
          <FormField label={tr("Mobile number", "މޯބައިލް ނަންބަރު")} name="phone" required>
            <PhoneInput value={values.phone} onValueChange={(v) => set("phone", v)} />
          </FormField>
          <FormField label={tr("Email", "އީމެއިލް")} name="email" required className="col-span-full">
            <TextInput
              type="email"
              value={values.email}
              onChange={(e) => set("email", e.target.value)}
              dir="ltr"
              autoComplete="email"
            />
          </FormField>
          <FormField label={tr("Atoll", "އަތޮޅު")} name="atoll" required>
            <Select options={atollOptions} value={values.atoll} onValueChange={(v) => set("atoll", v)} />
          </FormField>
          <FormField label={tr("Island", "ރަށް")} name="island" required>
            <SearchableSelect
              parentValue={values.atoll}
              parentLabel={tr("an atoll", "އަތޮޅެއް")}
              options={islandOptions}
              value={values.island}
              onValueChange={(v) => set("island", v)}
            />
          </FormField>
          <FormField label={tr("House and street", "ގޭގެ ނަމާއި މަގު")} name="house" required className="col-span-full">
            <TextInput value={values.house} onChange={(e) => set("house", e.target.value)} />
          </FormField>
        </FormGroup>
      ),
    },
    {
      id: "service",
      title: tr("Service", "ޚިދުމަތް"),
      description: tr("Licence options", "ލައިސަންސްގެ ތަފްސީލު"),
      validate: () => validateStep("service"),
      content: (
        <div className="gap-6 grid">
          <FormField label={tr("Application type", "އެޕްލިކޭޝަންގެ ބާވަތް")} name="licence_type" required>
            <RadioGroup
              variant="card"
              orientation="horizontal"
              value={values.licence_type}
              onValueChange={(v) => set("licence_type", v)}
              options={[
                {
                  value: "new",
                  label: tr("New licence", "އާ ލައިސަންސެއް"),
                  description: tr("Register a business for the first time.", "ފުރަތަމަ ފަހަރަށް ރަޖިސްޓްރީކުރުން."),
                },
                {
                  value: "renewal",
                  label: tr("Renewal", "އާކުރުން"),
                  description: tr("Renew an existing licence.", "މިހާރު ހުރި ލައިސަންސެއް އާކުރުން."),
                },
              ]}
            />
          </FormField>
          <FormGroup columns={2}>
            <FormField
              label={tr("Business name", "ވިޔަފާރީގެ ނަން")}
              name="business_name"
              help={tr("Type “taken” to see a server validation error.", "ސާވަރ އެރަރ ބެލުމަށް “taken” ލިޔުއްވާ.")}
              required
            >
              <TextInput value={values.business_name} onChange={(e) => set("business_name", e.target.value)} />
            </FormField>
            <FormField label={tr("Business activity", "ވިޔަފާރީގެ ބާވަތް")} name="activity" required>
              <Select
                options={activities}
                value={values.activity}
                onValueChange={(v) => set("activity", v)}
                placeholder={tr("Choose…", "ހޮވާ…")}
              />
            </FormField>
            <FormField label={tr("Licence period", "ލައިސަންސްގެ މުއްދަތު")} name="duration" required>
              <Select
                options={[
                  { value: "1", label: tr("1 year", "1 އަހަރު") },
                  { value: "2", label: tr("2 years", "2 އަހަރު") },
                  { value: "3", label: tr("3 years", "3 އަހަރު") },
                ]}
                value={values.duration}
                onValueChange={(v) => set("duration", v)}
              />
            </FormField>
            <div className="pt-6">
              <Checkbox
                checked={values.express}
                onCheckedChange={(c) => set("express", c === true)}
                label={tr("Express processing", "އަވަސް ޚިދުމަތް")}
                description={tr(
                  `Decision within 2 working days (+${money(EXPRESS_FEE)}).`,
                  `2 ބުރަސްފަތި ދުވަހުގެ ތެރޭގައި (+${money(EXPRESS_FEE)}).`,
                )}
              />
            </div>
          </FormGroup>
          <Callout appearance="plain" variant="info">
            {tr("Fee for this application:", "މި އެޕްލިކޭޝަންގެ ފީ:")}{" "}
            <strong className="tabular-nums">{money(fee)}</strong>
          </Callout>
        </div>
      ),
    },
    {
      id: "documents",
      title: tr("Documents", "ލިޔެކިޔުންތައް"),
      description: tr("Upload copies", "ކޮޕީތައް އަޕްލޯޑްކުރޭ"),
      validate: () => validateStep("documents"),
      content: (
        <div className="gap-5 max-w-xl grid">
          <FormField
            label={tr("Copy of ID card", "އައިޑީ ކާޑުގެ ކޮޕީ")}
            name="id_copy"
            help={tr("Both sides. PDF or image, up to 2 MB.", "ދެފަރާތް. PDF ނުވަތަ ފޮޓޯ، 2MB އާ ހަމައަށް.")}
            required
          >
            <FileInput
              accept=".pdf,image/*"
              maxSize={2 * 1024 * 1024}
              value={values.id_copy}
              onChange={(f) => set("id_copy", f)}
            />
          </FormField>
          <FormField
            label={tr("Passport photo", "ޕާސްޕޯޓް ފޮޓޯ")}
            name="photo"
            help={tr("JPG or PNG, white background.", "JPG ނުވަތަ PNG، ހުދު ފަސްބިމާއެކު.")}
            required
          >
            <FileInput accept="image/*" value={values.photo} onChange={(f) => set("photo", f)} />
          </FormField>
          <FormField
            label={tr("Lease agreement (optional)", "ކުލި އެއްބަސްވުން (ލާޒިމެއް ނޫން)")}
            name="lease"
            help={tr("If the premises are rented.", "ތަން ކުއްޔަށް ހިފާފައިވާނަމަ.")}
          >
            <FileInput accept=".pdf" multiple value={values.lease} onChange={(f) => set("lease", f)} />
          </FormField>
        </div>
      ),
    },
    {
      id: "review",
      title: tr("Review", "ރިވިއު"),
      description: tr("Check and submit", "ބަލައި ހުށަހަޅާ"),
      validate: () => validateStep("review"),
      content: (
        <div className="gap-6 grid">
          <Card headingLevel={2} title={tr("Applicant", "އެޕްލިކަންޓް")} size="sm">
            <DescriptionList
              items={[
                { label: tr("Name", "ނަން"), value: values.name },
                { label: tr("Name (Dhivehi)", "ނަން (ދިވެހިން)"), value: values.name_dv },
                { label: tr("ID card", "އައިޑީ ކާޑު"), value: values.id_card },
                { label: tr("Mobile", "މޯބައިލް"), value: values.phone ? <span dir="ltr">{values.phone}</span> : null },
                { label: tr("Email", "އީމެއިލް"), value: values.email },
                {
                  label: tr("Address", "އެޑްރެސް"),
                  value: [values.house, islandName(values.island), atollName(values.atoll)].filter(Boolean).join(", "),
                },
              ]}
            />
          </Card>
          <Card headingLevel={2} title={tr("Service", "ޚިދުމަތް")} size="sm">
            <DescriptionList
              items={[
                {
                  label: tr("Type", "ބާވަތް"),
                  value:
                    values.licence_type === "new" ? tr("New licence", "އާ ލައިސަންސެއް") : tr("Renewal", "އާކުރުން"),
                },
                { label: tr("Business name", "ވިޔަފާރީގެ ނަން"), value: values.business_name },
                {
                  label: tr("Activity", "ބާވަތް"),
                  value: activities.find((a) => a.value === values.activity)?.label,
                },
                {
                  label: tr("Period", "މުއްދަތު"),
                  value: tr(`${values.duration} year(s)`, `${values.duration} އަހަރު`),
                },
                {
                  label: tr("Express processing", "އަވަސް ޚިދުމަތް"),
                  value: values.express ? tr("Yes", "އާން") : tr("No", "ނޫން"),
                },
                { label: tr("Fee", "ފީ"), value: <strong className="tabular-nums">{money(fee)}</strong> },
              ]}
            />
          </Card>
          <Card headingLevel={2} title={tr("Documents", "ލިޔެކިޔުންތައް")} size="sm">
            <DescriptionList
              items={[
                { label: tr("ID card", "އައިޑީ ކާޑު"), value: values.id_copy.map((f) => f.name).join(", ") },
                { label: tr("Photo", "ފޮޓޯ"), value: values.photo.map((f) => f.name).join(", ") },
                { label: tr("Lease", "ކުލި އެއްބަސްވުން"), value: values.lease.map((f) => f.name).join(", ") },
              ]}
            />
          </Card>
          <FormField name="declaration" label={tr("Declaration", "އިޤްރާރު")} hideLabel>
            <Checkbox
              checked={values.declaration}
              onCheckedChange={(c) => set("declaration", c === true)}
              label={tr(
                "I confirm the information given is true and complete.",
                "ދީފައިވާ މަޢުލޫމާތަކީ ތެދު އަދި ފުރިހަމަ މަޢުލޫމާތުކަން ކަށަވަރުކުރަމެވެ.",
              )}
            />
          </FormField>
        </div>
      ),
    },
  ]

  return (
    <CitizenShell
      breadcrumbs={[
        { label: tr("My applications", "އަޅުގަނޑުގެ އެޕްލިކޭޝަންތައް"), href: routes.citizen.applications },
        { label: tr("New application", "އައު އެޕްލިކޭޝަން") },
      ]}
    >
      <div className="gap-6 max-w-4xl grid">
        <PageTitle
          title={tr("Apply for a business licence", "ވިޔަފާރީގެ ލައިސަންސަށް އެދުން")}
          description={tr(
            "Ministry of Economic Development · takes about 10 minutes",
            "އިޤްތިޞާދީ ތަރައްޤީއާ ބެހޭ ވުޒާރާ · 10 މިނެޓު ހާއިރު ނަގާނެ",
          )}
          actions={
            draft.status !== "idle" ? <AutosaveIndicator status={draft.status} lastSavedAt={draft.at} /> : undefined
          }
        />
        {submitted ? (
          <Callout
            variant="success"
            title={tr("Application submitted", "އެޕްލިކޭޝަން ހުށަހެޅިއްޖެ")}
            description={tr(
              `Your reference is ${submitted}. Pay the fee of ${money(fee)} to start the review.`,
              `ރެފަރެންސް ނަންބަރަކީ ${submitted}. ރިވިއު ފެށުމަށް ${money(fee)} ފީ ދައްކަވާ.`,
            )}
            actions={
              <>
                <LinkButton href={routes.applications.checkout} size="sm" startIcon="credit-card">
                  {tr("Pay now", "މިހާރު ފައިސާ ދައްކާ")}
                </LinkButton>
                <LinkButton href={routes.applications.statusTracker} size="sm" variant="outline">
                  {tr("Track application", "އެޕްލިކޭޝަން ބަލާ")}
                </LinkButton>
              </>
            }
          />
        ) : (
          <Card>
            <FormErrorsProvider errors={errors}>
              <Wizard
                steps={steps}
                step={step}
                onStepChange={setStep}
                errorSteps={errorSteps}
                onComplete={submit}
                finishLabel={tr("Submit application", "އެޕްލިކޭޝަން ހުށަހަޅާ")}
                footerExtra={
                  <Button variant="ghost" onClick={saveDraft} loading={draft.status === "saving"} startIcon="save">
                    {tr("Save draft", "ޑްރާފްޓް ސޭވްކުރޭ")}
                  </Button>
                }
              />
            </FormErrorsProvider>
          </Card>
        )}
      </div>
    </CitizenShell>
  )
}
