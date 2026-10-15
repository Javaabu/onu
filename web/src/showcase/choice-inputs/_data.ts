import type { ChoiceOption } from "@javaabu/onu"

export const atolls: ChoiceOption[] = [
  { value: "HA", label: "Haa Alif", description: "ހއ" },
  { value: "K", label: "Kaafu", description: "ކ" },
  { value: "AA", label: "Alif Alif", description: "އއ" },
  { value: "L", label: "Laamu", description: "ލ" },
  { value: "GDh", label: "Gaafu Dhaalu", description: "ގދ" },
  { value: "Gn", label: "Gnaviyani", description: "ޏ" },
  { value: "S", label: "Seenu", description: "ސ" },
]

export const islandsByAtoll: Record<string, ChoiceOption[]> = {
  HA: [
    { value: "dhidhdhoo", label: "Dhidhdhoo" },
    { value: "ihavandhoo", label: "Ihavandhoo" },
    { value: "kelaa", label: "Kelaa" },
  ],
  K: [
    { value: "male", label: "Malé" },
    { value: "hulhumale", label: "Hulhumalé" },
    { value: "villimale", label: "Villimalé" },
    { value: "maafushi", label: "Maafushi" },
    { value: "thulusdhoo", label: "Thulusdhoo" },
  ],
  AA: [
    { value: "rasdhoo", label: "Rasdhoo" },
    { value: "ukulhas", label: "Ukulhas" },
  ],
  L: [
    { value: "fonadhoo", label: "Fonadhoo" },
    { value: "gan-l", label: "Gan" },
  ],
  GDh: [
    { value: "thinadhoo", label: "Thinadhoo" },
    { value: "gadhdhoo", label: "Gadhdhoo" },
  ],
  Gn: [{ value: "fuvahmulah", label: "Fuvahmulah" }],
  S: [
    { value: "hithadhoo", label: "Hithadhoo" },
    { value: "feydhoo", label: "Feydhoo" },
    { value: "maradhoo", label: "Maradhoo" },
    { value: "meedhoo", label: "Meedhoo" },
  ],
}

export const islands: ChoiceOption[] = Object.entries(islandsByAtoll).flatMap(([atoll, list]) =>
  list.map((i) => ({ ...i, group: atolls.find((a) => a.value === atoll)?.label })),
)

export const dvIslands: ChoiceOption[] = [
  { value: "male", label: "މާލެ" },
  { value: "hulhumale", label: "ހުޅުމާލެ" },
  { value: "addu", label: "އައްޑޫ" },
  { value: "fuvahmulah", label: "ފުވައްމުލައް" },
  { value: "kulhudhuffushi", label: "ކުޅުދުއްފުށި" },
  { value: "thinadhoo", label: "ތިނަދޫ" },
]

export const ministries = [
  "Ministry of Education",
  "Ministry of Health",
  "Ministry of Finance",
  "Ministry of Housing",
  "Ministry of Tourism",
  "Ministry of Youth, Sports and Community Empowerment",
  "Ministry of Islamic Affairs",
  "Ministry of Fisheries and Ocean Resources",
]

export const permissions: ChoiceOption[] = [
  { value: "users.view", label: "View users" },
  { value: "users.create", label: "Create users" },
  { value: "users.edit", label: "Edit users" },
  { value: "users.delete", label: "Delete users", description: "Moves users to the trash" },
  { value: "applications.view", label: "View applications" },
  { value: "applications.approve", label: "Approve applications" },
  { value: "payments.view", label: "View payments" },
  { value: "payments.refund", label: "Refund payments" },
  { value: "settings.edit", label: "Edit settings" },
  { value: "root", label: "Super admin", disabled: true, description: "Assigned by Javaabu only" },
]

/** People for the API select demo, served by a fake Laravel paginator. */
const firstNames = [
  "Aishath",
  "Mohamed",
  "Fathimath",
  "Ahmed",
  "Mariyam",
  "Ibrahim",
  "Hawwa",
  "Hassan",
  "Aminath",
  "Ali",
]
const lastNames = ["Shifa", "Rasheed", "Nisha", "Ali", "Zahir", "Naseer", "Saeed", "Waheed", "Hussain", "Manik"]
export const people = firstNames.flatMap((f, i) =>
  lastNames.map((l, j) => ({
    id: i * 10 + j + 1,
    name: `${f} ${l}`,
    national_id: `A${String(100000 + (i * 10 + j) * 937).slice(0, 6)}`,
  })),
)

/**
 * A pretend Laravel endpoint: `GET /api/people?search=&page=&per_page=`.
 * Responds after a delay, like a real API, with `{ data, meta, links }`.
 */
export function fakePeopleApi(query: string, { page, signal }: { page: number; signal: AbortSignal }) {
  const perPage = 10
  return new Promise<unknown>((resolve, reject) => {
    const timer = setTimeout(() => {
      const q = query.toLowerCase()
      const matches = people.filter((p) => p.name.toLowerCase().includes(q) || p.national_id.toLowerCase().includes(q))
      const last = Math.max(1, Math.ceil(matches.length / perPage))
      resolve({
        data: matches.slice((page - 1) * perPage, page * perPage),
        meta: { current_page: page, last_page: last, per_page: perPage, total: matches.length },
        links: { next: page < last ? `/api/people?page=${page + 1}` : null },
      })
    }, 500)
    signal.addEventListener("abort", () => {
      clearTimeout(timer)
      reject(new DOMException("Aborted", "AbortError"))
    })
  })
}
