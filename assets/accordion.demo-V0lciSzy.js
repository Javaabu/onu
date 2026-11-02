var e=`import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"
import { useDhivehi } from "./_demo-nav"

export const meta = {
  title: "Accordion",
  group: "Layout and navigation",
  order: 17,
  description: "shadcn Accordion with an items API, single (collapsible) or multiple, and visual variants.",
}

export default function AccordionDemo() {
  const dv = useDhivehi()
  const items = [
    {
      value: "fees",
      icon: "credit-card",
      title: dv ? "ފީ ކިހާވަރެއް؟" : "What are the fees?",
      content: dv ? "އެޕްލިކޭޝަނަކަށް 50 ރުފިޔާ." : "MVR 50 per application, payable by BML Connect or transfer.",
    },
    {
      value: "time",
      icon: "clock",
      title: dv ? "ކިހާ ދުވަހެއް ނަގާނެ؟" : "How long does it take?",
      content: dv ? "5 ބައްޔަތު ދުވަސް." : "Up to 5 working days after all documents are received.",
    },
    {
      value: "where",
      icon: "map-pin",
      title: dv ? "ކޮންތާކުން؟" : "Where do I collect it?",
      content: dv ? "މާލޭގައި ނުވަތަ ރަށު ކައުންސިލުން." : "In Malé, or from your island council office.",
    },
    { value: "closed", title: dv ? "ބަންދު" : "Closed topic", content: "", disabled: true },
  ]
  return (
    <DemoPage>
      <DemoSection title="Single (default, collapsible)" className="block">
        <Accordion items={items} defaultValue="fees" />
      </DemoSection>
      <DemoSection title="Multiple, bordered" className="block">
        <Accordion type="multiple" variant="bordered" items={items} defaultValue={["fees", "time"]} />
      </DemoSection>
      <DemoSection title="Separated" className="block">
        <Accordion variant="separated" items={items.slice(0, 3)} />
      </DemoSection>
      <DemoSection title="Composed (shadcn API)" className="block">
        <Accordion>
          <AccordionItem value="a">
            <AccordionTrigger>{dv ? "ސުވާލު" : "Question"}</AccordionTrigger>
            <AccordionContent>{dv ? "ޖަވާބު" : "Answer"}</AccordionContent>
          </AccordionItem>
        </Accordion>
      </DemoSection>
    </DemoPage>
  )
}
`;export{e as default};