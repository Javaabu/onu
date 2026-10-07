import * as React from "react"
import { UserProfile } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"
import { DemoNav, useDhivehi } from "./_demo-nav"

export const meta = {
  title: "User profile widget",
  group: "Layout and navigation",
  order: 24,
  description: "Avatar, name and role with a menu: Profile, Settings, custom items and Sign out.",
}

export default function UserProfileDemo() {
  const dv = useDhivehi()
  const [status, setStatus] = React.useState("")
  return (
    <DemoNav>
      {() => (
        <DemoPage>
          <DemoSection title="Sidebar footer style" description={status || undefined} className="max-w-64 block">
            <UserProfile
              name={dv ? "އައިޝަތު ޝިފާ" : "Aishath Shifa"}
              subtitle={dv ? "އެޑްމިނިސްޓްރޭޓަރ" : "Administrator"}
              profileHref="/profile"
              settingsHref="/settings"
              items={[{ label: dv ? "ފައިސާ" : "Billing", icon: "credit-card", href: "/billing" }]}
              onSignOut={() => setStatus(dv ? "ސައިން އައުޓް ވެއްޖެ" : "Signed out")}
            />
          </DemoSection>
          <DemoSection title="Compact (header)">
            <UserProfile
              compact
              name="Ahmed Ali"
              subtitle="ahmed@example.mv"
              profileHref="/profile"
              onSignOut={() => {}}
            />
            <UserProfile compact name="Mariyam Nazima" settingsHref="/settings" onSignOut={() => {}} />
          </DemoSection>
        </DemoPage>
      )}
    </DemoNav>
  )
}
