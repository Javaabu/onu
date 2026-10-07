import { BottomNav } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"
import { DemoFrame, DemoNav, useDhivehi } from "./_demo-nav"

export const meta = {
  title: "Mobile bottom navigation",
  group: "Layout and navigation",
  order: 8,
  description:
    "Phone bottom bar with ≥ 44px targets, badges, the active state and safe-area padding. Hidden from 768px by default.",
}

export default function BottomNavDemo() {
  const dv = useDhivehi()
  return (
    <DemoPage>
      <DemoSection title="Citizen app" description="Shown at every width here (hideFrom='never')." className="block">
        <DemoNav initial="/applications/42">
          {(current) => (
            <DemoFrame className="max-w-sm mx-auto h-[360px]">
              <div className="p-4 text-sm text-muted-foreground">{current}</div>
              <BottomNav
                hideFrom="never"
                currentHref={current}
                items={[
                  { label: dv ? "ގެ" : "Home", href: "/", icon: "home" },
                  { label: dv ? "އެޕްލިކޭޝަން" : "Applications", href: "/applications", icon: "file-text", badge: 2 },
                  { label: dv ? "ސްކޭން" : "Scan", href: "/scan", icon: "qr-code" },
                  { label: dv ? "އިންބޮކްސް" : "Inbox", href: "/inbox", icon: "mail", badge: 128 },
                  { label: dv ? "އަހަރެން" : "Profile", href: "/profile", icon: "user" },
                ]}
              />
            </DemoFrame>
          )}
        </DemoNav>
      </DemoSection>
    </DemoPage>
  )
}
