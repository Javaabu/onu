var e=`import { Button, FormField, SlideOver, SlideOverClose, TextInput, type SlideOverSize } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Slide-over",
  group: "Overlays",
  order: 3,
  description: "Side panel with logical start/end sides (flips in RTL), sizes, and sticky header and footer.",
}

const sizes: SlideOverSize[] = ["sm", "md", "lg", "xl", "full"]

const footer = (
  <>
    <SlideOverClose asChild>
      <Button variant="outline">Cancel</Button>
    </SlideOverClose>
    <SlideOverClose asChild>
      <Button>Save</Button>
    </SlideOverClose>
  </>
)

export default function SlideOverDemo() {
  return (
    <DemoPage>
      <DemoSection title="Sides" description="\`end\` is on the right in LTR and on the left in RTL.">
        <SlideOver
          side="end"
          trigger={<Button>Open at end</Button>}
          title="Edit vessel"
          description="MV Hithadhoo Express, registration P-2041"
          footer={footer}
        >
          <div className="gap-4 grid">
            <FormField label="Vessel name">
              <TextInput defaultValue="Hithadhoo Express" />
            </FormField>
            <FormField label="Home port">
              <TextInput defaultValue="Addu City" />
            </FormField>
            <FormField label="Capacity">
              <TextInput defaultValue="120" inputMode="numeric" />
            </FormField>
          </div>
        </SlideOver>
        <SlideOver side="start" trigger={<Button variant="outline">Open at start</Button>} title="Navigation">
          <p className="text-muted-foreground">Panels on the start side suit navigation.</p>
        </SlideOver>
      </DemoSection>

      <DemoSection title="Sizes">
        {sizes.map((size) => (
          <SlideOver key={size} size={size} trigger={<Button variant="outline">{size}</Button>} title={\`Size \${size}\`}>
            <p className="text-muted-foreground">On phones the panel leaves a strip of the page visible.</p>
          </SlideOver>
        ))}
      </DemoSection>

      <DemoSection title="Long content" description="Header and footer stay visible while the body scrolls.">
        <SlideOver trigger={<Button variant="outline">Activity log</Button>} title="Activity log" footer={footer}>
          <ol className="gap-3 grid">
            {Array.from({ length: 40 }, (_, i) => (
              <li key={i} className="text-sm">
                <span className="font-medium">Hawwa Ibrahim</span> updated permit #{1040 + i}
                <span className="text-xs block text-muted-foreground">{i + 1} hours ago</span>
              </li>
            ))}
          </ol>
        </SlideOver>
      </DemoSection>

      <DemoSection title="ދިވެހި">
        <SlideOver
          trigger={<Button variant="outline">ތަފްސީލު</Button>}
          title="މުވައްޒަފުގެ ތަފްސީލު"
          description="އައިޝަތު ޢަލީ، ހުޅުމާލެ"
        >
          <FormField label="ނަން">
            <TextInput thaana defaultValue="އައިޝަތު ޢަލީ" />
          </FormField>
        </SlideOver>
      </DemoSection>
    </DemoPage>
  )
}
`;export{e as default};