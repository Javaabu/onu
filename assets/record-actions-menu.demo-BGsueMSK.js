var e=`import { RecordActionsMenu } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"
import { wait } from "./_data"

export const meta = { title: "Record actions menu", group: "Listing pages", order: 10 }

export default function RecordActionsMenuDemo() {
  return (
    <DemoPage>
      <DemoSection
        title="Record page header"
        description="Buttons from 640px; everything in the menu on phones."
        className="block"
      >
        <div className="gap-4 p-4 flex items-center justify-between rounded-lg border">
          <h2 className="text-lg font-semibold">Mariyam Rasheed</h2>
          <RecordActionsMenu
            name="Mariyam Rasheed"
            actions={[
              { id: "logs", label: "Logs", icon: "history", href: "#/components/listing-pages/record-actions-menu" },
              {
                id: "approve",
                label: "Approve",
                icon: "check",
                confirm: { title: "Approve Mariyam Rasheed?" },
                onSelect: () => wait(),
              },
              { id: "suspend", label: "Suspend", confirm: true, onSelect: () => wait() },
              { id: "delete", label: "Delete", icon: "trash", destructive: true, onSelect: () => wait() },
            ]}
          />
        </div>
      </DemoSection>
    </DemoPage>
  )
}
`;export{e as default};