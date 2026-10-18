var e=`import * as React from "react"
import { Button, CommandPalette, Icon, Kbd, type CommandPaletteGroup, type CommandPaletteItem } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Command palette",
  group: "Overlays",
  order: 9,
  description: "⌘K / Ctrl+K palette with groups, recent items, async search (debounce + abort) and Thaana input.",
}

const staff = [
  { id: "s1", name: "Aishath Ali", dv: "އައިޝަތު ޢަލީ", island: "Hulhumalé" },
  { id: "s2", name: "Mohamed Naseem", dv: "މުޙައްމަދު ނަސީމް", island: "Addu City" },
  { id: "s3", name: "Hawwa Ibrahim", dv: "ޙައްވާ އިބްރާހީމް", island: "Fuvahmulah" },
  { id: "s4", name: "Ahmed Shareef", dv: "އަޙްމަދު ޝަރީފް", island: "Kulhudhuffushi" },
  { id: "s5", name: "Mariyam Rasheed", dv: "މަރިޔަމް ރަޝީދު", island: "Malé" },
]

/** Fake API with 600ms latency that honours the abort signal. */
function searchStaff(query: string, { signal }: { signal: AbortSignal }): Promise<CommandPaletteItem[]> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      const q = query.toLowerCase()
      resolve(
        staff
          .filter((s) => s.name.toLowerCase().includes(q) || s.dv.includes(query) || s.island.toLowerCase().includes(q))
          .map((s) => ({ id: s.id, label: s.name, description: \`\${s.dv} · \${s.island}\`, icon: "user" })),
      )
    }, 600)
    signal.addEventListener("abort", () => {
      clearTimeout(timer)
      reject(new DOMException("Aborted", "AbortError"))
    })
  })
}

export default function CommandPaletteDemo() {
  const [last, setLast] = React.useState("")
  const [open, setOpen] = React.useState(false)
  const groups: CommandPaletteGroup[] = [
    {
      heading: "Pages",
      items: [
        { id: "dashboard", label: "Dashboard", icon: "home", keywords: ["ޑޭޝްބޯޑް"] },
        { id: "staff", label: "Staff", icon: "users", keywords: ["employees", "މުވައްޒަފުން"] },
        { id: "permits", label: "Permits", icon: "file-text", keywords: ["licences"] },
        { id: "settings", label: "Settings", icon: "settings", shortcut: "⌘," },
      ],
    },
    {
      heading: "Actions",
      items: [
        { id: "new-permit", label: "New permit", icon: "add", shortcut: "⌘N" },
        { id: "export", label: "Export to Excel", icon: "download" },
        { id: "print", label: "Print (unavailable)", icon: "print", disabled: true },
      ],
    },
  ]

  return (
    <DemoPage>
      <DemoSection
        title="Command palette"
        description="Press ⌘K or Ctrl+K, or use the button. Type a staff name (e.g. “ais”) for async results."
      >
        <Button variant="outline" className="w-64 justify-between text-muted-foreground" onClick={() => setOpen(true)}>
          <span className="gap-2 inline-flex items-center">
            <Icon name="search" />
            Search…
          </span>
          <span dir="ltr" className="gap-1 inline-flex">
            <Kbd>Ctrl</Kbd>
            <Kbd>K</Kbd>
          </span>
        </Button>
        <CommandPalette
          open={open}
          onOpenChange={setOpen}
          groups={groups}
          search={searchStaff}
          searchHeading="Staff"
          onItemSelect={(item) => setLast(String(item.label))}
        />
        <span role="status" className="text-sm self-center text-muted-foreground">
          {last ? \`Chose \${last}\` : ""}
        </span>
      </DemoSection>
      <DemoSection title="Thaana search" description="Types Thaana from a Latin keyboard; no global shortcut.">
        <CommandPalette
          trigger={<Button variant="outline">ހޯދާ</Button>}
          shortcut={false}
          thaana
          recent={false}
          search={searchStaff}
          searchHeading="މުވައްޒަފުން"
        />
      </DemoSection>
    </DemoPage>
  )
}
`;export{e as default};