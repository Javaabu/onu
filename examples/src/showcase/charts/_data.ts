// Mock data for the chart demos: realistic Maldivian figures (rounded, not official statistics).

/** Deterministic pseudo-random numbers so demos look the same on every load. */
export function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

export const arrivalsByMonth = [
  { month: "Jan", arrivals: 212400, target: 200000 },
  { month: "Feb", arrivals: 208900, target: 205000 },
  { month: "Mar", arrivals: 196300, target: 205000 },
  { month: "Apr", arrivals: 171200, target: 180000 },
  { month: "May", arrivals: 132800, target: 150000 },
  { month: "Jun", arrivals: 118400, target: 130000 },
  { month: "Jul", arrivals: 151700, target: 145000 },
  { month: "Aug", arrivals: 168200, target: 160000 },
  { month: "Sep", arrivals: 139500, target: 140000 },
  { month: "Oct", arrivals: 181100, target: 175000 },
  { month: "Nov", arrivals: 196800, target: 190000 },
  { month: "Dec", arrivals: 228600, target: 215000 },
]

export const fishCatch = [
  { month: "Jan", skipjack: 8400, yellowfin: 3100, reef: 900 },
  { month: "Feb", skipjack: 9100, yellowfin: 3400, reef: 950 },
  { month: "Mar", skipjack: 10200, yellowfin: 3900, reef: 1020 },
  { month: "Apr", skipjack: 9600, yellowfin: null, reef: 980 },
  { month: "May", skipjack: 7300, yellowfin: 2800, reef: 870 },
  { month: "Jun", skipjack: 6100, yellowfin: 2500, reef: 820 },
]

export const revenueByIsland = [
  { island: "Malé", revenue: 4820000, expenses: 3110000 },
  { island: "Hulhumalé", revenue: 2310000, expenses: 1640000 },
  { island: "Addu City", revenue: 1450000, expenses: 1220000 },
  { island: "Fuvahmulah", revenue: 860000, expenses: 710000 },
  { island: "Kulhudhuffushi", revenue: 790000, expenses: 640000 },
]

export const revenueByIslandDv = [
  { island: "މާލެ", revenue: 4820000, expenses: 3110000 },
  { island: "ހުޅުމާލެ", revenue: 2310000, expenses: 1640000 },
  { island: "އައްޑޫ ސިޓީ", revenue: 1450000, expenses: 1220000 },
  { island: "ފުވައްމުލައް", revenue: 860000, expenses: 710000 },
  { island: "ކުޅުދުއްފުށި", revenue: 790000, expenses: 640000 },
]

export const populationByAtoll = [
  { name: "Malé City", value: 211900 },
  { name: "Addu City", value: 34500 },
  { name: "Kaafu", value: 22400 },
  { name: "Haa Dhaalu", value: 20300 },
  { name: "Laamu", value: 13300 },
  { name: "Other atolls", value: 213100 },
]

export const applicationsByChannel = [
  { name: "eFaas portal", value: 6420 },
  { name: "Island council", value: 2190 },
  { name: "Walk-in", value: 1340 },
  { name: "Phone", value: 410 },
]

/** Daily airport arrivals for the 120 days before 1 Oct 2026, with a few missing days. */
export function dailyArrivals(days = 120) {
  const random = seeded(7)
  const end = new Date(2026, 9, 1)
  const rows: { date: Date; arrivals: number | null; departures: number | null }[] = []
  for (let i = days; i > 0; i--) {
    const date = new Date(end)
    date.setDate(end.getDate() - i)
    const season = 5200 + 1400 * Math.sin((i / days) * Math.PI * 2)
    const missing = i === 40 || i === 41 || i === 87
    rows.push({
      date,
      arrivals: missing ? null : Math.round(season + random() * 900),
      departures: missing ? null : Math.round(season - 300 + random() * 900),
    })
  }
  // Drop two days completely so `interval="day"` has a real gap to fill.
  return rows.filter((_, index) => index !== 60 && index !== 61)
}

export const weeklyApplications = [
  { day: "Sun", current: 412, previous: 380 },
  { day: "Mon", current: 538, previous: 471 },
  { day: "Tue", current: 497, previous: 502 },
  { day: "Wed", current: 561, previous: 489 },
  { day: "Thu", current: 604, previous: 515 },
  { day: "Fri", current: 122, previous: 140 },
  { day: "Sat", current: 289, previous: 301 },
]

export const monthlyCosts = [
  { month: "Jul", current: 182000, previous: 171500 },
  { month: "Aug", current: 176400, previous: 180200 },
  { month: "Sep", current: 169900, previous: 184700 },
]

export function trend(seed: number, length = 20, base = 100, swing = 20) {
  const random = seeded(seed)
  let value = base
  return Array.from({ length }, () => {
    value = Math.max(0, value + (random() - 0.45) * swing)
    return Math.round(value)
  })
}

type Polygon = { type: "Polygon"; coordinates: number[][][] }

function box(lng: number, lat: number, w: number, h: number): Polygon {
  return {
    type: "Polygon",
    coordinates: [
      [
        [lng, lat],
        [lng + w, lat],
        [lng + w, lat + h],
        [lng, lat + h],
        [lng, lat],
      ],
    ],
  }
}

/** Simplified atoll outlines (rough boxes, for the demo only). */
export const atollShapes = {
  type: "FeatureCollection" as const,
  features: [
    { type: "Feature" as const, properties: { id: "HA", name: "Haa Alifu" }, geometry: box(72.85, 6.85, 0.35, 0.55) },
    { type: "Feature" as const, properties: { id: "HDh", name: "Haa Dhaalu" }, geometry: box(72.9, 6.35, 0.35, 0.45) },
    { type: "Feature" as const, properties: { id: "R", name: "Raa" }, geometry: box(72.85, 5.35, 0.35, 0.55) },
    { type: "Feature" as const, properties: { id: "K", name: "Kaafu" }, geometry: box(73.35, 3.95, 0.35, 0.65) },
    { type: "Feature" as const, properties: { id: "MLE", name: "Malé City" }, geometry: box(73.48, 4.15, 0.08, 0.08) },
    { type: "Feature" as const, properties: { id: "L", name: "Laamu" }, geometry: box(73.35, 1.8, 0.3, 0.35) },
    { type: "Feature" as const, properties: { id: "GDh", name: "Gaafu Dhaalu" }, geometry: box(72.9, 0.2, 0.4, 0.45) },
    { type: "Feature" as const, properties: { id: "S", name: "Addu City" }, geometry: box(73.05, -0.7, 0.2, 0.15) },
  ],
}

export const atollPopulation = [
  { id: "HA", value: 13800 },
  { id: "HDh", value: 20300 },
  { id: "R", value: 16400 },
  { id: "K", value: 22400 },
  { id: "MLE", value: 211900 },
  { id: "L", value: 13300 },
  { id: "GDh", value: 9700 },
  { id: "S", value: 34500 },
]
