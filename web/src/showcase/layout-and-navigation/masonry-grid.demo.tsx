import { Card, MasonryGrid } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"
import { useDhivehi } from "./_demo-nav"

export const meta = {
  title: "Masonry grid",
  group: "Layout and navigation",
  order: 28,
  description: "CSS-columns masonry with column counts that follow the container width.",
}

export default function MasonryGridDemo() {
  const dv = useDhivehi()
  const posts = [
    { title: dv ? "ހުޅުމާލޭ ފެސްޓިވަލް" : "Hulhumalé festival", lines: 2 },
    { title: dv ? "އައު ފެރީ ޚިދުމަތް" : "New ferry route to Thinadhoo", lines: 5 },
    { title: dv ? "މަސްވެރިކަމުގެ ރިޕޯޓް" : "Fisheries report 2026", lines: 3 },
    { title: dv ? "ސްކޫލް ބަންދު" : "School holidays announced", lines: 1 },
    { title: dv ? "ރީސައިކްލިންގ" : "Recycling in Addu City", lines: 4 },
    { title: dv ? "ކުޅިވަރު" : "Inter-atoll football cup", lines: 2 },
    { title: dv ? "ސިއްޚަތު" : "Health camp in Kulhudhuffushi", lines: 6 },
  ]
  const text = dv
    ? "ދިވެހިރާއްޖޭގެ ރަށްރަށުން ލިބޭ ޚަބަރުތައް. "
    : "News and stories from islands across the Maldives. "
  return (
    <DemoPage>
      <DemoSection title="Responsive (1 → 2 → 3 columns)" className="block">
        <MasonryGrid>
          {posts.map((p) => (
            <Card key={p.title} title={p.title} size="sm">
              <p className="text-muted-foreground">{text.repeat(p.lines)}</p>
            </Card>
          ))}
        </MasonryGrid>
      </DemoSection>
      <DemoSection title="Fixed 2 columns, small gap" className="max-w-lg block">
        <MasonryGrid columns={2} gap="sm">
          {posts.slice(0, 5).map((p) => (
            <div key={p.title} className="p-3 text-sm rounded-lg bg-muted">
              {text.repeat(p.lines)}
            </div>
          ))}
        </MasonryGrid>
      </DemoSection>
    </DemoPage>
  )
}
