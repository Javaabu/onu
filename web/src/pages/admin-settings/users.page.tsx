import * as React from "react"
import {
  Button,
  Form,
  FormField,
  Icon,
  ListingPage,
  Modal,
  ModalClose,
  RelativeDate,
  Select,
  StatusBadge,
  SubmitButton,
  TextInput,
  UserAvatar,
  ValidationError,
  applyListingState,
  toast,
  useListingState,
  type ApplyListingOptions,
  type BulkAction,
  type DataTableColumn,
  type FilterDefinition,
  type StatusMap,
} from "@javaabu/onu"
import { useExportRows } from "@javaabu/onu/export"

import { useDv, useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import { AdminShell } from "../_shared/shells"
import { NOW, adminUsers, roleNames, statusNames, wait, type AdminUser, type RoleId, type UserStatus } from "./_data"

export const meta = { title: "Users index", group: "Admin: settings and access", layout: "bare", order: 2 }

const ISLANDS = [...new Set(adminUsers.map((u) => u.island))]

export default function UsersPage() {
  const tr = useTr()
  const dv = useDv()
  const [users, setUsers] = React.useState(adminUsers)
  const [inviteOpen, setInviteOpen] = React.useState(false)
  const [invite, setInvite] = React.useState({ name: "", email: "", role: "officer" })
  const state = useListingState({ paramPrefix: "users_" })

  const t = (s: { en: string; dv: string }) => (dv ? s.dv : s.en)
  const roleOptions = (Object.keys(roleNames) as RoleId[]).map((r) => ({ value: r, label: t(roleNames[r]) }))
  const statusMap: StatusMap = {
    active: { tone: "success", label: t(statusNames.active) },
    invited: { tone: "pending", label: t(statusNames.invited), icon: "mail" },
    suspended: { tone: "danger", label: t(statusNames.suspended) },
  }

  const exportRows = useExportRows()
  const listingOptions: ApplyListingOptions<AdminUser> = {
    locale: dv ? "dv" : "en",
    searchFields: (u) => [u.name, u.nameDv, u.email, u.island],
    filterFns: {
      status: (u, v) => (Array.isArray(v) ? v.includes(u.status) : u.status === v),
      role: (u, v) => (Array.isArray(v) ? v.includes(u.role) : u.role === v),
      island: (u, v) => (Array.isArray(v) ? v.includes(u.island) : u.island === v),
      two_factor: (u, v) => String(u.twoFactor) === String(v === "1" || v === "true"),
    },
    sortValue: (u, id) =>
      id === "name" ? (dv ? u.nameDv : u.name) : id === "lastLogin" ? (u.lastLogin ?? "") : u[id as keyof AdminUser],
  }
  const { rows, total } = applyListingState(users, state, listingOptions)

  const filters: FilterDefinition[] = [
    {
      type: "select",
      key: "role",
      label: tr("Role", "ރޯލް"),
      options: roleOptions,
    },
    {
      type: "select",
      key: "status",
      label: tr("Status", "ހާލަތު"),
      options: (Object.keys(statusNames) as UserStatus[]).map((s) => ({ value: s, label: t(statusNames[s]) })),
    },
    {
      type: "select",
      key: "island",
      label: tr("Island", "ރަށް"),
      options: ISLANDS.map((i) => ({ value: i, label: i })),
    },
    {
      type: "boolean",
      key: "two_factor",
      label: tr("Two-factor", "ޓޫ ފެކްޓަރ"),
      trueLabel: tr("On", "ހުޅުވާލާފައި"),
      falseLabel: tr("Off", "ބަންދުކޮށްފައި"),
    },
  ]

  const columns: DataTableColumn<AdminUser>[] = [
    {
      id: "name",
      header: tr("Name", "ނަން"),
      sortable: true,
      primary: true,
      accessor: (u) => (dv ? u.nameDv : u.name),
      cell: (u) => (
        <span className="gap-3 flex items-center">
          <UserAvatar name={dv ? u.nameDv : u.name} size="sm" decorative />
          <span className="font-medium">{dv ? u.nameDv : u.name}</span>
        </span>
      ),
    },
    {
      id: "email",
      header: tr("Email", "އީމެއިލް"),
      sortable: true,
      cell: (u) => <span dir="ltr">{u.email}</span>,
    },
    { id: "role", header: tr("Role", "ރޯލް"), sortable: true, accessor: (u) => t(roleNames[u.role]) },
    {
      id: "status",
      header: tr("Status", "ހާލަތު"),
      accessor: (u) => t(statusNames[u.status]),
      cell: (u) => <StatusBadge status={u.status} statusMap={statusMap} size="sm" />,
    },
    {
      id: "twoFactor",
      header: tr("Two-factor", "ޓޫ ފެކްޓަރ"),
      accessor: (u) => (u.twoFactor ? tr("On", "ހުޅުވާލާފައި") : tr("Off", "ބަންދުކޮށްފައި")),
      cell: (u) =>
        u.twoFactor ? (
          <span className="gap-1 inline-flex items-center">
            <Icon name="lock" className="size-4 text-success" />
            {tr("On", "ހުޅުވާލާފައި")}
          </span>
        ) : (
          <span className="text-muted-foreground">{tr("Off", "ބަންދުކޮށްފައި")}</span>
        ),
    },
    {
      id: "lastLogin",
      header: tr("Last sign-in", "ފަހުން ވަދެވަޑައިގެންނެވީ"),
      sortable: true,
      cell: (u) => (u.lastLogin ? <RelativeDate value={u.lastLogin} now={NOW} /> : <span>—</span>),
    },
  ]

  const setStatus = (ids: string[], status: UserStatus) =>
    setUsers((prev) => prev.map((u) => (ids.includes(u.id) ? { ...u, status } : u)))

  const bulkActions: BulkAction<string>[] = [
    {
      id: "role",
      label: tr("Change role", "ރޯލް ބަދަލުކުރޭ"),
      icon: "edit",
      defaultValue: "officer",
      form: ({ id, value, onChange }) => (
        <Select id={id} size="sm" options={roleOptions} value={value ?? ""} onValueChange={(v) => onChange(v)} />
      ),
      run: async (ids, role) => {
        await wait()
        setUsers((prev) => prev.map((u) => (ids.includes(u.id) ? { ...u, role: role as RoleId } : u)))
      },
      successMessage: (n) => tr(`${n} users updated`, `${n} މެމްބަރުން އަޕްޑޭޓްކުރެވިއްޖެ`),
    },
    {
      id: "suspend",
      label: tr("Suspend", "ހުއްޓާލާ"),
      icon: "lock",
      confirm: { title: tr("Suspend the selected users?", "ހޮވާފައިވާ މެމްބަރުން ހުއްޓާލަންތަ؟") },
      run: async (ids) => {
        await wait()
        setStatus(ids, "suspended")
      },
      successMessage: (n) => tr(`${n} users suspended`, `${n} މެމްބަރުން ހުއްޓާލެވިއްޖެ`),
    },
    {
      id: "delete",
      label: tr("Delete", "ޑިލީޓް"),
      icon: "trash",
      destructive: true,
      run: async (ids) => {
        await wait()
        setUsers((prev) => prev.filter((u) => !ids.includes(u.id)))
      },
    },
  ]

  async function sendInvite() {
    await wait(900)
    const errors: Record<string, string> = {}
    if (!invite.name.trim()) errors.name = tr("The name field is required.", "ނަން ލިޔުއްވާ.")
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(invite.email))
      errors.email = tr("Enter a valid email address.", "ރަނގަޅު އީމެއިލް އެޑްރެހެއް ޖައްސަވާ.")
    else if (users.some((u) => u.email === invite.email.toLowerCase()))
      errors.email = tr("The email has already been taken.", "މި އީމެއިލް ބޭނުންކުރެވިފައި.")
    if (Object.keys(errors).length) throw new ValidationError(errors)
    setUsers((prev) => [
      {
        id: String(Date.now()),
        name: invite.name,
        nameDv: invite.name,
        email: invite.email.toLowerCase(),
        role: invite.role as RoleId,
        status: "invited",
        island: "Malé",
        lastLogin: null,
        twoFactor: false,
      },
      ...prev,
    ])
  }

  const count = (s: UserStatus) => users.filter((u) => u.status === s).length

  return (
    <AdminShell
      contentWidth="full"
      breadcrumbs={[{ label: tr("Settings & access", "ސެޓިންގްސް") }, { label: tr("Users", "މެމްބަރުން") }]}
    >
      <ListingPage
        title={tr("Users", "މެމްބަރުން")}
        description={tr("Staff who can sign in to the admin panel.", "އެޑްމިން ޕެނަލަށް ވަދެވޭ މުވައްޒަފުން.")}
        state={state}
        columns={columns}
        data={rows}
        total={total}
        noun={dv ? { one: "މެމްބަރު", other: "މެމްބަރުން" } : { one: "user", other: "users" }}
        filters={filters}
        searchThaana={dv}
        searchPlaceholder={tr("Search name, email or island", "ނަން، އީމެއިލް ނުވަތަ ރަށް ހޯދާ")}
        primaryAction={
          <Button onClick={() => setInviteOpen(true)}>
            <Icon name="mail" />
            {tr("Invite user", "މެމްބަރަކަށް ދައުވަތު")}
          </Button>
        }
        links={[{ label: tr("Roles", "ރޯލްތައް"), href: routes.adminSettings.roles, icon: "lock" }]}
        trashHref={routes.adminRecords.trash}
        trashHasItems
        tabs={[
          { value: "all", label: tr("All", "ހުރިހާ"), count: users.length },
          { value: "active", label: t(statusNames.active), count: count("active") },
          { value: "invited", label: t(statusNames.invited), count: count("invited") },
          { value: "suspended", label: t(statusNames.suspended), count: count("suspended") },
        ]}
        onExport={(format) =>
          exportRows({
            format,
            rows: applyListingState(users, { ...state, page: 1, perPage: Infinity }, listingOptions).rows,
            columns: [
              { header: tr("Name", "ނަން"), accessor: (u) => (dv ? u.nameDv : u.name) },
              { header: tr("Email", "އީމެއިލް"), accessor: "email" },
              { header: tr("Role", "ރޯލް"), accessor: (u) => t(roleNames[u.role]) },
              { header: tr("Status", "ހާލަތު"), accessor: (u) => t(statusNames[u.status]) },
              { header: tr("Island", "ރަށް"), accessor: "island" },
              { header: tr("Two-factor", "ޓޫ ފެކްޓަރ"), accessor: "twoFactor", type: "boolean" },
              { header: tr("Last login", "އެންމެ ފަހުން ވަދެވުނީ"), accessor: "lastLogin", type: "datetime" },
            ],
            filename: "users",
            title: tr("Users", "މެމްބަރުން"),
          })
        }
        columnToggle
        bulkActions={bulkActions as BulkAction<unknown>[]}
        onBulkSuccess={(message) => toast.success(message)}
        getRowHref={() => routes.adminSettings.userProfile}
        rowActions={(u) => [
          { id: "view", label: tr("View", "ބަލާ"), icon: "eye", href: routes.adminSettings.userProfile },
          {
            id: "resend",
            label: tr("Resend invitation", "ދައުވަތު އަލުން ފޮނުވާ"),
            icon: "send",
            permitted: u.status === "invited",
            onSelect: async () => {
              await wait(500)
              toast.success(tr(`Invitation sent to ${u.email}`, `${u.email} އަށް ދައުވަތު ފޮނުވިއްޖެ`))
            },
          },
          {
            id: "suspend",
            label: tr("Suspend", "ހުއްޓާލާ"),
            icon: "lock",
            permitted: u.status === "active" && u.role !== "super-admin",
            confirm: { title: tr(`Suspend ${u.name}?`, `${u.nameDv} ހުއްޓާލަންތަ؟`) },
            onSelect: async () => {
              await wait(500)
              setStatus([u.id], "suspended")
              toast.success(tr(`${u.name} suspended`, `${u.nameDv} ހުއްޓާލެވިއްޖެ`))
            },
          },
          {
            id: "activate",
            label: tr("Reactivate", "އަލުން ހުޅުވާ"),
            icon: "unlock",
            permitted: u.status === "suspended",
            onSelect: async () => {
              await wait(500)
              setStatus([u.id], "active")
              toast.success(tr(`${u.name} reactivated`, `${u.nameDv} އަލުން ހުޅުވިއްޖެ`))
            },
          },
          {
            id: "delete",
            label: tr("Delete", "ޑިލީޓް"),
            icon: "trash",
            destructive: true,
            separator: true,
            permitted: u.role !== "super-admin",
            onSelect: async () => {
              await wait(500)
              setUsers((prev) => prev.filter((x) => x.id !== u.id))
              toast.success(tr("Moved to trash", "ކުނިފޮށިއަށް ލެވިއްޖެ"))
            },
          },
        ]}
      />

      <Modal
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        title={tr("Invite a user", "މެމްބަރަކަށް ދައުވަތު")}
        description={tr(
          "They get an email with a link to set their password. The link expires in 48 hours.",
          "ޕާސްވޯޑް ހެދުމަށް ލިންކެއް އީމެއިލްކުރެވޭނެ. ލިންކް 48 ގަޑިއިރުން ހަމަވާނެ.",
        )}
      >
        <Form
          id="invite-form"
          onSubmit={sendInvite}
          onSuccess={() => {
            toast.success(tr(`Invitation sent to ${invite.email}`, `${invite.email} އަށް ދައުވަތު ފޮނުވިއްޖެ`))
            setInvite({ name: "", email: "", role: "officer" })
            setInviteOpen(false)
          }}
          className="gap-4 grid"
        >
          <FormField label={tr("Full name", "ފުރިހަމަ ނަން")} name="name" required>
            <TextInput
              dir="auto"
              value={invite.name}
              onChange={(e) => setInvite((v) => ({ ...v, name: e.target.value }))}
              autoComplete="off"
            />
          </FormField>
          <FormField
            label={tr("Email", "އީމެއިލް")}
            name="email"
            required
            help={tr("Try shifa@javaabu.com to see the error.", "ގޯސް ދައްކާލުމަށް shifa@javaabu.com ޖައްސަވާ.")}
          >
            <TextInput
              type="email"
              value={invite.email}
              onChange={(e) => setInvite((v) => ({ ...v, email: e.target.value }))}
            />
          </FormField>
          <FormField label={tr("Role", "ރޯލް")} name="role" required>
            <Select
              options={roleOptions.filter((r) => r.value !== "super-admin")}
              value={invite.role}
              onValueChange={(role) => setInvite((v) => ({ ...v, role }))}
            />
          </FormField>
          <div className="gap-2 pt-2 flex flex-wrap justify-end">
            <ModalClose asChild>
              <Button type="button" variant="outline">
                {tr("Cancel", "ކެންސަލް")}
              </Button>
            </ModalClose>
            <SubmitButton>{tr("Send invitation", "ދައުވަތު ފޮނުވާ")}</SubmitButton>
          </div>
        </Form>
      </Modal>
    </AdminShell>
  )
}
