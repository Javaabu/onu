import * as React from "react"
import {
  Button,
  Callout,
  Card,
  ConfirmDialog,
  Form,
  FormField,
  FormGroup,
  Icon,
  ListView,
  OtpInput,
  PageTitle,
  PasswordInput,
  PhoneInput,
  RelativeDate,
  SaveBar,
  Select,
  SensitiveInput,
  StatusBadge,
  SubmitButton,
  TextInput,
  ValidationError,
  describeChanges,
  toast,
} from "@javaabu/onu"
import { AvatarUpload } from "@javaabu/onu/media"

import { useDv, useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import { AdminShell } from "../_shared/shells"
import { NOW, roleNames, sessions as initialSessions, wait } from "./_data"

export const meta = { title: "User profile", group: "Admin: settings and access", layout: "bare", order: 3 }

type Profile = {
  name: string
  nameDv: string
  email: string
  phone: string | undefined
  idCard: string
  designation: string
  language: string
}

const initialProfile: Profile = {
  name: "Aishath Shifa",
  nameDv: "އައިޝަތު ޝިފާ",
  email: "shifa@javaabu.com",
  phone: "+9607771234",
  idCard: "A123456",
  designation: "Senior Systems Officer",
  language: "dv",
}

const SECRET = "JBSWY3DPEHPK3PXP"
const RECOVERY = ["7HKD-2MQX", "Q9TR-LV4A", "Z3PW-8NCE", "M6YB-K2RJ", "4FGS-WX7D", "R8LN-3EHQ"]

/** A decorative QR-like pattern for the demo (not a scannable code). */
function FakeQr({ label }: { label: string }) {
  const cells = React.useMemo(
    () => Array.from({ length: 21 * 21 }, (_, i) => ((i * 7919) % 13 < 6 ? 1 : 0) as number),
    [],
  )
  return (
    <svg viewBox="0 0 21 21" role="img" aria-label={label} className="size-40 p-2 bg-white rounded-md border">
      {cells.map((on, i) =>
        on ? <rect key={i} x={i % 21} y={Math.floor(i / 21)} width="1" height="1" fill="#111" /> : null,
      )}
      {[
        [0, 0],
        [14, 0],
        [0, 14],
      ].map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <rect x={x} y={y} width="7" height="7" fill="#111" />
          <rect x={(x ?? 0) + 1} y={(y ?? 0) + 1} width="5" height="5" fill="#fff" />
          <rect x={(x ?? 0) + 2} y={(y ?? 0) + 2} width="3" height="3" fill="#111" />
        </g>
      ))}
    </svg>
  )
}

export default function UserProfilePage() {
  const tr = useTr()
  const dv = useDv()
  const [saved, setSaved] = React.useState(initialProfile)
  const [values, setValues] = React.useState(initialProfile)
  const [twoFactor, setTwoFactor] = React.useState<"off" | "setup" | "on">("off")
  const [code, setCode] = React.useState("")
  const [codeError, setCodeError] = React.useState<string>()
  const [verifying, setVerifying] = React.useState(false)
  const [sessions, setSessions] = React.useState(initialSessions)
  const [passwords, setPasswords] = React.useState({ current: "", next: "", confirm: "" })
  const set = <K extends keyof Profile>(key: K, value: Profile[K]) => setValues((v) => ({ ...v, [key]: value }))

  const languages = [
    { value: "dv", label: "ދިވެހި" },
    { value: "en", label: "English" },
  ]
  const changes = describeChanges(
    saved,
    values,
    {
      name: tr("Name (English)", "ނަން (އިނގިރޭސި)"),
      nameDv: tr("Name (Dhivehi)", "ނަން (ދިވެހި)"),
      email: tr("Email", "އީމެއިލް"),
      phone: tr("Mobile", "މޮބައިލް"),
      idCard: tr("ID card", "އައިޑީ ކާޑު"),
      designation: tr("Designation", "މަޤާމު"),
      language: tr("Language", "ބަސް"),
    },
    { language: (v) => languages.find((l) => l.value === v)?.label ?? v },
  )
  const displayName = dv ? saved.nameDv : saved.name

  async function verify() {
    setVerifying(true)
    await wait(800)
    setVerifying(false)
    if (code !== "123456") {
      setCodeError(
        tr("That code didn't work. Try 123456 in this demo.", "ކޯޑު ރަނގަޅެއް ނޫން. މި ޑެމޯގައި 123456 ޖައްސަވާ."),
      )
      return
    }
    setCodeError(undefined)
    setTwoFactor("on")
    setCode("")
    toast.success(tr("Two-factor authentication is on", "ޓޫ ފެކްޓަރ ހުޅުވިއްޖެ"))
  }

  return (
    <AdminShell
      contentWidth="wide"
      breadcrumbs={[{ label: tr("Users", "މެމްބަރުން"), href: routes.adminSettings.users }, { label: displayName }]}
    >
      <div className="gap-6 grid">
        <PageTitle
          title={displayName}
          description={`${dv ? roleNames["super-admin"].dv : roleNames["super-admin"].en} · ${saved.email}`}
          links={[
            { label: tr("All users", "ހުރިހާ މެމްބަރުން"), href: routes.adminSettings.users, icon: "back" },
            { label: tr("Notifications", "ނޮޓިފިކޭޝަން"), href: routes.adminSettings.notifications, icon: "bell" },
          ]}
          actions={<StatusBadge status="success">{tr("Active", "އެކްޓިވް")}</StatusBadge>}
        />

        <Form
          onSubmit={async () => {
            await wait(900)
            const errors: Record<string, string> = {}
            if (!/^[A-Z]\d{6}$/.test(values.idCard))
              errors.id_card = tr(
                "Enter an ID card number like A123456.",
                "A123456 ފަދަ އައިޑީ ކާޑު ނަންބަރެއް ޖައްސަވާ.",
              )
            if (values.email === "naseem@javaabu.com")
              errors.email = tr("The email has already been taken.", "މި އީމެއިލް ބޭނުންކުރެވިފައި.")
            if (Object.keys(errors).length) throw new ValidationError(errors)
            setSaved(values)
          }}
          onSuccess={() => toast.success(tr("Profile saved", "ޕްރޮފައިލް ސޭވްކުރެވިއްޖެ"))}
        >
          <div className="gap-6 lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-start grid">
            <div className="gap-6 min-w-0 grid">
              <Card title={tr("Profile", "ޕްރޮފައިލް")} headingLevel={2}>
                <div className="gap-6 md:grid-cols-[auto_minmax(0,1fr)] grid">
                  <FormField label={tr("Photo", "ފޮޓޯ")} name="avatar">
                    <AvatarUpload
                      personName={displayName}
                      size="xl"
                      maxSize={5 * 1024 * 1024}
                      onChange={() => toast.success(tr("Photo updated", "ފޮޓޯ ބަދަލުކުރެވިއްޖެ"))}
                    />
                  </FormField>
                  <FormGroup columns={2}>
                    <FormField label={tr("Name (English)", "ނަން (އިނގިރޭސި)")} name="name" required>
                      <TextInput dir="auto" value={values.name} onChange={(e) => set("name", e.target.value)} />
                    </FormField>
                    <FormField label={tr("Name (Dhivehi)", "ނަން (ދިވެހި)")} name="name_dv">
                      <TextInput
                        thaana
                        thaanaToggle
                        value={values.nameDv}
                        onChange={(e) => set("nameDv", e.target.value)}
                      />
                    </FormField>
                    <FormField
                      label={tr("Email", "އީމެއިލް")}
                      name="email"
                      required
                      help={tr("Try naseem@javaabu.com to see the error.", "ގޯސް ދައްކާލުމަށް naseem@javaabu.com.")}
                    >
                      <TextInput type="email" value={values.email} onChange={(e) => set("email", e.target.value)} />
                    </FormField>
                    <FormField label={tr("Mobile", "މޮބައިލް")} name="phone">
                      <PhoneInput value={values.phone} onValueChange={(v) => set("phone", v)} />
                    </FormField>
                    <FormField label={tr("ID card", "އައިޑީ ކާޑު")} name="id_card" required>
                      <TextInput
                        dir="ltr"
                        value={values.idCard}
                        onChange={(e) => set("idCard", e.target.value.toUpperCase())}
                        maxLength={7}
                      />
                    </FormField>
                    <FormField label={tr("Designation", "މަޤާމު")} name="designation">
                      <TextInput
                        dir="auto"
                        value={values.designation}
                        onChange={(e) => set("designation", e.target.value)}
                      />
                    </FormField>
                    <FormField label={tr("Language", "ބަސް")} name="language">
                      <Select options={languages} value={values.language} onValueChange={(v) => set("language", v)} />
                    </FormField>
                  </FormGroup>
                </div>
              </Card>
            </div>
            <SaveBar
              changes={changes}
              onDiscard={() => setValues(saved)}
              successMessage={tr("Profile saved", "ޕްރޮފައިލް ސޭވްކުރެވިއްޖެ")}
            />
          </div>
        </Form>

        <div className="gap-6 lg:grid-cols-2 grid items-start">
          <Form
            onSubmit={async () => {
              await wait(900)
              const errors: Record<string, string> = {}
              if (passwords.current !== "password")
                errors.current_password = tr(
                  "The password is incorrect. Use “password” in this demo.",
                  "ޕާސްވޯޑް ރަނގަޅެއް ނޫން. މި ޑެމޯގައި “password” ބޭނުންކުރައްވާ.",
                )
              if (passwords.next.length < 12)
                errors.password = tr("Use at least 12 characters.", "މަދުވެގެން 12 އަކުރު.")
              else if (passwords.next !== passwords.confirm)
                errors.password_confirmation = tr("The passwords don't match.", "ޕާސްވޯޑް ދިމައެއް ނުވޭ.")
              if (Object.keys(errors).length) throw new ValidationError(errors)
              setPasswords({ current: "", next: "", confirm: "" })
            }}
            onSuccess={() => toast.success(tr("Password changed", "ޕާސްވޯޑް ބަދަލުކުރެވިއްޖެ"))}
          >
            <Card
              title={tr("Change password", "ޕާސްވޯޑް ބަދަލުކުރުން")}
              description={tr(
                "Other sessions stay signed in until you sign them out below.",
                "އެހެން ސެޝަންތައް ލޮގްއައުޓް ނުވާނެ.",
              )}
              headingLevel={2}
              footer={
                <div className="flex w-full justify-end">
                  <SubmitButton>{tr("Change password", "ޕާސްވޯޑް ބަދަލުކުރޭ")}</SubmitButton>
                </div>
              }
            >
              <div className="gap-4 grid">
                <FormField label={tr("Current password", "މިހާރުގެ ޕާސްވޯޑް")} name="current_password" required>
                  <PasswordInput
                    autoComplete="current-password"
                    value={passwords.current}
                    onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))}
                  />
                </FormField>
                <FormField
                  label={tr("New password", "އައު ޕާސްވޯޑް")}
                  name="password"
                  required
                  help={tr("At least 12 characters.", "މަދުވެގެން 12 އަކުރު.")}
                >
                  <PasswordInput
                    strength
                    autoComplete="new-password"
                    value={passwords.next}
                    onChange={(e) => setPasswords((p) => ({ ...p, next: e.target.value }))}
                  />
                </FormField>
                <FormField
                  label={tr("Confirm new password", "އައު ޕާސްވޯޑް އަލުން")}
                  name="password_confirmation"
                  required
                >
                  <PasswordInput
                    autoComplete="new-password"
                    value={passwords.confirm}
                    onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))}
                  />
                </FormField>
              </div>
            </Card>
          </Form>

          <Card
            title={tr("Two-factor authentication", "ޓޫ ފެކްޓަރ އޮތެންޓިކޭޝަން")}
            description={tr(
              "Ask for a code from an authenticator app when you sign in.",
              "ލޮގިންވާއިރު އޮތެންޓިކޭޓަރ އެޕަކުން ކޯޑެއް ބޭނުންވާނެ.",
            )}
            headingLevel={2}
            actions={
              twoFactor === "on" ? (
                <StatusBadge status="success">{tr("On", "ހުޅުވާލާފައި")}</StatusBadge>
              ) : (
                <StatusBadge status="warning">{tr("Off", "ބަންދުކޮށްފައި")}</StatusBadge>
              )
            }
          >
            {twoFactor === "off" ? (
              <div className="gap-4 grid">
                <Callout
                  variant="warning"
                  title={tr("Required for administrators", "އެޑްމިނިސްޓްރޭޓަރުންނަށް މަޖުބޫރު")}
                  description={tr(
                    "Your organisation requires two-factor authentication from 1 November.",
                    "ނޮވެމްބަރު 1 ން ފެށިގެން ޓޫ ފެކްޓަރ މަޖުބޫރު.",
                  )}
                />
                <div>
                  <Button onClick={() => setTwoFactor("setup")}>
                    <Icon name="lock" />
                    {tr("Set up two-factor", "ޓޫ ފެކްޓަރ ސެޓްއަޕްކުރޭ")}
                  </Button>
                </div>
              </div>
            ) : twoFactor === "setup" ? (
              <div className="gap-4 grid">
                <ol className="gap-4 grid list-none">
                  <li className="gap-2 grid">
                    <span className="text-sm font-medium">
                      {tr(
                        "1. Scan this code with your authenticator app",
                        "1. އޮތެންޓިކޭޓަރ އެޕުން މި ކޯޑު ސްކޭންކުރައްވާ",
                      )}
                    </span>
                    <FakeQr label={tr("QR code for the authenticator app", "އޮތެންޓިކޭޓަރ އެޕަށް ކިއުއާރް ކޯޑު")} />
                    <FormField label={tr("Or enter this key", "ނުވަތަ މި ކީ ޖައްސަވާ")}>
                      <SensitiveInput masked={false} value={SECRET} dir="ltr" />
                    </FormField>
                  </li>
                  <li className="gap-2 grid">
                    <FormField label={tr("2. Enter the 6-digit code", "2. 6 އަކުރުގެ ކޯޑު ޖައްސަވާ")} error={codeError}>
                      <OtpInput value={code} onValueChange={setCode} onComplete={() => undefined} />
                    </FormField>
                  </li>
                </ol>
                <div className="gap-2 flex flex-wrap">
                  <Button onClick={verify} disabled={code.length < 6 || verifying} aria-busy={verifying}>
                    {verifying ? tr("Checking…", "ޗެކްކުރަނީ…") : tr("Verify and turn on", "ޗެކްކޮށް ހުޅުވާ")}
                  </Button>
                  <Button variant="ghost" onClick={() => setTwoFactor("off")}>
                    {tr("Cancel", "ކެންސަލް")}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="gap-4 grid">
                <p className="text-sm">
                  {tr(
                    "Keep these recovery codes somewhere safe. Each works once if you lose your phone.",
                    "މި ރިކަވަރީ ކޯޑުތައް ރައްކާތެރިކޮށް ބަހައްޓަވާ. ކޮންމެ ކޯޑެއް އެއް ފަހަރު ބޭނުންކުރެވޭނެ.",
                  )}
                </p>
                <ul className="gap-2 p-3 text-sm grid grid-cols-2 rounded-md bg-muted font-mono" dir="ltr">
                  {RECOVERY.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
                <div className="gap-2 flex flex-wrap">
                  <Button
                    variant="outline"
                    onClick={() =>
                      toast.success(tr("Recovery codes downloaded", "ރިކަވަރީ ކޯޑުތައް ޑައުންލޯޑްކުރެވިއްޖެ"))
                    }
                  >
                    <Icon name="download" />
                    {tr("Download codes", "ކޯޑުތައް ޑައުންލޯޑް")}
                  </Button>
                  <ConfirmDialog
                    trigger={<Button variant="ghost">{tr("Turn off", "ބަންދުކުރޭ")}</Button>}
                    variant="destructive"
                    title={tr("Turn off two-factor authentication?", "ޓޫ ފެކްޓަރ ބަންދުކުރަންތަ؟")}
                    description={tr(
                      "Your account will only be protected by your password.",
                      "ހަމައެކަނި ޕާސްވޯޑުން އެކައުންޓް ރައްކާތެރިވާނެ.",
                    )}
                    confirmLabel={tr("Turn off", "ބަންދުކުރޭ")}
                    onConfirm={async () => {
                      await wait(600)
                      setTwoFactor("off")
                      toast(tr("Two-factor authentication is off", "ޓޫ ފެކްޓަރ ބަންދުކުރެވިއްޖެ"))
                    }}
                  />
                </div>
              </div>
            )}
          </Card>
        </div>

        <Card
          title={tr("Sessions", "ސެޝަންތައް")}
          description={tr("Devices signed in to your account.", "ތިބާގެ އެކައުންޓަށް ވަދެފައިވާ ޑިވައިސްތައް.")}
          headingLevel={2}
          actions={
            sessions.length > 1 ? (
              <ConfirmDialog
                trigger={
                  <Button variant="outline" size="sm">
                    <Icon name="log-out" />
                    {tr("Sign out other sessions", "އެހެން ސެޝަންތައް ލޮގްއައުޓް")}
                  </Button>
                }
                variant="destructive"
                title={tr(
                  `Sign out ${sessions.length - 1} other sessions?`,
                  `${sessions.length - 1} ސެޝަން ލޮގްއައުޓްކުރަންތަ؟`,
                )}
                confirmLabel={tr("Sign out", "ލޮގްއައުޓް")}
                onConfirm={async () => {
                  await wait(700)
                  setSessions((s) => s.filter((x) => x.current))
                  toast.success(tr("Other sessions signed out", "އެހެން ސެޝަންތައް ލޮގްއައުޓްކުރެވިއްޖެ"))
                }}
              />
            ) : null
          }
        >
          <ListView
            aria-label={tr("Sessions", "ސެޝަންތައް")}
            items={sessions}
            getName={(s) => s.device}
            title={(s) => s.device}
            media={(s) => (
              <span className="size-10 flex items-center justify-center rounded-md bg-muted">
                <Icon name={s.icon} />
              </span>
            )}
            description={(s) => (
              <span>
                {dv ? s.location.dv : s.location.en} · <span dir="ltr">{s.ip}</span>
              </span>
            )}
            meta={(s) =>
              s.current ? (
                <StatusBadge status="success" size="sm">
                  {tr("This device", "މި ޑިވައިސް")}
                </StatusBadge>
              ) : (
                <RelativeDate value={s.lastActive} now={NOW} />
              )
            }
            itemActions={(s) => [
              {
                id: "sign-out",
                label: tr("Sign out", "ލޮގްއައުޓް"),
                icon: "log-out",
                destructive: true,
                permitted: !s.current,
                confirm: {
                  title: tr(`Sign out ${s.device}?`, `${s.device} ލޮގްއައުޓްކުރަންތަ؟`),
                  variant: "destructive",
                },
                onSelect: async () => {
                  await wait(500)
                  setSessions((list) => list.filter((x) => x.id !== s.id))
                  toast.success(tr(`${s.device} signed out`, `${s.device} ލޮގްއައުޓްކުރެވިއްޖެ`))
                },
              },
            ]}
          />
        </Card>
      </div>
    </AdminShell>
  )
}
