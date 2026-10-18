var e=`import { FormField, ThaanaInput, ThaanaTextarea } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = { title: "Thaana input", group: "Text inputs", order: 13 }

export default function ThaanaInputDemo() {
  return (
    <DemoPage>
      <DemoSection
        title="Phonetic (default)"
        description="Try typing: dhivehi → ދިވެހި"
        className="max-w-md gap-4 grid"
      >
        <FormField label="ނަން">
          <ThaanaInput />
        </FormField>
        <FormField label="އެޑްރެސް">
          <ThaanaTextarea />
        </FormField>
      </DemoSection>
      <DemoSection title="Other layouts" className="max-w-md gap-4 grid">
        <FormField label="Phonetic (Hassan Hameed)">
          <ThaanaInput thaana={{ keymap: "phonetic-hh" }} />
        </FormField>
        <FormField label="Typewriter">
          <ThaanaInput thaana={{ keymap: "typewriter" }} />
        </FormField>
        <FormField label="Paste converts Latin text">
          <ThaanaInput thaana={{ paste: "transliterate" }} />
        </FormField>
      </DemoSection>
    </DemoPage>
  )
}
`;export{e as default};