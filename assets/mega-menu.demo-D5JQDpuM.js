var e=`import { Card, Logo, MegaMenu } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"
import { DemoFrame, DemoNav, useDhivehi } from "./_demo-nav"

export const meta = {
  title: "Mega menu",
  group: "Layout and navigation",
  order: 5,
  description:
    "Header navigation with wide multi-column panels. On phones it becomes a drawer with accordion sections.",
}

export default function MegaMenuDemo() {
  const dv = useDhivehi()
  const logo = <Logo alt="gov.mv" text="gov.mv" href="/" />
  return (
    <DemoPage>
      <DemoSection title="Government portal" className="block">
        <DemoNav>
          {(current) => (
            <DemoFrame className="min-h-[420px] overflow-visible">
              <div className="gap-4 px-4 h-14 flex items-center border-b">
                {logo}
                <MegaMenu
                  className="md:ms-6 md:me-auto ms-auto"
                  logo={logo}
                  items={[
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
                            { label: dv ? "ހުޅުމާލޭ ފްލެޓް" : "Hulhumalé flats", href: "/flats", icon: "home" },
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
                          description={
                            dv ? "އެއް އެކައުންޓަކުން ހުރިހާ ޚިދުމަތެއް" : "One login for every government service."
                          }
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
                  ]}
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
`;export{e as default};