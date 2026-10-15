import * as React from "react"
import {
  EFAAS_LOGO_VARIANTS,
  EfaasButton,
  EfaasLogo,
  SegmentedControl,
  Select,
  type EfaasButtonVariant,
  type EfaasLogoVariant,
} from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "eFaas button",
  group: "Form scaffolding",
  order: 20.5,
  description:
    "Sign in or register with eFaas in the eFaas colours and wording, with any of the 22 official eFaas logos (logoVariant).",
}

const VARIANT_NUMBERS = Object.keys(EFAAS_LOGO_VARIANTS).map(Number) as EfaasLogoVariant[]

function describe(n: EfaasLogoVariant) {
  const v = EFAAS_LOGO_VARIANTS[n]
  const lang = v.language === "dv" ? "Dhivehi" : v.language === "en" ? "English" : ""
  return [
    v.layout === "icon" ? "Icon" : `${v.layout[0]!.toUpperCase()}${v.layout.slice(1)}`,
    lang,
    v.colour,
    `for ${v.background} backgrounds`,
  ]
    .filter(Boolean)
    .join(", ")
}

function LogoPicker() {
  const [logo, setLogo] = React.useState<EfaasLogoVariant>(15)
  const [colour, setColour] = React.useState<EfaasButtonVariant>("blue")
  const dark = EFAAS_LOGO_VARIANTS[logo].background === "dark"
  return (
    <div className="gap-4 grid">
      <div className="gap-3 flex flex-wrap items-end">
        <Select
          aria-label="Logo variant"
          value={String(logo)}
          onValueChange={(v) => {
            const n = Number(v) as EfaasLogoVariant
            setLogo(n)
            // Logos for dark backgrounds go on the blue button; logos for light ones on the white button.
            if (EFAAS_LOGO_VARIANTS[n].layout !== "icon")
              setColour(EFAAS_LOGO_VARIANTS[n].background === "dark" ? "blue" : "white")
          }}
          options={VARIANT_NUMBERS.map((n) => ({ value: String(n), label: `${n}: ${describe(n)}` }))}
          className="w-80"
        />
        <SegmentedControl
          aria-label="Button colour"
          value={colour}
          onValueChange={(v) => setColour(v as EfaasButtonVariant)}
          options={[
            { value: "blue", label: "blue" },
            { value: "white", label: "white" },
            { value: "black", label: "black" },
          ]}
        />
      </div>
      <div className={dark && colour === "white" ? "p-4 rounded-lg bg-[#164998]" : undefined}>
        <EfaasButton href="#/components/form-scaffolding/efaas-button" logoVariant={logo} variant={colour} />
      </div>
      <pre className="text-xs font-mono" dir="ltr">{`<EfaasButton logoVariant={${logo}} variant="${colour}" />`}</pre>
    </div>
  )
}

export default function EfaasButtonDemo() {
  const [loading, setLoading] = React.useState(false)
  return (
    <DemoPage>
      <DemoSection
        title="Logo variants"
        description="Pick any of the 22 official logos by number. The icon marks (9, 10, 11, 14, 15) sit before the label; the other logos already spell eFaas, so they replace it (the wording stays the button's accessible name)."
      >
        <LogoPicker />
      </DemoSection>

      <DemoSection title="All 22 logos" description="EfaasLogo, each on the background it is made for.">
        <ul className="gap-3 sm:grid-cols-2 lg:grid-cols-3 grid w-full">
          {VARIANT_NUMBERS.map((n) => (
            <li key={n} className="gap-2 grid">
              <div
                className={
                  EFAAS_LOGO_VARIANTS[n].background === "dark"
                    ? "h-28 p-4 flex items-center justify-center rounded-lg bg-[#164998]"
                    : "h-28 p-4 bg-white flex items-center justify-center rounded-lg border"
                }
              >
                <EfaasLogo variant={n} className="h-16 max-h-full max-w-full" />
              </div>
              <span className="text-xs text-muted-foreground">
                <span className="font-medium font-mono text-foreground">{n}</span> · {describe(n)}
              </span>
            </li>
          ))}
        </ul>
      </DemoSection>

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
