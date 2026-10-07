import * as React from "react"
import type { StatusMap } from "@javaabu/onu"

import { useDv } from "../_shared/i18n"
import { routes } from "../_shared/routes"

/**
 * Mock permit applications for the "Admin: records" sample pages.
 *
 * The records live in a tiny module-level store, so changes made on one page
 * (approve, delete, restore, move on the board) show up on the others while
 * the showcase stays open.
 */

export type ApplicationStatus = "submitted" | "in_review" | "approved" | "rejected" | "suspended"

export interface Application {
  id: string
  reference: string
  name: string
  nameDv: string
  idCard: string
  phone: string
  email: string
  island: string
  service: string
  status: ApplicationStatus
  amount: number
  submitted: string
  updated: string
  assignee: string | null
  address: string | null
  remarks: string | null
  documents: number
  deletedAt?: string | null
}

export interface Labelled {
  value: string
  en: string
  dv: string
}

export const ISLANDS: (Labelled & { atoll: string })[] = [
  { value: "male", en: "Malé", dv: "މާލެ", atoll: "K." },
  { value: "hulhumale", en: "Hulhumalé", dv: "ހުޅުމާލެ", atoll: "K." },
  { value: "villimale", en: "Villimalé", dv: "ވިލިމާލެ", atoll: "K." },
  { value: "addu", en: "Addu City", dv: "އައްޑޫ ސިޓީ", atoll: "S." },
  { value: "fuvahmulah", en: "Fuvahmulah", dv: "ފުވައްމުލައް", atoll: "Gn." },
  { value: "kulhudhuffushi", en: "Kulhudhuffushi", dv: "ކުޅުދުއްފުށި", atoll: "HDh." },
  { value: "thinadhoo", en: "Thinadhoo", dv: "ތިނަދޫ", atoll: "GDh." },
  { value: "naifaru", en: "Naifaru", dv: "ނައިފަރު", atoll: "Lh." },
  { value: "eydhafushi", en: "Eydhafushi", dv: "އޭދަފުށި", atoll: "B." },
  { value: "thulusdhoo", en: "Thulusdhoo", dv: "ތުލުސްދޫ", atoll: "K." },
]

export const SERVICES: (Labelled & { fee: number })[] = [
  { value: "building", en: "Building permit", dv: "ބިނާކުރުމުގެ ހުއްދަ", fee: 2500 },
  { value: "business", en: "Business registration", dv: "ވިޔަފާރި ރަޖިސްޓްރީ", fee: 500 },
  { value: "land", en: "Land lease", dv: "ބިން ކުއްޔަށް ދިނުން", fee: 7500 },
  { value: "vessel", en: "Vessel registration", dv: "އުޅަނދު ރަޖިސްޓްރީ", fee: 1200 },
  { value: "event", en: "Event permit", dv: "ހަރަކާތެއް ބޭއްވުމުގެ ހުއްދަ", fee: 250 },
  { value: "trade", en: "Trade licence", dv: "ވިޔަފާރީގެ ލައިސަންސް", fee: 1000 },
]

export const STATUSES: (Labelled & { value: ApplicationStatus })[] = [
  { value: "submitted", en: "Submitted", dv: "ހުށަހެޅި" },
  { value: "in_review", en: "In review", dv: "ރިވިއުކުރަނީ" },
  { value: "approved", en: "Approved", dv: "ފާސްކުރެވިފަ" },
  { value: "rejected", en: "Rejected", dv: "ރިޖެކްޓްކުރެވިފަ" },
  { value: "suspended", en: "Suspended", dv: "ހުއްޓާލެވިފަ" },
]

export const STAFF: Labelled[] = [
  { value: "shifa", en: "Aishath Shifa", dv: "އައިޝަތު ޝިފާ" },
  { value: "nazeer", en: "Ibrahim Nazeer", dv: "އިބްރާހީމް ނަޒީރު" },
  { value: "rasheed", en: "Mariyam Rasheed", dv: "މަރިޔަމް ރަޝީދު" },
  { value: "waheed", en: "Hussain Waheed", dv: "ޙުސައިން ވަޙީދު" },
]

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
const LAST = ["Hassan", "Rasheed", "Nazeer", "Manik", "Didi", "Waheed", "Shareef", "Saeed", "Latheef", "Zahir", "Moosa"]
const LAST_DV = [
  "ޙަސަން",
  "ރަޝީދު",
  "ނަޒީރު",
  "މަނިކު",
  "ދީދީ",
  "ވަޙީދު",
  "ޝަރީފް",
  "ސަޢީދު",
  "ލަޠީފް",
  "ޒާހިރު",
  "މޫސާ",
]
const HOUSES = ["Rose Villa", "Blue Lagoon", "Maafanu Fehi", "Henveiru Kurangi", "Sunny Side", "Galolhu Dhoshimeyna"]
const STATUS_CYCLE: ApplicationStatus[] = [
  "submitted",
  "in_review",
  "approved",
  "submitted",
  "in_review",
  "approved",
  "rejected",
  "approved",
  "suspended",
]

const pad = (n: number, w = 2) => String(n).padStart(w, "0")

/** A date `days` before 7 October 2026, as `yyyy-MM-dd`. */
function daysAgo(days: number) {
  const d = new Date(Date.UTC(2026, 9, 7) - days * 86_400_000)
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`
}

function make(i: number): Application {
  const f = i % FIRST.length
  const l = (i * 7) % LAST.length
  const service = SERVICES[i % SERVICES.length]!
  const submittedAgo = (i * 13) % 120
  const n = 1000 + i
  return {
    id: String(n),
    reference: `APP-2026-${pad(n, 6)}`,
    name: `${FIRST[f]} ${LAST[l]}`,
    nameDv: `${FIRST_DV[f]} ${LAST_DV[l]}`,
    idCard: `A${pad(100000 + ((i * 7919) % 899999), 6)}`,
    phone: `+960 7${pad((i * 37) % 100)}-${pad((i * 53) % 100)}${pad((i * 71) % 100)}`,
    email: `${FIRST[f]!.toLowerCase()}.${LAST[l]!.toLowerCase()}${i % 50}@gmail.com`,
    island: ISLANDS[(i * 3) % ISLANDS.length]!.value,
    service: service.value,
    status: STATUS_CYCLE[(i + Math.floor(i / 6)) % STATUS_CYCLE.length]!,
    amount: service.fee + ((i * 37) % 4) * 250,
    submitted: daysAgo(submittedAgo),
    updated: daysAgo(Math.max(0, submittedAgo - ((i * 5) % 9))),
    assignee: i % 5 === 3 ? null : STAFF[i % STAFF.length]!.value,
    address: i % 6 === 4 ? null : `${HOUSES[i % HOUSES.length]}, ${ISLANDS[(i * 3) % ISLANDS.length]!.en}`,
    remarks: i % 3 === 0 ? "Site visit requested before approval." : null,
    documents: 2 + (i % 4),
    deletedAt: null,
  }
}

function seed(): Application[] {
  const list = Array.from({ length: 156 }, (_, i) => make(i))
  // A handful of records start in the trash.
  for (const i of [11, 29, 47, 68, 90, 121, 140]) list[i] = { ...list[i]!, deletedAt: daysAgo((i % 9) + 1) }
  // The record the show/edit pages open by default.
  list[42] = {
    ...list[42]!,
    name: "Aishath Shiuna",
    nameDv: "އައިޝަތު ޝިއުނާ",
    email: "shiuna@gmail.com",
    status: "in_review",
    service: "building",
    island: "hulhumale",
    amount: 2750,
    address: "Rose Villa, Hulhumalé",
    remarks: null,
  }
  return list
}

// ---------------------------------------------------------------------------
// Store

let records: Application[] = seed()
const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** Every record, including trashed ones. */
export function useAllApplications() {
  return React.useSyncExternalStore(
    subscribe,
    () => records,
    () => records,
  )
}

/** Records not in the trash. */
export function useApplications() {
  const all = useAllApplications()
  return React.useMemo(() => all.filter((a) => !a.deletedAt), [all])
}

export function useTrashedApplications() {
  const all = useAllApplications()
  return React.useMemo(() => all.filter((a) => a.deletedAt), [all])
}

export function setApplications(update: (prev: Application[]) => Application[]) {
  records = update(records)
  listeners.forEach((l) => l())
}

export function updateApplication(id: string, patch: Partial<Application>) {
  setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch, updated: TODAY } : a)))
}

export function trashApplications(ids: string[]) {
  setApplications((prev) => prev.map((a) => (ids.includes(a.id) ? { ...a, deletedAt: TODAY } : a)))
}

export function restoreApplications(ids: string[]) {
  setApplications((prev) => prev.map((a) => (ids.includes(a.id) ? { ...a, deletedAt: null } : a)))
}

export function forceDeleteApplications(ids: string[]) {
  setApplications((prev) => prev.filter((a) => !ids.includes(a.id)))
}

export function addApplication(data: Omit<Application, "id" | "reference">) {
  const n = Math.max(...records.map((a) => Number(a.id))) + 1
  const record: Application = { ...data, id: String(n), reference: `APP-2026-${pad(n, 6)}` }
  setApplications((prev) => [record, ...prev])
  return record
}

export const TODAY = "2026-10-07"
export const DEFAULT_ID = "1042"

export const wait = (ms = 700) => new Promise((resolve) => setTimeout(resolve, ms))

// ---------------------------------------------------------------------------
// Links

export const showHref = (id: string) => `${routes.adminRecords.show}?id=${id}`
export const showTabsHref = (id: string, tab?: string) =>
  `${routes.adminRecords.showTabs}?id=${id}${tab ? `&tab=${tab}` : ""}`
export const editHref = (id: string) => `${routes.adminRecords.edit}?id=${id}`

// ---------------------------------------------------------------------------
// Labels

const MONTHS_DV = [
  "ޖަނަވަރީ",
  "ފެބްރުއަރީ",
  "މާރިޗު",
  "އޭޕްރީލް",
  "މެއި",
  "ޖޫން",
  "ޖުލައި",
  "އޯގަސްޓު",
  "ސެޕްޓެމްބަރު",
  "އޮކްޓޫބަރު",
  "ނޮވެމްބަރު",
  "ޑިސެމްބަރު",
]
const MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

const pick = (list: Labelled[], value: string | null | undefined, dv: boolean) => {
  const item = list.find((x) => x.value === value)
  return item ? (dv ? item.dv : item.en) : ""
}

/** Locale-aware labels and formatters for application fields. */
export function useLabels() {
  const dv = useDv()
  return React.useMemo(() => {
    const statusMap: StatusMap = {
      submitted: { tone: "info", label: pick(STATUSES, "submitted", dv), icon: "send" },
      in_review: { tone: "pending", label: pick(STATUSES, "in_review", dv) },
      approved: { tone: "success", label: pick(STATUSES, "approved", dv) },
      rejected: { tone: "danger", label: pick(STATUSES, "rejected", dv) },
      suspended: { tone: "warning", label: pick(STATUSES, "suspended", dv), icon: "pause" },
    }
    const options = (list: Labelled[]) => list.map((x) => ({ value: x.value, label: dv ? x.dv : x.en }))
    return {
      dv,
      name: (a: Pick<Application, "name" | "nameDv">) => (dv ? a.nameDv : a.name),
      island: (v: string | null | undefined) => {
        const i = ISLANDS.find((x) => x.value === v)
        return i ? `${i.atoll} ${dv ? i.dv : i.en}` : ""
      },
      service: (v: string | null | undefined) => pick(SERVICES, v, dv),
      status: (v: string | null | undefined) => pick(STATUSES, v, dv),
      staff: (v: string | null | undefined) => pick(STAFF, v, dv),
      statusMap,
      options: {
        islands: options(ISLANDS),
        services: options(SERVICES),
        statuses: options(STATUSES),
        staff: options(STAFF),
      },
      mvr: (n: number) =>
        `${dv ? "ރ." : "MVR"} ${n.toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      date: (iso: string | null | undefined) => {
        if (!iso) return ""
        const [y, m, d] = iso.slice(0, 10).split("-").map(Number)
        return dv ? `${d} ${MONTHS_DV[m! - 1]} ${y}` : `${d} ${MONTHS_EN[m! - 1]} ${y}`
      },
      noun: dv ? { one: "އެޕްލިކޭޝަން", other: "އެޕްލިކޭޝަން" } : { one: "application", other: "applications" },
    }
  }, [dv])
}

export type Labels = ReturnType<typeof useLabels>

/** Fields searched by the index pages. */
export const searchFields = (a: Application) => [a.reference, a.name, a.nameDv, a.idCard, a.email, a.phone]

/** Filter functions for `applyListingState`. */
export const filterFns = {
  status: (a: Application, v: unknown) => (Array.isArray(v) ? v.includes(a.status) : a.status === v),
  island: (a: Application, v: unknown) => (Array.isArray(v) ? v.includes(a.island) : a.island === v),
  service: (a: Application, v: unknown) => (Array.isArray(v) ? v.includes(a.service) : a.service === v),
  assignee: (a: Application, v: unknown) =>
    Array.isArray(v) ? v.includes(a.assignee ?? "none") : (a.assignee ?? "none") === v,
  unassigned: (a: Application, v: unknown) => (v === "1" ? !a.assignee : v === "0" ? !!a.assignee : true),
  date: (a: Application, v: unknown) => {
    const range = v as { field?: string; from?: string; to?: string }
    const value = range.field === "updated" ? a.updated : a.submitted
    return (!range.from || value >= range.from) && (!range.to || value <= range.to)
  },
}

/** Mock activity entries for a record. */
export function recordActivity(a: Application, labels: Labels, tr: (en: string, dv: string) => string) {
  const staff = STAFF.find((s) => s.value === a.assignee) ?? STAFF[0]!
  const staffName = labels.dv ? staff.dv : staff.en
  return [
    {
      id: "a5",
      actor: { name: staffName },
      action: tr(`changed the status to ${labels.status(a.status)}`, `ސްޓޭޓަސް ބަދަލުކުރީ: ${labels.status(a.status)}`),
      timestamp: `${a.updated}T10:24:00`,
    },
    {
      id: "a4",
      actor: { name: staffName },
      action: tr("added a note", "ނޯޓެއް ލިޔުއްވައިފި"),
      detail: tr("Site visit requested before approval.", "ފާސްކުރުމުގެ ކުރިން ސައިޓް ވިޒިޓެއް ބޭނުންވޭ."),
      timestamp: `${a.updated}T09:02:00`,
    },
    {
      id: "a3",
      icon: "attachment",
      action: tr("Land ownership document uploaded", "ބިމުގެ މިލްކިއްޔާތުގެ ލިޔުން އަޕްލޯޑްކުރެވިއްޖެ"),
      timestamp: `${a.submitted}T16:40:00`,
    },
    {
      id: "a2",
      icon: "credit-card",
      action: tr(`Payment received: ${labels.mvr(a.amount)}`, `ފައިސާ ލިބިއްޖެ: ${labels.mvr(a.amount)}`),
      timestamp: `${a.submitted}T11:15:00`,
    },
    {
      id: "a1",
      actor: { name: labels.name(a) },
      action: tr("submitted the application", "އެޕްލިކޭޝަން ހުށަހެޅުއްވި"),
      timestamp: `${a.submitted}T11:02:00`,
    },
  ]
}

/** A small text file to download in place of real documents. */
export const SAMPLE_FILE = `data:text/plain;charset=utf-8,${encodeURIComponent("Sample document from the Onu showcase.")}`
