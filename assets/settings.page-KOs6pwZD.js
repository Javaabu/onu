var e=`import * as React from "react"
import {
  Button,
  Card,
  ColorPicker,
  EmailInput,
  Form,
  FormField,
  FormGroup,
  ImageInput,
  NumberInput,
  PageTitle,
  PhoneInput,
  RadioGroup,
  SearchableSelect,
  Select,
  StackedTabs,
  SubmitButton,
  Switch,
  TagsInput,
  TextInput,
  Textarea,
  ValidationError,
  toast,
} from "@javaabu/onu"

import { useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import { AdminShell } from "../_shared/shells"
import { wait } from "./_data"

export const meta = { title: "Settings", group: "Admin: settings and access", layout: "bare", order: 1 }

/** Local state for one settings section: values, the last saved values and whether they differ. */
function useSection<T extends Record<string, unknown>>(initial: T) {
  const [saved, setSaved] = React.useState(initial)
  const [values, setValues] = React.useState(initial)
  const set = <K extends keyof T>(key: K, value: T[K]) => setValues((v) => ({ ...v, [key]: value }))
  const dirty = JSON.stringify(saved) !== JSON.stringify(values)
  return { values, set, dirty, commit: () => setSaved(values), reset: () => setValues(saved) }
}

/** A settings card with its own form and Save button. */
function Section({
  title,
  description,
  dirty,
  onSubmit,
  onReset,
  successMessage,
  children,
}: {
  title: string
  description: string
  dirty: boolean
  onSubmit: () => Promise<void>
  onReset: () => void
  successMessage: string
  children: React.ReactNode
}) {
  const tr = useTr()
  return (
    <Form onSubmit={onSubmit} onSuccess={() => toast.success(successMessage)}>
      <Card
        title={title}
        description={description}
        headingLevel={2}
        footer={
          <div className="gap-2 flex w-full flex-wrap items-center justify-end">
            {dirty ? (
              <span className="text-sm me-auto text-muted-foreground" role="status">
                {tr("Unsaved changes", "ސޭވް ނުކުރާ ބަދަލުތައް")}
              </span>
            ) : null}
            <Button type="button" variant="ghost" disabled={!dirty} onClick={onReset}>
              {tr("Discard", "ދޫކޮށްލާ")}
            </Button>
            <SubmitButton disabled={!dirty}>{tr("Save", "ސޭވްކުރޭ")}</SubmitButton>
          </div>
        }
      >
        {children}
      </Card>
    </Form>
  )
}

export default function SettingsPage() {
  const tr = useTr()

  const general = useSection({
    nameEn: "Ministry of Services",
    nameDv: "ޚިދުމަތްތަކުގެ ވުޒާރާ",
    email: "info@services.gov.mv",
    phone: "+9603001234" as string | undefined,
    address: "Velaanaage, Ameer Ahmed Magu, Malé 20096",
  })
  const branding = useSection({
    primary: "#15803d" as string | null,
    logo: null as File | string | null,
    radius: "soft",
  })
  const localisation = useSection({
    language: "dv",
    timezone: "Indian/Maldives",
    dateFormat: "d MMM yyyy",
    currency: "MVR",
    weekStart: "0",
  })
  const notifications = useSection({
    newApplication: true,
    dailyDigest: true,
    paymentFailed: true,
    smsFallback: false,
    senderName: "GovMV",
  })
  const security = useSection({
    require2fa: true,
    sessionMinutes: 30 as number | null,
    passwordLength: 12 as number | null,
    ipAllowlist: ["103.31.84.0/24"] as string[],
    lockAfter: "5",
  })

  const saveWith =
    (section: { commit: () => void }, validate?: () => Record<string, string | undefined>) => async () => {
      await wait(800)
      const errors = Object.fromEntries(Object.entries(validate?.() ?? {}).filter(([, v]) => v)) as Record<
        string,
        string
      >
      if (Object.keys(errors).length) throw new ValidationError(errors)
      section.commit()
    }

  const items = [
    {
      value: "general",
      label: tr("General", "ޢާންމު"),
      icon: "settings",
      description: tr("Name and contact details", "ނަމާއި ގުޅޭނެ ގޮތް"),
      content: (
        <Section
          title={tr("General", "ޢާންމު")}
          description={tr("Shown in the header, emails and receipts.", "ހެޑަރ، އީމެއިލް އަދި ރަސީދުގައި ފެންނާނެ.")}
          dirty={general.dirty}
          onReset={general.reset}
          successMessage={tr("General settings saved", "ޢާންމު ސެޓިންގްސް ސޭވްކުރެވިއްޖެ")}
          onSubmit={saveWith(general, () => {
            const e: Record<string, string> = {}
            if (!general.values.nameEn.trim()) e.name_en = tr("The name field is required.", "ނަން ލިޔުއްވާ.")
            if (!/^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/.test(general.values.email))
              e.email = tr("Enter a valid email address.", "ރަނގަޅު އީމެއިލް އެޑްރެހެއް ޖައްސަވާ.")
            return e
          })}
        >
          <FormGroup columns={2}>
            <FormField label={tr("Name (English)", "ނަން (އިނގިރޭސި)")} name="name_en" required>
              <TextInput
                dir="auto"
                value={general.values.nameEn}
                onChange={(e) => general.set("nameEn", e.target.value)}
              />
            </FormField>
            <FormField label={tr("Name (Dhivehi)", "ނަން (ދިވެހި)")} name="name_dv">
              <TextInput
                thaana
                thaanaToggle
                value={general.values.nameDv}
                onChange={(e) => general.set("nameDv", e.target.value)}
              />
            </FormField>
            <FormField label={tr("Contact email", "އީމެއިލް")} name="email" required>
              <EmailInput value={general.values.email} onChange={(e) => general.set("email", e.target.value)} />
            </FormField>
            <FormField label={tr("Phone", "ފޯނު")} name="phone">
              <PhoneInput value={general.values.phone} onValueChange={(v) => general.set("phone", v)} />
            </FormField>
            <FormField label={tr("Address", "އެޑްރެސް")} name="address" className="col-span-full">
              <Textarea
                dir="auto"
                rows={2}
                value={general.values.address}
                onChange={(e) => general.set("address", e.target.value)}
              />
            </FormField>
          </FormGroup>
        </Section>
      ),
    },
    {
      value: "branding",
      label: tr("Branding", "ބްރޭންޑިންގ"),
      icon: "star",
      description: tr("Colour, logo and shape", "ކުލަ، ލޯގޯ އަދި ސިފަ"),
      content: (
        <Section
          title={tr("Branding", "ބްރޭންޑިންގ")}
          description={tr("Changes apply to every portal page.", "ބަދަލުތައް ހުރިހާ ސަފްހާއަކަށް ކުރާނެ.")}
          dirty={branding.dirty}
          onReset={branding.reset}
          successMessage={tr("Branding saved", "ބްރޭންޑިންގ ސޭވްކުރެވިއްޖެ")}
          onSubmit={saveWith(branding)}
        >
          <div className="gap-6 md:grid-cols-[minmax(0,1fr)_14rem] grid">
            <div className="gap-5 grid content-start">
              <FormField
                label={tr("Primary colour", "މައި ކުލަ")}
                name="primary"
                help={tr("Used for buttons and links.", "ފިތްތަކާއި ލިންކްތަކުގައި ބޭނުންކުރާނެ.")}
              >
                <ColorPicker
                  value={branding.values.primary}
                  onValueChange={(v) => branding.set("primary", v)}
                  presets={["#15803d", "#0f766e", "#0369a1", "#7c3aed", "#b91c1c", "#c2410c"]}
                />
              </FormField>
              <FormField label={tr("Corner shape", "ކަނުގެ ސިފަ")} name="radius">
                <RadioGroup
                  orientation="horizontal"
                  value={branding.values.radius}
                  onValueChange={(v) => branding.set("radius", v)}
                  options={[
                    { value: "sharp", label: tr("Sharp", "ތޫނު") },
                    { value: "soft", label: tr("Soft", "މަޑު") },
                    { value: "pill", label: tr("Pill", "ވަށް") },
                  ]}
                />
              </FormField>
              <div className="gap-3 p-4 flex flex-wrap items-center rounded-lg border">
                <span className="text-sm text-muted-foreground">{tr("Preview", "ޕްރިވިއު")}</span>
                <span
                  className="px-4 py-2 text-sm font-medium text-white"
                  style={{
                    background: branding.values.primary ?? "#15803d",
                    borderRadius: branding.values.radius === "sharp" ? 0 : branding.values.radius === "pill" ? 999 : 8,
                  }}
                >
                  {tr("Apply now", "އެދިވަޑައިގަންނަވާ")}
                </span>
                <span className="text-sm font-medium underline" style={{ color: branding.values.primary ?? undefined }}>
                  {tr("Read more", "އިތުރަށް")}
                </span>
              </div>
            </div>
            <FormField
              label={tr("Logo", "ލޯގޯ")}
              name="logo"
              help={tr("SVG or PNG, square, up to 1 MB.", "SVG ނުވަތަ PNG، 1 MB އަށްވުރެ ކުޑަ.")}
            >
              <ImageInput
                alt={tr("Portal logo", "ޕޯޓަލްގެ ލޯގޯ")}
                aspectRatio={1}
                accept="image/png,image/svg+xml"
                maxSize={1024 * 1024}
                value={branding.values.logo}
                onChange={(f) => branding.set("logo", f)}
              />
            </FormField>
          </div>
        </Section>
      ),
    },
    {
      value: "localisation",
      label: tr("Localisation", "ލޯކަލައިޒޭޝަން"),
      icon: "languages",
      description: tr("Language, time and money", "ބަސް، ވަގުތު އަދި ފައިސާ"),
      content: (
        <Section
          title={tr("Localisation", "ލޯކަލައިޒޭޝަން")}
          description={tr("Defaults for new visitors and emails.", "އައު ޒިޔާރަތްކުރާ ފަރާތްތަކަށް ޑިފޯލްޓް.")}
          dirty={localisation.dirty}
          onReset={localisation.reset}
          successMessage={tr("Localisation saved", "ލޯކަލައިޒޭޝަން ސޭވްކުރެވިއްޖެ")}
          onSubmit={saveWith(localisation)}
        >
          <FormGroup columns={2}>
            <FormField label={tr("Default language", "ޑިފޯލްޓް ބަސް")} name="language" className="col-span-full">
              <RadioGroup
                variant="card"
                orientation="horizontal"
                value={localisation.values.language}
                onValueChange={(v) => localisation.set("language", v)}
                options={[
                  { value: "dv", label: "ދިވެހި", description: tr("Right to left", "ކަނާތުން ވާތަށް") },
                  { value: "en", label: "English", description: tr("Left to right", "ވާތުން ކަނާތަށް") },
                ]}
              />
            </FormField>
            <FormField label={tr("Time zone", "ޓައިމް ޒޯން")} name="timezone">
              <SearchableSelect
                value={localisation.values.timezone}
                onValueChange={(v) => localisation.set("timezone", (v as string) || "Indian/Maldives")}
                options={[
                  { value: "Indian/Maldives", label: "Indian/Maldives (GMT+5)" },
                  { value: "Asia/Colombo", label: "Asia/Colombo (GMT+5:30)" },
                  { value: "Asia/Dubai", label: "Asia/Dubai (GMT+4)" },
                  { value: "Asia/Kolkata", label: "Asia/Kolkata (GMT+5:30)" },
                  { value: "Asia/Singapore", label: "Asia/Singapore (GMT+8)" },
                  { value: "UTC", label: "UTC" },
                ]}
              />
            </FormField>
            <FormField label={tr("Date format", "ތާރީޚު ލިޔާ ގޮތް")} name="date_format">
              <Select
                value={localisation.values.dateFormat}
                onValueChange={(v) => localisation.set("dateFormat", v)}
                options={[
                  { value: "d MMM yyyy", label: "7 Oct 2026" },
                  { value: "dd/MM/yyyy", label: "07/10/2026" },
                  { value: "yyyy-MM-dd", label: "2026-10-07" },
                ]}
              />
            </FormField>
            <FormField label={tr("Currency", "ފައިސާ")} name="currency">
              <Select
                value={localisation.values.currency}
                onValueChange={(v) => localisation.set("currency", v)}
                options={[
                  { value: "MVR", label: tr("Maldivian rufiyaa (MVR)", "ދިވެހި ރުފިޔާ (MVR)") },
                  { value: "USD", label: tr("US dollar (USD)", "އެމެރިކާ ޑޮލަރު (USD)") },
                ]}
              />
            </FormField>
            <FormField label={tr("Week starts on", "ހަފްތާ ފެށޭ ދުވަސް")} name="week_start">
              <Select
                value={localisation.values.weekStart}
                onValueChange={(v) => localisation.set("weekStart", v)}
                options={[
                  { value: "0", label: tr("Sunday", "އާދިއްތަ") },
                  { value: "1", label: tr("Monday", "ހޯމަ") },
                  { value: "6", label: tr("Saturday", "ހޮނިހިރު") },
                ]}
              />
            </FormField>
          </FormGroup>
        </Section>
      ),
    },
    {
      value: "notifications",
      label: tr("Notifications", "ނޮޓިފިކޭޝަން"),
      icon: "bell",
      description: tr("What staff are told", "މުވައްޒަފުންނަށް ދަންނަވާ ކަންތައް"),
      content: (
        <Section
          title={tr("Notifications", "ނޮޓިފިކޭޝަން")}
          description={tr(
            "Defaults for every staff member. People can change their own in their profile.",
            "ހުރިހާ މުވައްޒަފުންނަށް ޑިފޯލްޓް. ކޮންމެ މީހަކަށް އަމިއްލައަށް ބަދަލުކުރެވޭނެ.",
          )}
          dirty={notifications.dirty}
          onReset={notifications.reset}
          successMessage={tr("Notification settings saved", "ނޮޓިފިކޭޝަން ސެޓިންގްސް ސޭވްކުރެވިއްޖެ")}
          onSubmit={saveWith(notifications, () =>
            notifications.values.senderName.length > 11
              ? { sender: tr("Use 11 characters or fewer.", "11 އަކުރަށްވުރެ ކުރުކޮށް.") }
              : {},
          )}
        >
          <div className="gap-4 grid">
            <Switch
              label={tr("New applications", "އައު އެޕްލިކޭޝަން")}
              description={tr(
                "Email the assigned officer straight away.",
                "ހަވާލުކުރެވިފައިވާ އޮފިސަރަށް ވަގުތުން އީމެއިލް.",
              )}
              labelPosition="start"
              classNames={{ root: "justify-between w-full" }}
              checked={notifications.values.newApplication}
              onCheckedChange={(v) => notifications.set("newApplication", v)}
            />
            <Switch
              label={tr("Daily digest", "ދުވަހުގެ ޚުލާޞާ")}
              description={tr("A summary at 08:00 every working day.", "ކޮންމެ ރަސްމީ ދުވަހަކު 08:00 ގައި.")}
              labelPosition="start"
              classNames={{ root: "justify-between w-full" }}
              checked={notifications.values.dailyDigest}
              onCheckedChange={(v) => notifications.set("dailyDigest", v)}
            />
            <Switch
              label={tr("Failed payments", "ނާކާމިޔާބު ފައިސާ")}
              description={tr("Alert finance staff when a payment fails.", "ފައިސާ ނާކާމިޔާބުވާއިރު ފައިނޭންސަށް.")}
              labelPosition="start"
              classNames={{ root: "justify-between w-full" }}
              checked={notifications.values.paymentFailed}
              onCheckedChange={(v) => notifications.set("paymentFailed", v)}
            />
            <Switch
              label={tr("SMS when email fails", "އީމެއިލް ނުދިޔައިމަ އެސްއެމްއެސް")}
              description={tr("Charged at MVR 0.25 per message.", "ކޮންމެ މެސެޖަކަށް ރ. 0.25.")}
              labelPosition="start"
              classNames={{ root: "justify-between w-full" }}
              checked={notifications.values.smsFallback}
              onCheckedChange={(v) => notifications.set("smsFallback", v)}
            />
            <FormField
              label={tr("SMS sender name", "އެސްއެމްއެސް ފޮނުވާ ނަން")}
              name="sender"
              help={tr("Up to 11 letters, no spaces.", "11 އަކުރު، ހުސްތަނެއް ނެތި.")}
            >
              <TextInput
                dir="ltr"
                value={notifications.values.senderName}
                onChange={(e) => notifications.set("senderName", e.target.value)}
              />
            </FormField>
          </div>
        </Section>
      ),
    },
    {
      value: "security",
      label: tr("Security", "ސެކިއުރިޓީ"),
      icon: "lock",
      description: tr("Sign-in and sessions", "ލޮގިން އަދި ސެޝަން"),
      content: (
        <Section
          title={tr("Security", "ސެކިއުރިޓީ")}
          description={tr("Applies to every staff account.", "ހުރިހާ މުވައްޒަފެއްގެ އެކައުންޓަށް.")}
          dirty={security.dirty}
          onReset={security.reset}
          successMessage={tr("Security settings saved", "ސެކިއުރިޓީ ސެޓިންގްސް ސޭވްކުރެވިއްޖެ")}
          onSubmit={saveWith(security, () =>
            (security.values.passwordLength ?? 0) < 8
              ? { password_length: tr("Use at least 8 characters.", "މަދުވެގެން 8 އަކުރު.") }
              : {},
          )}
        >
          <FormGroup columns={2}>
            <div className="col-span-full">
              <Switch
                label={tr("Require two-factor authentication", "ޓޫ ފެކްޓަރ މަޖުބޫރު")}
                description={tr(
                  "Staff without it are asked to set it up at their next sign-in.",
                  "ނެތް މުވައްޒަފުންނަށް ދެން ލޮގިންވާއިރު ސެޓްއަޕްކުރަން އެދޭނެ.",
                )}
                labelPosition="start"
                classNames={{ root: "justify-between w-full" }}
                checked={security.values.require2fa}
                onCheckedChange={(v) => security.set("require2fa", v)}
              />
            </div>
            <FormField label={tr("Sign out after inactivity", "ހަރަކާތެއް ނެތްނަމަ ލޮގްއައުޓް")} name="session_minutes">
              <NumberInput
                min={5}
                max={480}
                step={5}
                value={security.values.sessionMinutes}
                onValueChange={(v) => security.set("sessionMinutes", v)}
                endAddon={tr("minutes", "މިނިޓު")}
              />
            </FormField>
            <FormField label={tr("Minimum password length", "ޕާސްވޯޑުގެ ކުޑަ ދިގުމިން")} name="password_length">
              <NumberInput
                min={1}
                max={64}
                value={security.values.passwordLength}
                onValueChange={(v) => security.set("passwordLength", v)}
                endAddon={tr("characters", "އަކުރު")}
              />
            </FormField>
            <FormField label={tr("Lock account after", "އެކައުންޓް ތަޅުލާނީ")} name="lock_after">
              <Select
                value={security.values.lockAfter}
                onValueChange={(v) => security.set("lockAfter", v)}
                options={["3", "5", "10"].map((n) => ({
                  value: n,
                  label: tr(\`\${n} failed attempts\`, \`\${n} ފަހަރު ނާކާމިޔާބުވުމުން\`),
                }))}
              />
            </FormField>
            <FormField
              label={tr("Admin IP allowlist", "ހުއްދަ އައިޕީތައް")}
              name="ip_allowlist"
              help={tr("Leave empty to allow any network.", "ހުސްކޮށް ބާއްވައިފިނަމަ ކޮންމެ ނެޓްވޯކަކުން.")}
              className="col-span-full"
            >
              <TagsInput
                dir="ltr"
                value={security.values.ipAllowlist}
                onValueChange={(v) => security.set("ipAllowlist", v)}
              />
            </FormField>
          </FormGroup>
        </Section>
      ),
    },
  ]

  return (
    <AdminShell
      contentWidth="wide"
      breadcrumbs={[{ label: tr("Settings & access", "ސެޓިންގްސް") }, { label: tr("Settings", "ސެޓިންގްސް") }]}
    >
      <div className="gap-6 grid">
        <PageTitle
          title={tr("Settings", "ސެޓިންގްސް")}
          description={tr("Each section saves on its own.", "ކޮންމެ ބައެއް ވަކިން ސޭވްކުރެވޭނެ.")}
          links={[
            { label: tr("Users", "މެމްބަރުން"), href: routes.adminSettings.users, icon: "users" },
            { label: tr("Roles", "ރޯލްތައް"), href: routes.adminSettings.roles, icon: "lock" },
          ]}
        />
        <StackedTabs items={items} listLabel={tr("Settings sections", "ސެޓިންގްސްގެ ބައިތައް")} />
      </div>
    </AdminShell>
  )
}
`;export{e as default};