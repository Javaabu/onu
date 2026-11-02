var e=`import { Button, Icon, Section } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"
import { useDhivehi } from "./_demo-nav"

export const meta = {
  title: "Section",
  group: "Layout and navigation",
  order: 12,
  description:
    "A page section with heading, description and actions. Actions move under the text in narrow containers.",
}

export default function SectionDemo() {
  const dv = useDhivehi()
  const body = (
    <dl className="gap-3 text-sm sm:grid-cols-2 grid">
      <div>
        <dt className="text-muted-foreground">{dv ? "އީމެއިލް" : "Email"}</dt>
        <dd>shifa@example.mv</dd>
      </div>
      <div>
        <dt className="text-muted-foreground">{dv ? "ރަށް" : "Island"}</dt>
        <dd>{dv ? "ހުޅުމާލެ" : "Hulhumalé"}</dd>
      </div>
    </dl>
  )
  return (
    <DemoPage>
      <DemoSection title="Variants" className="gap-6 grid">
        <Section
          title={dv ? "ގުޅޭނެ ގޮތް" : "Contact details"}
          description={dv ? "މެމްބަރާ ގުޅޭނެ ގޮތްތައް" : "How we reach this member."}
          actions={
            <Button variant="outline" size="sm">
              <Icon name="edit" />
              {dv ? "ބަދަލުކުރޭ" : "Edit"}
            </Button>
          }
        >
          {body}
        </Section>
        <Section
          variant="card"
          title={dv ? "ފައިސާ" : "Billing"}
          description={dv ? "ފަހު ފައިސާ ދެއްކި ތާރީޚް: 1 އޮކްޓޫބަރު" : "Last payment MVR 1,250.00 on 1 October."}
          actions={<Button size="sm">{dv ? "ބިލެއް ހަދާ" : "Create invoice"}</Button>}
        >
          {body}
        </Section>
        <Section variant="muted" title={dv ? "ނޯޓު" : "Notes"} headingLevel={3}>
          <p className="text-sm">{dv ? "ނޯޓެއް ނެތް." : "No notes yet."}</p>
        </Section>
      </DemoSection>
      <DemoSection title="In a narrow column" className="max-w-xs block">
        <Section
          variant="card"
          title={dv ? "ސެޓިންގްސް" : "Settings"}
          description={dv ? "ކުޑަ ތަނެއްގައި" : "Actions wrap below the heading."}
          actions={<Button size="sm">{dv ? "ސޭވްކުރޭ" : "Save"}</Button>}
        />
      </DemoSection>
    </DemoPage>
  )
}
`;export{e as default};