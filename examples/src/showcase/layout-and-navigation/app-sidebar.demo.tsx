import { AppSidebar, Logo, SidebarProvider, SidebarTrigger, UserProfile } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"
import { DemoFrame, DemoNav, adminGroups, useDhivehi } from "./_demo-nav"

export const meta = {
  title: "Sidebar",
  group: "Layout and navigation",
  order: 6,
  description:
    "AppSidebar: the shadcn sidebar with a simple items API — groups, icons, badges, nested items and the active state from the current URL.",
}

function Demo({
  variant,
  side,
  defaultOpen = true,
}: {
  variant?: "sidebar" | "floating" | "inset"
  side?: "start" | "end"
  defaultOpen?: boolean
}) {
  const dv = useDhivehi()
  return (
    <DemoNav initial="/applications">
      {(current) => (
        <DemoFrame className="h-[480px]">
          <SidebarProvider defaultOpen={defaultOpen} className="min-h-0 h-full">
            <AppSidebar
              className="h-full"
              variant={variant}
              side={side}
              groups={adminGroups(dv)}
              currentHref={current}
              header={<Logo alt="Onu" text="Onu" src={`${import.meta.env.BASE_URL}favicon.svg`} />}
              footer={
                <UserProfile
                  name="Ahmed Ali"
                  subtitle={dv ? "އެޑްމިން" : "Administrator"}
                  side="top"
                  onSignOut={() => {}}
                />
              }
            />
            <div className="p-4 flex-1">
              <SidebarTrigger />
              <p className="mt-4 text-sm text-muted-foreground">{current}</p>
            </div>
          </SidebarProvider>
        </DemoFrame>
      )}
    </DemoNav>
  )
}

export default function AppSidebarDemo() {
  return (
    <DemoPage>
      <DemoSection title="Default (collapses to icons)" className="block">
        <Demo />
      </DemoSection>
      <DemoSection
        title="Collapsed"
        description="Hover icons for tooltips; nested items open in a menu."
        className="block"
      >
        <Demo defaultOpen={false} />
      </DemoSection>
      <DemoSection title="Floating, at the inline end" className="block">
        <Demo variant="floating" side="end" />
      </DemoSection>
    </DemoPage>
  )
}
