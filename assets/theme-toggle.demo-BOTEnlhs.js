var e=`import { ThemeToggle } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Theme toggle",
  group: "Layout and navigation",
  order: 22,
  description: "Light / dark / system switch using useTheme(). The choice persists and is announced.",
}

export default function ThemeToggleDemo() {
  return (
    <DemoPage>
      <DemoSection title="Menu (default)">
        <ThemeToggle />
        <ThemeToggle size="sm" />
      </DemoSection>
      <DemoSection title="Segmented">
        <ThemeToggle variant="segmented" />
        <ThemeToggle variant="segmented" showSystem={false} size="sm" />
      </DemoSection>
      <DemoSection title="Cycle">
        <ThemeToggle variant="cycle" />
      </DemoSection>
    </DemoPage>
  )
}
`;export{e as default};