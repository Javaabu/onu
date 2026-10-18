var e=`import * as React from "react"
import {
  AccountSwitcher,
  Button,
  Card,
  Checkbox,
  FormErrorsProvider,
  FormField,
  FormGroup,
  Form,
  ListView,
  Modal,
  Notice,
  PageTitle,
  PhoneInput,
  Select,
  SubmitButton,
  Tag,
  TextInput,
  ThaanaInput,
  toast,
  type Account,
  type FormErrors,
} from "@javaabu/onu"

import { CitizenShell } from "../_shared/shells"
import { useTr } from "../_shared/i18n"
import { applicant, throwIfInvalid, useFormat, wait, type L } from "../applications/_data"

export const meta = { title: "Profile and delegation", group: "Citizen portal", layout: "bare", order: 5 }

interface Delegate {
  id: string
  name: L
  idCard: string
  relationship: string
  permissions: string[]
  until: string
}

const initialDelegates: Delegate[] = [
  {
    id: "d1",
    name: ["Aminath Hassan", "އާމިނަތު ޙަސަން"],
    idCard: "A287341",
    relationship: "spouse",
    permissions: ["apply", "pay", "documents"],
    until: "2027-03-31T00:00:00",
  },
  {
    id: "d2",
    name: ["Ibrahim Rasheed", "އިބްރާހީމް ރަޝީދު"],
    idCard: "A301922",
    relationship: "agent",
    permissions: ["pay"],
    until: "2026-12-31T00:00:00",
  },
]

const ID_CARD = /^A\\d{6}$/i

export default function ProfilePage() {
  const tr = useTr()
  const { date } = useFormat()

  const accounts: Account[] = [
    { id: "me", name: tr(...applicant.name), description: applicant.idCard, type: "personal" },
    {
      id: "cafe",
      name: tr("Ocean Breeze Pvt Ltd", "އޯޝަން ބްރީޒް ޕްރައިވެޓް ލިމިޓެޑް"),
      description: "C-0821/2026",
      type: "organisation",
    },
    {
      id: "club",
      name: tr("Hulhumalé Sports Club", "ހުޅުމާލެ ސްޕޯޓްސް ކްލަބް"),
      description: tr("Association", "ޖަމްޢިއްޔާ"),
      type: "organisation",
    },
    {
      id: "mother",
      name: tr("Mariyam Nisha", "މަރިޔަމް ނިޝާ"),
      description: tr("Delegated to you", "ތިބާއަށް ހަވާލުކޮށްފައި"),
      type: "delegated",
    },
    {
      id: "father",
      name: tr("Ali Manik", "ޢަލީ މަނިކު"),
      description: tr("Delegation expired", "ހަވާލުކުރުމުގެ މުއްދަތު ހަމަވެފައި"),
      type: "delegated",
      disabled: true,
    },
  ]
  const [acting, setActing] = React.useState("me")
  const actingAccount = accounts.find((a) => a.id === acting)

  const relationships = [
    { value: "spouse", label: tr("Spouse", "އަނބިމީހާ / ފިރިމީހާ") },
    { value: "parent", label: tr("Parent", "މައިންބަފައިން") },
    { value: "child", label: tr("Son or daughter", "ދަރިން") },
    { value: "agent", label: tr("Authorised agent", "ބާރުދީފައިވާ ފަރާތް") },
  ]
  const permissionLabels: Record<string, string> = {
    apply: tr("Apply for services", "ޚިދުމަތަށް އެދުން"),
    pay: tr("Make payments", "ފައިސާ ދެއްކުން"),
    documents: tr("View documents", "ލިޔެކިޔުން ބެލުން"),
  }

  const [delegates, setDelegates] = React.useState(initialDelegates)
  const [adding, setAdding] = React.useState(false)
  const [draft, setDraft] = React.useState({ name: "", idCard: "", relationship: "", permissions: ["pay"] as string[] })
  const [draftErrors, setDraftErrors] = React.useState<FormErrors>({})
  const [saving, setSaving] = React.useState(false)

  const addDelegate = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string[]> = {}
    if (!draft.name.trim()) errs.name = [tr("Enter the person's name.", "ނަން ލިޔުއްވާ.")]
    if (!ID_CARD.test(draft.idCard.trim()))
      errs.id_card = [tr("Enter an ID card number like A123456.", "A123456 ފަދަ ނަންބަރެއް ލިޔުއްވާ.")]
    else if (draft.idCard.toUpperCase() === applicant.idCard)
      errs.id_card = [tr("You can't delegate to yourself.", "އަމިއްލަ ނަފްސަށް ހަވާލުނުކުރެވޭނެ.")]
    if (!draft.relationship) errs.relationship = [tr("Choose a relationship.", "ގުޅުން ހޮވާ.")]
    if (!draft.permissions.length)
      errs.permissions = [tr("Choose at least one permission.", "މަދުވެގެން އެއް ހުއްދަ ހޮވާ.")]
    setDraftErrors(errs)
    if (Object.keys(errs).length) return
    setSaving(true)
    await wait(800)
    setDelegates((d) => [
      ...d,
      {
        id: String(Date.now()),
        name: [draft.name, draft.name],
        idCard: draft.idCard.toUpperCase(),
        relationship: draft.relationship,
        permissions: draft.permissions,
        until: "2027-10-06T00:00:00",
      },
    ])
    setSaving(false)
    setAdding(false)
    setDraft({ name: "", idCard: "", relationship: "", permissions: ["pay"] })
    toast.success(tr("Delegate added", "ހަވާލުކުރެވިއްޖެ"), {
      description: tr("They'll get an SMS to accept.", "ގަބޫލުކުރުމަށް އެސްއެމްއެސް ފޮނުވާނަން."),
    })
  }

  return (
    <CitizenShell>
      <div className="gap-6 max-w-4xl grid">
        <PageTitle
          title={tr("Profile and delegation", "ޕްރޮފައިލް އަދި ހަވާލުކުރުން")}
          description={tr(
            "Your details, the accounts you can act for, and who can act for you.",
            "ތިބާގެ މަޢުލޫމާތު، ތިބާއަށް ބޭނުންކުރެވޭ އެކައުންޓްތައް، އަދި ތިބާގެ ފަރާތުން ޢަމަލުކުރެވޭ މީހުން.",
          )}
        />

        <Card
          headingLevel={2}
          title={tr("Acting as", "ބޭނުންކުރަނީ")}
          description={tr(
            "Switch to an organisation or a person who delegated their account to you.",
            "ޖަމްޢިއްޔާއަކަށް ނުވަތަ ތިބާއަށް ހަވާލުކޮށްފައިވާ އެކައުންޓަކަށް ބަދަލުކުރައްވާ.",
          )}
        >
          <div className="gap-3 max-w-sm grid">
            <AccountSwitcher
              aria-label={tr("Acting as", "ބޭނުންކުރަނީ")}
              accounts={accounts}
              value={acting}
              size="lg"
              onValueChange={(id, account) => {
                setActing(id)
                toast.success(tr(\`Now acting as \${account.name}\`, \`މިހާރު ބޭނުންކުރަނީ \${account.name}\`))
              }}
            />
            {acting !== "me" ? (
              <Notice tone="info">
                {tr(
                  \`Applications and payments you make now are made for \${actingAccount?.name}.\`,
                  \`މިހާރު ކުރާ ޢަމަލުތައް ކުރެވެނީ \${actingAccount?.name} ގެ ފަރާތުން.\`,
                )}
              </Notice>
            ) : null}
          </div>
        </Card>

        <Card headingLevel={2} title={tr("Personal details", "ޝަޚްޞީ މަޢުލޫމާތު")}>
          <Form
            noValidate
            onSubmit={async (values) => {
              await wait(900)
              const email = String(values.email ?? "")
              throwIfInvalid({
                ...(!/^\\S+@\\S+\\.\\S+$/.test(email)
                  ? { email: [tr("Enter a valid email address.", "ރަނގަޅު އީމެއިލެއް ލިޔުއްވާ.")] }
                  : email.endsWith("@taken.mv")
                    ? {
                        email: [
                          tr(
                            "This email is used by another account.",
                            "މި އީމެއިލް އެހެން އެކައުންޓެއްގައި ބޭނުންކުރެވިފައި.",
                          ),
                        ],
                      }
                    : {}),
              })
              toast.success(tr("Profile saved", "ޕްރޮފައިލް ސޭވްކުރެވިއްޖެ"))
            }}
          >
            <FormGroup columns={2}>
              <FormField
                label={tr("Full name", "ފުރިހަމަ ނަން")}
                name="name"
                help={tr("From the National Registration Bureau.", "ނޭޝަނަލް ރަޖިސްޓްރޭޝަން ބިއުރޯއިން.")}
                disabled
              >
                <TextInput defaultValue={tr(...applicant.name)} />
              </FormField>
              <FormField label={tr("ID card", "އައިޑީ ކާޑު")} name="id_card" disabled>
                <TextInput defaultValue={applicant.idCard} dir="ltr" />
              </FormField>
              <FormField
                label={tr("Email", "އީމެއިލް")}
                name="email"
                help={tr("Try an address ending in @taken.mv.", "@taken.mv ގައި ނިމޭ އީމެއިލެއް ޓެސްޓްކޮށްލައްވާ.")}
                required
              >
                <TextInput type="email" defaultValue={applicant.email} dir="ltr" autoComplete="email" />
              </FormField>
              <FormField label={tr("Mobile number", "މޯބައިލް ނަންބަރު")} name="phone" required>
                <PhoneInput defaultValue={applicant.phone} />
              </FormField>
              <FormField
                label={tr("Address (Dhivehi)", "އެޑްރެސް (ދިވެހިން)")}
                name="address_dv"
                className="col-span-full"
              >
                <ThaanaInput defaultValue={applicant.house[1]} />
              </FormField>
            </FormGroup>
            <div>
              <SubmitButton startIcon="save">{tr("Save changes", "ބަދަލުތައް ސޭވްކުރޭ")}</SubmitButton>
            </div>
          </Form>
        </Card>

        <Card
          headingLevel={2}
          title={tr("People who can act for you", "ތިބާގެ ފަރާތުން ޢަމަލުކުރެވޭ މީހުން")}
          description={tr(
            "Delegates can use eServices on your behalf.",
            "ތިބާގެ ފަރާތުން އީ ސަރވިސަސް ބޭނުންކުރެވޭނެ.",
          )}
          actions={
            <Button size="sm" startIcon="add" onClick={() => setAdding(true)}>
              {tr("Add delegate", "މީހަކު އިތުރުކުރޭ")}
            </Button>
          }
        >
          <ListView
            aria-label={tr("Delegates", "ހަވާލުކުރެވިފައިވާ މީހުން")}
            items={delegates}
            getId={(d) => d.id}
            getName={(d) => tr(...d.name)}
            title={(d) => tr(...d.name)}
            description={(d) =>
              \`\${d.idCard} · \${relationships.find((r) => r.value === d.relationship)?.label ?? ""} · \${tr("until", "ހަމަވަނީ")} \${date(d.until)}\`
            }
            meta={(d) => (
              <span className="gap-1 flex flex-wrap">
                {d.permissions.map((p) => (
                  <Tag key={p} size="sm" variant="outline">
                    {permissionLabels[p]}
                  </Tag>
                ))}
              </span>
            )}
            itemActions={(d) => [
              {
                id: "remove",
                label: tr("Remove", "ނައްތާލާ"),
                icon: "trash",
                destructive: true,
                confirm: {
                  title: tr(\`Remove \${d.name[0]}?\`, \`\${d.name[1]} ނައްތާލަންވީތޯ؟\`),
                  description: tr(
                    "They won't be able to act for you any more.",
                    "ތިބާގެ ފަރާތުން ޢަމަލެއް ނުކުރެވޭނެ.",
                  ),
                  confirmLabel: tr("Remove", "ނައްތާލާ"),
                },
                onSelect: async () => {
                  await wait(500)
                  setDelegates((list) => list.filter((x) => x.id !== d.id))
                  toast.success(tr("Delegate removed", "ނައްތާލެވިއްޖެ"))
                },
              },
            ]}
          />
        </Card>
      </div>

      <Modal
        open={adding}
        onOpenChange={setAdding}
        title={tr("Add a delegate", "މީހަކު އިތުރުކުރޭ")}
        description={tr("They'll need an eFaas account to accept.", "ގަބޫލުކުރުމަށް އީފާސް އެކައުންޓެއް ބޭނުންވާނެ.")}
        footer={
          <>
            <Button variant="outline" onClick={() => setAdding(false)}>
              {tr("Cancel", "ކެންސަލް")}
            </Button>
            <Button type="submit" form="add-delegate" loading={saving}>
              {tr("Add delegate", "އިތުރުކުރޭ")}
            </Button>
          </>
        }
      >
        <form id="add-delegate" noValidate onSubmit={addDelegate} className="gap-4 grid">
          <FormErrorsProvider errors={draftErrors}>
            <FormField label={tr("Full name", "ފުރިހަމަ ނަން")} name="name" required>
              <TextInput value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} />
            </FormField>
            <FormField label={tr("ID card number", "އައިޑީ ކާޑު ނަންބަރު")} name="id_card" required>
              <TextInput
                value={draft.idCard}
                onChange={(e) => setDraft((d) => ({ ...d, idCard: e.target.value.toUpperCase() }))}
                dir="ltr"
                maxLength={7}
                placeholder="A123456"
              />
            </FormField>
            <FormField label={tr("Relationship", "ގުޅުން")} name="relationship" required>
              <Select
                options={relationships}
                value={draft.relationship}
                onValueChange={(v) => setDraft((d) => ({ ...d, relationship: v }))}
                placeholder={tr("Choose…", "ހޮވާ…")}
              />
            </FormField>
            <FormField
              label={tr("They can", "ކުރެވޭނެ ކަންތައް")}
              name="permissions"
              id="delegate-permissions"
              required
            >
              <div className="gap-2 grid" role="group" aria-labelledby="delegate-permissions-label">
                {Object.entries(permissionLabels).map(([key, label]) => (
                  <Checkbox
                    key={key}
                    label={label}
                    checked={draft.permissions.includes(key)}
                    onCheckedChange={(c) =>
                      setDraft((d) => ({
                        ...d,
                        permissions: c === true ? [...d.permissions, key] : d.permissions.filter((p) => p !== key),
                      }))
                    }
                  />
                ))}
              </div>
            </FormField>
          </FormErrorsProvider>
        </form>
      </Modal>
    </CitizenShell>
  )
}
`;export{e as default};