import * as React from "react"
import { useParams } from "react-router"

import { PageReady } from "./views"

// Scenarios for the real-browser tests in e2e/browser.spec.ts. Unlisted: not in the
// navigation, search, or the a11y and visual loops (those walk showcase/ and pages/).
const harnesses = import.meta.glob<{ default: React.ComponentType }>("../e2e/*.harness.tsx")

/** `#/e2e/<name>` renders `web/src/e2e/<name>.harness.tsx`. */
export function HarnessRoute() {
  const { name } = useParams()
  const load = harnesses[`../e2e/${name}.harness.tsx`]
  const Harness = React.useMemo(() => (load ? React.lazy(load) : null), [load])
  if (!Harness) return <p>No harness named {name}</p>
  return (
    <main className="p-6 mx-auto max-w-3xl">
      <React.Suspense fallback={null}>
        <Harness />
        <PageReady />
      </React.Suspense>
    </main>
  )
}
