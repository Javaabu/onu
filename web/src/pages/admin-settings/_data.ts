/** A string in English and Dhivehi. */
export interface L10n {
  en: string
  dv: string
}

export const wait = (ms = 700) => new Promise((resolve) => setTimeout(resolve, ms))

// Fixed demo clock so relative times are stable.
export const NOW = new Date("2026-10-07T09:30:00+05:00").getTime()
export const minutesAgo = (m: number) => new Date(NOW - m * 60_000).toISOString()

// ---------------------------------------------------------------------------
// Users and roles

export type RoleId = "super-admin" | "admin" | "editor" | "officer" | "viewer"
export type UserStatus = "active" | "invited" | "suspended"

export const roleNames: Record<RoleId, L10n> = {
  "super-admin": { en: "Super admin", dv: "ސުޕަރ އެޑްމިން" },
  admin: { en: "Admin", dv: "އެޑްމިން" },
  editor: { en: "Editor", dv: "އެޑިޓަރ" },
  officer: { en: "Service officer", dv: "ސަރވިސް އޮފިސަރ" },
  viewer: { en: "Viewer", dv: "ވިއުއަރ" },
}

export const statusNames: Record<UserStatus, L10n> = {
  active: { en: "Active", dv: "އެކްޓިވް" },
  invited: { en: "Invited", dv: "ދައުވަތު ދީފައި" },
  suspended: { en: "Suspended", dv: "ހުއްޓާލައިފައި" },
}

export interface AdminUser {
  id: string
  name: string
  nameDv: string
  email: string
  role: RoleId
  status: UserStatus
  island: string
  lastLogin: string | null
  twoFactor: boolean
}

const FIRST = ["Aishath", "Mohamed", "Mariyam", "Ahmed", "Fathimath", "Ibrahim", "Aminath", "Hussain", "Hawwa", "Ali"]
const FIRST_DV = [
  "އައިޝަތު",
  "މުޙައްމަދު",
  "މަރިޔަމް",
  "އަޙްމަދު",
  "ފާތިމަތު",
  "އިބްރާހީމް",
  "އާމިނަތު",
  "ޙުސައިން",
  "ޙައްވާ",
  "ޢަލީ",
]
const LAST = ["Shifa", "Naseem", "Zahir", "Rasheed", "Hassan", "Manik", "Didi", "Waheed", "Shareef", "Latheef"]
const LAST_DV = ["ޝިފާ", "ނަސީމް", "ޒާހިރު", "ރަޝީދު", "ޙަސަން", "މަނިކު", "ދީދީ", "ވަޙީދު", "ޝަރީފް", "ލަޠީފް"]
const ISLANDS = ["Malé", "Hulhumalé", "Addu City", "Fuvahmulah", "Kulhudhuffushi", "Thinadhoo", "Naifaru"]
const ROLES: RoleId[] = ["viewer", "officer", "officer", "editor", "viewer", "admin", "officer"]
const STATUSES: UserStatus[] = ["active", "active", "active", "active", "invited", "active", "suspended"]

export const adminUsers: AdminUser[] = Array.from({ length: 46 }, (_, i) => {
  const f = i % FIRST.length
  const l = (i * 3 + Math.floor(i / FIRST.length)) % LAST.length
  const status = i === 0 ? "active" : (STATUSES[i % STATUSES.length] as UserStatus)
  return {
    id: String(i + 1),
    name: `${FIRST[f]} ${LAST[l]}`,
    nameDv: `${FIRST_DV[f]} ${LAST_DV[l]}`,
    email: `${(FIRST[f] as string).toLowerCase()}.${(LAST[l] as string).toLowerCase()}${i ? i : ""}@javaabu.com`,
    role: i === 0 ? "super-admin" : (ROLES[i % ROLES.length] as RoleId),
    status,
    island: ISLANDS[i % ISLANDS.length] as string,
    lastLogin: status === "invited" ? null : minutesAgo(7 + i * 173),
    twoFactor: i % 3 !== 1,
  }
})

// ---------------------------------------------------------------------------
// Permissions

export interface PermissionGroup {
  id: string
  label: L10n
  permissions: { id: string; label: L10n; description?: L10n }[]
}

const crud = (resource: string, extra: PermissionGroup["permissions"] = []): PermissionGroup["permissions"] => [
  { id: `${resource}.view`, label: { en: "View", dv: "ބެލުން" } },
  { id: `${resource}.create`, label: { en: "Create", dv: "އުފެއްދުން" } },
  { id: `${resource}.update`, label: { en: "Edit", dv: "އެޑިޓްކުރުން" } },
  { id: `${resource}.delete`, label: { en: "Delete", dv: "ޑިލީޓްކުރުން" } },
  ...extra,
]

export const permissionGroups: PermissionGroup[] = [
  {
    id: "applications",
    label: { en: "Applications", dv: "އެޕްލިކޭޝަންތައް" },
    permissions: crud("applications", [
      {
        id: "applications.approve",
        label: { en: "Approve or reject", dv: "ޤަބޫލު ނުވަތަ ރައްދު" },
        description: { en: "Make a final decision", dv: "ނިންމުން" },
      },
      { id: "applications.export", label: { en: "Export", dv: "އެކްސްޕޯޓް" } },
    ]),
  },
  {
    id: "payments",
    label: { en: "Payments", dv: "ފައިސާ" },
    permissions: [
      { id: "payments.view", label: { en: "View", dv: "ބެލުން" } },
      { id: "payments.refund", label: { en: "Refund", dv: "އަނބުރާ ދިނުން" } },
      { id: "payments.reconcile", label: { en: "Reconcile", dv: "ރިކޮންސައިލް" } },
    ],
  },
  {
    id: "posts",
    label: { en: "Posts and pages", dv: "ޕޯސްޓް އަދި ސަފްހާ" },
    permissions: crud("posts", [{ id: "posts.publish", label: { en: "Publish", dv: "ޝާއިޢުކުރުން" } }]),
  },
  { id: "media", label: { en: "Media", dv: "މީޑިއާ" }, permissions: crud("media") },
  {
    id: "users",
    label: { en: "Users", dv: "މެމްބަރުން" },
    permissions: crud("users", [
      { id: "users.impersonate", label: { en: "Sign in as user", dv: "މެމްބަރެއްގެ ގޮތުގައި ވަނުން" } },
    ]),
  },
  {
    id: "settings",
    label: { en: "Settings", dv: "ސެޓިންގްސް" },
    permissions: [
      { id: "settings.view", label: { en: "View", dv: "ބެލުން" } },
      { id: "settings.update", label: { en: "Edit", dv: "އެޑިޓްކުރުން" } },
      { id: "settings.api", label: { en: "Manage API keys", dv: "އޭޕީއައި ކީ" } },
    ],
  },
]

const all = permissionGroups.flatMap((g) => g.permissions.map((p) => p.id))

export interface Role {
  id: RoleId | string
  name: L10n
  description: L10n
  users: number
  locked?: boolean
  permissions: string[]
}

export const initialRoles: Role[] = [
  {
    id: "super-admin",
    name: roleNames["super-admin"],
    description: { en: "Everything, always. Cannot be edited.", dv: "ހުރިހާ ހުއްދައެއް. ބަދަލެއް ނުގެނެވޭނެ." },
    users: 1,
    locked: true,
    permissions: all,
  },
  {
    id: "admin",
    name: roleNames.admin,
    description: { en: "Runs the portal day to day.", dv: "ޕޯޓަލް ހިންގުން." },
    users: 4,
    permissions: all.filter((p) => !["users.impersonate", "settings.api"].includes(p)),
  },
  {
    id: "editor",
    name: roleNames.editor,
    description: { en: "Writes and publishes news and pages.", dv: "ޚަބަރާއި ސަފްހާ ލިޔުން." },
    users: 6,
    permissions: [...all.filter((p) => p.startsWith("posts.") || p.startsWith("media.")), "applications.view"],
  },
  {
    id: "officer",
    name: roleNames.officer,
    description: { en: "Processes citizen applications.", dv: "ރައްޔިތުންގެ އެޕްލިކޭޝަން ބެލުން." },
    users: 19,
    permissions: ["applications.view", "applications.update", "applications.approve", "payments.view", "media.view"],
  },
  {
    id: "viewer",
    name: roleNames.viewer,
    description: { en: "Read-only access to reports.", dv: "ހަމައެކަނި ބެލުމުގެ ހުއްދަ." },
    users: 16,
    permissions: ["applications.view", "payments.view"],
  },
]

// ---------------------------------------------------------------------------
// API keys and OAuth clients

export const scopes: { value: string; label: L10n }[] = [
  { value: "applications:read", label: { en: "Read applications", dv: "އެޕްލިކޭޝަން ކިޔުން" } },
  { value: "applications:write", label: { en: "Create and update applications", dv: "އެޕްލިކޭޝަން ލިޔުން" } },
  { value: "payments:read", label: { en: "Read payments", dv: "ފައިސާ ކިޔުން" } },
  { value: "payments:write", label: { en: "Create payments", dv: "ފައިސާ ލިޔުން" } },
  { value: "users:read", label: { en: "Read users", dv: "މެމްބަރުން ކިޔުން" } },
  { value: "webhooks", label: { en: "Receive webhooks", dv: "ވެބްހުކް" } },
]

export interface ApiKey {
  id: string
  name: string
  prefix: string
  scopes: string[]
  createdBy: string
  createdAt: string
  lastUsed: string | null
  expires: string | null
  revoked: boolean
}

export const initialKeys: ApiKey[] = [
  {
    id: "k1",
    name: "BML payment gateway",
    prefix: "onu_live_7Fq2",
    scopes: ["payments:read", "payments:write", "webhooks"],
    createdBy: "Aishath Shifa",
    createdAt: "2026-03-14",
    lastUsed: minutesAgo(3),
    expires: null,
    revoked: false,
  },
  {
    id: "k2",
    name: "Hulhumalé ferry kiosk",
    prefix: "onu_live_Kd81",
    scopes: ["applications:read", "payments:write"],
    createdBy: "Mohamed Naseem",
    createdAt: "2026-06-02",
    lastUsed: minutesAgo(48),
    expires: "2027-06-02",
    revoked: false,
  },
  {
    id: "k3",
    name: "Reporting dashboard",
    prefix: "onu_live_p0Zc",
    scopes: ["applications:read", "payments:read", "users:read"],
    createdBy: "Mariyam Zahir",
    createdAt: "2026-08-21",
    lastUsed: minutesAgo(60 * 26),
    expires: "2026-12-31",
    revoked: false,
  },
  {
    id: "k4",
    name: "Old SMS gateway",
    prefix: "onu_live_Qa3e",
    scopes: ["webhooks"],
    createdBy: "Ahmed Rasheed",
    createdAt: "2025-11-09",
    lastUsed: minutesAgo(60 * 24 * 90),
    expires: null,
    revoked: true,
  },
]

export interface OAuthClient {
  id: string
  name: string
  clientId: string
  secret: string
  redirects: string[]
  firstParty: boolean
  createdAt: string
}

export const initialClients: OAuthClient[] = [
  {
    id: "c1",
    name: "eFaas citizen portal",
    clientId: "9d41c2f8-6e0b-4b3a-a1c7-5f2e8b90d3aa",
    secret: "Xk2pQ7vN4mR9sT1wY6zB3cF8hJ5lD0gA",
    redirects: ["https://portal.gov.mv/auth/callback"],
    firstParty: true,
    createdAt: "2026-01-12",
  },
  {
    id: "c2",
    name: "Island council mobile app",
    clientId: "3b7e0a12-94cd-4f6e-8b21-c0d9e7a5f416",
    secret: "aR8tL2nV6qW0eY4uI9oP3sD7fG1hJ5kZ",
    redirects: ["mv.gov.council://oauth", "https://council.gov.mv/callback"],
    firstParty: false,
    createdAt: "2026-07-30",
  },
]

/** A random-looking secret for the demo (not cryptographically secure). */
export function demoSecret(prefix = "onu_live_") {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789"
  let out = prefix
  for (let i = 0; i < 40; i++) out += chars[Math.floor(Math.random() * chars.length)]
  return out
}

// ---------------------------------------------------------------------------
// Notifications

export type NotificationCategory = "applications" | "payments" | "security" | "system"

export interface InboxItem {
  id: string
  category: NotificationCategory
  title: L10n
  body: L10n
  time: string
  read: boolean
  icon: string
  variant: "default" | "success" | "warning" | "error" | "info"
}

export const inbox: InboxItem[] = [
  {
    id: "n1",
    category: "applications",
    title: { en: "New housing application from Hulhumalé", dv: "ހުޅުމާލެއިން ހިޔާވަހިކަމަށް އައު އެޕްލިކޭޝަނެއް" },
    body: {
      en: "Aminath Waheed (A204518) applied for a 2-bedroom flat.",
      dv: "އާމިނަތު ވަޙީދު (A204518) 2 ކޮޓަރީގެ ފްލެޓަކަށް އެދިއްޖެ.",
    },
    time: minutesAgo(12),
    read: false,
    icon: "file-text",
    variant: "info",
  },
  {
    id: "n2",
    category: "payments",
    title: { en: "Payment received: MVR 1,250.00", dv: "ފައިސާ ލިބިއްޖެ: ރ. 1,250.00" },
    body: { en: "Ferry season pass for Ibrahim Manik.", dv: "އިބްރާހީމް މަނިކުގެ ފެރީ ސީޒަން ޕާސް." },
    time: minutesAgo(64),
    read: false,
    icon: "credit-card",
    variant: "success",
  },
  {
    id: "n3",
    category: "security",
    title: { en: "New sign-in from Addu City", dv: "އައްޑޫ ސިޓީން އައު ލޮގިނެއް" },
    body: {
      en: "Chrome on Android, 103.110.108.21. Was this you?",
      dv: "އެންޑްރޮއިޑްގެ ކްރޯމް، 103.110.108.21. މިއީ ތިބާތަ؟",
    },
    time: minutesAgo(60 * 5),
    read: false,
    icon: "lock",
    variant: "warning",
  },
  {
    id: "n4",
    category: "applications",
    title: { en: "Application APP-2026-00412 approved", dv: "APP-2026-00412 ޤަބޫލުކުރެވިއްޖެ" },
    body: { en: "Approved by Mohamed Naseem.", dv: "މުޙައްމަދު ނަސީމް ޤަބޫލުކޮށްފި." },
    time: minutesAgo(60 * 20),
    read: true,
    icon: "success",
    variant: "success",
  },
  {
    id: "n5",
    category: "payments",
    title: { en: "Refund failed for MVR 75.00", dv: "ރ. 75.00 އަނބުރާ ދިނުން ކާމިޔާބު ނުވި" },
    body: {
      en: "The card issuer declined the refund. Try again or refund by transfer.",
      dv: "ކާޑު ދޫކުރާ ފަރާތުން ރިފަންޑް ރައްދުކޮށްފި.",
    },
    time: minutesAgo(60 * 30),
    read: true,
    icon: "error",
    variant: "error",
  },
  {
    id: "n6",
    category: "system",
    title: { en: "Scheduled maintenance on Friday", dv: "ހުކުރު ދުވަހު މެއިންޓެނެންސް" },
    body: { en: "The portal will be offline from 01:00 to 03:00.", dv: "01:00 އިން 03:00 އަށް ޕޯޓަލް ނުހިނގާނެ." },
    time: minutesAgo(60 * 50),
    read: true,
    icon: "wrench",
    variant: "default",
  },
  {
    id: "n7",
    category: "security",
    title: { en: "API key “Reporting dashboard” expires soon", dv: "“Reporting dashboard” ކީގެ މުއްދަތު ހަމަވަނީ" },
    body: { en: "It expires on 31 December 2026.", dv: "31 ޑިސެމްބަރު 2026 ގައި މުއްދަތު ހަމަވާނެ." },
    time: minutesAgo(60 * 72),
    read: true,
    icon: "key",
    variant: "warning",
  },
]

export const categoryNames: Record<NotificationCategory, L10n> = {
  applications: { en: "Applications", dv: "އެޕްލިކޭޝަންތައް" },
  payments: { en: "Payments", dv: "ފައިސާ" },
  security: { en: "Security", dv: "ސެކިއުރިޓީ" },
  system: { en: "System", dv: "ސިސްޓަމް" },
}

export type Channel = "inApp" | "email" | "sms" | "push"

export const channelNames: Record<Channel, L10n> = {
  inApp: { en: "In the app", dv: "އެޕްގައި" },
  email: { en: "Email", dv: "އީމެއިލް" },
  sms: { en: "SMS", dv: "އެސްއެމްއެސް" },
  push: { en: "Push", dv: "ޕުޝް" },
}

export const preferenceEvents: { id: string; category: NotificationCategory; label: L10n; description: L10n }[] = [
  {
    id: "application.submitted",
    category: "applications",
    label: { en: "New application", dv: "އައު އެޕްލިކޭޝަން" },
    description: { en: "When a citizen submits an application", dv: "ރައްޔިތަކު އެޕްލިކޭޝަނެއް ހުށަހަޅާއިރު" },
  },
  {
    id: "application.assigned",
    category: "applications",
    label: { en: "Assigned to me", dv: "އަޅުގަނޑަށް ހަވާލުކުރުން" },
    description: { en: "When an application is assigned to you", dv: "އެޕްލިކޭޝަނެއް ތިބާއަށް ހަވާލުކުރާއިރު" },
  },
  {
    id: "payment.received",
    category: "payments",
    label: { en: "Payment received", dv: "ފައިސާ ލިބުން" },
    description: { en: "Every successful payment", dv: "ކޮންމެ ފައިސާ ދެއްކުމެއް" },
  },
  {
    id: "payment.failed",
    category: "payments",
    label: { en: "Payment or refund failed", dv: "ފައިސާ ނުވަތަ ރިފަންޑް ނާކާމިޔާބު" },
    description: { en: "Failures that need action", dv: "ފިޔަވަޅު އަޅަންޖެހޭ މައްސަލަ" },
  },
  {
    id: "security.sign_in",
    category: "security",
    label: { en: "New sign-in", dv: "އައު ލޮގިން" },
    description: { en: "A sign-in from a new device", dv: "އައު ޑިވައިސްއަކުން ލޮގިންވުން" },
  },
  {
    id: "system.maintenance",
    category: "system",
    label: { en: "Maintenance", dv: "މެއިންޓެނެންސް" },
    description: { en: "Planned downtime", dv: "ރޭވިފައިވާ ހުއްޓުން" },
  },
]

export const initialPreferences: Record<string, Record<Channel, boolean>> = {
  "application.submitted": { inApp: true, email: false, sms: false, push: true },
  "application.assigned": { inApp: true, email: true, sms: false, push: true },
  "payment.received": { inApp: true, email: false, sms: false, push: false },
  "payment.failed": { inApp: true, email: true, sms: true, push: true },
  "security.sign_in": { inApp: true, email: true, sms: true, push: false },
  "system.maintenance": { inApp: true, email: true, sms: false, push: false },
}

// ---------------------------------------------------------------------------
// Profile

export const sessions = [
  {
    id: "s1",
    device: "Chrome on macOS",
    location: { en: "Malé, Maldives", dv: "މާލެ، ދިވެހިރާއްޖެ" },
    ip: "103.31.84.12",
    lastActive: minutesAgo(0),
    current: true,
    icon: "monitor",
  },
  {
    id: "s2",
    device: "Safari on iPhone",
    location: { en: "Hulhumalé, Maldives", dv: "ހުޅުމާލެ، ދިވެހިރާއްޖެ" },
    ip: "103.110.108.4",
    lastActive: minutesAgo(95),
    current: false,
    icon: "phone",
  },
  {
    id: "s3",
    device: "Chrome on Android",
    location: { en: "Addu City, Maldives", dv: "އައްޑޫ ސިޓީ، ދިވެހިރާއްޖެ" },
    ip: "103.110.108.21",
    lastActive: minutesAgo(60 * 5),
    current: false,
    icon: "phone",
  },
  {
    id: "s4",
    device: "Edge on Windows",
    location: { en: "Kulhudhuffushi, Maldives", dv: "ކުޅުދުއްފުށި، ދިވެހިރާއްޖެ" },
    ip: "27.114.130.77",
    lastActive: minutesAgo(60 * 24 * 6),
    current: false,
    icon: "monitor",
  },
]
