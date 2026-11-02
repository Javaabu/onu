var e=`import { Badge, ContentCard, IconText } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"
import { daysFromNow } from "./_data"

export const meta = {
  title: "Content card",
  group: "Display and feedback",
  order: 25,
  description: "News, services and events: image, title, excerpt, meta and link. Vertical or horizontal.",
}

const image = (seed: string) =>
  \`data:image/svg+xml;utf8,\${encodeURIComponent(
    \`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 9"><defs><linearGradient id="g" x2="1" y2="1"><stop offset="0" stop-color="#0e7490"/><stop offset="1" stop-color="\${seed}"/></linearGradient></defs><rect width="16" height="9" fill="url(#g)"/></svg>\`,
  )}\`

export default function ContentCardDemo() {
  return (
    <DemoPage>
      <DemoSection title="Vertical (news grid)" className="sm:grid-cols-2 lg:grid-cols-3 grid">
        <ContentCard
          title="New ferry routes connect Hulhumalé and Villimalé"
          excerpt="The new routes run every 30 minutes from 6:00 to 23:00, with discounted fares for students and seniors."
          image={{ src: image("#22c55e"), alt: "Ferry at the Hulhumalé jetty" }}
          href="#news/ferry"
          date={daysFromNow(-1)}
          category="News"
        />
        <ContentCard
          title="ދިވެހި ބަހުގެ ހަފްތާ ފެށިއްޖެ"
          excerpt="މި ހަފްތާގައި ސްކޫލުތަކުގައި ކުރިއަށްދާ ހަރަކާތްތައް."
          image={{ src: image("#f59e0b"), alt: "" }}
          href="#news/dhivehi"
          date={daysFromNow(-3)}
          category="ޚަބަރު"
        />
        <ContentCard
          title="Job fair 2026"
          excerpt="Meet over 40 employers from tourism, health and the public sector."
          href="#events/job-fair"
          date={daysFromNow(12)}
          category="Event"
          meta={<IconText icon="map-pin">Dharubaaruge</IconText>}
          footer={<Badge variant="secondary">Free entry</Badge>}
        />
      </DemoSection>
      <DemoSection title="Horizontal (service list)" className="grid">
        <ContentCard
          orientation="horizontal"
          title="Renew your passport"
          excerpt="Apply online with eFaas and collect your passport from any service centre within 5 working days."
          image={{ src: image("#6366f1"), alt: "" }}
          href="#services/passport"
          category="Service"
          meta={<span>MVR 750</span>}
        />
      </DemoSection>
    </DemoPage>
  )
}
`;export{e as default};