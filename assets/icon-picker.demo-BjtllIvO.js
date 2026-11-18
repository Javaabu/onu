var e=`import * as React from "react"
import {
  DynamicIcon,
  FormField,
  Icon,
  IconContext,
  IconPicker,
  SEMANTIC_ICON_NAMES,
  type IconSource,
} from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Icon picker",
  group: "Text inputs",
  order: 18,
  description: "Searchable, virtualised grid over Lucide and any registered icon sources.",
}

/**
 * A tiny extra source for the demo. Real projects register Iconify collections
 * (\`iconifySource\`) or FontAwesome on OnuProvider \`iconSources\`.
 */
const semanticSource: IconSource = {
  prefixes: ["onu"],
  label: "Onu semantic icons",
  render: (name, { className }) => <Icon name={name} className={className} />,
  list: () => SEMANTIC_ICON_NAMES.map((name) => \`onu:\${name}\`),
}

export default function IconPickerDemo() {
  const [icon, setIcon] = React.useState<string | null>("lucide:ship")
  const sources = React.useMemo(() => ({ sources: [semanticSource] }), [])
  return (
    <DemoPage>
      <DemoSection
        title="Lucide"
        description="Search, arrow keys to move, Enter to pick."
        className="max-w-md gap-4 grid"
      >
        <FormField label="Menu icon" help={\`Stored id: \${icon ?? "—"}\`}>
          <IconPicker value={icon} onValueChange={setIcon} />
        </FormField>
        {icon ? (
          <div className="gap-2 text-sm flex items-center text-muted-foreground">
            <DynamicIcon id={icon} className="size-6 text-foreground" /> rendered with &lt;DynamicIcon id=&quot;{icon}
            &quot;&gt;
          </div>
        ) : null}
      </DemoSection>
      <DemoSection title="Several sources" description="Filter by set with the select." className="max-w-md gap-4 grid">
        <IconContext.Provider value={sources}>
          <FormField label="އައިކަން">
            <IconPicker defaultValue="onu:home" />
          </FormField>
        </IconContext.Provider>
      </DemoSection>
      <DemoSection title="States" className="max-w-md gap-4 grid">
        <FormField label="Disabled">
          <IconPicker defaultValue="lucide:anchor" disabled />
        </FormField>
        <FormField label="With error" error="Choose an icon">
          <IconPicker />
        </FormField>
      </DemoSection>
    </DemoPage>
  )
}
`;export{e as default};