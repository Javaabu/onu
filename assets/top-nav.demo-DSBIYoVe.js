var e=`import { Button, Logo, TopNav } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"
import { DemoFrame, DemoNav, portalItems, useDhivehi } from "./_demo-nav"

export const meta = {
  title: "Top navigation bar",
  group: "Layout and navigation",
  order: 3,
  description: "Horizontal navigation with dropdown panels. Below 768px it collapses to a menu button and a drawer.",
}

export default function TopNavDemo() {
  const dv = useDhivehi()
  const logo = <Logo alt="Onu" text="Onu" src={\`\${import.meta.env.BASE_URL}favicon.svg\`} />
  return (
    <DemoPage>
      <DemoSection title="Portal navigation" className="block">
        <DemoNav initial="/services/passports">
          {(current) => (
            <DemoFrame className="overflow-visible">
              <div className="gap-4 px-4 h-14 flex items-center border-b">
                {logo}
                <TopNav
                  className="md:ms-6 md:me-auto ms-auto"
                  items={portalItems(dv)}
                  currentHref={current}
                  logo={logo}
                  mobileFooter={<Button className="w-full">{dv ? "ސައިން އިން" : "Sign in"}</Button>}
                />
              </div>
              <p className="p-4 text-sm text-muted-foreground">{current}</p>
            </DemoFrame>
          )}
        </DemoNav>
      </DemoSection>
    </DemoPage>
  )
}
`;export{e as default};