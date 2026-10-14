import type {
  AddressIsland,
  HeatmapPoint,
  LatLng,
  LatLngBounds,
  PlaceResult,
  PolygonCollection,
  TrackPoint,
  ViewportMarker,
} from "@javaabu/onu/maps"

/** Inhabited islands used across the map demos (approximate positions). */
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
  { value: "dhidhdhoo", label: "Dhidhdhoo", dvLabel: "ދިއްދޫ", atoll: "HA", position: { lat: 6.8873, lng: 73.1139 } },
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

const wait = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const id = setTimeout(resolve, ms)
    signal.addEventListener("abort", () => {
      clearTimeout(id)
      reject(new DOMException("Aborted", "AbortError"))
    })
  })

/** A demo place search over ISLANDS (works without an API key). */
export async function searchIslands(query: string, { signal }: { signal: AbortSignal }): Promise<PlaceResult[]> {
  await wait(250, signal)
  const q = query.toLowerCase()
  return ISLANDS.filter((i) => i.label.toLowerCase().includes(q) || i.dvLabel?.includes(query)).map((i) => ({
    id: i.value,
    label: `${i.label} · ${i.dvLabel}`,
    description: `${i.atoll} atoll`,
    position: i.position!,
  }))
}

export const MALE: LatLng = { lat: 4.1755, lng: 73.5093 }

/**
 * Where the map demos open: Javaabu's office in Malé. The exact office
 * coordinates are not confirmed yet, so this is central Malé; replace it with
 * the office's position once known.
 */
export const JAVAABU_OFFICE: LatLng = MALE

/** Rough ward-style zones in Malé, for the polygon demo. */
export const ZONES: PolygonCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      id: "henveiru",
      properties: { name: "Henveiru" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [73.5085, 4.1762],
            [73.5175, 4.1762],
            [73.5175, 4.1705],
            [73.5085, 4.1705],
            [73.5085, 4.1762],
          ],
        ],
      },
    },
    {
      type: "Feature",
      id: "maafannu",
      properties: { name: "Maafannu" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [73.4985, 4.1785],
            [73.5065, 4.1785],
            [73.5065, 4.1715],
            [73.4985, 4.1715],
            [73.4985, 4.1785],
          ],
        ],
      },
    },
  ],
}

/** Ferry track Malé → Maafushi, one point per minute. */
export function ferryTrack(): TrackPoint[] {
  const start = Date.UTC(2026, 2, 12, 4, 30) // 09:30 MVT
  const legs: LatLng[] = [
    { lat: 4.1745, lng: 73.5125 },
    { lat: 4.165, lng: 73.52 },
    { lat: 4.12, lng: 73.525 },
    { lat: 4.05, lng: 73.515 },
    { lat: 3.99, lng: 73.5 },
    { lat: 3.948, lng: 73.492 },
  ]
  const points: TrackPoint[] = []
  let minute = 0
  for (let i = 1; i < legs.length; i++) {
    const a = legs[i - 1]!
    const b = legs[i]!
    for (let s = 0; s < 8; s++) {
      const t = s / 8
      points.push({ lat: a.lat + (b.lat - a.lat) * t, lng: a.lng + (b.lng - a.lng) * t, time: start + minute * 60_000 })
      minute++
    }
  }
  points.push({ ...legs[legs.length - 1]!, time: start + minute * 60_000 })
  return points
}

function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

/** Reported incidents around the capital, for the heatmap demo. */
export function incidents(): HeatmapPoint[] {
  const rand = seeded(42)
  const hubs = [
    { center: MALE, n: 120, spread: 0.006 },
    { center: { lat: 4.2105, lng: 73.5402 }, n: 70, spread: 0.008 },
    { center: { lat: 4.1748, lng: 73.4853 }, n: 25, spread: 0.003 },
  ]
  return hubs.flatMap((h) =>
    Array.from({ length: h.n }, () => ({
      position: {
        lat: h.center.lat + (rand() - 0.5) * h.spread * 2,
        lng: h.center.lng + (rand() - 0.5) * h.spread * 2,
      },
      weight: 1 + Math.round(rand() * 4),
    })),
  )
}

const CATEGORIES = [
  { name: "Clinic", dv: "ކްލިނިކް", tone: "destructive" as const },
  { name: "School", dv: "ސްކޫލް", tone: "info" as const },
  { name: "Mosque", dv: "މިސްކިތް", tone: "success" as const },
  { name: "Service centre", dv: "ސަރވިސް ސެންޓަރ", tone: "warning" as const },
]

/** ~400 points of interest across Kaafu and Malé, for the viewport demo. */
export const POIS: ViewportMarker[] = (() => {
  const rand = seeded(7)
  return Array.from({ length: 400 }, (_, i) => {
    const island = ISLANDS[Math.floor(rand() * 7)]!
    const c = CATEGORIES[i % CATEGORIES.length]!
    return {
      id: `poi-${i}`,
      title: `${c.name} ${i + 1}`,
      description: `${c.dv} · ${island.label}`,
      tone: c.tone,
      position: {
        lat: island.position!.lat + (rand() - 0.5) * 0.012,
        lng: island.position!.lng + (rand() - 0.5) * 0.012,
      },
    }
  })
})()

export async function fetchPois(bounds: LatLngBounds, { signal }: { zoom: number; signal: AbortSignal }) {
  await wait(400, signal)
  return POIS.filter(
    (p) =>
      p.position.lat <= bounds.north &&
      p.position.lat >= bounds.south &&
      p.position.lng >= bounds.west &&
      p.position.lng <= bounds.east,
  ).slice(0, 200)
}

export const POI_CATEGORIES = CATEGORIES
