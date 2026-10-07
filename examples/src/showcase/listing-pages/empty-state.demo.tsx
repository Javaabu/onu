import { Button, EmptyState, Icon } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"
import { noun, nounDv } from "./_data"

export const meta = { title: "Empty state", group: "Listing pages", order: 11 }

export default function EmptyStateDemo() {
  return (
    <DemoPage>
      <DemoSection title="No records yet" className="block">
        <EmptyState
          bordered
          noun={noun}
          action={
            <Button>
              <Icon name="add" />
              New user
            </Button>
          }
        />
      </DemoSection>
      <DemoSection title="No results" className="block">
        <EmptyState
          bordered
          variant="no-results"
          noun={noun}
          search="hassan"
          filters={["Status: Active", "Island: Addu City"]}
          onClearSearch={() => undefined}
          onClearFilters={() => undefined}
        />
      </DemoSection>
      <DemoSection title="Trash, in Dhivehi noun" className="block">
        <EmptyState bordered variant="trash" noun={nounDv} />
      </DemoSection>
    </DemoPage>
  )
}
