import { FeatureGrid, Section, type FeatureItem } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"
import { useDhivehi } from "./_demo-nav"

export const meta = {
  title: "Feature grid",
  group: "Layout and navigation",
  order: 31,
  description: "A responsive grid of services or features with icons and links; columns follow the container.",
}

export default function FeatureGridDemo() {
  const dv = useDhivehi()
  const services: FeatureItem[] = dv
    ? [
        { icon: "file-text", title: "ޕާސްޕޯޓް", description: "އާ ޕާސްޕޯޓަކަށް ނުވަތަ އާކުރުމަށް.", href: "#passport" },
        { icon: "banknote", title: "ޓެކްސް ދެއްކުން", description: "މީރާއަށް ފައިސާ ދައްކަވާ.", href: "#tax" },
        {
          icon: "building",
          title: "ވިޔަފާރި ރަޖިސްޓްރީ",
          description: "ކުންފުންޏެއް ނުވަތަ ވިޔަފާރިއެއް.",
          href: "#business",
        },
        {
          icon: "calendar",
          title: "އެޕޮއިންޓްމަންޓް",
          description: "ކައުންޓަރަށް ވަގުތެއް ހޯއްދަވާ.",
          href: "#appointments",
        },
        { icon: "users", title: "އާއިލާ", description: "އުފަންދުވަސް، ކައިވެނި، އަދި ވަރި.", href: "#family" },
        { icon: "help", title: "އެހީ", description: "އާންމު ސުވާލުތަކުގެ ޖަވާބު." },
      ]
    : [
        {
          icon: "file-text",
          title: "Passports",
          description: "Apply for a new passport or renew one.",
          href: "#passport",
        },
        { icon: "banknote", title: "Pay tax", description: "GST, income tax and business tax to MIRA.", href: "#tax" },
        {
          icon: "building",
          title: "Register a business",
          description: "Companies, partnerships and sole traders.",
          href: "#business",
        },
        {
          icon: "calendar",
          title: "Appointments",
          description: "Book a time at a service counter.",
          href: "#appointments",
        },
        { icon: "users", title: "Family", description: "Births, marriages and divorces.", href: "#family" },
        { icon: "help", title: "Help centre", description: "Answers to the most common questions." },
      ]
  return (
    <DemoPage>
      <DemoSection
        title="Services (cards)"
        description="1 → 2 → 3 columns as the container grows. The whole card is clickable; the title is the link."
        className="block"
      >
        <Section title={dv ? "ޚިދުމަތްތައް" : "Popular services"}>
          <FeatureGrid items={services} />
        </Section>
      </DemoSection>
      <DemoSection title="Plain, centred, up to 4 columns" className="block">
        <FeatureGrid
          variant="plain"
          align="center"
          columns={4}
          items={services.slice(0, 4).map((item) => ({ ...item, href: undefined }))}
        />
      </DemoSection>
      <DemoSection
        title="In a sidebar"
        description="Columns come from container queries, so a narrow column stays one-up."
        className="max-w-xs block"
      >
        <FeatureGrid variant="muted" items={services.slice(0, 3)} />
      </DemoSection>
    </DemoPage>
  )
}
