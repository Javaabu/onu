import type { DataTableColumn, FilterDefinition } from "@javaabu/onu"

/** Mock Maldivian records shared by the listing demos. */
export interface Person {
  id: string
  name: string
  nameDv: string
  email: string
  island: string
  status: "active" | "pending" | "banned"
  role: "admin" | "editor" | "viewer"
  balance: number
  created: string
}

const FIRST = ["Aishath", "Mariyam", "Fathimath", "Ahmed", "Mohamed", "Ibrahim", "Hussain", "Aminath", "Hawwa", "Ali"]
const FIRST_DV = [
  "އައިޝަތު",
  "މަރިޔަމް",
  "ފާތިމަތު",
  "އަޙްމަދު",
  "މުޙައްމަދު",
  "އިބްރާހީމް",
  "ޙުސައިން",
  "އާމިނަތު",
  "ޙައްވާ",
  "ޢަލީ",
]
const LAST = ["Hassan", "Rasheed", "Nazeer", "Manik", "Didi", "Waheed", "Shareef", "Saeed", "Latheef", "Zahir"]
const LAST_DV = ["ޙަސަން", "ރަޝީދު", "ނަޒީރު", "މަނިކު", "ދީދީ", "ވަޙީދު", "ޝަރީފް", "ސަޢީދު", "ލަޠީފް", "ޒާހިރު"]
export const ISLANDS = [
  "Malé",
  "Hulhumalé",
  "Villimalé",
  "Addu City",
  "Fuvahmulah",
  "Kulhudhuffushi",
  "Thinadhoo",
  "Naifaru",
  "Eydhafushi",
]
const STATUSES = ["active", "active", "active", "pending", "banned"] as const
const ROLES = ["viewer", "viewer", "editor", "admin"] as const

export const people: Person[] = Array.from({ length: 312 }, (_, i) => {
  const f = i % FIRST.length
  const l = Math.floor(i / FIRST.length) % LAST.length
  return {
    id: String(i + 1),
    name: `${FIRST[f]} ${LAST[l]}`,
    nameDv: `${FIRST_DV[f]} ${LAST_DV[l]}`,
    email: `${(FIRST[f] as string).toLowerCase()}.${(LAST[l] as string).toLowerCase()}${i}@gov.mv`,
    island: ISLANDS[i % ISLANDS.length] as string,
    status: STATUSES[i % STATUSES.length] as Person["status"],
    role: ROLES[i % ROLES.length] as Person["role"],
    balance: ((i * 7919) % 50000) / 2,
    created: `2026-${String((i % 9) + 1).padStart(2, "0")}-${String((i % 28) + 1).padStart(2, "0")}`,
  }
})

export const mvr = new Intl.NumberFormat("en-MV", { style: "currency", currency: "MVR" })

export const statusLabel: Record<Person["status"], string> = { active: "Active", pending: "Pending", banned: "Banned" }

export const personFilters: FilterDefinition[] = [
  {
    type: "select",
    key: "status",
    label: "Status",
    options: [
      { value: "active", label: "Active" },
      { value: "pending", label: "Pending" },
      { value: "banned", label: "Banned" },
    ],
  },
  { type: "select", key: "island", label: "Island", options: ISLANDS.map((i) => ({ value: i, label: i })) },
  {
    type: "date-range",
    key: "created",
    label: "Date",
    fields: [
      { value: "created_at", label: "Created" },
      { value: "updated_at", label: "Updated" },
    ],
  },
  { type: "boolean", key: "verified", label: "Verified email" },
  { type: "text", key: "email", label: "Email contains", placeholder: "gov.mv" },
  { type: "trashed", key: "trashed", label: "Deleted records" },
]

export const personFilterFns = {
  status: (p: Person, v: unknown) => (Array.isArray(v) ? v.includes(p.status) : p.status === v),
  island: (p: Person, v: unknown) => (Array.isArray(v) ? v.includes(p.island) : p.island === v),
  email: (p: Person, v: unknown) => p.email.includes(String(v)),
  created: (p: Person, v: unknown) => {
    const range = v as { from?: string; to?: string }
    return (!range.from || p.created >= range.from) && (!range.to || p.created <= range.to)
  },
}

export const noun = { one: "user", other: "users" }
export const nounDv = { one: "މީހާ", other: "މީހުން" }

export function personColumns(): DataTableColumn<Person>[] {
  return [
    { id: "name", header: "Name", sortable: true, primary: true },
    { id: "email", header: "Email", sortable: true },
    { id: "island", header: "Island", sortable: true },
    { id: "status", header: "Status", accessor: (p) => statusLabel[p.status] },
    { id: "balance", header: "Balance", numeric: true, sortable: true, cell: (p) => mvr.format(p.balance) },
  ]
}

export const wait = (ms = 700) => new Promise((resolve) => setTimeout(resolve, ms))
