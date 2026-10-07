import * as React from "react"
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
  const words = query.toLowerCase().split(/\s+/).filter(Boolean)
  if (!words.length) return []
  return all.map((g) => ({
    ...g,
    items: g.items.filter((i) => words.some((w) => `${i.title} ${i.description ?? ""}`.toLowerCase().includes(w))),
  }))
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
    </DemoPage>
  )
}
