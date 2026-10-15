import { Button, Hero, Icon, SearchBox } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"
import { useDhivehi } from "./_demo-nav"

export const meta = {
  title: "Hero",
  group: "Layout and navigation",
  order: 30,
  description: "The opening block of a portal page: fluid heading, lead text, actions, search and media.",
}

/** A self-contained "lagoon" picture so the demo needs no network. */
const lagoon = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice">
    <defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7dd3fc"/><stop offset="1" stop-color="#0e7490"/></linearGradient></defs>
    <rect width="1200" height="600" fill="url(#s)"/>
    <ellipse cx="860" cy="430" rx="260" ry="70" fill="#fde68a"/>
    <ellipse cx="860" cy="420" rx="190" ry="45" fill="#16a34a"/>
    <ellipse cx="260" cy="500" rx="180" ry="40" fill="#fde68a" opacity=".8"/>
    <circle cx="1020" cy="120" r="60" fill="#fef9c3" opacity=".9"/>
  </svg>`,
)}`

/** A simple illustration for the media slot. */
function Illustration({ label }: { label: string }) {
  return (
    <div
      role="img"
      aria-label={label}
      className="gap-3 p-6 grid aspect-[4/3] w-full grid-cols-3 rounded-xl bg-primary-subtle"
    >
      {["file-text", "banknote", "calendar", "building", "users", "globe"].map((name) => (
        <span key={name} className="shadow-xs grid place-items-center rounded-lg bg-background/80 text-primary">
          <Icon name={name} size="lg" />
        </span>
      ))}
    </div>
  )
}

export default function HeroDemo() {
  const dv = useDhivehi()
  const s = dv
    ? {
        eyebrow: "ގައުމީ ޕޯޓަލް",
        title: "ސަރުކާރުގެ ޚިދުމަތްތައް، އެއް ތަނަކުން",
        lead: "ޕާސްޕޯޓް، ޓެކްސް، ހުއްދަތަކާއި އިތުރު ޚިދުމަތްތައް އޮންލައިންކޮށް.",
        search: "ޚިދުމަތެއް ހޯއްދަވާ",
        start: "ފަށާ",
        browse: "ހުރިހާ ޚިދުމަތެއް",
        visit: "އައްޑޫއަށް މަރުޙަބާ",
        visitLead: "ރާއްޖޭގެ ދެކުނުގައި ހުރި ސިޓީ.",
        plan: "ދަތުރު ރާވާ",
        media: "ޚިދުމަތްތަކުގެ ނިޝާންތައް",
      }
    : {
        eyebrow: "National portal",
        title: "Government services, in one place",
        lead: "Apply for passports, pay taxes, renew permits and track your requests online.",
        search: "Search services",
        start: "Get started",
        browse: "Browse all services",
        visit: "Welcome to Addu City",
        visitLead: "The southernmost city of the Maldives, linked by the longest road in the country.",
        plan: "Plan your trip",
        media: "Service icons",
      }
  return (
    <DemoPage>
      <DemoSection title="With search" description="Centred, with a search slot and actions." className="block">
        <Hero
          tone="muted"
          rounded
          align="center"
          eyebrow={s.eyebrow}
          title={s.title}
          description={s.lead}
          search={<SearchBox aria-label={s.search} placeholder={s.search} />}
          actions={
            <>
              <Button>{s.start}</Button>
              <Button variant="outline">{s.browse}</Button>
            </>
          }
        />
      </DemoSection>
      <DemoSection
        title="With media"
        description="Text and media side by side; the media moves below in narrow containers."
        className="block"
      >
        <Hero
          headingLevel={2}
          eyebrow={s.eyebrow}
          title={s.title}
          description={s.lead}
          media={<Illustration label={s.media} />}
          actions={
            <Button>
              {s.start}
              <Icon name="arrow-right" />
            </Button>
          }
        />
      </DemoSection>
      <DemoSection
        title="Background image"
        description="A decorative photo behind a scrim made from theme tokens (plain and primary tones)."
        className="gap-6 grid"
      >
        <Hero
          rounded
          size="lg"
          headingLevel={2}
          backgroundImage={lagoon}
          title={s.visit}
          description={s.visitLead}
          actions={<Button>{s.plan}</Button>}
        />
        <Hero
          rounded
          size="sm"
          tone="primary"
          headingLevel={2}
          backgroundImage={lagoon}
          title={s.visit}
          description={s.visitLead}
          actions={<Button variant="secondary">{s.plan}</Button>}
        />
      </DemoSection>
      <DemoSection title="In a narrow column" className="max-w-sm block">
        <Hero tone="muted" rounded size="sm" headingLevel={2} title={s.title} description={s.lead} />
      </DemoSection>
    </DemoPage>
  )
}
