import * as React from "react"
import { Avatar, AvatarFallback, Badge, EmptyState, ListView, LoadMore } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"
import { mvr, people, statusLabel, wait } from "./_data"

export const meta = { title: "List view", group: "Listing pages", order: 18 }

export default function ListViewDemo() {
  const [count, setCount] = React.useState(5)
  const [selection, setSelection] = React.useState<string[]>([])
  return (
    <DemoPage>
      <DemoSection title="Divided list with selection and load more" className="block">
        <ListView
          aria-label="Users"
          items={people.slice(0, count)}
          title={(p) => p.name}
          description={(p) => p.email}
          media={(p) => (
            <Avatar>
              <AvatarFallback>{p.name.slice(0, 2)}</AvatarFallback>
            </Avatar>
          )}
          meta={(p) => (
            <>
              <span>{p.island}</span>
              <span className="tabular-nums">{mvr.format(p.balance)}</span>
              <Badge variant="secondary">{statusLabel[p.status]}</Badge>
            </>
          )}
          getHref={(p) => `#/components/listing-pages/list-view?id=${p.id}`}
          selection={selection}
          onSelectionChange={setSelection}
          itemActions={() => [
            { id: "edit", label: "Edit", icon: "edit" },
            { id: "delete", label: "Delete", icon: "trash", destructive: true, onSelect: () => wait() },
          ]}
        />
        <LoadMore
          loaded={count}
          total={40}
          onLoadMore={() => wait().then(() => setCount((n) => Math.min(n + 5, 40)))}
          noun={{ one: "user", other: "users" }}
        />
      </DemoSection>
      <DemoSection title="Cards, Dhivehi" className="block">
        <ListView
          variant="cards"
          items={people.slice(0, 3)}
          title={(p) => <span lang="dv">{p.nameDv}</span>}
          getName={(p) => p.nameDv}
          description={(p) => p.island}
        />
      </DemoSection>
      <DemoSection title="Loading and empty" className="gap-3 grid">
        <ListView items={[]} title={() => ""} loading />
        <ListView items={[]} title={() => ""} empty={<EmptyState bordered />} />
      </DemoSection>
    </DemoPage>
  )
}
