import { Button, Card, Logo, TopNav, type TopNavItem } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"
import { DemoFrame, DemoNav, portalItems, useDhivehi } from "./_demo-nav"

export const meta = {
  title: "Top navigation bar",
  group: "Layout and navigation",
  order: 3,
  description:
    "Horizontal navigation with dropdowns and wide multi-column panels (a mega menu). Below 768px it collapses to a menu button and a drawer.",
}

function megaItems(dv: boolean): TopNavItem[] {
  return [
    {
      label: dv ? "ރައްޔިތުންނަށް" : "Citizens",
      columns: [
        {
          title: dv ? "ކާޑާއި ލިޔުންތައް" : "ID and documents",
          links: [
            {
              label: dv ? "ދިވެހި ކާޑު" : "National ID card",
              href: "/id",
              icon: "user",
              description: dv ? "އައު ކާޑާއި އާކުރުން" : "Apply or renew",
            },
            {
              label: dv ? "ޕާސްޕޯޓް" : "Passport",
              href: "/passport",
              icon: "globe",
              description: dv ? "ޕާސްޕޯޓް ހެދުން" : "Apply for a passport",
            },
          ],
        },
        {
          title: dv ? "ގެދޮރު" : "Housing",
          links: [
            { label: dv ? "ހުޅުމާލޭ ފްލެޓް" : "Hulhumalé flats", href: "/flats", icon: "home", badge: 2 },
            { label: dv ? "ބިމުގެ ހުއްދަ" : "Land permits", href: "/land", icon: "map-pin" },
          ],
        },
        {
          title: dv ? "ފައިސާ" : "Payments",
          links: [
            {
              label: dv ? "ބިލުތައް" : "Pay a bill",
              href: "/bills",
              icon: "credit-card",
              description: "MVR",
            },
          ],
        },
      ],
      featured: (
        <Card
          size="sm"
          variant="muted"
          title={dv ? "އީފާސް" : "eFaas"}
          description={dv ? "އެއް އެކައުންޓަކުން ހުރިހާ ޚިދުމަތެއް" : "One login for every government service."}
          href="/efaas"
        />
      ),
    },
    {
      label: dv ? "ވިޔަފާރިތަކަށް" : "Businesses",
      columns: [
        {
          title: dv ? "ރަޖިސްޓްރީ" : "Registration",
          links: [
            { label: dv ? "ކުންފުނި" : "Companies", href: "/companies" },
            { label: dv ? "ޕާޓްނަރޝިޕް" : "Partnerships", href: "/partnerships" },
          ],
        },
        {
          title: dv ? "ލައިސަންސް" : "Licences",
          links: [
            { label: dv ? "ފަތުރުވެރިކަން" : "Tourism", href: "/tourism" },
            { label: dv ? "މަސްވެރިކަން" : "Fisheries", href: "/fisheries" },
          ],
        },
      ],
    },
    { label: dv ? "ޚަބަރު" : "News", href: "/news" },
  ]
}

export default function TopNavDemo() {
  const dv = useDhivehi()
  const logo = <Logo alt="Onu" text="Onu" src={`${import.meta.env.BASE_URL}favicon.svg`} />
  const govLogo = <Logo alt="gov.mv" text="gov.mv" href="/" />
  return (
    <DemoPage>
      <DemoSection title="Portal navigation" className="block">
        <DemoNav initial="/services/passports">
          {(current) => (
            <DemoFrame className="overflow-visible">
              <div className="gap-4 px-4 h-14 flex items-center border-b">
                {logo}
                <TopNav
                  className="md:ms-6 md:me-auto ms-auto"
                  items={portalItems(dv)}
                  currentHref={current}
                  logo={logo}
                  mobileFooter={<Button className="w-full">{dv ? "ސައިން އިން" : "Sign in"}</Button>}
                />
              </div>
              <p className="p-4 text-sm text-muted-foreground">{current}</p>
            </DemoFrame>
          )}
        </DemoNav>
      </DemoSection>
      <DemoSection
        title="Mega menu"
        description="Items with columns open a wide panel with an optional featured area. On phones each titled column is a section of the drawer."
        className="block"
      >
        <DemoNav initial="/passport">
          {(current) => (
            <DemoFrame className="min-h-[420px] overflow-visible">
              <div className="gap-4 px-4 h-14 flex items-center border-b">
                {govLogo}
                <TopNav
                  className="md:ms-6 md:me-auto ms-auto"
                  logo={govLogo}
                  currentHref={current}
                  items={megaItems(dv)}
                />
              </div>
              <p className="p-4 text-sm text-muted-foreground">{current}</p>
            </DemoFrame>
          )}
        </DemoNav>
      </DemoSection>
    </DemoPage>
  )
}
