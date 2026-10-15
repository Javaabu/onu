import type { ChoiceOption, StatusMap, UploadFn } from "@javaabu/onu"

import { useDv, useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"

/**
 * Mock data for the application, citizen portal and kiosk sample pages.
 * Every visible string is an `[English, Dhivehi]` pair, read with `tr(...pair)`.
 */
export type L = readonly [en: string, dv: string]

export const wait = (ms = 700) => new Promise((resolve) => setTimeout(resolve, ms))

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

const MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const MONTHS_DV = [
  "ޖެނުއަރީ",
  "ފެބުރުއަރީ",
  "މާރިޗު",
  "އޭޕްރީލް",
  "މޭ",
  "ޖޫން",
  "ޖުލައި",
  "އޯގަސްޓު",
  "ސެޕްޓެމްބަރު",
  "އޮކްޓޫބަރު",
  "ނޮވެމްބަރު",
  "ޑިސެމްބަރު",
]

const number = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/** Money and date formatters for the current language (Western digits in both, R12.6). */
export function useFormat() {
  const dv = useDv()
  const money = (amount: number) => (dv ? `ރ. ${number.format(amount)}` : `MVR ${number.format(amount)}`)
  const date = (iso: string) => {
    const d = new Date(iso)
    const month = (dv ? MONTHS_DV : MONTHS_EN)[d.getMonth()]
    return `${d.getDate()} ${month} ${d.getFullYear()}`
  }
  const dateTime = (iso: string) => {
    const d = new Date(iso)
    const time = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
    return `${date(iso)}, ${time}`
  }
  return { money, date, dateTime }
}

/** Fixed "now" for the mock data, so the sample pages render the same every time. */
export const TODAY = "2026-10-07T09:30:00"

// ---------------------------------------------------------------------------
// People and places
// ---------------------------------------------------------------------------

export const applicant = {
  name: ["Ahmed Ali", "އަޙްމަދު ޢަލީ"] as L,
  firstName: ["Ahmed", "އަޙްމަދު"] as L,
  idCard: "A123456",
  phone: "+9607771234",
  email: "ahmed.ali@example.mv",
  atoll: "K",
  island: "hulhumale",
  house: ["Lot 10234, Nirolhu Magu", "ލޮޓް 10234، ނިރޮޅު މަގު"] as L,
}

export const atolls: { value: string; label: L }[] = [
  { value: "HA", label: ["Haa Alif", "ހއ"] },
  { value: "K", label: ["Kaafu", "ކ"] },
  { value: "AA", label: ["Alif Alif", "އއ"] },
  { value: "L", label: ["Laamu", "ލ"] },
  { value: "GDh", label: ["Gaafu Dhaalu", "ގދ"] },
  { value: "Gn", label: ["Gnaviyani", "ޏ"] },
  { value: "S", label: ["Seenu", "ސ"] },
]

export const islandsByAtoll: Record<string, { value: string; label: L }[]> = {
  HA: [
    { value: "dhidhdhoo", label: ["Dhidhdhoo", "ދިއްދޫ"] },
    { value: "ihavandhoo", label: ["Ihavandhoo", "އިހަވަންދޫ"] },
  ],
  K: [
    { value: "male", label: ["Malé", "މާލެ"] },
    { value: "hulhumale", label: ["Hulhumalé", "ހުޅުމާލެ"] },
    { value: "villimale", label: ["Villimalé", "ވިލިމާލެ"] },
    { value: "maafushi", label: ["Maafushi", "މާފުށި"] },
  ],
  AA: [
    { value: "rasdhoo", label: ["Rasdhoo", "ރަސްދޫ"] },
    { value: "ukulhas", label: ["Ukulhas", "އުކުޅަސް"] },
  ],
  L: [
    { value: "fonadhoo", label: ["Fonadhoo", "ފޮނަދޫ"] },
    { value: "gan-l", label: ["Gan", "ގަން"] },
  ],
  GDh: [{ value: "thinadhoo", label: ["Thinadhoo", "ތިނަދޫ"] }],
  Gn: [{ value: "fuvahmulah", label: ["Fuvahmulah", "ފުވައްމުލައް"] }],
  S: [
    { value: "hithadhoo", label: ["Hithadhoo", "ހިތަދޫ"] },
    { value: "feydhoo", label: ["Feydhoo", "ފޭދޫ"] },
  ],
}

/** Atoll and island option lists in the current language. */
export function usePlaces() {
  const tr = useTr()
  const atollOptions: ChoiceOption[] = atolls.map((a) => ({ value: a.value, label: tr(...a.label) }))
  const islandOptions: Record<string, ChoiceOption[]> = Object.fromEntries(
    Object.entries(islandsByAtoll).map(([k, list]) => [
      k,
      list.map((i) => ({ value: i.value, label: tr(...i.label) })),
    ]),
  )
  const islandName = (value: string | null | undefined) => {
    for (const list of Object.values(islandsByAtoll)) {
      const found = list.find((i) => i.value === value)
      if (found) return tr(...found.label)
    }
    return ""
  }
  const atollName = (value: string | null | undefined) => {
    const found = atolls.find((a) => a.value === value)
    return found ? tr(...found.label) : ""
  }
  return { atollOptions, islandOptions, islandName, atollName }
}

// ---------------------------------------------------------------------------
// Applications
// ---------------------------------------------------------------------------

export type ApplicationStatus = "draft" | "submitted" | "in_review" | "needs_info" | "approved" | "rejected"

export function useApplicationStatuses(): StatusMap {
  const tr = useTr()
  return {
    draft: { tone: "neutral", label: tr("Draft", "ޑްރާފްޓް") },
    submitted: { tone: "info", label: tr("Submitted", "ހުށަހަޅާފައި") },
    in_review: { tone: "pending", label: tr("In review", "ރިވިއުކުރަނީ") },
    needs_info: { tone: "warning", label: tr("Action needed", "ޢަމަލެއް ކުރަން ޖެހޭ") },
    approved: { tone: "success", label: tr("Approved", "ފާސްކުރެވިފައި") },
    rejected: { tone: "danger", label: tr("Rejected", "ރިޖެކްޓްކުރެވިފައި") },
  }
}

export interface Application {
  id: string
  ref: string
  service: L
  status: ApplicationStatus
  submitted: string | null
  updated: string
  fee: number
}

export const applications: Application[] = [
  {
    id: "1",
    ref: "APP-2026-00412",
    service: ["Business licence (new)", "ވިޔަފާރީގެ ލައިސަންސް (އާ)"],
    status: "needs_info",
    submitted: "2026-09-29T10:12:00",
    updated: "2026-10-05T14:20:00",
    fee: 350,
  },
  {
    id: "2",
    ref: "APP-2026-00398",
    service: ["Building permit", "ބިނާކުރުމުގެ ހުއްދަ"],
    status: "in_review",
    submitted: "2026-09-21T09:05:00",
    updated: "2026-10-02T11:00:00",
    fee: 1250,
  },
  {
    id: "3",
    ref: "APP-2026-00377",
    service: ["Vessel registration", "އުޅަނދު ރަޖިސްޓްރީ"],
    status: "approved",
    submitted: "2026-08-30T13:40:00",
    updated: "2026-09-12T08:45:00",
    fee: 500,
  },
  {
    id: "4",
    ref: "APP-2026-00352",
    service: ["Tourist guesthouse licence", "ގެސްޓްހައުސް ލައިސަންސް"],
    status: "rejected",
    submitted: "2026-08-11T15:15:00",
    updated: "2026-08-25T10:30:00",
    fee: 2000,
  },
  {
    id: "5",
    ref: "APP-2026-00431",
    service: ["Road closure permit", "މަގު ބަންދުކުރުމުގެ ހުއްދަ"],
    status: "draft",
    submitted: null,
    updated: "2026-10-06T19:02:00",
    fee: 150,
  },
  {
    id: "6",
    ref: "APP-2026-00301",
    service: ["Food handler card", "ކާބޯތަކެތި ހިފާ މީހުންގެ ކާޑު"],
    status: "approved",
    submitted: "2026-07-02T09:00:00",
    updated: "2026-07-09T12:10:00",
    fee: 100,
  },
  {
    id: "7",
    ref: "APP-2026-00289",
    service: ["Business name reservation", "ވިޔަފާރީގެ ނަން ރިޒާވްކުރުން"],
    status: "approved",
    submitted: "2026-06-18T10:30:00",
    updated: "2026-06-19T09:00:00",
    fee: 50,
  },
  {
    id: "8",
    ref: "APP-2026-00426",
    service: ["Hulhumalé parking permit", "ހުޅުމާލޭގެ ޕާކިންގ ހުއްދަ"],
    status: "submitted",
    submitted: "2026-10-04T08:15:00",
    updated: "2026-10-04T08:15:00",
    fee: 300,
  },
]

// ---------------------------------------------------------------------------
// Payments
// ---------------------------------------------------------------------------

export type PaymentStatus = "due" | "overdue" | "paid" | "verifying"

export function usePaymentStatuses(): StatusMap {
  const tr = useTr()
  return {
    due: { tone: "warning", label: tr("Due", "ދައްކަން ޖެހޭ") },
    overdue: { tone: "danger", label: tr("Overdue", "ފަހަނައަޅާފައި") },
    paid: { tone: "success", label: tr("Paid", "ދައްކާފައި") },
    verifying: { tone: "pending", label: tr("Verifying transfer", "ޓްރާންސްފަރ ޗެކްކުރަނީ") },
  }
}

export interface Payment {
  id: string
  ref: string
  description: L
  amount: number
  status: PaymentStatus
  due: string
  paid?: string
  method?: L
}

export const payments: Payment[] = [
  {
    id: "1",
    ref: "INV-2026-11873",
    description: ["Business licence fee · APP-2026-00412", "ވިޔަފާރީގެ ލައިސަންސް ފީ · APP-2026-00412"],
    amount: 350,
    status: "due",
    due: "2026-10-14T00:00:00",
  },
  {
    id: "2",
    ref: "INV-2026-11702",
    description: ["Hulhumalé parking permit · APP-2026-00426", "ޕާކިންގ ހުއްދަ · APP-2026-00426"],
    amount: 300,
    status: "overdue",
    due: "2026-10-01T00:00:00",
  },
  {
    id: "3",
    ref: "INV-2026-11544",
    description: ["Building permit fee · APP-2026-00398", "ބިނާކުރުމުގެ ހުއްދަ ފީ · APP-2026-00398"],
    amount: 1250,
    status: "verifying",
    due: "2026-09-28T00:00:00",
    paid: "2026-09-22T10:02:00",
    method: ["BML Transfer", "ބީއެމްއެލް ޓްރާންސްފަރ"],
  },
  {
    id: "4",
    ref: "INV-2026-11309",
    description: ["Vessel registration fee · APP-2026-00377", "އުޅަނދު ރަޖިސްޓްރީ ފީ · APP-2026-00377"],
    amount: 500,
    status: "paid",
    due: "2026-09-05T00:00:00",
    paid: "2026-08-30T13:52:00",
    method: ["BML Connect (card)", "ބީއެމްއެލް ކަނެކްޓް (ކާޑު)"],
  },
  {
    id: "5",
    ref: "INV-2026-10966",
    description: ["Food handler card fee · APP-2026-00301", "ފުޑް ހޭންޑްލަރ ކާޑު ފީ · APP-2026-00301"],
    amount: 100,
    status: "paid",
    due: "2026-07-10T00:00:00",
    paid: "2026-07-02T09:06:00",
    method: ["BML Connect (card)", "ބީއެމްއެލް ކަނެކްޓް (ކާޑު)"],
  },
  {
    id: "6",
    ref: "INV-2026-10731",
    description: ["Business name reservation · APP-2026-00289", "ވިޔަފާރީގެ ނަން ރިޒާވްކުރުން · APP-2026-00289"],
    amount: 50,
    status: "paid",
    due: "2026-06-25T00:00:00",
    paid: "2026-06-18T10:41:00",
    method: ["BML Transfer", "ބީއެމްއެލް ޓްރާންސްފަރ"],
  },
]

/** The order paid on the checkout, receipt and kiosk pages. */
export const order = {
  ref: "INV-2026-11873",
  application: "APP-2026-00412",
  items: [
    { label: ["Business licence (new), 1 year", "ވިޔަފާރީގެ ލައިސަންސް (އާ)، 1 އަހަރު"] as L, amount: 300 },
    { label: ["Express processing", "އަވަސް ޚިދުމަތް"] as L, amount: 50 },
  ],
  total: 350,
  receipt: "RCT-2026-08841",
  transaction: "BMLC-7F3A91C2",
  paidAt: "2026-10-07T09:42:00",
}

// ---------------------------------------------------------------------------
// Documents
// ---------------------------------------------------------------------------

export interface PortalDocument {
  id: string
  name: string
  title: L
  category: "identity" | "certificates" | "receipts"
  size: number
  added: string
  kind: "image" | "pdf"
}

export const documents: PortalDocument[] = [
  {
    id: "1",
    name: "id-card-front.jpg",
    title: ["National ID card (front)", "ދިވެހި ރައްޔިތެއްކަން އަންގައިދޭ ކާޑު (ކުރިމަތި)"],
    category: "identity",
    size: 412_000,
    added: "2026-09-29T10:05:00",
    kind: "image",
  },
  {
    id: "2",
    name: "id-card-back.jpg",
    title: ["National ID card (back)", "ދިވެހި ރައްޔިތެއްކަން އަންގައިދޭ ކާޑު (ފަހަތް)"],
    category: "identity",
    size: 398_000,
    added: "2026-09-29T10:06:00",
    kind: "image",
  },
  {
    id: "3",
    name: "passport-photo.jpg",
    title: ["Passport photo", "ޕާސްޕޯޓް ފޮޓޯ"],
    category: "identity",
    size: 186_000,
    added: "2026-08-30T13:20:00",
    kind: "image",
  },
  {
    id: "4",
    name: "vessel-registration-certificate.pdf",
    title: ["Vessel registration certificate", "އުޅަނދު ރަޖިސްޓްރީ ސެޓްފިކެޓް"],
    category: "certificates",
    size: 240_000,
    added: "2026-09-12T08:45:00",
    kind: "pdf",
  },
  {
    id: "5",
    name: "food-handler-card.pdf",
    title: ["Food handler card", "ފުޑް ހޭންޑްލަރ ކާޑު"],
    category: "certificates",
    size: 128_000,
    added: "2026-07-09T12:10:00",
    kind: "pdf",
  },
  {
    id: "6",
    name: "receipt-RCT-2026-07731.pdf",
    title: ["Receipt RCT-2026-07731", "ރަސީދު RCT-2026-07731"],
    category: "receipts",
    size: 64_000,
    added: "2026-08-30T13:52:00",
    kind: "pdf",
  },
]

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export interface PortalNotification {
  id: string
  category: "applications" | "payments" | "announcements"
  title: L
  body: L
  time: string
  read: boolean
  href?: string
}

export const notifications: PortalNotification[] = [
  {
    id: "1",
    category: "applications",
    title: ["Document requested for APP-2026-00412", "APP-2026-00412 އަށް ލިޔުމެއް ހުށަހަޅަން އެދިފައި"],
    body: [
      "Upload a signed lease agreement by 19 October to keep your application open.",
      "އެޕްލިކޭޝަން ހުޅުވާލުމަށް 19 އޮކްޓޫބަރުގެ ކުރިން ކުލި އެއްބަސްވުން އަޕްލޯޑްކުރައްވާ.",
    ],
    time: "2026-10-05T14:20:00",
    read: false,
    href: routes.applications.statusTracker,
  },
  {
    id: "2",
    category: "payments",
    title: ["Parking permit fee is overdue", "ޕާކިންގ ހުއްދައިގެ ފީ ފަހަނައަޅާފައި"],
    body: ["Pay MVR 300.00 for invoice INV-2026-11702.", "INV-2026-11702 އަށް ރ. 300.00 ދައްކަވާ."],
    time: "2026-10-02T08:00:00",
    read: false,
    href: routes.applications.checkout,
  },
  {
    id: "3",
    category: "announcements",
    title: ["Service centres closed on 11 November", "ނޮވެމްބަރު 11 ގައި ސަރވިސް ސެންޓަރުތައް ބަންދު"],
    body: [
      "Independence Day holiday. Online services stay open.",
      "މިނިވަންކަމުގެ ދުވަހުގެ ބަންދު. އޮންލައިން ޚިދުމަތްތައް ހުޅުވިފައި.",
    ],
    time: "2026-10-01T09:00:00",
    read: false,
  },
  {
    id: "4",
    category: "applications",
    title: ["Building permit is in review", "ބިނާކުރުމުގެ ހުއްދަ ރިވިއުކުރަނީ"],
    body: ["APP-2026-00398 was assigned to a reviewer.", "APP-2026-00398 ރިވިއުކުރާ މުވައްޒަފަކާ ހަވާލުކުރެވިއްޖެ."],
    time: "2026-09-25T11:00:00",
    read: true,
    href: routes.applications.statusTracker,
  },
  {
    id: "5",
    category: "payments",
    title: ["Payment received: MVR 500.00", "ފައިސާ ލިބިއްޖެ: ރ. 500.00"],
    body: ["Receipt RCT-2026-07731 for vessel registration.", "އުޅަނދު ރަޖިސްޓްރީގެ ރަސީދު RCT-2026-07731."],
    time: "2026-08-30T13:52:00",
    read: true,
    href: routes.applications.receipt,
  },
  {
    id: "6",
    category: "applications",
    title: ["Vessel registration approved", "އުޅަނދު ރަޖިސްޓްރީ ފާސްކުރެވިއްޖެ"],
    body: ["Your certificate is ready to download.", "ސެޓްފިކެޓް ޑައުންލޯޑްކުރެވޭނެ."],
    time: "2026-09-12T08:45:00",
    read: true,
    href: routes.applications.certificate,
  },
  {
    id: "7",
    category: "announcements",
    title: ["New: renew your passport online", "އައު: ޕާސްޕޯޓް އޮންލައިންކޮށް އާކުރެވޭނެ"],
    body: ["Passport renewals are now available on eServices.", "ޕާސްޕޯޓް އާކުރުން މިހާރު އީ ސަރވިސަސްގައި."],
    time: "2026-09-01T10:00:00",
    read: true,
  },
]

// ---------------------------------------------------------------------------
// Fake files
// ---------------------------------------------------------------------------

/** A placeholder picture as an SVG data URI (no network). Colours are picture content, not UI. */
export function picture(label: string, hue: number, w = 800, h = 520) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="${w}" height="${h}" rx="24" fill="hsl(${hue} 45% 92%)"/>
  <rect x="40" y="40" width="${w * 0.28}" height="${h * 0.62}" rx="12" fill="hsl(${hue} 30% 78%)"/>
  <circle cx="${40 + w * 0.14}" cy="${40 + h * 0.24}" r="${h * 0.12}" fill="hsl(${hue} 25% 62%)"/>
  <rect x="${w * 0.4}" y="70" width="${w * 0.5}" height="22" rx="6" fill="hsl(${hue} 25% 70%)"/>
  <rect x="${w * 0.4}" y="120" width="${w * 0.4}" height="18" rx="6" fill="hsl(${hue} 20% 78%)"/>
  <rect x="${w * 0.4}" y="160" width="${w * 0.44}" height="18" rx="6" fill="hsl(${hue} 20% 78%)"/>
  <text x="${w / 2}" y="${h - 40}" font-family="sans-serif" font-size="30" text-anchor="middle" fill="hsl(${hue} 30% 30%)">${label}</text>
</svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

/** A one-page PDF as a data URI. */
export const samplePdf =
  "data:application/pdf;base64,JVBERi0xLjQKMSAwIG9iajw8L1R5cGUvQ2F0YWxvZy9QYWdlcyAyIDAgUj4+ZW5kb2JqCjIgMCBvYmo8PC9UeXBlL1BhZ2VzL0tpZHNbMyAwIFJdL0NvdW50IDE+PmVuZG9iagozIDAgb2JqPDwvVHlwZS9QYWdlL1BhcmVudCAyIDAgUi9NZWRpYUJveFswIDAgMjAwIDIwMF0+PmVuZG9iagp0cmFpbGVyPDwvUm9vdCAxIDAgUj4+CiUlRU9G"

/** URL for a mock document (image or PDF). */
export function documentUrl(doc: { name: string; kind: "image" | "pdf" }, hue = 200) {
  return doc.kind === "image" ? picture(doc.name, hue) : samplePdf
}

/**
 * A pretend upload with progress that resolves with a Laravel-style resource.
 * Files with "fail" in the name are rejected.
 */
export const fakeUpload: UploadFn = (file, { onProgress, signal }) =>
  new Promise((resolve, reject) => {
    let progress = 0
    const timer = setInterval(() => {
      progress = Math.min(100, progress + 15 + Math.round(Math.random() * 15))
      onProgress(progress)
      if (progress >= 100) {
        clearInterval(timer)
        if (/fail/i.test(file.name)) reject(new Error("The file could not be scanned. Please try another file."))
        else resolve({ data: { id: Math.round(Math.random() * 100000), name: file.name } })
      }
    }, 200)
    signal.addEventListener("abort", () => {
      clearInterval(timer)
      reject(new DOMException("Aborted", "AbortError"))
    })
  })

/** Throws a Laravel 422-shaped error when `errors` has any keys. */
export function throwIfInvalid(errors: Record<string, string[]>) {
  if (Object.keys(errors).length) {
    throw { message: "The given data was invalid.", errors }
  }
}

/** True when the search text is empty or appears in any of the values (case-insensitive). */
export function matchesAny(search: string, values: string[]) {
  const q = search.trim().toLocaleLowerCase()
  return !q || values.some((v) => v.toLocaleLowerCase().includes(q))
}
