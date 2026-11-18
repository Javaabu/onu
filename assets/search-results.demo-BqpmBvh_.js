var e=`import * as React from "react"
import { SearchBox, SearchResults, type SearchResultGroup } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = { title: "Search results", group: "Listing pages", order: 25 }

const all: SearchResultGroup[] = [
  {
    id: "services",
    label: "Services",
    moreHref: "#/components/listing-pages/search-results",
    items: [
      {
        id: "s1",
        title: "Passport renewal",
        description: "Renew a Maldivian passport online with eFaas.",
        href: "#",
        icon: "file-text",
        meta: "Department of Immigration",
      },
      {
        id: "s2",
        title: "Business name registration",
        description: "Register a business name with the Ministry of Economic Development.",
        href: "#",
        icon: "file-text",
      },
      {
        id: "s3",
        title: "Vessel registration",
        description: "Register a sea vessel with the Transport Authority.",
        href: "#",
        icon: "file-text",
      },
    ],
  },
  {
    id: "news",
    label: "News",
    items: [
      {
        id: "n1",
        title: "Passport fees reduced for students",
        description: "Students under 18 now pay half for a new passport.",
        href: "#",
        meta: "12 March 2026",
      },
      { id: "n2", title: "ޕާސްޕޯޓް ހެދުމުގެ ޚިދުމަތް އަވަސްކޮށްފި", href: "#", meta: "10 March 2026" },
    ],
  },
]

function search(query: string): SearchResultGroup[] {
  const words = query.toLowerCase().split(/\\s+/).filter(Boolean)
  if (!words.length) return []
  return all.map((g) => ({
    ...g,
    items: g.items.filter((i) => words.some((w) => \`\${i.title} \${i.description ?? ""}\`.toLowerCase().includes(w))),
  }))
}

const MORE_SERVICES = [
  { title: "ID card renewal", titleDv: "އައިޑީ ކާޑު އާކުރުން", agency: "Department of National Registration" },
  { title: "Driving licence renewal", titleDv: "ޑްރައިވިންގ ލައިސަންސް އާކުރުން", agency: "Transport Authority" },
  { title: "Land lease registration", titleDv: "ބިމުގެ ލީސް ރަޖިސްޓަރީ", agency: "Hulhumalé, K. Atoll" },
  { title: "Fishing vessel licence", titleDv: "މަސްވެރި ދޯނީގެ ލައިސަންސް", agency: "Ministry of Fisheries" },
  { title: "Guest house registration", titleDv: "ގެސްޓް ހައުސް ރަޖިސްޓަރީ", agency: "Ministry of Tourism" },
  { title: "Building permit", titleDv: "ޢިމާރާތް ކުރުމުގެ ހުއްދަ", agency: "Addu City Council" },
]

function ShowMoreDemo() {
  const [shown, setShown] = React.useState(2)
  const services = MORE_SERVICES.slice(0, shown).map((s, i) => ({
    id: \`m\${i}\`,
    title: s.title,
    description: s.titleDv,
    meta: s.agency,
    href: "#",
    icon: "file-text",
  }))
  return (
    <SearchResults
      query="renewal registration"
      groups={[
        { id: "services", label: "Services", total: MORE_SERVICES.length, items: services },
        all[1] as SearchResultGroup,
      ]}
      onShowMore={async () => {
        await new Promise((r) => setTimeout(r, 700))
        setShown((n) => Math.min(MORE_SERVICES.length, n + 2))
      }}
    />
  )
}

export default function SearchResultsDemo() {
  const [query, setQuery] = React.useState("passport registration")
  const [loading, setLoading] = React.useState(false)
  return (
    <DemoPage>
      <DemoSection title="Grouped and highlighted" className="gap-4 grid">
        <SearchBox
          value={query}
          onSearch={(q) => {
            setLoading(true)
            setQuery(q)
            setTimeout(() => setLoading(false), 500)
          }}
        />
        <SearchResults query={query} groups={search(query)} loading={loading} />
      </DemoSection>
      <DemoSection
        title="Show more on the same page"
        description="With onShowMore, groups with more results get a Show more button instead of a link. Focus moves to the first new result and the count is announced."
        className="gap-4 grid"
      >
        <ShowMoreDemo />
      </DemoSection>
    </DemoPage>
  )
}
`;export{e as default};