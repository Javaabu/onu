import * as React from "react"
import { TextInput } from "@javaabu/onu"
import { QrCode, type QrCodeLevel } from "@javaabu/onu/media"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "QR code",
  group: "Files and media",
  order: 19,
  description: "QR code generator: themed SVG, error-correction levels, centre logo, download and copy.",
}

const logoSrc = `${import.meta.env.BASE_URL}favicon.svg`
const LEVELS: QrCodeLevel[] = ["L", "M", "Q", "H"]
const APPLICATION = "https://portal.gov.mv/applications/APP-2026-01893"
const BILL = "MVR 150.00 · Malé City Council · INV-2026-7781"

export default function QrCodeDemo() {
  const [value, setValue] = React.useState("https://verify.trade.gov.mv/BL-2026-04417")
  return (
    <DemoPage>
      <DemoSection
        title="Licence verification"
        description="Type to update the code. Download it as PNG or SVG, or copy the encoded text."
        className="gap-4 max-w-md grid"
      >
        <TextInput aria-label="Text to encode" value={value} onChange={(e) => setValue(e.target.value)} dir="ltr" />
        <QrCode
          value={value}
          size={200}
          label="QR code to verify licence BL-2026-04417"
          caption="Scan to verify"
          download
          copyable
          filename="licence-BL-2026-04417"
        />
      </DemoSection>

      <DemoSection
        title="Error-correction levels"
        description="Higher levels survive more damage but need more modules."
        className="gap-6"
      >
        {LEVELS.map((level) => (
          <QrCode key={level} value="TKT-2026-0042" level={level} size={112} caption={`Level ${level}`} />
        ))}
      </DemoSection>

      <DemoSection
        title="Centre logo"
        description="A logo switches to level H automatically and clears the modules behind it."
        className="gap-6"
      >
        <QrCode value={APPLICATION} logo={logoSrc} size={180} download={["png"]} filename="APP-2026-01893" />
        <QrCode value={APPLICATION} logo={{ src: logoSrc, size: 0.3 }} size={180} caption="Larger logo (30%)" />
      </DemoSection>

      <DemoSection
        title="Tones"
        description="contrast (default) keeps dark modules on a light ground in dark mode too; theme follows the theme; transparent uses the text colour."
        className="gap-6"
      >
        <QrCode value={BILL} caption="contrast" size={128} />
        <QrCode value={BILL} caption="theme" tone="theme" size={128} />
        <div className="p-2 rounded-lg bg-primary text-primary-foreground">
          <QrCode value={BILL} tone="transparent" quietZone={2} size={112} label="Bill INV-2026-7781" />
        </div>
      </DemoSection>

      <DemoSection title="Dhivehi text">
        <div dir="rtl" lang="dv" className="gap-4 flex flex-wrap">
          <QrCode
            value="އައިޝަތު ރަޝީދާ · ހުޅުމާލެ · ކ. އަތޮޅު"
            label="ކިއުއާރް ކޯޑު: އައިޝަތު ރަޝީދާ"
            size={150}
            showValue
            copyable
          />
        </div>
      </DemoSection>

      <DemoSection title="Too much data" description="Text that cannot fit shows an error instead of a code.">
        <QrCode value={"ހ".repeat(3000)} size={160} />
      </DemoSection>
    </DemoPage>
  )
}
