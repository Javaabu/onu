var e=`import * as React from "react"
import {
  applyListingState,
  Button,
  DataTable,
  trashActions,
  useListingState,
  useTranslation,
  type DataTableProps,
} from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"
import { noun, people, personColumns, personFilterFns, wait, type Person } from "./_data"

export const meta = { title: "Data table", group: "Listing pages", order: 2 }

function Table(props: Partial<DataTableProps<Person>> & { rows?: Person[] }) {
  const state = useListingState({ url: false, defaultState: { perPage: 10 } })
  const { rows, total } = applyListingState(props.rows ?? people, state, { filterFns: personFilterFns })
  return <DataTable columns={personColumns()} data={rows} total={total} state={state} noun={noun} {...props} />
}

function Trash() {
  const { t } = useTranslation()
  const [rows, setRows] = React.useState(people.slice(0, 4))
  const remove = (id: string) => setRows((prev) => prev.filter((p) => p.id !== id))
  return (
    <Table
      rows={rows}
      trash
      caption="Deleted users"
      rowActions={(p) =>
        trashActions(t, {
          onRestore: async () => {
            await wait(300)
            remove(p.id)
          },
          onForceDelete: async () => {
            await wait(300)
            remove(p.id)
          },
        })
      }
    />
  )
}

export default function DataTableDemo() {
  return (
    <DemoPage>
      <DemoSection title="Sortable, selectable, paginated" className="block">
        <Table
          caption="Users"
          bulkActions={[{ id: "delete", label: "Delete", destructive: true, run: () => wait() }]}
          rowActions={() => [
            { id: "view", label: "View", icon: "eye" },
            { id: "delete", label: "Delete", icon: "trash", destructive: true, onSelect: () => wait(300) },
          ]}
        />
      </DemoSection>
      <DemoSection title="Striped, compact, sticky header" className="block">
        <div className="max-h-80 overflow-auto">
          <Table
            caption="Compact users"
            striped
            density="compact"
            stickyHeader
            pagination={false}
            rows={people.slice(0, 10)}
          />
        </div>
      </DemoSection>
      <DemoSection
        title="Phone cards"
        description="Below 768px every table switches to these cards automatically."
        className="block"
      >
        <div className="max-w-sm">
          <Table
            caption="Users as cards"
            layout="cards"
            rows={people.slice(0, 3)}
            bulkActions={[{ id: "x", label: "Export", run: () => wait() }]}
          />
        </div>
      </DemoSection>
      <DemoSection
        title="Trash view"
        description="No bulk bar; Restore and Delete permanently (with confirmation)."
        className="block"
      >
        <Trash />
      </DemoSection>
      <DemoSection title="Loading" className="block">
        <Table caption="Loading users" loading />
      </DemoSection>
      <DemoSection title="Empty" className="block">
        <Table caption="No users" rows={[]} emptyAction={<Button>New user</Button>} />
      </DemoSection>
    </DemoPage>
  )
}
`;export{e as default};