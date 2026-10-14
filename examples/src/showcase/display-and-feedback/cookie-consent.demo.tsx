import * as React from "react"
import { Button, CookieConsent, openCookiePreferences, useCookieConsent } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Cookie consent",
  group: "Display and feedback",
  order: 10,
  description: "Banner and preferences dialog; the choice is saved in localStorage.",
}

const STORAGE_KEY = "onu-demo-cookie-consent"

export default function CookieConsentDemo() {
  const consent = useCookieConsent(STORAGE_KEY)
  const [mounted, setMounted] = React.useState(true)
  return (
    <DemoPage>
      <DemoSection title="Current choice" className="grid">
        <pre
          role="region"
          aria-label="Stored consent"
          // Focusable so the scrollable region can be scrolled by keyboard.
          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
          tabIndex={0}
          className="p-3 text-xs overflow-x-auto rounded-md bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          {consent ? JSON.stringify(consent, null, 2) : "No choice yet: the banner is shown at the bottom of the page."}
        </pre>
        <div className="gap-2 flex flex-wrap">
          <Button variant="outline" onClick={() => openCookiePreferences()}>
            Cookie settings
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              localStorage.removeItem(STORAGE_KEY)
              setMounted(false)
              requestAnimationFrame(() => setMounted(true))
            }}
          >
            Reset
          </Button>
        </div>
      </DemoSection>
      {mounted ? <CookieConsent storageKey={STORAGE_KEY} policyHref="#privacy" /> : null}
    </DemoPage>
  )
}
