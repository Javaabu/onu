import type { MessageDict } from "../../i18n/types"
import type { input as en } from "../en/input"

export const input = {
  // Password
  showPassword: "ޕާސްވޯޑް ދައްކާ",
  capsLockOn: "ކެޕްސް ލޮކް ހުޅުވިފައި",
  strength: "ޕާސްވޯޑުގެ ވަރުގަދަކަން: {level}",
  strengthVeryWeak: "ވަރަށް ބަލި",
  strengthWeak: "ބަލި",
  strengthFair: "މެދުމިނުގެ",
  strengthGood: "ރަނގަޅު",
  strengthStrong: "ވަރުގަދަ",
  // Sensitive and copy
  reveal: "އަގު ދައްކާ",
  revealed: "އަގު ދައްކަނީ",
  concealed: "އަގު ފޮރުވިފައި",
  copy: "ކޮޕީކުރޭ",
  copied: "ކޮޕީކުރެވިއްޖެ",
  copyFailed: "ކޮޕީ ނުކުރެވުނު",
  // Number, quantity and unit
  increment: "އިތުރުކުރޭ",
  decrement: "މަދުކުރޭ",
  unit: "މިންވަރު",
  // Phone
  country: "ޤައުމު",
  phone: "ފޯނު ނަންބަރު",
  searchCountries: "ޤައުމު ހޯދާ",
  noCountries: "އެއްވެސް ޤައުމެއް ނުފެނުނު",
  international: "ބައިނަލްއަޤްވާމީ",
  // OTP
  otp: "އެއްފަހަރު ބޭނުންކުރާ ކޯޑު",
  // Slug
  slugAuto: "ސްލަގް އަމިއްލައަށް ހައްދާ",
  slugAutoOn: "ސްލަގް ހެދެނީ އަމިއްލައަށް",
  slugAutoOff: "ސްލަގް ބަދަލުކުރަނީ އަތުން",
  slugPreview: "ފެންނާނެ ގޮތް",
  // Autocomplete and tags
  suggestions: "ހުށަހެޅުންތައް",
  suggestionsCount: {
    zero: "އެއްވެސް ހުށަހެޅުމެއް ނެތް",
    one: "{count} ހުށަހެޅުމެއް ލިބެން އެބައޮތް",
    other: "{count} ހުށަހެޅުން ލިބެން އެބައޮތް",
  },
  loadingSuggestions: "ހުށަހެޅުންތައް ލޯޑުވަނީ…",
  suggestionsError: "ހުށަހެޅުންތައް ލޯޑު ނުކުރެވުނު",
  removeTag: "{tag} ނައްތާލާ",
  tagAdded: "{tag} އިތުރުކުރެވިއްޖެ",
  tagRemoved: "{tag} ނައްތާލެވިއްޖެ",
  tagLimit: {
    one: "އެންމެ ގިނަވެގެން {count} ޓެގް އިތުރުކުރެވޭނެ",
    other: "އެންމެ ގިނަވެގެން {count} ޓެގް އިތުރުކުރެވޭނެ",
  },
  // Colour picker
  pickColour: "ކުލައެއް ޚިޔާރުކުރޭ",
  colourArea: "ކުލައިގެ ފުރިހަމަކަމާއި އަލިކަން",
  hue: "ކުލަ",
  hex: "ހެކްސް ކުލަ",
  presets: "ތައްޔާރުކޮށްފައިވާ ކުލަތައް",
  noColour: "ކުލައެއް ނެތް",
  // Icon picker
  pickIcon: "އައިކަނެއް ޚިޔާރުކުރޭ",
  searchIcons: "އައިކަން ހޯދާ",
  noIcons: "އެއްވެސް އައިކަނެއް ނުފެނުނު",
  iconSet: "އައިކަން ސެޓް",
  allIconSets: "ހުރިހާ ސެޓެއް",
  recentIcons: "ފަހުން ބޭނުންކުރި",
  iconsCount: {
    zero: "އެއްވެސް އައިކަނެއް ނެތް",
    one: "{count} އައިކަން",
    other: "{count} އައިކަން",
  },
  noIcon: "އައިކަނެއް ނެތް",
  clearIcon: "އައިކަން ނައްތާލާ",
  // Signature pad
  signatureCanvas: "ސޮއިކުރާ ސަރަހައްދު. އިނގިލި، ޤަލަމް ނުވަތަ މައުސް ބޭނުންކޮށް ސޮއިކުރައްވާ، ނުވަތަ ނަން ލިޔުއްވާ.",
  signatureDraw: "ކުރަހާ",
  signatureType: "ލިޔޭ",
  signatureTypedName: "ފުރިހަމަ ނަން ލިޔުއްވާ",
  signatureUndo: "ފަހު ކުރެހުން ބާޠިލުކުރޭ",
  signatureClear: "ސޮއި ފޮހެލާ",
  signatureCleared: "ސޮއި ފޮހެލެވިއްޖެ",
  signatureCaptured: "ސޮއި ލިބިއްޖެ",
  signatureEmpty: "މަތީގައި ސޮއިކުރައްވާ",
  // QR code scanner
  scanStart: "ކެމެރާ ހުޅުވާ",
  scanStop: "ކެމެރާ ބަންދުކުރޭ",
  scanRequesting: "ކެމެރާ ބޭނުންކުރުމުގެ ހުއްދައަށް މަޑުކުރަނީ…",
  scanActive: "ކިއުއާރް ކޯޑާ ދިމާއަށް ކެމެރާ ހިފައްވާ",
  scanDenied:
    "ކެމެރާ ބޭނުންކުރުން ބްލޮކްކޮށްފައި. ބްރައުޒަރުގެ ސެޓިންގްސްއިން ހުއްދަ ދެއްވާ، ނުވަތަ ތިރީގައި ކޯޑު ލިޔުއްވާ.",
  scanNoCamera: "މި ޑިވައިސްގައި ކެމެރާއެއް ނުފެނުނު. ތިރީގައި ކޯޑު ލިޔުއްވާ.",
  scanUnsupported: "މި ބްރައުޒަރުން ކޯޑު ސްކޭން ނުކުރެވޭ. ތިރީގައި ކޯޑު ލިޔުއްވާ.",
  scanError: "ކެމެރާ ހުޅުވިއެއް ނުދިޔަ.",
  scanTorchOn: "ޓޯޗު ދިއްލާ",
  scanTorchOff: "ޓޯޗު ނިއްވާ",
  scanManual: "ކޯޑު އަތުން ލިޔުއްވާ",
  scanManualSubmit: "ކޯޑު ބޭނުންކުރޭ",
  scanFound: "ކޯޑު ސްކޭންކުރެވިއްޖެ: {value}",
  scanVideo: "ކެމެރާއިން ފެންނަ ގޮތް",
} satisfies Record<keyof typeof en, MessageDict[string]> & MessageDict
