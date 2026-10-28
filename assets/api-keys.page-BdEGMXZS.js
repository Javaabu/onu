var e=`import * as React from "react"
import {
  Button,
  Callout,
  Card,
  Checkbox,
  ConfirmDialog,
  DataTable,
  DescriptionList,
  FieldErrors,
  Form,
  FormField,
  Icon,
  Modal,
  ModalClose,
  PageTitle,
  RelativeDate,
  Select,
  SensitiveInput,
  StatusBadge,
  SubmitButton,
  Switch,
  Tabs,
  Tag,
  TagsInput,
  TextInput,
  ValidationError,
  toast,
  type DataTableColumn,
} from "@javaabu/onu"

import { useDv, useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import { AdminShell } from "../_shared/shells"
import { NOW, demoSecret, initialClients, initialKeys, scopes, wait, type ApiKey, type OAuthClient } from "./_data"

export const meta = {
  title: "API keys and OAuth clients",
  group: "Admin: settings and access",
  layout: "bare",
  order: 5,
}

export default function ApiKeysPage() {
  const tr = useTr()
  const dv = useDv()
  const [keys, setKeys] = React.useState(initialKeys)
  const [clients, setClients] = React.useState(initialClients)
  const [createOpen, setCreateOpen] = React.useState(false)
  const [draft, setDraft] = React.useState({ name: "", scopes: ["applications:read"], expires: "365" })
  const [scopeError, setScopeError] = React.useState<string>()
  const [created, setCreated] = React.useState<{ name: string; secret: string } | null>(null)
  const [clientOpen, setClientOpen] = React.useState(false)
  const [clientDraft, setClientDraft] = React.useState({ name: "", redirects: [] as string[], firstParty: false })

  async function revoke(key: ApiKey) {
    await wait(700)
    setKeys((list) => list.map((k) => (k.id === key.id ? { ...k, revoked: true } : k)))
    toast.success(tr(\`\${key.name} revoked\`, \`\${key.name} ބާޠިލުކުރެވިއްޖެ\`))
  }

  const columns: DataTableColumn<ApiKey>[] = [
    {
      id: "name",
      header: tr("Name", "ނަން"),
      primary: true,
      cell: (k) => (
        <span className="gap-0.5 grid">
          <span className="font-medium">{k.name}</span>
          <span className="text-xs font-mono text-muted-foreground" dir="ltr">
            {\`\${k.prefix}••••••••\`}
          </span>
        </span>
      ),
    },
    {
      id: "scopes",
      header: tr("Scopes", "ސްކޯޕް"),
      accessor: (k) => k.scopes.join(", "),
      cell: (k) => (
        <span className="gap-1 flex flex-wrap">
          {k.scopes.map((s) => (
            <Tag key={s} size="sm" variant="outline">
              <span dir="ltr">{s}</span>
            </Tag>
          ))}
        </span>
      ),
    },
    {
      id: "lastUsed",
      header: tr("Last used", "ފަހުން ބޭނުންކުރީ"),
      cell: (k) => (k.lastUsed ? <RelativeDate value={k.lastUsed} now={NOW} /> : <span>{tr("Never", "ނުކުރޭ")}</span>),
    },
    {
      id: "expires",
      header: tr("Expires", "ހަމަވާނީ"),
      accessor: (k) => k.expires ?? tr("Never", "ނުހަމަވޭ"),
    },
    {
      id: "status",
      header: tr("Status", "ހާލަތު"),
      accessor: (k) => (k.revoked ? tr("Revoked", "ބާޠިލު") : tr("Active", "އެކްޓިވް")),
      cell: (k) =>
        k.revoked ? (
          <StatusBadge status="neutral" size="sm">
            {tr("Revoked", "ބާޠިލު")}
          </StatusBadge>
        ) : (
          <StatusBadge status="success" size="sm">
            {tr("Active", "އެކްޓިވް")}
          </StatusBadge>
        ),
    },
  ]

  const keysPanel = (
    <div className="gap-4 grid">
      <Callout
        variant="info"
        title={tr("Keep keys secret", "ކީތައް ސިއްރުކޮށް ބަހައްޓަވާ")}
        description={tr(
          "A key is shown once, when you create it. Revoke a key straight away if it leaks.",
          "ކީ ފެންނާނީ ހަދާއިރު އެކަނި. ލީކުވެއްޖެނަމަ ވަގުތުން ބާޠިލުކުރައްވާ.",
        )}
      />
      <DataTable
        caption={tr("API keys", "އޭޕީއައި ކީތައް")}
        columns={columns}
        data={keys}
        noun={dv ? { one: "ކީ", other: "ކީ" } : { one: "key", other: "keys" }}
        selectable={false}
        rowActions={(k) => [
          {
            id: "copy",
            label: tr("Copy key prefix", "ކީގެ ފުރަތަމަ ބައި ކޮޕީ"),
            icon: "copy",
            onSelect: async () => {
              await navigator.clipboard?.writeText(k.prefix).catch(() => undefined)
              toast.success(tr("Copied", "ކޮޕީކުރެވިއްޖެ"))
            },
          },
          {
            id: "revoke",
            label: tr("Revoke", "ބާޠިލުކުރޭ"),
            icon: "trash",
            destructive: true,
            permitted: !k.revoked,
            confirm: {
              title: tr(\`Revoke \${k.name}?\`, \`\${k.name} ބާޠިލުކުރަންތަ؟\`),
              description: tr(
                "Apps using this key stop working immediately. This can't be undone.",
                "މި ކީ ބޭނުންކުރާ އެޕްތައް ވަގުތުން ހުއްޓޭނެ. އަނބުރާ ނުގެނެވޭނެ.",
              ),
              confirmLabel: tr("Revoke key", "ކީ ބާޠިލުކުރޭ"),
              variant: "destructive",
              confirmText: k.name,
            },
            onSelect: () => revoke(k),
          },
        ]}
      />
    </div>
  )

  const clientsPanel = (
    <div className="gap-4 grid">
      {clients.map((c) => (
        <ClientCard key={c.id} client={c} onDelete={() => setClients((list) => list.filter((x) => x.id !== c.id))} />
      ))}
      <div>
        <Button variant="outline" onClick={() => setClientOpen(true)}>
          <Icon name="add" />
          {tr("New OAuth client", "އައު OAuth ކްލައިންޓް")}
        </Button>
      </div>
    </div>
  )

  return (
    <AdminShell
      contentWidth="wide"
      breadcrumbs={[{ label: tr("Settings & access", "ސެޓިންގްސް") }, { label: tr("API keys", "އޭޕީއައި ކީ") }]}
    >
      <div className="gap-6 grid">
        <PageTitle
          title={tr("API keys and OAuth clients", "އޭޕީއައި ކީ އަދި OAuth ކްލައިންޓް")}
          description={tr(
            "Let other systems use the portal's API.",
            "އެހެން ސިސްޓަމްތަކަށް ޕޯޓަލްގެ އޭޕީއައި ބޭނުންކުރެވޭނެ ގޮތް.",
          )}
          action={
            <Button onClick={() => setCreateOpen(true)}>
              <Icon name="key" />
              {tr("Create API key", "އޭޕީއައި ކީ ހަދާ")}
            </Button>
          }
          links={[{ label: tr("Settings", "ސެޓިންގްސް"), href: routes.adminSettings.settings, icon: "settings" }]}
        />
        <Tabs
          variant="line"
          listLabel={tr("Credentials", "ކްރެޑެންޝަލް")}
          items={[
            {
              value: "keys",
              label: tr("API keys", "އޭޕީއައި ކީ"),
              icon: "key",
              count: keys.filter((k) => !k.revoked).length,
              content: keysPanel,
            },
            {
              value: "clients",
              label: tr("OAuth clients", "OAuth ކްލައިންޓް"),
              icon: "lock",
              count: clients.length,
              content: clientsPanel,
            },
          ]}
        />
      </div>

      <Modal
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open)
          if (!open) setCreated(null)
        }}
        title={created ? tr("Copy your new key", "އައު ކީ ކޮޕީކުރައްވާ") : tr("Create API key", "އޭޕީއައި ކީ ހަދާ")}
        description={
          created
            ? tr("This is the only time the key is shown.", "ކީ ފެންނާނީ މި ފަހަރު އެކަނި.")
            : tr("Give only the scopes the system needs.", "ސިސްޓަމަށް ބޭނުންވާ ސްކޯޕް އެކަނި ދޭށެވެ.")
        }
        size="lg"
      >
        {created ? (
          <div className="gap-4 grid">
            <Callout
              variant="warning"
              title={tr("Copy it now", "މިހާރު ކޮޕީކުރައްވާ")}
              description={tr(
                "You won't be able to see it again. If you lose it, revoke it and create a new one.",
                "އަލުން ނުފެންނާނެ. ގެއްލިއްޖެނަމަ ބާޠިލުކޮށް އައު ކީއެއް ހައްދަވާ.",
              )}
            />
            <FormField label={created.name}>
              <SensitiveInput
                value={created.secret}
                defaultRevealed
                visibleChars={6}
                onCopy={() => toast.success(tr("Key copied", "ކީ ކޮޕީކުރެވިއްޖެ"))}
              />
            </FormField>
            <div className="flex justify-end">
              <ModalClose asChild>
                <Button>{tr("Done", "ނިމުނީ")}</Button>
              </ModalClose>
            </div>
          </div>
        ) : (
          <Form
            className="gap-4 grid"
            onSubmit={async () => {
              await wait(800)
              const errors: Record<string, string> = {}
              if (!draft.name.trim()) errors.name = tr("The name field is required.", "ނަން ލިޔުއްވާ.")
              if (!draft.scopes.length)
                errors.scopes = tr("Choose at least one scope.", "މަދުވެގެން އެއް ސްކޯޕް ހޮއްވަވާ.")
              setScopeError(errors.scopes)
              if (Object.keys(errors).length) throw new ValidationError(errors)
              const secret = demoSecret()
              const expires =
                draft.expires === "never"
                  ? null
                  : new Date(NOW + Number(draft.expires) * 86_400_000).toISOString().slice(0, 10)
              setKeys((list) => [
                {
                  id: \`k-\${Date.now()}\`,
                  name: draft.name.trim(),
                  prefix: secret.slice(0, 13),
                  scopes: draft.scopes,
                  createdBy: "Aishath Shifa",
                  createdAt: new Date(NOW).toISOString().slice(0, 10),
                  lastUsed: null,
                  expires,
                  revoked: false,
                },
                ...list,
              ])
              setCreated({ name: draft.name.trim(), secret })
              setDraft({ name: "", scopes: ["applications:read"], expires: "365" })
            }}
          >
            <FormField
              label={tr("Name", "ނަން")}
              name="name"
              required
              help={tr("e.g. BML payment gateway", "މިސާލު: BML ޕޭމަންޓް ގޭޓްވޭ")}
            >
              <TextInput
                dir="auto"
                value={draft.name}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              />
            </FormField>
            <fieldset className="gap-3 grid" aria-describedby={scopeError ? "scopes-error" : undefined}>
              <legend className="mb-2 text-sm font-medium">{tr("Scopes", "ސްކޯޕް")}</legend>
              <div className="gap-3 sm:grid-cols-2 grid">
                {scopes.map((s) => (
                  <Checkbox
                    key={s.value}
                    label={dv ? s.label.dv : s.label.en}
                    description={<span dir="ltr">{s.value}</span>}
                    checked={draft.scopes.includes(s.value)}
                    onCheckedChange={(on) => {
                      setScopeError(undefined)
                      setDraft((d) => ({
                        ...d,
                        scopes: on ? [...d.scopes, s.value] : d.scopes.filter((x) => x !== s.value),
                      }))
                    }}
                  />
                ))}
              </div>
              {scopeError ? <FieldErrors id="scopes-error" errors={scopeError} /> : null}
            </fieldset>
            <FormField label={tr("Expires", "ހަމަވާނީ")} name="expires">
              <Select
                value={draft.expires}
                onValueChange={(v) => setDraft((d) => ({ ...d, expires: v || "365" }))}
                options={[
                  { value: "30", label: tr("In 30 days", "30 ދުވަހުން") },
                  { value: "90", label: tr("In 90 days", "90 ދުވަހުން") },
                  { value: "365", label: tr("In 1 year", "1 އަހަރުން") },
                  { value: "never", label: tr("Never", "ނުހަމަވޭ") },
                ]}
              />
            </FormField>
            <div className="gap-2 pt-2 flex flex-wrap justify-end">
              <ModalClose asChild>
                <Button type="button" variant="outline">
                  {tr("Cancel", "ކެންސަލް")}
                </Button>
              </ModalClose>
              <SubmitButton>{tr("Create key", "ކީ ހަދާ")}</SubmitButton>
            </div>
          </Form>
        )}
      </Modal>

      <Modal
        open={clientOpen}
        onOpenChange={setClientOpen}
        title={tr("New OAuth client", "އައު OAuth ކްލައިންޓް")}
        description={tr(
          "For apps that sign people in with their portal account.",
          "ޕޯޓަލް އެކައުންޓުން ލޮގިންކުރާ އެޕްތަކަށް.",
        )}
      >
        <Form
          className="gap-4 grid"
          onSubmit={async () => {
            await wait(800)
            const errors: Record<string, string> = {}
            if (!clientDraft.name.trim()) errors.name = tr("The name field is required.", "ނަން ލިޔުއްވާ.")
            if (!clientDraft.redirects.length)
              errors.redirects = tr("Add at least one redirect URL.", "މަދުވެގެން އެއް ރީޑައިރެކްޓް ލިންކް.")
            if (Object.keys(errors).length) throw new ValidationError(errors)
            setClients((list) => [
              ...list,
              {
                id: \`c-\${Date.now()}\`,
                name: clientDraft.name.trim(),
                clientId: crypto.randomUUID?.() ?? \`client-\${Date.now()}\`,
                secret: demoSecret(""),
                redirects: clientDraft.redirects,
                firstParty: clientDraft.firstParty,
                createdAt: new Date(NOW).toISOString().slice(0, 10),
              },
            ])
          }}
          onSuccess={() => {
            toast.success(tr("OAuth client created", "OAuth ކްލައިންޓް ހެދިއްޖެ"))
            setClientDraft({ name: "", redirects: [], firstParty: false })
            setClientOpen(false)
          }}
        >
          <FormField label={tr("Name", "ނަން")} name="name" required>
            <TextInput
              dir="auto"
              value={clientDraft.name}
              onChange={(e) => setClientDraft((d) => ({ ...d, name: e.target.value }))}
            />
          </FormField>
          <FormField
            label={tr("Redirect URLs", "ރީޑައިރެކްޓް ލިންކް")}
            name="redirects"
            required
            help={tr("Press Enter after each URL.", "ކޮންމެ ލިންކަކަށްފަހު Enter ފިއްތަވާ.")}
          >
            <TagsInput
              dir="ltr"
              value={clientDraft.redirects}
              onValueChange={(redirects) => setClientDraft((d) => ({ ...d, redirects }))}
              placeholder="https://example.gov.mv/callback"
            />
          </FormField>
          <Switch
            label={tr("First-party app", "ފަސްޓް ޕާޓީ އެޕް")}
            description={tr("Skip the consent screen.", "ރުހުން ހޯދާ ސްކްރީން ނުދައްކާ.")}
            checked={clientDraft.firstParty}
            onCheckedChange={(firstParty) => setClientDraft((d) => ({ ...d, firstParty }))}
          />
          <div className="gap-2 pt-2 flex flex-wrap justify-end">
            <ModalClose asChild>
              <Button type="button" variant="outline">
                {tr("Cancel", "ކެންސަލް")}
              </Button>
            </ModalClose>
            <SubmitButton>{tr("Create client", "ކްލައިންޓް ހަދާ")}</SubmitButton>
          </div>
        </Form>
      </Modal>
    </AdminShell>
  )
}

function ClientCard({ client, onDelete }: { client: OAuthClient; onDelete: () => void }) {
  const tr = useTr()
  const [secret, setSecret] = React.useState(client.secret)
  return (
    <Card
      title={client.name}
      description={tr(\`Created \${client.createdAt}\`, \`ހެދީ \${client.createdAt}\`)}
      headingLevel={3}
      actions={
        client.firstParty ? (
          <StatusBadge status="info" size="sm">
            {tr("First party", "ފަސްޓް ޕާޓީ")}
          </StatusBadge>
        ) : null
      }
      footer={
        <div className="gap-2 flex w-full flex-wrap justify-end">
          <ConfirmDialog
            trigger={
              <Button variant="outline" size="sm">
                <Icon name="refresh" />
                {tr("Regenerate secret", "ސީކްރެޓް އަލުން ހަދާ")}
              </Button>
            }
            title={tr(\`Regenerate the secret for \${client.name}?\`, \`\${client.name} ގެ ސީކްރެޓް އަލުން ހަދަންތަ؟\`)}
            description={tr("The old secret stops working straight away.", "ކުރީގެ ސީކްރެޓް ވަގުތުން ހުއްޓޭނެ.")}
            confirmLabel={tr("Regenerate", "އަލުން ހަދާ")}
            onConfirm={async () => {
              await wait(600)
              setSecret(demoSecret(""))
              toast.success(tr("New secret created. Copy it now.", "އައު ސީކްރެޓް ހެދިއްޖެ. މިހާރު ކޮޕީކުރައްވާ."))
            }}
          />
          <ConfirmDialog
            trigger={
              <Button variant="outline" size="sm" className="text-destructive">
                <Icon name="trash" />
                {tr("Revoke", "ބާޠިލުކުރޭ")}
              </Button>
            }
            variant="destructive"
            title={tr(\`Revoke \${client.name}?\`, \`\${client.name} ބާޠިލުކުރަންތަ؟\`)}
            description={tr(
              "Everyone signed in through this app is signed out.",
              "މި އެޕުން ލޮގިންވެފައިވާ ހުރިހާ މީހުން ލޮގްއައުޓްވާނެ.",
            )}
            confirmLabel={tr("Revoke", "ބާޠިލުކުރޭ")}
            confirmText={client.name}
            onConfirm={async () => {
              await wait(600)
              onDelete()
              toast.success(tr(\`\${client.name} revoked\`, \`\${client.name} ބާޠިލުކުރެވިއްޖެ\`))
            }}
          />
        </div>
      }
    >
      <div className="gap-4 md:grid-cols-2 grid">
        <FormField label={tr("Client ID", "ކްލައިންޓް އައިޑީ")}>
          <SensitiveInput masked={false} value={client.clientId} dir="ltr" />
        </FormField>
        <FormField label={tr("Client secret", "ކްލައިންޓް ސީކްރެޓް")}>
          <SensitiveInput value={secret} />
        </FormField>
        <div className="col-span-full">
          <DescriptionList
            layout="stacked"
            divided={false}
            items={[
              {
                label: tr("Redirect URLs", "ރީޑައިރެކްޓް ލިންކް"),
                value: (
                  <ul className="gap-1 grid" dir="ltr">
                    {client.redirects.map((r) => (
                      <li key={r} className="text-sm font-mono break-all">
                        {r}
                      </li>
                    ))}
                  </ul>
                ),
              },
            ]}
          />
        </div>
      </div>
    </Card>
  )
}
`;export{e as default};