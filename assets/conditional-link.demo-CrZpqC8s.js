var e=`import * as React from "react"
import { ConditionalLink, Switch, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Conditional link",
  group: "Display and feedback",
  order: 12,
  description: "A link only when there is an href and the user is allowed; plain text otherwise.",
}

const rows = [
  { id: 1, name: "Aishath Shiuna", href: "#/users/1" },
  { id: 2, name: "Ahmed Ali", href: null },
  { id: 3, name: "މަރިޔަމް ޒާހިރާ", href: "#/users/3" },
]

export default function ConditionalLinkDemo() {
  const [canView, setCanView] = React.useState(true)
  return (
    <DemoPage>
      <DemoSection title="In a table" className="grid">
        <div className="gap-2 text-sm flex items-center">
          <Switch id="can-view" checked={canView} onCheckedChange={setCanView} />
          <label htmlFor="can-view">User can view profiles</label>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Profile</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <ConditionalLink href={row.href} when={canView}>
                    {row.name}
                  </ConditionalLink>
                </TableCell>
                <TableCell className="text-muted-foreground">{row.href ? "Has a page" : "No page"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DemoSection>
    </DemoPage>
  )
}
`;export{e as default};