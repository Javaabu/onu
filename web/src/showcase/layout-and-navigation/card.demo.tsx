import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Icon,
} from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"
import { DemoNav, useDhivehi } from "./_demo-nav"

export const meta = {
  title: "Card",
  group: "Layout and navigation",
  order: 13,
  description: "shadcn Card, extended with title/description/actions/footer props, link cards and asChild.",
}

export default function CardDemo() {
  const dv = useDhivehi()
  return (
    <DemoNav>
      {(current) => (
        <DemoPage>
          <DemoSection title="Header actions and footer" className="gap-4 md:grid-cols-2 grid">
            <Card
              title={dv ? "ފައިސާ ލިބުނު" : "Payments received"}
              description={dv ? "ފަހު 30 ދުވަސް" : "Last 30 days"}
              actions={
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-sm" aria-label={dv ? "އިތުރު" : "More"}>
                      <Icon name="more" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>{dv ? "އެކްސްޕޯޓް" : "Export"}</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              }
              footer={
                <Button variant="outline" size="sm">
                  {dv ? "ހުރިހާ އެއްޗެއް ބަލާ" : "View all"}
                </Button>
              }
            >
              <p className="text-2xl font-semibold tabular-nums">MVR 48,250.00</p>
            </Card>
            <Card
              size="sm"
              variant="muted"
              title={dv ? "ކުޑަ" : "Small, muted"}
              description={dv ? "ތަފްސީލު" : "Compact spacing"}
            >
              <Badge variant="secondary">{dv ? "އެކްޓިވް" : "Active"}</Badge>
            </Card>
          </DemoSection>
          <DemoSection title="Link cards" description={current} className="gap-4 sm:grid-cols-3 grid">
            {[
              { name: dv ? "މާލެ" : "Malé", n: 4 },
              { name: dv ? "އައްޑޫ" : "Addu City", n: 6 },
              { name: dv ? "ފުވައްމުލައް" : "Fuvahmulah", n: 1 },
            ].map((c) => (
              <Card
                key={c.n}
                href={`/cities/${c.n}`}
                title={c.name}
                description={dv ? `${c.n} ރަށް` : `${c.n} islands`}
                actions={<Badge variant="outline">{c.n}</Badge>}
              />
            ))}
          </DemoSection>
          <DemoSection title="Composed (shadcn API) and asChild" className="gap-4 md:grid-cols-2 grid">
            <Card>
              <CardHeader>
                <CardTitle>{dv ? "ކްލާސިކް" : "Classic composition"}</CardTitle>
                <CardDescription>CardHeader · CardContent</CardDescription>
              </CardHeader>
              <CardContent>{dv ? "ކުރީގެ ގޮތަށް" : "Works exactly like shadcn."}</CardContent>
            </Card>
            <Card
              asChild
              title={dv ? "އާޓިކަލް" : "Rendered as <article>"}
              footer={<span className="text-xs">asChild</span>}
            >
              <article>
                <CardContent>{dv ? "ތަފްސީލު" : "The child element becomes the card."}</CardContent>
              </article>
            </Card>
          </DemoSection>
        </DemoPage>
      )}
    </DemoNav>
  )
}
