import type { MediaItem, TreeNode } from "@javaabu/onu"
import type { JSONContent, TranslationEntry } from "@javaabu/onu/editor"

/** A string in English and Dhivehi. */
export interface L10n {
  en: string
  dv: string
}

export const wait = (ms = 700) => new Promise((resolve) => setTimeout(resolve, ms))

/** An illustrative scene as an SVG data URI (no network needed). Colours are picture content, not UI. */
export function scene(label: string, hue: number, w = 1200, h = 800) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="hsl(${hue} 70% 72%)"/>
      <stop offset="1" stop-color="hsl(${hue + 30} 80% 88%)"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#sky)"/>
  <circle cx="${w * 0.75}" cy="${h * 0.3}" r="${h * 0.1}" fill="hsl(45 100% 70%)"/>
  <path d="M0 ${h * 0.68} Q ${w * 0.25} ${h * 0.6} ${w * 0.5} ${h * 0.68} T ${w} ${h * 0.66} V ${h} H 0 Z" fill="hsl(190 70% 45%)"/>
  <path d="M0 ${h * 0.8} Q ${w * 0.3} ${h * 0.74} ${w * 0.6} ${h * 0.8} T ${w} ${h * 0.78} V ${h} H 0 Z" fill="hsl(45 60% 82%)"/>
  <text x="${w / 2}" y="${h * 0.93}" font-family="sans-serif" font-size="${h * 0.06}" text-anchor="middle" fill="hsl(200 40% 20%)">${label}</text>
</svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

// ---------------------------------------------------------------------------
// Post editor

export type PostValues = {
  title: string
  slug: string
  excerpt: string
  body: string
  categories: string[]
  tags: string[]
  metaTitle: string
  metaDescription: string
  status: string
  visibility: string
  publishAt: Date | null
}

export const initialPost: PostValues = {
  title: "Hulhumalé ferry schedule changes from 1 November",
  slug: "hulhumale-ferry-schedule-changes",
  excerpt:
    "Ferries between Malé and Hulhumalé will run every 15 minutes during peak hours, with two new late-night trips.",
  body: `<h2>What changes</h2>
<p>From <strong>1 November 2026</strong>, ferries between Malé and Hulhumalé run every 15 minutes between 07:00 and 09:00, and again between 16:00 and 19:00.</p>
<p>ނޮވެމްބަރު 1 ވަނަ ދުވަހުން ފެށިގެން، މާލެއާއި ހުޅުމާލެ ދެމެދު ދަތުރުކުރާ ފެރީތައް ގިނަ ބޭނުންކުރާ ގަޑިތަކުގައި ކޮންމެ 15 މިނިޓަކުން ދަތުރުކުރާނެ.</p>
<ul><li>Two new trips at 23:30 and 00:15</li><li>Fares stay at MVR 10.00 per trip</li></ul>
<p>Questions? Call <a href="tel:+9601414">1414</a>.</p>`,
  categories: ["transport", "announcements"],
  tags: ["Ferry", "Hulhumalé", "Malé"],
  metaTitle: "Hulhumalé ferry schedule from 1 November",
  metaDescription: "New peak-hour frequency and two late-night trips between Malé and Hulhumalé. Fares stay at MVR 10.",
  status: "draft",
  visibility: "public",
  publishAt: null,
}

export const categoryTree = (t: (s: L10n) => string): TreeNode[] => [
  {
    id: "news",
    label: t({ en: "News", dv: "ޚަބަރު" }),
    icon: "folder",
    children: [
      { id: "announcements", label: t({ en: "Announcements", dv: "އިޢުލާނު" }) },
      { id: "press-releases", label: t({ en: "Press releases", dv: "ނޫސް ބަޔާން" }) },
    ],
  },
  {
    id: "services",
    label: t({ en: "Services", dv: "ޚިދުމަތްތައް" }),
    icon: "folder",
    children: [
      { id: "transport", label: t({ en: "Transport", dv: "ދަތުރުފަތުރު" }) },
      { id: "housing", label: t({ en: "Housing", dv: "ހިޔާވަހިކަން" }) },
      { id: "health", label: t({ en: "Health", dv: "ސިއްޚަތު" }) },
    ],
  },
  { id: "events", label: t({ en: "Events", dv: "ހަރަކާތްތައް" }), icon: "folder" },
]

export const tagSuggestions = [
  "Ferry",
  "Hulhumalé",
  "Malé",
  "Villimalé",
  "Addu City",
  "Tourism",
  "Fisheries",
  "Health",
  "Budget 2027",
]

// ---------------------------------------------------------------------------
// Page builder

const text = (value: string, marks?: JSONContent["marks"]): JSONContent => ({ type: "text", text: value, marks })
const paragraph = (...content: JSONContent[]): JSONContent => ({ type: "paragraph", content })

export const aboutPage: JSONContent = {
  type: "doc",
  content: [
    { type: "heading", attrs: { level: 2 }, content: [text("Getting around the atoll")] },
    paragraph(
      text("Addu is the southernmost atoll of the Maldives, home to "),
      text("Hithadhoo", [{ type: "bold" }]),
      text(", Maradhoo and Feydhoo."),
    ),
    { type: "heading", attrs: { level: 3 }, content: [text("އައްޑޫ ސިޓީއަށް ދަތުރުކުރުން")] },
    paragraph(text("އައްޑޫ ސިޓީއަކީ ދިވެހިރާއްޖޭގެ އެންމެ ދެކުނުގައި އޮތް އަތޮޅު.")),
    {
      type: "callout",
      attrs: { variant: "info" },
      content: [text("Ferries from Gan to Hithadhoo run every 30 minutes until 22:00.")],
    },
    {
      type: "bulletList",
      content: [
        { type: "listItem", content: [paragraph(text("Gan Island causeway"))] },
        { type: "listItem", content: [paragraph(text("ކޯއްޓެ ބީޗް"))] },
      ],
    },
    {
      type: "table",
      content: [
        {
          type: "tableRow",
          content: [
            { type: "tableHeader", content: [paragraph(text("Island"))] },
            { type: "tableHeader", content: [paragraph(text("Population"))] },
          ],
        },
        {
          type: "tableRow",
          content: [
            { type: "tableCell", content: [paragraph(text("Hithadhoo"))] },
            { type: "tableCell", content: [paragraph(text("12,000"))] },
          ],
        },
        {
          type: "tableRow",
          content: [
            { type: "tableCell", content: [paragraph(text("Feydhoo"))] },
            { type: "tableCell", content: [paragraph(text("3,800"))] },
          ],
        },
      ],
    },
    { type: "horizontalRule" },
    paragraph(text("Contact the council on "), text("+960 689-8000", [{ type: "bold" }]), text(".")),
  ],
}

// ---------------------------------------------------------------------------
// Media library

export type MediaKind = "image" | "document" | "video" | "audio"

export interface LibraryItem extends MediaItem {
  title: L10n
  kind: MediaKind
  uploadedBy: string
  uploadedAt: string
  width?: number
  height?: number
  usedIn: number
}

const people = ["Aishath Shifa", "Mohamed Naseem", "Mariyam Zahir", "Ahmed Rasheed"]

const imageSeeds: [string, string, number, number, number][] = [
  ["maafushi-beach.jpg", "Maafushi beach", 200, 1600, 1067],
  ["fuvahmulah-sunset.jpg", "Fuvahmulah sunset", 15, 1200, 1600],
  ["hulhumale-skyline.jpg", "Hulhumalé skyline", 210, 2000, 1333],
  ["addu-causeway.jpg", "Addu City causeway", 170, 1800, 1350],
  ["hanifaru-bay.jpg", "Hanifaru Bay", 185, 1100, 1500],
  ["thoddoo-farms.jpg", "Thoddoo farmland", 120, 1600, 1067],
  ["male-harbour.jpg", "Malé harbour", 195, 1600, 900],
  ["villimale-park.jpg", "Villimalé park", 140, 1200, 800],
  ["kulhudhuffushi-mangroves.jpg", "Kulhudhuffushi mangroves", 160, 1600, 1067],
  ["naifaru-jetty.jpg", "Naifaru jetty", 205, 1400, 933],
]

const docSeeds: [string, string, string, MediaKind, number][] = [
  ["ferry-schedule-nov-2026.pdf", "Ferry schedule, November 2026", "application/pdf", "document", 482_000],
  ["budget-2027-summary.pdf", "Budget 2027 summary", "application/pdf", "document", 1_240_000],
  ["housing-applicants.xlsx", "Housing applicants", "application/vnd.ms-excel", "document", 96_000],
  ["council-meeting-oct.mp4", "Council meeting, October", "video/mp4", "video", 48_300_000],
  ["radio-announcement.mp3", "Radio announcement", "audio/mpeg", "audio", 3_400_000],
]

const dvTitles: Record<string, string> = {
  "Maafushi beach": "މާފުށީ ގޮނޑުދޮށް",
  "Fuvahmulah sunset": "ފުވައްމުލަކު އިރުއޮއްސުން",
  "Hulhumalé skyline": "ހުޅުމާލެ",
  "Addu City causeway": "އައްޑޫ ލިންކް ރޯޑް",
  "Hanifaru Bay": "ހަނިފަރު",
  "Thoddoo farmland": "ތޮއްޑޫ ދަނޑުބިން",
  "Malé harbour": "މާލެ ބަނދަރު",
  "Villimalé park": "ވިލިމާލެ ޕާކު",
  "Kulhudhuffushi mangroves": "ކުޅުދުއްފުށީ ކުޅި",
  "Naifaru jetty": "ނައިފަރު ފާލަން",
  "Ferry schedule, November 2026": "ފެރީ ތާވަލު، ނޮވެމްބަރު 2026",
  "Budget 2027 summary": "2027 ބަޖެޓުގެ ޚުލާޞާ",
  "Housing applicants": "ހިޔާވަހިކަމަށް އެދުނު ފަރާތްތައް",
  "Council meeting, October": "ކައުންސިލް ބައްދަލުވުން، އޮކްޓޫބަރު",
  "Radio announcement": "ރޭޑިއޯ އިޢުލާނު",
}

export const mediaItems: LibraryItem[] = [
  ...imageSeeds.map(([name, title, hue, width, height], i) => ({
    id: `img-${i + 1}`,
    name,
    title: { en: title, dv: dvTitles[title] ?? title },
    alt: title,
    url: scene(title, hue, 1200, Math.round((1200 * height) / width)),
    thumbnailUrl: scene(title, hue, 400, Math.round((400 * height) / width)),
    type: "image/jpeg",
    kind: "image" as const,
    size: 180_000 + i * 73_500,
    width,
    height,
    uploadedBy: people[i % people.length] as string,
    uploadedAt: `2026-${String(10 - (i % 4)).padStart(2, "0")}-${String(28 - i * 2).padStart(2, "0")}`,
    usedIn: i % 3,
  })),
  ...docSeeds.map(([name, title, type, kind, size], i) => ({
    id: `doc-${i + 1}`,
    name,
    title: { en: title, dv: dvTitles[title] ?? title },
    type,
    kind,
    size,
    uploadedBy: people[(i + 1) % people.length] as string,
    uploadedAt: `2026-09-${String(20 - i * 3).padStart(2, "0")}`,
    usedIn: (i + 1) % 2,
  })),
]

// ---------------------------------------------------------------------------
// Menu builder

export interface MenuNode {
  id: string
  label: L10n
  href: string
  icon: string | null
  newTab: boolean
  children: MenuNode[]
}

export const initialMenu: MenuNode[] = [
  {
    id: "home",
    label: { en: "Home", dv: "މައި ސަފްހާ" },
    href: "/",
    icon: "lucide:house",
    newTab: false,
    children: [],
  },
  {
    id: "services",
    label: { en: "Services", dv: "ޚިދުމަތްތައް" },
    href: "/services",
    icon: "lucide:layout-grid",
    newTab: false,
    children: [
      {
        id: "ferry",
        label: { en: "Ferry tickets", dv: "ފެރީ ޓިކެޓް" },
        href: "/services/ferry",
        icon: "lucide:ship",
        newTab: false,
        children: [],
      },
      {
        id: "housing",
        label: { en: "Housing", dv: "ހިޔާވަހިކަން" },
        href: "/services/housing",
        icon: "lucide:building-2",
        newTab: false,
        children: [],
      },
      {
        id: "permits",
        label: { en: "Permits", dv: "ހުއްދަތައް" },
        href: "/services/permits",
        icon: "lucide:file-check",
        newTab: false,
        children: [],
      },
    ],
  },
  {
    id: "news",
    label: { en: "News", dv: "ޚަބަރު" },
    href: "/news",
    icon: "lucide:newspaper",
    newTab: false,
    children: [
      {
        id: "press",
        label: { en: "Press releases", dv: "ނޫސް ބަޔާން" },
        href: "/news/press",
        icon: null,
        newTab: false,
        children: [],
      },
    ],
  },
  {
    id: "contact",
    label: { en: "Contact", dv: "ގުޅުއްވާ" },
    href: "/contact",
    icon: "lucide:phone",
    newTab: false,
    children: [],
  },
  {
    id: "efaas",
    label: { en: "eFaas sign in", dv: "އީފާސް" },
    href: "https://efaas.gov.mv",
    icon: "lucide:log-in",
    newTab: true,
    children: [],
  },
]

export const pageLinks: { value: string; label: L10n }[] = [
  { value: "/", label: { en: "Home", dv: "މައި ސަފްހާ" } },
  { value: "/services", label: { en: "Services", dv: "ޚިދުމަތްތައް" } },
  { value: "/services/ferry", label: { en: "Ferry tickets", dv: "ފެރީ ޓިކެޓް" } },
  { value: "/services/housing", label: { en: "Housing", dv: "ހިޔާވަހިކަން" } },
  { value: "/services/permits", label: { en: "Permits", dv: "ހުއްދަތައް" } },
  { value: "/news", label: { en: "News", dv: "ޚަބަރު" } },
  { value: "/news/press", label: { en: "Press releases", dv: "ނޫސް ބަޔާން" } },
  { value: "/about", label: { en: "About us", dv: "އަޅުގަނޑުމެން" } },
  { value: "/contact", label: { en: "Contact", dv: "ގުޅުއްވާ" } },
  { value: "/jobs", label: { en: "Jobs", dv: "ވަޒީފާ" } },
]

// ---------------------------------------------------------------------------
// Translations

export const translationGroups: { value: string; label: L10n }[] = [
  { value: "all", label: { en: "All groups", dv: "ހުރިހާ ގްރޫޕެއް" } },
  { value: "auth", label: { en: "Sign in", dv: "ލޮގިން" } },
  { value: "nav", label: { en: "Navigation", dv: "ނެވިގޭޝަން" } },
  { value: "services", label: { en: "Services", dv: "ޚިދުމަތްތައް" } },
  { value: "validation", label: { en: "Validation", dv: "ވެލިޑޭޝަން" } },
]

export const translationEntries: TranslationEntry[] = [
  { key: "auth.login", values: { en: "Log in", dv: "ލޮގިން" }, description: "Sign-in button" },
  { key: "auth.logout", values: { en: "Log out", dv: "ލޮގްއައުޓް" } },
  { key: "auth.efaas", values: { en: "Sign in with eFaas", dv: "އީފާސް މެދުވެރިކޮށް ވަދެވަޑައިގަންނަވާ" } },
  { key: "auth.forgot", values: { en: "Forgot your password?", dv: "" }, description: "Link under the password" },
  { key: "auth.remember", values: { en: "Remember me", dv: "" } },
  { key: "nav.home", values: { en: "Home", dv: "މައި ސަފްހާ" } },
  { key: "nav.services", values: { en: "Services", dv: "ޚިދުމަތްތައް" } },
  { key: "nav.news", values: { en: "News", dv: "ޚަބަރު" } },
  { key: "nav.contact", values: { en: "Contact us", dv: "ގުޅުއްވާ" } },
  { key: "nav.jobs", values: { en: "Jobs", dv: "" } },
  {
    key: "services.ferry.title",
    values: { en: "Ferry tickets", dv: "ފެރީ ޓިކެޓް" },
    description: "Service card title",
  },
  {
    key: "services.ferry.summary",
    values: { en: "Buy Malé–Hulhumalé ferry tickets online.", dv: "" },
  },
  { key: "services.housing.title", values: { en: "Social housing", dv: "ސޯޝަލް ހައުސިންގ" } },
  {
    key: "services.housing.summary",
    values: { en: "Apply for a flat in Hulhumalé Phase 2.", dv: "ހުޅުމާލެ ފޭސް 2 ގެ ފްލެޓަކަށް އެދިވަޑައިގަންނަވާ." },
  },
  { key: "services.permits.title", values: { en: "Permits", dv: "" } },
  {
    key: "validation.required",
    values: { en: "The :attribute field is required.", dv: ":attribute ފުރިހަމަ ކުރައްވާ." },
  },
  { key: "validation.email", values: { en: "Enter a valid email address.", dv: "" } },
  { key: "validation.id_card", values: { en: "Enter an ID card number like A123456.", dv: "" } },
  {
    key: "validation.phone",
    values: { en: "Enter a Maldivian phone number (+960).", dv: "ދިވެހި ފޯނު ނަންބަރެއް ޖައްސަވާ (+960)." },
  },
]
