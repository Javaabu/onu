var e=`import {
  AppSidebar,
  AppSwitcher,
  Button,
  Logo,
  SidebarProvider,
  SidebarTrigger,
  UsageMeter,
  UserProfile,
} from "@javaabu/onu"

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
              header={<Logo alt="Onu" text="Onu" src={\`\${import.meta.env.BASE_URL}favicon.svg\`} />}
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

/** The Proton shell: app switcher, a call to action, count pills, coloured folders and labels, a quota meter. */
function ShellDemo() {
  const dv = useDhivehi()
  const tr = (en: string, dvText: string) => (dv ? dvText : en)
  return (
    <DemoNav initial="/inbox">
      {(current) => (
        <DemoFrame className="h-[640px]">
          <SidebarProvider className="min-h-0 h-full">
            <AppSidebar
              className="h-full"
              surface="shell"
              currentHref={current}
              header={
                <div className="gap-2 flex items-center justify-between">
                  <Logo alt="Onu" text="Onu" src={\`\${import.meta.env.BASE_URL}favicon.svg\`} />
                  <AppSwitcher
                    apps={[
                      { label: tr("Records", "ރެކޯޑްސް"), href: "/inbox", icon: "file-text", current: true },
                      { label: tr("Calendar", "ކަލެންޑަރު"), href: "/calendar", icon: "calendar" },
                      { label: tr("Drive", "ޑްރައިވް"), href: "/drive", icon: "folder" },
                    ]}
                  />
                </div>
              }
              action={
                <Button startIcon="add" onClick={() => {}}>
                  {tr("New application", "އައު އެޕްލިކޭޝަން")}
                </Button>
              }
              groups={[
                {
                  items: [
                    { label: tr("Inbox", "އިންބޮކްސް"), href: "/inbox", icon: "home", badge: 12 },
                    {
                      label: tr("In review", "ރިވިއުކުރަނީ"),
                      href: "/review",
                      icon: "clock",
                      badge: 34,
                      badgeTone: "neutral",
                    },
                    { label: tr("Starred", "ތަރި ޖަހާފަ"), href: "/starred", icon: "star" },
                    { label: tr("Trash", "ކުނިފޮށި"), href: "/trash", icon: "trash" },
                  ],
                },
                {
                  label: tr("Folders", "ފޯލްޑަރުތައް"),
                  items: [
                    {
                      label: tr("Building permits", "ބިނާކުރުމުގެ ހުއްދަ"),
                      href: "/f/building",
                      icon: "folder",
                      color: "#8080ff",
                    },
                    { label: tr("Land leases", "ބިން ކުއްޔަށް"), href: "/f/land", icon: "folder", color: "#db60d6" },
                  ],
                },
                {
                  label: tr("Labels", "ލޭބަލްތައް"),
                  items: [
                    { label: tr("Malé", "މާލެ"), href: "/l/male", color: "#1da583" },
                    { label: tr("Addu City", "އައްޑޫ ސިޓީ"), href: "/l/addu", color: "#f78400" },
                  ],
                },
              ]}
              footer={
                <UsageMeter
                  label={tr("Storage", "ޖާގަ")}
                  icon="file-archive"
                  value={1284}
                  max={2000}
                  link={{ label: tr("Get more space", "އިތުރު ޖާގަ"), href: "/billing" }}
                  meta="v5.0.42"
                />
              }
            />
            <div className="p-4 flex-1 bg-background">
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
      <DemoSection
        title="Proton shell"
        description="A call to action, count pills, coloured folders and labels, an app switcher and a quota meter on the shell colour (the default inside AppLayout)."
        className="block"
      >
        <ShellDemo />
      </DemoSection>
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
`;export{e as default};