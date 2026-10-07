import {
  AppHeader,
  AppLayout,
  AppSidebar,
  BottomNav,
  Breadcrumbs,
  Button,
  Icon,
  Logo,
  NotificationCenter,
  PageTitle,
  ThemeToggle,
  UserProfile,
} from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"
import { DemoFrame, DemoNav, adminGroups, useDhivehi } from "./_demo-nav"

export const meta = {
  title: "App layout",
  group: "Layout and navigation",
  order: 1,
  description:
    "Application shell: skip link, sidebar (collapses to icons, off-canvas drawer on phones), header, content and an optional phone bottom navigation.",
}

function Shell({ bottomNav, collapsible }: { bottomNav?: boolean; collapsible?: "icon" | "offcanvas" }) {
  const dv = useDhivehi()
  return (
    <DemoNav initial="/users/all">
      {(current) => (
        <DemoFrame className="h-[600px]">
          <AppLayout
            className="min-h-0 h-full"
            sidebar={
              <AppSidebar
                className="h-full"
                collapsible={collapsible}
                groups={adminGroups(dv)}
                currentHref={current}
                header={<Logo alt="Onu" text="Onu" src={`${import.meta.env.BASE_URL}favicon.svg`} />}
                footer={
                  <UserProfile
                    name={dv ? "އައިޝަތު ޝިފާ" : "Aishath Shifa"}
                    subtitle="shifa@javaabu.com"
                    onSignOut={() => {}}
                    side="top"
                  />
                }
              />
            }
            header={
              <AppHeader
                sidebarTrigger
                actions={
                  <>
                    <ThemeToggle />
                    <NotificationCenter
                      notifications={[
                        {
                          id: "1",
                          title: dv ? "އެޕްލިކޭޝަނެއް ހުށަހެޅީ" : "New application from Hulhumalé",
                          time: new Date(),
                        },
                      ]}
                      onMarkRead={() => {}}
                    />
                  </>
                }
              >
                <Breadcrumbs
                  items={[
                    { label: dv ? "މެމްބަރުން" : "Users", href: "/users" },
                    { label: dv ? "ހުރިހާ މެމްބަރުން" : "All users" },
                  ]}
                />
              </AppHeader>
            }
            bottomNav={
              bottomNav ? (
                <BottomNav
                  currentHref={current}
                  items={[
                    { label: dv ? "ގެ" : "Home", href: "/", icon: "home" },
                    {
                      label: dv ? "އެޕްލިކޭޝަން" : "Applications",
                      href: "/applications",
                      icon: "file-text",
                      badge: 12,
                    },
                    { label: dv ? "މެމްބަރުން" : "Users", href: "/users", icon: "users" },
                    { label: dv ? "ސެޓިންގްސް" : "Settings", href: "/settings", icon: "settings" },
                  ]}
                />
              ) : undefined
            }
          >
            <PageTitle
              title={dv ? "މެމްބަރުން" : "Users"}
              description={current}
              action={
                <Button>
                  <Icon name="add" />
                  {dv ? "އައު މެމްބަރެއް" : "New user"}
                </Button>
              }
              links={[{ label: dv ? "ކުނިފޮށި" : "Trash", href: "/users/trash", icon: "trash", dot: true }]}
            />
            <div className="mt-6 gap-4 sm:grid-cols-2 grid">
              {["Malé", "Addu City", "Fuvahmulah", "Kulhudhuffushi"].map((city) => (
                <div key={city} className="h-28 p-4 text-sm rounded-xl border bg-muted/40">
                  {city}
                </div>
              ))}
            </div>
          </AppLayout>
        </DemoFrame>
      )}
    </DemoNav>
  )
}

export default function AppLayoutDemo() {
  return (
    <DemoPage>
      <DemoSection
        title="Admin shell"
        description="Toggle the sidebar with the header button, the rail, or Ctrl/⌘+B. It collapses to icons; nested items open in a flyout. Narrow the window to see the drawer."
        className="block"
      >
        <Shell />
      </DemoSection>
      <DemoSection
        title="With bottom navigation"
        description="The bottom bar shows on phones only (below 768px) and pads the content."
        className="block"
      >
        <Shell bottomNav collapsible="offcanvas" />
      </DemoSection>
    </DemoPage>
  )
}
