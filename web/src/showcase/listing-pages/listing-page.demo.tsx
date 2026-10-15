import * as React from "react"
import {
  applyListingState,
  Badge,
  Button,
  GridView,
  Icon,
  ListingPage,
  ListView,
  useListingState,
  useTranslation,
  ViewSwitcher,
  type BulkAction,
} from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"
import {
  ISLANDS,
  noun,
  nounDv,
  people,
  personColumns,
  personFilterFns,
  personFilters,
  statusLabel,
  wait,
  type Person,
} from "./_data"

export const meta = {
  title: "Index page",
  group: "Listing pages",
  order: 1,
  description: "A complete index page: search, filters, pills, table, bulk actions, row menus, pagination, URL state.",
}

function UsersIndex() {
  const { locale } = useTranslation()
  const dv = locale.code === "dv"
  const [data, setData] = React.useState(people)
  const state = useListingState({ paramPrefix: "users_" })
  const { rows, total } = applyListingState(data, state, { filterFns: personFilterFns, locale: locale.code })
  const view = state.view ?? "table"

  const bulkActions: BulkAction<string>[] = [
    {
      id: "status",
      label: "Change status",
      icon: "edit",
      defaultValue: "active",
      form: ({ id, value, onChange }) => (
        <select
          id={id}
          className="h-7 px-2 text-sm rounded-md border bg-background"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {Object.entries(statusLabel).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
      ),
      run: async (ids, value) => {
        await wait()
        setData((prev) => prev.map((p) => (ids.includes(p.id) ? { ...p, status: value as Person["status"] } : p)))
      },
      successMessage: (n) => `${n} users updated`,
    },
    {
      id: "delete",
      label: "Delete",
      icon: "trash",
      destructive: true,
      run: async (ids) => {
        await wait()
        setData((prev) => prev.filter((p) => !ids.includes(p.id)))
      },
    },
  ]

  const name = (p: Person) => (dv ? p.nameDv : p.name)
  const columns = personColumns().map((c) => (c.id === "name" ? { ...c, accessor: name } : c))

  return (
    <ListingPage
      title={dv ? "މުވައްޒަފުން" : "Users"}
      description={dv ? "ސިސްޓަމަށް ވަދެވޭ ހުރިހާ މީހުން" : "Everyone who can sign in to the portal"}
      state={state}
      columns={columns}
      data={rows}
      total={total}
      noun={dv ? nounDv : noun}
      filters={personFilters}
      searchThaana={dv}
      primaryAction={
        <Button>
          <Icon name="add" />
          {dv ? "އާ މީހަކު" : "New user"}
        </Button>
      }
      trashHref="#/components/listing-pages/data-table"
      trashHasItems
      tabs={[
        { value: "all", label: dv ? "ހުރިހާ" : "All", count: data.length },
        { value: "active", label: statusLabel.active, count: data.filter((p) => p.status === "active").length },
        { value: "pending", label: statusLabel.pending, count: data.filter((p) => p.status === "pending").length },
        { value: "banned", label: statusLabel.banned, count: data.filter((p) => p.status === "banned").length },
      ]}
      onExport={() => wait(1200)}
      columnToggle
      bulkActions={bulkActions as BulkAction<unknown>[]}
      getRowHref={(p) => `#/components/listing-pages/record-actions-menu?id=${p.id}`}
      rowActions={(p) => [
        { id: "view", label: "View", icon: "eye", href: `#/components/listing-pages/record-actions-menu?id=${p.id}` },
        { id: "edit", label: "Edit", icon: "edit", onSelect: () => undefined, permitted: p.role !== "admin" },
        {
          id: "delete",
          label: "Delete",
          icon: "trash",
          destructive: true,
          separator: true,
          onSelect: async () => {
            await wait(400)
            setData((prev) => prev.filter((x) => x.id !== p.id))
          },
        },
      ]}
      toolbarEnd={<ViewSwitcher views={["table", "list", "grid"]} value={view} onValueChange={state.setView} />}
    >
      {view === "list" ? (
        <ListView
          aria-label="Users"
          items={rows}
          title={name}
          description={(p) => p.email}
          meta={(p) => (
            <>
              <span>{p.island}</span>
              <Badge variant="secondary">{statusLabel[p.status]}</Badge>
            </>
          )}
          selection={state.selection}
          onSelectionChange={state.setSelection}
        />
      ) : view === "grid" ? (
        <GridView
          aria-label="Users"
          items={rows}
          title={name}
          description={(p) => p.email}
          media={(p) => (
            <div className="text-3xl font-semibold flex size-full items-center justify-center text-muted-foreground">
              {p.name[0]}
            </div>
          )}
          meta={(p) => <span>{p.island}</span>}
        />
      ) : undefined}
    </ListingPage>
  )
}

export default function ListingPageDemo() {
  return (
    <DemoPage>
      <DemoSection
        title="Users index"
        description={`Search (Enter or leave the box), filter, sort, select rows and try the bulk actions. The view is kept in the address bar. Islands: ${ISLANDS.length}.`}
        className="block"
      >
        <UsersIndex />
      </DemoSection>
    </DemoPage>
  )
}
