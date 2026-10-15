import { useNavigate } from "react-router"
import { Card, NotFoundPage, SearchBox } from "@javaabu/onu"

import { useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import { PortalShell } from "../_shared/shells"

export const meta = { title: "404 Not found", group: "System", layout: "bare", order: 2 }

export default function NotFoundSamplePage() {
  const tr = useTr()
  const navigate = useNavigate()
  const popular = [
    {
      title: tr("Services directory", "ޚިދުމަތްތައް"),
      description: tr("Apply for permits, licences and more.", "ހުއްދަތަކާއި ލައިސަންސްތަކަށް އެދިވަޑައިގަންނަވާ."),
      href: routes.public.services,
    },
    {
      title: tr("News", "ޚަބަރު"),
      description: tr("Announcements and press releases.", "އިއުލާނާއި ނޫސްބަޔާން."),
      href: routes.public.news,
    },
    {
      title: tr("Contact us", "ގުޅުއްވާ"),
      description: tr(
        "Call 1500 or visit a service centre.",
        "1500 އަށް ގުޅުއްވާ ނުވަތަ ސަރވިސް ސެންޓަރަށް ވަޑައިގަންނަވާ.",
      ),
      href: routes.public.contact,
    },
  ]

  return (
    <PortalShell>
      <NotFoundPage
        as="div"
        homeHref={routes.public.home}
        className="pb-8"
        message={tr(
          "The page you're looking for has moved or no longer exists. Check the address, or search the site.",
          "ހޯއްދަވާ ސަފުހާ ބަދަލުވެފައި ނުވަތަ ނެތިފައި. އެޑްރެސް ޗެކްކުރައްވާ، ނުވަތަ ސައިޓުގައި ހޯއްދަވާ.",
        )}
      />
      <div className="max-w-xl gap-8 px-4 pb-16 mx-auto grid">
        <SearchBox
          aria-label={tr("Search the site", "ސައިޓުގައި ހޯދާ")}
          placeholder={tr("Search services, news, laws…", "ޚިދުމަތް، ޚަބަރު، ޤާނޫނު ހޯދާ…")}
          onSearch={(q) => q && navigate(`${routes.public.search}?q=${encodeURIComponent(q)}`)}
        />
        <section aria-labelledby="popular-heading" className="gap-3 grid">
          <h2 id="popular-heading" className="text-sm font-medium text-muted-foreground">
            {tr("Popular pages", "ގިނައިން ބައްލަވާ ސަފުހާތައް")}
          </h2>
          <div className="gap-3 sm:grid-cols-3 grid">
            {popular.map((p) => (
              <Card key={p.href} size="sm" title={p.title} description={p.description} href={p.href} headingLevel={3} />
            ))}
          </div>
        </section>
      </div>
    </PortalShell>
  )
}
