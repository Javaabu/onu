var e=`import * as React from "react"
import { MenuBar } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"
import { useDhivehi } from "./_demo-nav"

export const meta = {
  title: "Menu bar",
  group: "Layout and navigation",
  order: 4,
  description:
    "A desktop-style application menu bar from data (WAI-ARIA menubar). Arrow keys follow the visual order in RTL.",
}

export default function MenuBarDemo() {
  const dv = useDhivehi()
  const [wrap, setWrap] = React.useState(true)
  const [zoom, setZoom] = React.useState("100")
  const [last, setLast] = React.useState("")
  return (
    <DemoPage>
      <DemoSection title="Editor menus" description={last ? \`\${dv ? "ފަހުން" : "Last action"}: \${last}\` : undefined}>
        <MenuBar
          menus={[
            {
              label: dv ? "ފައިލް" : "File",
              items: [
                { label: dv ? "އައު" : "New", icon: "add", shortcut: "⌘N", onSelect: () => setLast("New") },
                { label: dv ? "ހުޅުވާ" : "Open…", icon: "folder", shortcut: "⌘O", onSelect: () => setLast("Open") },
                { label: dv ? "ސޭވްކުރޭ" : "Save", icon: "save", shortcut: "⌘S", onSelect: () => setLast("Save") },
                { type: "separator" },
                {
                  type: "sub",
                  label: dv ? "އެކްސްޕޯޓް" : "Export",
                  icon: "download",
                  items: [
                    { label: "PDF", onSelect: () => setLast("PDF") },
                    { label: "CSV", onSelect: () => setLast("CSV") },
                  ],
                },
                { type: "separator" },
                { label: dv ? "ފުހެލާ" : "Delete", icon: "trash", variant: "destructive", disabled: true },
              ],
            },
            {
              label: dv ? "އެޑިޓް" : "Edit",
              items: [
                { label: dv ? "ފަހަތަށް" : "Undo", icon: "undo", shortcut: "⌘Z" },
                { label: dv ? "ކުރިއަށް" : "Redo", icon: "redo", shortcut: "⇧⌘Z" },
                { type: "separator" },
                { label: dv ? "ކޮޕީ" : "Copy", icon: "copy", shortcut: "⌘C" },
              ],
            },
            {
              label: dv ? "ވިއު" : "View",
              items: [
                { type: "label", label: dv ? "ދައްކާ ގޮތް" : "Display" },
                { type: "checkbox", label: dv ? "ލައިން ރެޕް" : "Word wrap", checked: wrap, onCheckedChange: setWrap },
                { type: "separator" },
                {
                  type: "radio",
                  value: zoom,
                  onValueChange: setZoom,
                  options: [
                    { value: "100", label: "100%" },
                    { value: "125", label: "125%" },
                    { value: "150", label: "150%" },
                  ],
                },
              ],
            },
            {
              label: dv ? "އެހީ" : "Help",
              items: [{ label: dv ? "ލިޔުންތައް" : "Documentation", icon: "help", href: "https://javaabu.com" }],
            },
          ]}
        />
      </DemoSection>
    </DemoPage>
  )
}
`;export{e as default};