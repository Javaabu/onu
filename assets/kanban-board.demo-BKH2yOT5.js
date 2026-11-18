var e=`import * as React from "react"
import { Badge, Button, Icon, KanbanBoard, type KanbanMove } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Kanban board",
  group: "Listing pages",
  order: 20,
  description:
    "Drag with mouse, touch (press and hold) or keyboard (Space, arrows, Space), or use each card's Move to… menu.",
}

interface Application {
  id: string
  ref: string
  applicant: string
  service: string
  amount: number
}

const mvr = new Intl.NumberFormat("en-MV", { style: "currency", currency: "MVR" })

const initial: Record<string, Application[]> = {
  submitted: [
    { id: "a1", ref: "APP-1042", applicant: "Aishath Hassan", service: "Business permit", amount: 750 },
    { id: "a2", ref: "APP-1043", applicant: "ޢަލީ ރަޝީދު", service: "Land lease", amount: 12000 },
    { id: "a3", ref: "APP-1044", applicant: "Mohamed Didi", service: "Vessel registration", amount: 1500 },
  ],
  review: [{ id: "a4", ref: "APP-1039", applicant: "Mariyam Nazeer", service: "Building permit", amount: 3200 }],
  approved: [{ id: "a5", ref: "APP-1031", applicant: "Ibrahim Manik", service: "Trade licence", amount: 500 }],
  rejected: [],
}

export default function KanbanBoardDemo() {
  const [items, setItems] = React.useState(initial)
  const [last, setLast] = React.useState<KanbanMove | null>(null)
  return (
    <DemoPage>
      <DemoSection title="Applications" className="block">
        <KanbanBoard
          columns={[
            { id: "submitted", title: "Submitted", accentClassName: "bg-chart-1" },
            {
              id: "review",
              title: "In review",
              accentClassName: "bg-chart-3",
              actions: (
                <Button variant="ghost" size="icon-xs" aria-label="Add to In review">
                  <Icon name="add" />
                </Button>
              ),
            },
            { id: "approved", title: "Approved", accentClassName: "bg-success" },
            { id: "rejected", title: "Rejected", accentClassName: "bg-destructive" },
          ]}
          items={items}
          getName={(a) => \`\${a.ref} \${a.applicant}\`}
          canMove={(m) => !(m.from === "approved" && m.to === "submitted")}
          onItemsChange={(next, move) => {
            setItems(next)
            setLast(move)
          }}
          renderCard={(a, { handle, moveMenu }) => (
            <div className="gap-1 p-2 grid">
              <div className="gap-1 flex items-center">
                {handle}
                <span className="text-xs font-mono text-muted-foreground">{a.ref}</span>
                <span className="ms-auto">{moveMenu}</span>
              </div>
              <div className="px-1 text-sm font-medium" dir="auto">
                {a.applicant}
              </div>
              <div className="gap-2 px-1 text-xs flex items-center justify-between text-muted-foreground">
                <span>{a.service}</span>
                <Badge variant="secondary" className="tabular-nums">
                  {mvr.format(a.amount)}
                </Badge>
              </div>
            </div>
          )}
        />
        <p className="mt-2 text-sm text-muted-foreground" dir="ltr">
          Last move: {last ? \`\${last.id} \${last.from} → \${last.to} (#\${last.index + 1})\` : "none"}
        </p>
      </DemoSection>
    </DemoPage>
  )
}
`;export{e as default};