import type { MessageDict } from "../../i18n/types"
import type { overlay as en } from "../en/overlay"

export const overlay = {
  close: "ބަންދުކުރޭ",
  confirmTitle: "ޔަޤީންތޯ؟",
  typeToConfirm: "ކަށަވަރުކުރުމަށް، ތިރީގައި “{text}” ޖައްސަވާ",
  working: "މަސައްކަތް ކުރަނީ…",
  confirmFailed: "ނުކުރެވުނު. އަލުން މަސައްކަތް ކޮށްލައްވާ.",
  commandPalette: "ކޮމާންޑް ޕެލެޓް",
  commandPaletteDescription: "ސަފްހާއެއް ނުވަތަ ކޮމާންޑެއް ހޯއްދަވާ",
  commandPlaceholder: "ކޮމާންޑެއް ލިޔުއްވާ ނުވަތަ ހޯއްދަވާ…",
  openCommandPalette: "ކޮމާންޑް ޕެލެޓް ހުޅުވާ",
  recent: "ފަހުން ބޭނުންކުރި",
  searching: "ހޯދަނީ…",
  searchFailed: "ހޯދުމުގައި މައްސަލައެއް ދިމާވެއްޖެ",
  results: { zero: "އެއްވެސް ނަތީޖާއެއް ނުފެނުނު", other: "ނަތީޖާ {count}" },
  hintNavigate: "ދަތުރުކުރުމަށް",
  hintSelect: "ޚިޔާރުކުރުމަށް",
  hintClose: "ބަންދުކުރުމަށް",
  moreActions: "އިތުރު ޢަމަލުތައް",
  moreInfo: "އިތުރު މަޢުލޫމާތު",
  expand: "ބޮޑުކުރޭ",
  collapse: "ކުޑަކުރޭ",
  loading: "ލޯޑުވަނީ…",
  pageLoading: "ސަފްހާ ލޯޑުވަނީ",
  progress: "ކުރިއެރުން",
} satisfies Record<keyof typeof en, MessageDict[string]> & MessageDict
