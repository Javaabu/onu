import * as React from "react"
import { EfaasButton } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "eFaas button",
  group: "Form scaffolding",
  order: 20.5,
  description:
    "Sign in or register with eFaas in the eFaas colours and wording. Pass the eFaas icon from eFaas's brand kit as logo; this demo has none.",
}

export default function EfaasButtonDemo() {
  const [loading, setLoading] = React.useState(false)
  return (
    <DemoPage>
      <DemoSection title="Colour variations" className="items-center">
        <EfaasButton href="#/components/form-scaffolding/efaas-button" />
        <EfaasButton href="#/components/form-scaffolding/efaas-button" variant="white" />
        <EfaasButton href="#/components/form-scaffolding/efaas-button" variant="black" />
      </DemoSection>

      <DemoSection
        title="On a dark background"
        description="Use the white button on dark surfaces; the black one is not for dark backgrounds."
        className="p-6 items-center rounded-lg bg-[#164998]"
      >
        <EfaasButton href="#/components/form-scaffolding/efaas-button" variant="white" />
      </DemoSection>

      <DemoSection title="Register, large, square corners" className="items-center">
        <EfaasButton intent="register" size="lg" />
        <EfaasButton intent="register" shape="square" variant="white" />
      </DemoSection>

      <DemoSection title="Redirecting" description="Click to show the loading state for two seconds.">
        <EfaasButton
          loading={loading}
          onClick={() => {
            setLoading(true)
            setTimeout(() => setLoading(false), 2000)
          }}
        />
      </DemoSection>

      <DemoSection title="Full width" className="max-w-sm grid">
        <EfaasButton href="#/components/form-scaffolding/efaas-button" fullWidth />
      </DemoSection>
    </DemoPage>
  )
}
