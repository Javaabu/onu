import * as React from "react"
import { Badge } from "@javaabu/onu"
import { QrCodeScanner } from "@javaabu/onu/media"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "QR code scanner",
  group: "Text inputs",
  order: 21,
  description: "Camera scanning with a polyfill fallback, torch, and manual entry.",
}

export default function QrCodeScannerDemo() {
  const [results, setResults] = React.useState<string[]>([])
  return (
    <DemoPage>
      <DemoSection
        title="Scan a ticket"
        description="Allow camera access when asked. No camera? Type the code instead (e.g. TKT-2026-0042)."
        className="max-w-md gap-4 grid"
      >
        <QrCodeScanner onScan={(value) => setResults((r) => [value, ...r].slice(0, 5))} />
        {results.length ? (
          <ul className="gap-2 flex flex-wrap" aria-label="Scanned codes">
            {results.map((r, i) => (
              <li key={`${i}-${r}`}>
                <Badge variant="secondary" dir="ltr">
                  {r}
                </Badge>
              </li>
            ))}
          </ul>
        ) : null}
      </DemoSection>
      <DemoSection title="Continuous (kiosk check-in)" className="max-w-md gap-4 grid">
        <QrCodeScanner continuous onScan={() => undefined} />
      </DemoSection>
    </DemoPage>
  )
}
