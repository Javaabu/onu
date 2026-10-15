import { LanguageSwitcher, Logo, SiteFooter } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"
import { DemoFrame, DemoNav, useDhivehi } from "./_demo-nav"

export const meta = {
  title: "Footer",
  group: "Layout and navigation",
  order: 9,
  description: "Site footer with link columns, social links, copyright, legal links and a language switcher slot.",
}

export default function SiteFooterDemo() {
  const dv = useDhivehi()
  return (
    <DemoPage>
      <DemoSection title="Portal footer" className="block">
        <DemoNav>
          {() => (
            <DemoFrame>
              <SiteFooter
                logo={<Logo alt="Javaabu" text="Javaabu" href="/" />}
                description={
                  dv
                    ? "ދިވެހިރާއްޖޭގެ ސަރުކާރާއި ވިޔަފާރިތަކަށް ސޮފްޓްވެއާ."
                    : "Software for government and businesses in the Maldives."
                }
                name={dv ? "ޖާވާބު" : "Javaabu Pvt Ltd"}
                columns={[
                  {
                    title: dv ? "ޚިދުމަތްތައް" : "Services",
                    links: [
                      { label: dv ? "ވެބްސައިޓް" : "Websites", href: "/websites" },
                      { label: dv ? "އެޕްތައް" : "Apps", href: "/apps" },
                      { label: dv ? "ހޯސްޓިންގ" : "Hosting", href: "/hosting" },
                    ],
                  },
                  {
                    title: dv ? "ކުންފުނި" : "Company",
                    links: [
                      { label: dv ? "އަހަރެމެން" : "About", href: "/about" },
                      { label: dv ? "ވަޒީފާ" : "Careers", href: "/careers" },
                    ],
                  },
                  {
                    title: dv ? "އެހީ" : "Support",
                    links: [
                      { label: dv ? "ލިޔުންތައް" : "Docs", href: "https://github.com/Javaabu", external: true },
                      { label: dv ? "ގުޅުއްވާ" : "Contact", href: "/contact" },
                    ],
                  },
                  {
                    title: dv ? "އޮފީސް" : "Office",
                    links: [{ label: "Malé 20026", href: "/office" }],
                  },
                ]}
                social={[
                  { label: "Email", href: "mailto:hello@javaabu.com", icon: "mail" },
                  { label: "Website", href: "https://javaabu.com", icon: "globe" },
                  { label: "Phone", href: "tel:+9603000000", icon: "phone" },
                ]}
                legalLinks={[
                  { label: dv ? "ޕްރައިވެސީ" : "Privacy", href: "/privacy" },
                  { label: dv ? "ޝަރުތުތައް" : "Terms", href: "/terms" },
                ]}
                languageSwitcher={<LanguageSwitcher size="sm" />}
              />
            </DemoFrame>
          )}
        </DemoNav>
      </DemoSection>
      <DemoSection title="Minimal" className="block">
        <DemoFrame>
          <SiteFooter name="Onu" />
        </DemoFrame>
      </DemoSection>
    </DemoPage>
  )
}
