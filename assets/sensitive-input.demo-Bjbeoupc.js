var e=`import { FormField, SensitiveInput } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Sensitive input",
  group: "Text inputs",
  order: 4,
  description: "A masked secret such as an API key, with reveal and copy.",
}

export default function SensitiveInputDemo() {
  return (
    <DemoPage>
      <DemoSection title="API keys" className="max-w-lg gap-4 grid">
        <FormField label="Live secret key" help="Copy copies the full key, even while it is hidden.">
          <SensitiveInput value="sk_live_51Hx9aBcDeFgHiJkLmN0pQ7342" />
        </FormField>
        <FormField label="Webhook signing secret">
          <SensitiveInput value="whsec_9f8e7d6c5b4a3f2e1d0c8812" visibleChars={6} />
        </FormField>
        <FormField label="ކްލައިންޓް ސީކްރެޓް">
          <SensitiveInput value="cs_mv_portal_00a1b2c3d4e5f6a7" />
        </FormField>
      </DemoSection>
      <DemoSection title="Variants" className="max-w-lg gap-4 grid">
        <FormField label="Copy only">
          <SensitiveInput value="tok_2026_ferry_api_b7c1" revealable={false} />
        </FormField>
        <FormField label="Revealed by default">
          <SensitiveInput value="pk_test_TYooMQauvdEDq54NiTphI7jx" defaultRevealed />
        </FormField>
        <FormField label="Disabled">
          <SensitiveInput value="sk_live_revoked_key_0000" disabled />
        </FormField>
      </DemoSection>
    </DemoPage>
  )
}
`;export{e as default};