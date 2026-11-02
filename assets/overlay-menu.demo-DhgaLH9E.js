var e=`import { Button, LanguageSwitcher, Logo, OverlayMenu } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"
import { DemoNav, useDhivehi } from "./_demo-nav"

export const meta = {
  title: "Full-screen overlay menu",
  group: "Layout and navigation",
  order: 29,
  description: "Full-screen menu for portals and kiosks: portal, focus trap, Escape closes, large touch targets.",
}

export default function OverlayMenuDemo() {
  const dv = useDhivehi()
  return (
    <DemoNav initial="/courses">
      {(current) => (
        <DemoPage>
          <DemoSection title="Learning portal" description={current}>
            <OverlayMenu
              currentHref={current}
              logo={<Logo alt="Academy" text={dv ? "އެކަޑަމީ" : "Academy"} href="/" />}
              footer={
                <div className="gap-3 flex flex-wrap items-center justify-between">
                  <LanguageSwitcher variant="toggle" />
                  <Button>{dv ? "ސައިން އިން" : "Sign in"}</Button>
                </div>
              }
              items={[
                { label: dv ? "ފުރަތަމަ ސަފްޙާ" : "Home", href: "/", icon: "home" },
                {
                  label: dv ? "ކޯސްތައް" : "Courses",
                  href: "/courses",
                  icon: "list",
                  description: dv ? "48 ކޯސް" : "48 courses in Dhivehi and English",
                },
                {
                  label: dv ? "ޕްރޮގްރާމްތައް" : "Programmes",
                  icon: "grid",
                  items: [
                    { label: dv ? "ޑިޕްލޮމާ" : "Diplomas", href: "/programmes/diplomas" },
                    { label: dv ? "ސެޓްފިކެޓް" : "Certificates", href: "/programmes/certificates" },
                  ],
                },
                { label: dv ? "ގުޅުއްވާ" : "Contact", href: "/contact", icon: "phone" },
              ]}
            />
          </DemoSection>
        </DemoPage>
      )}
    </DemoNav>
  )
}
`;export{e as default};