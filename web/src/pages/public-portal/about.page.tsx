import { Card, Icon, LinkButton, Timeline, UserAvatar } from "@javaabu/onu"
import { StatTile, StatTiles } from "@javaabu/onu/charts"

import { useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import { PortalShell } from "../_shared/shells"
import { history, leadership } from "./_data"
import { scene, toDate, useL } from "./_i18n"
import { Container, PortalPageHeader } from "./_ui"

export const meta = { title: "About", group: "Public portal", layout: "bare", order: 13 }

export default function AboutPage() {
  const tr = useTr()
  const l = useL()

  const values = [
    {
      icon: "users",
      title: tr("People first", "މީހުންނަށް ފުރަތަމަ"),
      text: tr(
        "We design every service with the people who use it.",
        "ޚިދުމަތް ބޭނުންކުރާ މީހުންނާއެކު ކޮންމެ ޚިދުމަތެއް ޑިޒައިންކުރަނީ.",
      ),
    },
    {
      icon: "globe",
      title: tr("Every island", "ކޮންމެ ރަށަކަށް"),
      text: tr(
        "The same service in Malé, Addu or Kulhudhuffushi.",
        "މާލޭގައި، އައްޑޫގައި ނުވަތަ ކުޅުދުއްފުށީގައި އެއް ފެންވަރެއްގެ ޚިދުމަތް.",
      ),
    },
    {
      icon: "languages",
      title: tr("Dhivehi and English", "ދިވެހި އަދި އިނގިރޭސި"),
      text: tr("Every form, letter and screen in both languages.", "ކޮންމެ ފޯމެއް، ސިޓީއެއް އަދި ސްކްރީނެއް ދެބަހުން."),
    },
    {
      icon: "lock",
      title: tr("Trust", "އިތުބާރު"),
      text: tr(
        "Your data is protected and only used for your service.",
        "ތިބާގެ މަޢުލޫމާތު ރައްކާތެރިކޮށް، ހަމައެކަނި ޚިދުމަތަށް ބޭނުންކުރަނީ.",
      ),
    },
  ]

  return (
    <PortalShell>
      <PortalPageHeader
        crumbs={[{ label: tr("About", "އަޅުގަނޑުމެން") }]}
        eyebrow={tr("About the ministry", "ވުޒާރާއާ ބެހޭ")}
        title={tr("Making government simple for every citizen", "ކޮންމެ ރައްޔިތަކަށް ސަރުކާރު ފަސޭހަކުރުން")}
        description={tr(
          "We run the eServices portal, 24 island service centres and the 1500 call centre, so that people can get things done without travelling to Malé.",
          "މާލެ ނާދެ ކަންތައް ނިންމޭނެ ގޮތަށް، އީސަރވިސަސް ޕޯޓަލާއި، ރަށްރަށުގައި ހުރި 24 ސަރވިސް ސެންޓަރާއި، 1500 ކޯލް ސެންޓަރު ހިންގަނީ އަޅުގަނޑުމެން.",
        )}
      />

      <Container className="py-12 gap-10 lg:grid-cols-2 grid items-center">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{tr("Our mission", "އަޅުގަނޑުމެންގެ މިޝަން")}</h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            {tr(
              "To deliver public services that are fair, fast and easy to use — online first, with a person to help whenever you need one.",
              "ޢަދުލުވެރި، އަވަސް، އަދި ބޭނުންކުރަން ފަސޭހަ ޢާންމު ޚިދުމަތް ފޯރުކޮށްދިނުން — އޮންލައިންކޮށް ފުރަތަމަ، އަދި ބޭނުންވާ ކޮންމެ ވަގުތެއްގައި އެހީވެދޭނެ މީހަކާއެކު.",
            )}
          </p>
          <div className="mt-6 gap-3 flex flex-wrap">
            <LinkButton href={routes.public.services} endIcon="arrow-right">
              {tr("Browse services", "ޚިދުމަތްތައް ބައްލަވާ")}
            </LinkButton>
            <LinkButton href={routes.public.jobs} variant="outline">
              {tr("Join our team", "ޓީމާ ގުޅިވަޑައިގަންނަވާ")}
            </LinkButton>
          </div>
        </div>
        <img
          src={scene("", 160, 1200, 800)}
          alt={tr("Staff at the Hulhumalé service centre", "ހުޅުމާލޭ ސަރވިސް ސެންޓަރުގެ މުވައްޒަފުން")}
          className="aspect-[3/2] w-full rounded-2xl border object-cover"
        />
      </Container>

      <div className="border-y bg-muted/30">
        <Container className="py-12">
          <h2 className="sr-only">{tr("In numbers", "ޢަދަދުތައް")}</h2>
          <StatTiles columns={4}>
            <StatTile label={tr("Online services", "އޮންލައިން ޚިދުމަތް")} value={124} icon="globe" />
            <StatTile
              label={tr("Applications in 2025", "2025 ގައި ލިބުނު އެޕްލިކޭޝަން")}
              value={482_310}
              icon="file-text"
            />
            <StatTile label={tr("Islands served", "ޚިދުމަތް ފޯރާ ރަށް")} value={187} icon="map-pin" />
            <StatTile
              label={tr("Average processing time", "އެވްރެޖް މުއްދަތު")}
              value={tr("3.2 days", "3.2 ދުވަސް")}
              delta={-0.24}
              positiveIsGood={false}
              deltaContext={tr("vs 2024", "2024 އާ އަޅާބަލާއިރު")}
              icon="clock"
            />
          </StatTiles>
        </Container>
      </div>

      <Container className="py-12">
        <h2 className="text-2xl font-semibold tracking-tight">
          {tr("What we stand for", "އަޅުގަނޑުމެންގެ އުސޫލުތައް")}
        </h2>
        <ul className="mt-6 gap-4 sm:grid-cols-2 lg:grid-cols-4 grid">
          {values.map((v) => (
            <li key={v.icon} className="p-6 rounded-xl border bg-card">
              <span className="size-10 grid place-items-center rounded-lg bg-primary/10 text-primary">
                <Icon name={v.icon} className="size-5" />
              </span>
              <h3 className="mt-4 font-semibold">{v.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{v.text}</p>
            </li>
          ))}
        </ul>
      </Container>

      <Container className="py-12">
        <h2 className="text-2xl font-semibold tracking-tight">{tr("Leadership", "ލީޑަރޝިޕް")}</h2>
        <ul className="mt-6 gap-4 sm:grid-cols-2 lg:grid-cols-4 grid">
          {leadership.map((p) => (
            <li key={p.name.en}>
              <Card className="h-full text-center">
                <div className="gap-3 flex flex-col items-center">
                  <UserAvatar name={l(p.name)} size="xl" decorative />
                  <div>
                    <h3 className="font-semibold">{l(p.name)}</h3>
                    <p className="text-sm text-muted-foreground">{l(p.role)}</p>
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      </Container>

      <Container className="pt-4 pb-16 gap-10 lg:grid-cols-[18rem_1fr] grid">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{tr("Our history", "ތާރީޚު")}</h2>
          <p className="mt-2 text-muted-foreground">
            {tr(
              "From one office in Malé to services on every island.",
              "މާލޭގެ އެއް އޮފީހަކުން ފެށިގެން ކޮންމެ ރަށަކަށް.",
            )}
          </p>
        </div>
        <Timeline
          aria-label={tr("History", "ތާރީޚު")}
          datePattern="yyyy"
          items={history.map((h) => ({
            title: l(h.title),
            description: l(h.description),
            time: toDate(`${h.year}-01-01`),
            status: h.status ?? "success",
          }))}
        />
      </Container>
    </PortalShell>
  )
}
