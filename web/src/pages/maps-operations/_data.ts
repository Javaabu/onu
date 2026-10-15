// Mock data for the maps and operations sample pages (approximate positions, invented vessels and figures).
import type { AddressIsland, LatLng, PlaceResult } from "@javaabu/onu/maps"

export const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

// ---------------------------------------------------------------- Islands

export const ISLANDS: AddressIsland[] = [
  { value: "male", label: "Malé", dvLabel: "މާލެ", atoll: "MLE", position: { lat: 4.1755, lng: 73.5093 } },
  {
    value: "hulhumale",
    label: "Hulhumalé",
    dvLabel: "ހުޅުމާލެ",
    atoll: "MLE",
    position: { lat: 4.2105, lng: 73.5402 },
  },
  {
    value: "villimale",
    label: "Villimalé",
    dvLabel: "ވިލިމާލެ",
    atoll: "MLE",
    position: { lat: 4.1748, lng: 73.4853 },
  },
  { value: "maafushi", label: "Maafushi", dvLabel: "މާފުށި", atoll: "K", position: { lat: 3.942, lng: 73.49 } },
  { value: "guraidhoo", label: "Guraidhoo", dvLabel: "ގުރައިދޫ", atoll: "K", position: { lat: 3.8995, lng: 73.47 } },
  {
    value: "himmafushi",
    label: "Himmafushi",
    dvLabel: "ހިންމަފުށި",
    atoll: "K",
    position: { lat: 4.3086, lng: 73.5698 },
  },
  {
    value: "thulusdhoo",
    label: "Thulusdhoo",
    dvLabel: "ތުލުސްދޫ",
    atoll: "K",
    position: { lat: 4.3744, lng: 73.6505 },
  },
  { value: "rasdhoo", label: "Rasdhoo", dvLabel: "ރަސްދޫ", atoll: "AA", position: { lat: 4.263, lng: 72.992 } },
  {
    value: "mahibadhoo",
    label: "Mahibadhoo",
    dvLabel: "މަހިބަދޫ",
    atoll: "ADh",
    position: { lat: 3.757, lng: 72.969 },
  },
  { value: "felidhoo", label: "Felidhoo", dvLabel: "ފެލިދޫ", atoll: "V", position: { lat: 3.471, lng: 73.547 } },
  { value: "naifaru", label: "Naifaru", dvLabel: "ނައިފަރު", atoll: "Lh", position: { lat: 5.444, lng: 73.366 } },
  {
    value: "eydhafushi",
    label: "Eydhafushi",
    dvLabel: "އޭދަފުށި",
    atoll: "B",
    position: { lat: 5.1036, lng: 73.0705 },
  },
  {
    value: "kulhudhuffushi",
    label: "Kulhudhuffushi",
    dvLabel: "ކުޅުދުއްފުށި",
    atoll: "HDh",
    position: { lat: 6.6223, lng: 73.07 },
  },
  { value: "fonadhoo", label: "Fonadhoo", dvLabel: "ފޮނަދޫ", atoll: "L", position: { lat: 1.8336, lng: 73.5011 } },
  { value: "thinadhoo", label: "Thinadhoo", dvLabel: "ތިނަދޫ", atoll: "GDh", position: { lat: 0.5303, lng: 72.9967 } },
  {
    value: "fuvahmulah",
    label: "Fuvahmulah",
    dvLabel: "ފުވައްމުލައް",
    atoll: "Gn",
    position: { lat: -0.2989, lng: 73.424 },
  },
  { value: "hithadhoo", label: "Hithadhoo", dvLabel: "ހިތަދޫ", atoll: "S", position: { lat: -0.6094, lng: 73.0891 } },
]

/** A keyless place search over ISLANDS (try "Maafushi" or "ހިތަދޫ"). */
export async function searchIslands(query: string, { signal }: { signal: AbortSignal }): Promise<PlaceResult[]> {
  await new Promise<void>((resolve, reject) => {
    const id = setTimeout(resolve, 250)
    signal.addEventListener("abort", () => {
      clearTimeout(id)
      reject(new DOMException("Aborted", "AbortError"))
    })
  })
  const q = query.toLowerCase()
  return ISLANDS.filter((i) => i.label.toLowerCase().includes(q) || i.dvLabel?.includes(query)).map((i) => ({
    id: i.value,
    label: `${i.label} · ${i.dvLabel}`,
    description: `${i.atoll}`,
    position: i.position!,
  }))
}

// ---------------------------------------------------------------- Fleet

export type VesselStatus = "underway" | "docked" | "alert"
export type VesselType = "ferry" | "speedboat" | "dhoni" | "cargo"

export interface Vessel {
  id: string
  name: string
  dvName: string
  type: VesselType
  registration: string
  status: VesselStatus
  position: LatLng
  heading: number
  /** Knots. */
  speed: number
  destination: string
  dvDestination: string
  captain: string
  dvCaptain: string
  passengers: number
  capacity: number
}

export const VESSELS: Vessel[] = [
  {
    id: "v1",
    name: "Ferry Raajje",
    dvName: "ފެރީ ރާއްޖެ",
    type: "ferry",
    registration: "P-4471-K",
    status: "underway",
    position: { lat: 4.12, lng: 73.52 },
    heading: 185,
    speed: 11.5,
    destination: "Maafushi",
    dvDestination: "މާފުށި",
    captain: "Ibrahim Rasheed",
    dvCaptain: "އިބްރާހީމް ރަޝީދު",
    passengers: 84,
    capacity: 120,
  },
  {
    id: "v2",
    name: "Speedboat Kandu",
    dvName: "ސްޕީޑްބޯޓް ކަނޑު",
    type: "speedboat",
    registration: "P-2093-K",
    status: "underway",
    position: { lat: 4.26, lng: 73.58 },
    heading: 40,
    speed: 24,
    destination: "Thulusdhoo",
    dvDestination: "ތުލުސްދޫ",
    captain: "Mohamed Shiyam",
    dvCaptain: "މުޙައްމަދު ޝިޔާމް",
    passengers: 18,
    capacity: 30,
  },
  {
    id: "v3",
    name: "Dhoni Hiyala",
    dvName: "ދޯނި ހިޔާލަ",
    type: "dhoni",
    registration: "P-0817-MLE",
    status: "docked",
    position: { lat: 4.1757, lng: 73.5166 },
    heading: 90,
    speed: 0,
    destination: "Malé ferry terminal",
    dvDestination: "މާލެ ފެރީ ޓާމިނަލް",
    captain: "Hassan Waheed",
    dvCaptain: "ޙަސަން ވަޙީދު",
    passengers: 0,
    capacity: 45,
  },
  {
    id: "v4",
    name: "Cargo Fehi",
    dvName: "ކާގޯ ފެހި",
    type: "cargo",
    registration: "C-1156-K",
    status: "alert",
    position: { lat: 4.05, lng: 73.43 },
    heading: 230,
    speed: 3.2,
    destination: "Guraidhoo",
    dvDestination: "ގުރައިދޫ",
    captain: "Ali Nashid",
    dvCaptain: "ޢަލީ ނާޝިދު",
    passengers: 4,
    capacity: 6,
  },
  {
    id: "v5",
    name: "Ferry Hulhangu",
    dvName: "ފެރީ ހުޅަނގު",
    type: "ferry",
    registration: "P-3310-MLE",
    status: "underway",
    position: { lat: 4.195, lng: 73.528 },
    heading: 30,
    speed: 9.8,
    destination: "Hulhumalé",
    dvDestination: "ހުޅުމާލެ",
    captain: "Aminath Shaheema",
    dvCaptain: "އާމިނަތު ޝަހީމާ",
    passengers: 102,
    capacity: 150,
  },
  {
    id: "v6",
    name: "Dhoni Dhiyares",
    dvName: "ދޯނި ދިޔަރެސް",
    type: "dhoni",
    registration: "P-0552-K",
    status: "docked",
    position: { lat: 4.3086, lng: 73.5698 },
    heading: 0,
    speed: 0,
    destination: "Himmafushi",
    dvDestination: "ހިންމަފުށި",
    captain: "Ahmed Faisal",
    dvCaptain: "އަޙްމަދު ފައިޞަލް",
    passengers: 0,
    capacity: 40,
  },
]

/** Moves every vessel that is under way one step along its heading (a fake GPS feed). */
export function stepVessels(vessels: Vessel[], seconds: number): Vessel[] {
  return vessels.map((v) => {
    if (v.status === "docked" || v.speed === 0) return v
    // 1 knot ≈ 1/60 degree of latitude per hour.
    const deg = (v.speed / 60 / 3600) * seconds * 6 // sped up ×6 so the demo visibly moves
    const rad = (v.heading * Math.PI) / 180
    const heading = (v.heading + (Math.random() - 0.5) * 16 + 360) % 360
    const speed = Math.max(1, +(v.speed + (Math.random() - 0.5) * 0.8).toFixed(1))
    return {
      ...v,
      heading,
      speed,
      position: { lat: v.position.lat + Math.cos(rad) * deg, lng: v.position.lng + Math.sin(rad) * deg },
    }
  })
}

// ---------------------------------------------------------------- Zones

export type ZoneType = "waste" | "parking" | "mooring"

export interface Zone {
  id: string
  name: string
  dvName: string
  type: ZoneType
  /** Collection or patrol day. */
  day: string
  /** Lng/lat ring, closed. */
  ring: [number, number][]
}

const rect = (lng: number, lat: number, w: number, h: number): [number, number][] => [
  [lng, lat],
  [lng + w, lat],
  [lng + w, lat - h],
  [lng, lat - h],
  [lng, lat],
]

export const ZONES: Zone[] = [
  {
    id: "z1",
    name: "Henveiru waste zone",
    dvName: "ހެންވޭރު ކުނި ސަރަހައްދު",
    type: "waste",
    day: "sun",
    ring: rect(73.5085, 4.1762, 0.009, 0.0057),
  },
  {
    id: "z2",
    name: "Maafannu waste zone",
    dvName: "މާފަންނު ކުނި ސަރަހައްދު",
    type: "waste",
    day: "mon",
    ring: rect(73.4985, 4.1785, 0.008, 0.007),
  },
  {
    id: "z3",
    name: "Galolhu parking zone",
    dvName: "ގަލޮޅު ޕާކިން ސަރަހައްދު",
    type: "parking",
    day: "tue",
    ring: [
      [73.5065, 4.1712],
      [73.5125, 4.1712],
      [73.5135, 4.1678],
      [73.507, 4.1672],
      [73.5065, 4.1712],
    ],
  },
  {
    id: "z4",
    name: "Harbour mooring area",
    dvName: "ބަނދަރުގެ ދޯނި ބަނދެވޭ ސަރަހައްދު",
    type: "mooring",
    day: "wed",
    ring: [
      [73.5055, 4.1808],
      [73.5175, 4.1808],
      [73.5175, 4.1785],
      [73.5055, 4.1785],
      [73.5055, 4.1808],
    ],
  },
]

// ---------------------------------------------------------------- Route planner

export const SPEEDS: Record<VesselType, number> = { speedboat: 25, ferry: 11, dhoni: 8, cargo: 6 }
/** MVR per nautical mile, fuel and crew. */
export const COST_PER_NM: Record<VesselType, number> = { speedboat: 95, ferry: 60, dhoni: 32, cargo: 48 }

// ---------------------------------------------------------------- Location categories

export const LOCATION_CATEGORIES = [
  { value: "health", label: "Health centre", dv: "ހެލްތު ސެންޓަރު" },
  { value: "school", label: "School", dv: "ސްކޫލް" },
  { value: "council", label: "Council office", dv: "ކައުންސިލް އޮފީސް" },
  { value: "harbour", label: "Harbour", dv: "ބަނދަރު" },
  { value: "service", label: "Service centre", dv: "ސަރވިސް ސެންޓަރު" },
]
