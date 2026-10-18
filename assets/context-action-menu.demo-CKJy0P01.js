var e=`import * as React from "react"
import { ActionMenu, ContextActionMenu, type MenuItem } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Context menu",
  group: "Overlays",
  order: 8,
  description: "ContextActionMenu: Right-click, long press on touch, or the Menu key / Shift+F10.",
}

const files = ["permit-2041.pdf", "vessel-photo.jpg", "receipt-MVR-1250.pdf"]

export default function ContextActionMenuDemo() {
  const [last, setLast] = React.useState("")
  const itemsFor = (file: string): MenuItem[] => [
    { label: "Open", icon: "external-link", onSelect: () => setLast(\`Opened \${file}\`) },
    { label: "Download", icon: "download", shortcut: "⌘S", onSelect: () => setLast(\`Downloaded \${file}\`) },
    { label: "Rename", icon: "edit", shortcut: "F2", onSelect: () => setLast(\`Rename \${file}\`) },
    { type: "separator" },
    {
      type: "sub",
      label: "Share with",
      icon: "share",
      items: [
        { label: "Finance team", onSelect: () => setLast("Shared with finance") },
        { label: "HR team", onSelect: () => setLast("Shared with HR") },
      ],
    },
    { type: "separator" },
    { label: "Delete", icon: "trash", variant: "destructive", onSelect: () => setLast(\`Deleted \${file}\`) },
  ]

  return (
    <DemoPage>
      <DemoSection
        title="Files"
        description="Right-click a file (long press on touch). The same actions are also in the ⋯ menu."
        className="grid"
      >
        <ul className="gap-2 grid">
          {files.map((file) => (
            <li key={file}>
              <ContextActionMenu items={itemsFor(file)} asChild>
                <div
                  // Focusable so keyboard users can open the menu with the Menu key or Shift+F10.
                  // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
                  tabIndex={0}
                  className="gap-3 px-3 py-2 flex items-center justify-between rounded-lg border outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <span className="text-sm">{file}</span>
                  <ActionMenu items={itemsFor(file)} label={\`Actions for \${file}\`} />
                </div>
              </ContextActionMenu>
            </li>
          ))}
        </ul>
        <span role="status" className="text-sm text-muted-foreground">
          {last}
        </span>
      </DemoSection>
      <DemoSection title="Area" className="grid">
        <ContextActionMenu items={itemsFor("canvas")}>
          <span className="h-32 text-sm flex items-center justify-center rounded-lg border border-dashed text-muted-foreground">
            Right-click or long press here
          </span>
        </ContextActionMenu>
      </DemoSection>
    </DemoPage>
  )
}
`;export{e as default};