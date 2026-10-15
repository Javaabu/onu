import { Breadcrumbs } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"
import { DemoNav, useDhivehi } from "./_demo-nav"

export const meta = {
  title: "Breadcrumbs",
  group: "Layout and navigation",
  order: 11,
  description:
    "Every part is a link except the last (§25.8). Middle parts collapse into a menu on phones; separators mirror in RTL.",
}

export default function BreadcrumbsDemo() {
  const dv = useDhivehi()
  const long = [
    { label: dv ? "ފުރަތަމަ ސަފްޙާ" : "Home", href: "/", icon: "home" },
    { label: dv ? "އަތޮޅުތައް" : "Atolls", href: "/atolls" },
    { label: dv ? "ކ. އަތޮޅު" : "Kaafu Atoll", href: "/atolls/kaafu" },
    { label: dv ? "ރަށްތައް" : "Islands", href: "/atolls/kaafu/islands" },
    { label: dv ? "މާފުށި" : "Maafushi" },
  ]
  return (
    <DemoNav>
      {(current) => (
        <DemoPage>
          <DemoSection title="Record (§25.8)">
            <Breadcrumbs
              items={[
                { label: dv ? "މެމްބަރުން" : "Users", href: "/users" },
                { label: dv ? "އައިޝަތު ޝިފާ" : "Jane Doe" },
              ]}
            />
          </DemoSection>
          <DemoSection
            title="Long trail"
            description="On phones only the first and last parts stay; the rest are in the … menu."
          >
            <Breadcrumbs items={long} />
          </DemoSection>
          <DemoSection title="Collapse past 3 items (any width)">
            <Breadcrumbs items={long} maxItems={3} />
          </DemoSection>
          <DemoSection title="Custom separator">
            <Breadcrumbs items={long.slice(0, 3)} separator="/" />
            <p className="text-xs w-full text-muted-foreground">{current}</p>
          </DemoSection>
        </DemoPage>
      )}
    </DemoNav>
  )
}
