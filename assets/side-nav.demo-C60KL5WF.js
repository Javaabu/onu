var e=`import { SideNav } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"
import { DemoNav, useDhivehi } from "./_demo-nav"

export const meta = {
  title: "Side navigation",
  group: "Layout and navigation",
  order: 7,
  description:
    "A vertical navigation list for settings pages, docs and drawers: groups, icons, badges and collapsible nested items.",
}

export default function SideNavDemo() {
  const dv = useDhivehi()
  return (
    <DemoPage>
      <DemoSection title="Settings" className="gap-8 sm:grid-cols-[16rem_1fr] grid">
        <DemoNav initial="/settings/members/invitations">
          {(current) => (
            <>
              <SideNav
                aria-label={dv ? "ސެޓިންގްސް" : "Settings"}
                currentHref={current}
                groups={[
                  {
                    label: dv ? "ޖަމްޢިއްޔާ" : "Organisation",
                    items: [
                      { label: dv ? "އާންމު" : "General", href: "/settings", icon: "settings" },
                      {
                        label: dv ? "މެމްބަރުން" : "Members",
                        href: "/settings/members",
                        icon: "users",
                        badge: 24,
                        items: [
                          { label: dv ? "ހުރިހާ" : "All members", href: "/settings/members/all" },
                          { label: dv ? "ދައުވަތު" : "Invitations", href: "/settings/members/invitations", badge: 3 },
                        ],
                      },
                      { label: dv ? "ފައިސާ" : "Billing", href: "/settings/billing", icon: "credit-card" },
                    ],
                  },
                  {
                    label: dv ? "ސިކިއުރިޓީ" : "Security",
                    items: [
                      { label: dv ? "ޕާސްވޯޑް" : "Password", href: "/settings/password", icon: "key" },
                      {
                        label: dv ? "ލޮގްތައް" : "Audit logs",
                        icon: "history",
                        items: [
                          { label: dv ? "ލޮގިން" : "Sign-ins", href: "/settings/logs/sign-ins" },
                          { label: dv ? "ބަދަލުތައް" : "Changes", href: "/settings/logs/changes" },
                        ],
                      },
                      { label: dv ? "API ކީ" : "API keys", href: "/settings/api", icon: "lock", disabled: true },
                    ],
                  },
                ]}
              />
              <p className="text-sm text-muted-foreground">{current}</p>
            </>
          )}
        </DemoNav>
      </DemoSection>
      <DemoSection title="Large (kiosk / overlay)" className="max-w-sm block">
        <DemoNav initial="/courses">
          {(current) => (
            <SideNav
              size="lg"
              currentHref={current}
              items={[
                { label: dv ? "ފުރަތަމަ ސަފްޙާ" : "Home", href: "/", icon: "home" },
                {
                  label: dv ? "ކޯސްތައް" : "Courses",
                  href: "/courses",
                  icon: "list",
                  description: dv ? "48 ކޯސް" : "48 courses",
                },
                { label: dv ? "ގުޅުއްވާ" : "Contact", href: "/contact", icon: "phone" },
              ]}
            />
          )}
        </DemoNav>
      </DemoSection>
    </DemoPage>
  )
}
`;export{e as default};