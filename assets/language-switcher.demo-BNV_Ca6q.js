var e=`import { LanguageSwitcher } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"
import { useSettings } from "../../settings"

export const meta = {
  title: "Language switcher",
  group: "Layout and navigation",
  order: 21,
  description:
    "Switch between English and ދިވެހި using native names, as a select, toggle or menu. Changes the showcase locale.",
}

export default function LanguageSwitcherDemo() {
  const { settings, update } = useSettings()
  const onChange = (code: string) => update({ locale: code as "en" | "dv" })
  return (
    <DemoPage>
      <DemoSection title="Select">
        <LanguageSwitcher value={settings.locale} onChange={onChange} />
        <LanguageSwitcher value={settings.locale} onChange={onChange} size="sm" showIcon={false} />
      </DemoSection>
      <DemoSection title="Toggle">
        <LanguageSwitcher variant="toggle" value={settings.locale} onChange={onChange} />
      </DemoSection>
      <DemoSection title="Menu">
        <LanguageSwitcher variant="menu" value={settings.locale} onChange={onChange} />
      </DemoSection>
      <DemoSection title="Disabled">
        <LanguageSwitcher disabled />
      </DemoSection>
    </DemoPage>
  )
}
`;export{e as default};