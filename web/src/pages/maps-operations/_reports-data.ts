// Mock data for the reports page (invented figures, not official statistics).

/** Deterministic pseudo-random numbers so the charts look the same on every load. */
function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

// A type alias (not an interface) so rows can be passed straight to the charts.
export type DailyApplications = {
  date: Date
  online: number
  counter: number
  revenue: number
}

/** Two years of daily applications up to 6 Oct 2026 (online and at counters), with MVR revenue. */
export const DAILY: DailyApplications[] = (() => {
  const rand = seeded(11)
  const end = new Date(2026, 9, 6)
  const rows: DailyApplications[] = []
  for (let i = 729; i >= 0; i--) {
    const date = new Date(end)
    date.setDate(end.getDate() - i)
    const weekend = date.getDay() === 5 || date.getDay() === 6 // Friday, Saturday
    const growth = 1 + (729 - i) / 1400
    const season = 1 + 0.18 * Math.sin(((date.getMonth() + 1) / 12) * Math.PI * 2)
    const online = Math.round((weekend ? 38 : 120) * growth * season * (0.85 + rand() * 0.3))
    const counter = weekend ? 0 : Math.round(64 * season * (0.8 + rand() * 0.4) * (2 - growth))
    rows.push({ date, online, counter, revenue: Math.round((online + counter) * (180 + rand() * 60)) })
  }
  return rows
})()

export const SERVICES = [
  { key: "trade", en: "Trade licence", dv: "ވިޔަފާރީގެ ލައިސަންސް", share: 0.27 },
  { key: "birth", en: "Birth certificate", dv: "އުފަން ސެޓްފިކެޓް", share: 0.23 },
  { key: "building", en: "Building permit", dv: "ބިނާކުރުމުގެ ހުއްދަ", share: 0.18 },
  { key: "passport", en: "Passport renewal", dv: "ޕާސްޕޯޓް އާކުރުން", share: 0.18 },
  { key: "vessel", en: "Vessel registration", dv: "އުޅަނދު ރަޖިސްޓްރީ", share: 0.14 },
]

export const CHANNELS = [
  { en: "eFaas portal", dv: "eFaas ޕޯޓަލް", share: 0.58 },
  { en: "Island council", dv: "ރަށު ކައުންސިލް", share: 0.21 },
  { en: "Counter", dv: "ކައުންޓަރު", share: 0.17 },
  { en: "Phone", dv: "ފޯނު", share: 0.04 },
]

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

/** Atolls with a share of applications and a simplified outline (rough boxes, demo only). */
export const ATOLLS = [
  { id: "MLE", en: "Malé City", dv: "މާލެ ސިޓީ", share: 0.46, geometry: box(73.48, 4.15, 0.08, 0.08) },
  { id: "S", en: "Addu City", dv: "އައްޑޫ ސިޓީ", share: 0.12, geometry: box(73.05, -0.7, 0.2, 0.15) },
  { id: "K", en: "Kaafu", dv: "ކާފު", share: 0.1, geometry: box(73.35, 3.95, 0.35, 0.65) },
  { id: "HDh", en: "Haa Dhaalu", dv: "ހާދަނު", share: 0.08, geometry: box(72.9, 6.35, 0.35, 0.45) },
  { id: "R", en: "Raa", dv: "ރާ", share: 0.07, geometry: box(72.85, 5.35, 0.35, 0.55) },
  { id: "HA", en: "Haa Alifu", dv: "ހާއަލިފު", share: 0.06, geometry: box(72.85, 6.85, 0.35, 0.55) },
  { id: "L", en: "Laamu", dv: "ލާމު", share: 0.06, geometry: box(73.35, 1.8, 0.3, 0.35) },
  { id: "GDh", en: "Gaafu Dhaalu", dv: "ގާފު ދާލު", share: 0.05, geometry: box(72.9, 0.2, 0.4, 0.45) },
]
