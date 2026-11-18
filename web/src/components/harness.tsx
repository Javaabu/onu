import * as React from "react"
import { useParams } from "react-router"

import { PageReady } from "./views"

// Scenarios for the real-browser tests in e2e/browser.spec.ts. Unlisted: not in the
// navigation, search, or the a11y and visual loops (those walk showcase/ and pages/).
const harnesses = Object.fromEntries(
  Object.entries(import.meta.glob<{ default: React.ComponentType }>("../e2e/*.harness.tsx")).map(([path, load]) => [
    path,
    React.lazy(load),
  ]),
)

/** `#/e2e/<name>` renders `web/src/e2e/<name>.harness.tsx`. */
export function HarnessRoute() {
  const { name } = useParams()
  const Harness = harnesses[`../e2e/${name}.harness.tsx`]
  if (!Harness) return <p>No harness named {name}</p>
  return (
    <main className="p-6 max-w-3xl mx-auto">
      <React.Suspense fallback={null}>
        <Harness />
        <PageReady />
      </React.Suspense>
    </main>
  )
}
