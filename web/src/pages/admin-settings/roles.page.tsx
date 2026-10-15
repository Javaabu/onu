import * as React from "react"
import {
  Badge,
  Button,
  Callout,
  Card,
  Checkbox,
  Form,
  FormField,
  Icon,
  Modal,
  ModalClose,
  PageTitle,
  SaveBar,
  SubmitButton,
  TextInput,
  Textarea,
  ValidationError,
  cn,
  toast,
  useConfirm,
  type SaveBarChange,
} from "@javaabu/onu"

import { useDv, useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import { AdminShell } from "../_shared/shells"
import { initialRoles, permissionGroups, wait, type L10n, type Role } from "./_data"

export const meta = { title: "Roles and permissions", group: "Admin: settings and access", layout: "bare", order: 4 }

export default function RolesPage() {
  const tr = useTr()
  const dv = useDv()
  const ask = useConfirm()
  const t = (s: L10n) => (dv ? s.dv : s.en)
  const [roles, setRoles] = React.useState(initialRoles)
  const [roleId, setRoleId] = React.useState<string>("officer")
  const role = roles.find((r) => r.id === roleId) ?? roles[0]!
  const [granted, setGranted] = React.useState<string[]>(role.permissions)
  const [saving, setSaving] = React.useState(false)
  const [status, setStatus] = React.useState<"idle" | "success" | "error">("idle")
  const [newOpen, setNewOpen] = React.useState(false)
  const [draft, setDraft] = React.useState({ name: "", description: "" })

  const label = (id: string) => {
    for (const g of permissionGroups) {
      const p = g.permissions.find((x) => x.id === id)
      if (p) return `${t(g.label)}: ${t(p.label)}`
    }
    return id
  }
  const added = granted.filter((p) => !role.permissions.includes(p))
  const removed = role.permissions.filter((p) => !granted.includes(p))
  const changes: SaveBarChange[] = [
    ...added.map((p) => ({
      key: `+${p}`,
      field: label(p),
      description: tr(`${label(p)} is granted`, `${label(p)} ހުއްދަ ދެވޭނެ`),
    })),
    ...removed.map((p) => ({
      key: `-${p}`,
      field: label(p),
      description: tr(`${label(p)} is removed`, `${label(p)} ހުއްދަ ނަގާލެވޭނެ`),
    })),
  ]
  const dirty = changes.length > 0

  async function switchRole(id: string) {
    if (id === roleId) return
    if (dirty) {
      const ok = await ask({
        title: tr("You have unsaved changes. Leave anyway?", "ސޭވް ނުކުރާ ބަދަލުތައް އެބަހުރި. ދޫކޮށްލަންތަ؟"),
        confirmLabel: tr("Leave", "ދޫކޮށްލާ"),
        cancelLabel: tr("Stay", "މިތާ ހުންނާނަން"),
        variant: "destructive",
      })
      if (!ok) return
    }
    const next = roles.find((r) => r.id === id)
    setRoleId(id)
    setGranted(next?.permissions ?? [])
    setStatus("idle")
  }

  const toggle = (id: string, on: boolean) => {
    setGranted((g) => (on ? [...g, id] : g.filter((x) => x !== id)))
    setStatus("idle")
  }
  const toggleGroup = (ids: string[], on: boolean) => {
    setGranted((g) => (on ? [...new Set([...g, ...ids])] : g.filter((x) => !ids.includes(x))))
    setStatus("idle")
  }

  return (
    <AdminShell
      contentWidth="full"
      breadcrumbs={[{ label: tr("Settings & access", "ސެޓިންގްސް") }, { label: tr("Roles", "ރޯލްތައް") }]}
    >
      <div className="gap-6 grid">
        <PageTitle
          title={tr("Roles and permissions", "ރޯލްތަކާއި ހުއްދަތައް")}
          description={tr("Choose what each role can do.", "ކޮންމެ ރޯލަކަށް ކުރެވޭނެ ކަންތައް ހޮވާ.")}
          action={
            <Button onClick={() => setNewOpen(true)}>
              <Icon name="add" />
              {tr("New role", "އައު ރޯލް")}
            </Button>
          }
          links={[{ label: tr("Users", "މެމްބަރުން"), href: routes.adminSettings.users, icon: "users" }]}
        />

        <div className="gap-6 lg:grid-cols-[16rem_minmax(0,1fr)] lg:items-start grid">
          <div className="gap-6 min-w-0 lg:top-20 lg:sticky grid">
            <nav aria-label={tr("Roles", "ރޯލްތައް")}>
              <ul className="gap-1 lg:grid pb-1 flex overflow-x-auto">
                {roles.map((r) => (
                  <li key={r.id} className="shrink-0">
                    <button
                      type="button"
                      aria-current={r.id === roleId ? "page" : undefined}
                      onClick={() => switchRole(r.id)}
                      className={cn(
                        "gap-0.5 px-3 py-2 grid w-full rounded-md border border-transparent text-start hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                        r.id === roleId && "border-border bg-muted",
                      )}
                    >
                      <span className="gap-2 font-medium flex items-center">
                        {t(r.name)}
                        {r.locked ? <Icon name="lock" className="size-3.5 text-muted-foreground" /> : null}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {tr(`${r.users} users`, `${r.users} މެމްބަރުން`)} ·{" "}
                        {tr(`${r.permissions.length} permissions`, `${r.permissions.length} ހުއްދަ`)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
            <SaveBar
              changes={changes}
              dirty={dirty}
              saving={saving}
              status={status}
              title={tr("Unsaved changes", "ސޭވް ނުކުރާ ބަދަލުތައް")}
              onDiscard={() => {
                setGranted(role.permissions)
                setStatus("idle")
              }}
              onSave={async () => {
                setSaving(true)
                await wait(900)
                setRoles((list) => list.map((r) => (r.id === roleId ? { ...r, permissions: granted } : r)))
                setSaving(false)
                setStatus("success")
                toast.success(tr(`${t(role.name)} saved`, `${t(role.name)} ސޭވްކުރެވިއްޖެ`))
              }}
              successMessage={tr("Role saved", "ރޯލް ސޭވްކުރެވިއްޖެ")}
            />
          </div>

          <section aria-labelledby="role-title" className="gap-4 min-w-0 grid">
            <div className="gap-1 grid">
              <h2 id="role-title" className="text-lg font-semibold">
                {t(role.name)}
              </h2>
              <p className="text-sm text-muted-foreground">{t(role.description)}</p>
            </div>
            {role.locked ? (
              <Callout
                variant="info"
                title={tr("This role can't be changed", "މި ރޯލް ބަދަލެއް ނުކުރެވޭނެ")}
                description={tr(
                  "Super admins always have every permission.",
                  "ސުޕަރ އެޑްމިނުންނަށް ހުރިހާ ހުއްދައެއް ލިބިގެންވޭ.",
                )}
              />
            ) : null}
            <div className="gap-4 2xl:grid-cols-2 grid">
              {permissionGroups.map((group) => {
                const ids = group.permissions.map((p) => p.id)
                const on = ids.filter((id) => granted.includes(id)).length
                return (
                  <Card
                    key={group.id}
                    size="sm"
                    title={t(group.label)}
                    headingLevel={3}
                    actions={
                      <Badge variant="secondary" className="tabular-nums" dir="ltr">
                        {`${on} / ${ids.length}`}
                      </Badge>
                    }
                  >
                    <fieldset className="gap-3 grid" disabled={role.locked}>
                      <legend className="sr-only">{t(group.label)}</legend>
                      <Checkbox
                        label={tr("Select all", "ހުރިހާ ހޮވާ")}
                        aria-label={tr(
                          `Select all ${group.label.en} permissions`,
                          `${group.label.dv} ގެ ހުރިހާ ހުއްދަ`,
                        )}
                        checked={on === ids.length}
                        indeterminate={on > 0 && on < ids.length}
                        onCheckedChange={(v) => toggleGroup(ids, v === true)}
                        classNames={{ label: "font-medium" }}
                      />
                      <div className="gap-3 ps-6 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-2 grid">
                        {group.permissions.map((p) => (
                          <Checkbox
                            key={p.id}
                            label={t(p.label)}
                            description={p.description ? t(p.description) : undefined}
                            checked={granted.includes(p.id)}
                            onCheckedChange={(v) => toggle(p.id, v === true)}
                          />
                        ))}
                      </div>
                    </fieldset>
                  </Card>
                )
              })}
            </div>
          </section>
        </div>
      </div>

      <Modal
        open={newOpen}
        onOpenChange={setNewOpen}
        title={tr("New role", "އައު ރޯލް")}
        description={tr(
          "Start with no permissions, then tick what it needs.",
          "ހުއްދައެއް ނެތި ފަށާ، ދެން ބޭނުންވާ ހުއްދަތައް ހޮވާ.",
        )}
      >
        <Form
          className="gap-4 grid"
          onSubmit={async () => {
            await wait(700)
            const name = draft.name.trim()
            if (!name) throw new ValidationError({ name: tr("The name field is required.", "ނަން ލިޔުއްވާ.") })
            if (roles.some((r) => r.name.en.toLowerCase() === name.toLowerCase() || r.name.dv === name))
              throw new ValidationError({
                name: tr("A role with this name already exists.", "މި ނަމުގައި ރޯލެއް އެބައޮތް."),
              })
            const id = `role-${Date.now()}`
            const role: Role = {
              id,
              name: { en: name, dv: name },
              description: { en: draft.description, dv: draft.description },
              users: 0,
              permissions: [],
            }
            setRoles((list) => [...list, role])
            setRoleId(id)
            setGranted([])
          }}
          onSuccess={() => {
            toast.success(tr("Role created", "ރޯލް ހެދިއްޖެ"))
            setDraft({ name: "", description: "" })
            setNewOpen(false)
          }}
        >
          <FormField label={tr("Name", "ނަން")} name="name" required>
            <TextInput
              dir="auto"
              thaana={{ defaultEnabled: dv }}
              thaanaToggle
              value={draft.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
            />
          </FormField>
          <FormField label={tr("Description", "ތަފްޞީލް")} name="description">
            <Textarea
              dir="auto"
              rows={2}
              value={draft.description}
              onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
            />
          </FormField>
          <div className="gap-2 pt-2 flex flex-wrap justify-end">
            <ModalClose asChild>
              <Button type="button" variant="outline">
                {tr("Cancel", "ކެންސަލް")}
              </Button>
            </ModalClose>
            <SubmitButton>{tr("Create role", "ރޯލް ހަދާ")}</SubmitButton>
          </div>
        </Form>
      </Modal>
    </AdminShell>
  )
}
