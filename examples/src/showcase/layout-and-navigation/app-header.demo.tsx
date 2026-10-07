import {
  AppHeader,
  Button,
  Icon,
  LanguageSwitcher,
  Logo,
  NotificationCenter,
  ThemeToggle,
  TopNav,
  UserProfile,
} from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"
import { DemoFrame, DemoNav, portalItems, useDhivehi } from "./_demo-nav"

export const meta = {
  title: "Header",
  group: "Layout and navigation",
  order: 2,
  description: "The top bar: logo, navigation or search, and actions. Sticky, respecting the notch.",
}

export default function AppHeaderDemo() {
  const dv = useDhivehi()
  const logo = <Logo alt="Onu" text="Onu" src={`${import.meta.env.BASE_URL}favicon.svg`} />
  return (
    <DemoPage>
      <DemoSection title="Admin" className="block">
        <DemoFrame>
          <AppHeader
            sticky={false}
            logo={logo}
            actions={
              <>
                <ThemeToggle />
                <NotificationCenter notifications={[]} />
                <UserProfile compact name="Aishath Shifa" onSignOut={() => {}} />
              </>
            }
          >
            <Button variant="outline" className="sm:inline-flex hidden text-muted-foreground">
              <Icon name="search" />
              {dv ? "ހޯދާ…" : "Search…"}
            </Button>
          </AppHeader>
        </DemoFrame>
      </DemoSection>
      <DemoSection title="Portal with navigation" className="block">
        <DemoNav initial="/news">
          {(current) => (
            <DemoFrame>
              <AppHeader
                sticky={false}
                logo={logo}
                actions={<LanguageSwitcher variant="menu" size="sm" />}
                classNames={{ center: "justify-end md:justify-center" }}
              >
                <TopNav items={portalItems(dv)} currentHref={current} logo={logo} />
              </AppHeader>
            </DemoFrame>
          )}
        </DemoNav>
      </DemoSection>
      <DemoSection title="Primary variant" className="block">
        <DemoFrame>
          <AppHeader sticky={false} variant="primary" logo={<span className="font-semibold">gov.mv</span>}>
            <span className="text-sm opacity-80">{dv ? "ދިވެހިރާއްޖޭގެ ސަރުކާރު" : "Government of Maldives"}</span>
          </AppHeader>
        </DemoFrame>
      </DemoSection>
    </DemoPage>
  )
}
