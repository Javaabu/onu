import type { LatLng } from "./types"

export interface MaldivesAtoll {
  /** Short administrative code, e.g. `K`, `HA`, `GDh`. */
  code: string
  /** English name, e.g. "Kaafu". */
  name: string
  /** Dhivehi abbreviation, e.g. "ކ". */
  dv: string
  /** Formal Dhivehi name, e.g. "މާލޭ އަތޮޅު". */
  dvName: string
  /** Approximate centre, for centring maps. */
  center: LatLng
}

/** Administrative atolls of the Maldives, north to south, plus Malé City. */
export const MALDIVES_ATOLLS: readonly MaldivesAtoll[] = [
  { code: "HA", name: "Haa Alif", dv: "ހއ", dvName: "ތިލަދުންމަތީ އުތުރުބުރި", center: { lat: 6.95, lng: 72.95 } },
  { code: "HDh", name: "Haa Dhaalu", dv: "ހދ", dvName: "ތިލަދުންމަތީ ދެކުނުބުރި", center: { lat: 6.6, lng: 73.05 } },
  { code: "Sh", name: "Shaviyani", dv: "ށ", dvName: "މިލަދުންމަޑުލު އުތުރުބުރި", center: { lat: 6.25, lng: 73.2 } },
  { code: "N", name: "Noonu", dv: "ނ", dvName: "މިލަދުންމަޑުލު ދެކުނުބުރި", center: { lat: 5.8, lng: 73.35 } },
  { code: "R", name: "Raa", dv: "ރ", dvName: "މާޅޮސްމަޑުލު އުތުރުބުރި", center: { lat: 5.6, lng: 72.95 } },
  { code: "B", name: "Baa", dv: "ބ", dvName: "މާޅޮސްމަޑުލު ދެކުނުބުރި", center: { lat: 5.15, lng: 73.05 } },
  { code: "Lh", name: "Lhaviyani", dv: "ޅ", dvName: "ފާދިއްޕޮޅު", center: { lat: 5.3, lng: 73.55 } },
  { code: "MLE", name: "Malé City", dv: "މާލެ", dvName: "މާލެ ސިޓީ", center: { lat: 4.1755, lng: 73.5093 } },
  { code: "K", name: "Kaafu", dv: "ކ", dvName: "މާލޭ އަތޮޅު", center: { lat: 4.3, lng: 73.5 } },
  { code: "AA", name: "Alif Alif", dv: "އއ", dvName: "އަރިއަތޮޅު އުތުރުބުރި", center: { lat: 4.05, lng: 72.9 } },
  { code: "ADh", name: "Alif Dhaal", dv: "އދ", dvName: "އަރިއަތޮޅު ދެކުނުބުރި", center: { lat: 3.65, lng: 72.85 } },
  { code: "V", name: "Vaavu", dv: "ވ", dvName: "ފެލިދެއަތޮޅު", center: { lat: 3.55, lng: 73.45 } },
  { code: "M", name: "Meemu", dv: "މ", dvName: "މުލަކަތޮޅު", center: { lat: 2.95, lng: 73.55 } },
  { code: "F", name: "Faafu", dv: "ފ", dvName: "ނިލަންދެއަތޮޅު އުތުރުބުރި", center: { lat: 3.25, lng: 72.95 } },
  { code: "Dh", name: "Dhaalu", dv: "ދ", dvName: "ނިލަންދެއަތޮޅު ދެކުނުބުރި", center: { lat: 2.85, lng: 72.95 } },
  { code: "Th", name: "Thaa", dv: "ތ", dvName: "ކޮޅުމަޑުލު", center: { lat: 2.35, lng: 73.15 } },
  { code: "L", name: "Laamu", dv: "ލ", dvName: "ހައްދުންމަތި", center: { lat: 1.85, lng: 73.4 } },
  { code: "GA", name: "Gaafu Alif", dv: "ގއ", dvName: "ހުވަދުއަތޮޅު އުތުރުބުރި", center: { lat: 0.55, lng: 73.3 } },
  { code: "GDh", name: "Gaafu Dhaalu", dv: "ގދ", dvName: "ހުވަދުއަތޮޅު ދެކުނުބުރި", center: { lat: 0.35, lng: 73.2 } },
  { code: "Gn", name: "Gnaviyani", dv: "ޏ", dvName: "ފުވައްމުލައް", center: { lat: -0.3, lng: 73.43 } },
  { code: "S", name: "Seenu", dv: "ސ", dvName: "އައްޑޫ އަތޮޅު", center: { lat: -0.65, lng: 73.15 } },
]

export function findAtoll(code: string | null | undefined) {
  return code ? MALDIVES_ATOLLS.find((a) => a.code === code) : undefined
}

/** `"K. Malé"` / `"ކ. މާލެ"` style short label for an atoll code in the given locale. */
export function atollLabel(atoll: MaldivesAtoll, localeCode: string) {
  return localeCode === "dv" ? `${atoll.dv}. ${atoll.dvName}` : `${atoll.code}. ${atoll.name}`
}
