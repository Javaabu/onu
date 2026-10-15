import { KeyboardKey, formatShortcut } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Keyboard key",
  group: "Display and feedback",
  order: 6,
  description: "Keys and shortcuts that adapt to the platform: ⌘K on Apple devices, Ctrl+K elsewhere.",
}

export default function KeyboardKeyDemo() {
  return (
    <DemoPage>
      <DemoSection title="Single keys">
        <KeyboardKey>Esc</KeyboardKey>
        <KeyboardKey keys="enter" />
        <KeyboardKey keys="tab" />
        <KeyboardKey keys="up" />
        <KeyboardKey keys="down" />
      </DemoSection>
      <DemoSection title="Detected platform">
        <KeyboardKey keys="mod+k" />
        <KeyboardKey keys="mod+shift+p" />
        <KeyboardKey keys="alt+shift+t" />
        <KeyboardKey keys="g d" />
      </DemoSection>
      <DemoSection title="Forced platform">
        <span className="text-sm">macOS:</span>
        <KeyboardKey keys="mod+s" platform="mac" />
        <KeyboardKey keys="ctrl+alt+delete" platform="mac" />
        <span className="text-sm">Windows / Linux:</span>
        <KeyboardKey keys="mod+s" platform="other" />
        <KeyboardKey keys="ctrl+alt+delete" platform="other" />
      </DemoSection>
      <DemoSection title="In text">
        <p className="text-sm">
          Press <KeyboardKey keys="mod+k" /> to search, or{" "}
          <code className="font-mono">{formatShortcut("mod+enter", "other")}</code> to send.
        </p>
        <p className="text-sm" lang="dv" dir="rtl">
          ހޯދުމަށް <KeyboardKey keys="mod+k" /> ފިއްތަވާ
        </p>
      </DemoSection>
    </DemoPage>
  )
}
