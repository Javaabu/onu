import * as React from "react"
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Checkbox,
  Label,
  Slider,
  Switch,
  TextInput,
} from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Theme builder",
  group: "Foundations",
  order: 2,
  description: "Pick a primary colour and radius, preview them, and copy the CSS (REQUIREMENTS R9.7).",
}

function hexToOklch(hex: string): string {
  const n = parseInt(hex.slice(1), 16)
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }) as [number, number, number]
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  const C = Math.sqrt(A * A + B * B)
  const H = ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360
  return `oklch(${L.toFixed(3)} ${C.toFixed(3)} ${H.toFixed(1)})`
}

export default function ThemeBuilder() {
  const [hex, setHex] = React.useState("#1f7a4d")
  const [radius, setRadius] = React.useState(0.625)
  const primary = hexToOklch(hex)
  const css = `:root {\n  --onu-primary: ${primary};\n  --onu-radius: ${radius}rem;\n}`

  return (
    <DemoPage>
      <DemoSection title="Settings" className="max-w-md gap-4 grid">
        <div className="gap-2 grid">
          <Label htmlFor="primary-colour">Primary colour</Label>
          <div className="gap-2 flex items-center">
            <input
              id="primary-colour"
              type="color"
              value={hex}
              onChange={(e) => setHex(e.target.value)}
              className="h-9 w-14 cursor-pointer rounded-md border bg-transparent"
            />
            <code className="text-sm font-mono">{primary}</code>
          </div>
        </div>
        <div className="gap-2 grid">
          <Label>Radius ({radius}rem)</Label>
          <Slider
            min={0}
            max={1.25}
            step={0.125}
            value={[radius]}
            onValueChange={([v]) => setRadius(v ?? 0.625)}
            aria-label="Radius"
          />
        </div>
      </DemoSection>

      <DemoSection title="Preview" className="block">
        <div
          data-onu-theme
          style={{ "--onu-primary": primary, "--onu-radius": `${radius}rem` } as React.CSSProperties}
          className="gap-4 md:grid-cols-2 grid"
        >
          <Card>
            <CardHeader>
              <CardTitle>Renew licence</CardTitle>
            </CardHeader>
            <CardContent className="gap-3 grid">
              <TextInput aria-label="Licence number" placeholder="Licence number" />
              <div className="gap-2 flex items-center">
                <Checkbox id="tb-agree" defaultChecked />
                <Label htmlFor="tb-agree">I agree to the terms</Label>
              </div>
              <div className="gap-2 flex items-center">
                <Switch id="tb-notify" defaultChecked />
                <Label htmlFor="tb-notify">Email me updates</Label>
              </div>
              <div className="gap-2 flex flex-wrap">
                <Button>Pay MVR 250</Button>
                <Button variant="outline">Save draft</Button>
                <Badge>Pending</Badge>
              </div>
            </CardContent>
          </Card>
          <div
            className="dark p-4 rounded-xl bg-background text-foreground"
            data-onu-theme
            style={{ "--onu-primary": primary } as React.CSSProperties}
          >
            <p className="mb-3 text-sm text-muted-foreground">Dark mode</p>
            <div className="gap-2 flex flex-wrap">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Badge>Active</Badge>
            </div>
          </div>
        </div>
      </DemoSection>

      <DemoSection title="CSS" className="block">
        <pre className="p-4 text-sm overflow-auto rounded-lg border bg-muted font-mono" dir="ltr">
          <code>{css}</code>
        </pre>
        <Button className="mt-3" variant="outline" onClick={() => void navigator.clipboard?.writeText(css)}>
          Copy CSS
        </Button>
      </DemoSection>
    </DemoPage>
  )
}
