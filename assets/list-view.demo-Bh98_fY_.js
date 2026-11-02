var e=`import * as React from "react"
import { Avatar, AvatarFallback, Badge, EmptyState, ListView, LoadMore } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"
import { ISLANDS, mvr, people, statusLabel, wait } from "./_data"

export const meta = {
  title: "List view",
  group: "Listing pages",
  order: 18,
  description: 'Records as a list or, with layout="grid", a grid of cards that follows the space available.',
}

const services = ISLANDS.map((island, i) => ({
  id: String(i),
  title: \`\${island} council office\`,
  description: "Permits, registrations and certificates for residents.",
  open: i % 3 !== 0,
  hue: (i * 40) % 360,
}))

export default function ListViewDemo() {
  const [count, setCount] = React.useState(5)
  const [selection, setSelection] = React.useState<string[]>([])
  const [gridSelection, setGridSelection] = React.useState<string[]>(["1"])
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
          getHref={(p) => \`#/components/listing-pages/list-view?id=\${p.id}\`}
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
      <DemoSection title="Grid: cards follow the space available" className="block">
        <ListView
          layout="grid"
          aria-label="Council offices"
          items={services}
          title={(s) => s.title}
          description={(s) => s.description}
          media={(s) => (
            <div className="p-3 text-xs flex size-full items-end bg-linear-to-br from-primary/20 to-chart-2/30 text-muted-foreground">
              {s.hue}°
            </div>
          )}
          meta={(s) => <Badge variant={s.open ? "secondary" : "outline"}>{s.open ? "Open" : "Closed"}</Badge>}
          selection={gridSelection}
          onSelectionChange={setGridSelection}
          itemActions={() => [{ id: "edit", label: "Edit", icon: "edit" }]}
          onItemClick={() => undefined}
        />
      </DemoSection>
      <DemoSection title="Grid in a narrow column" className="block">
        <div className="max-w-xs">
          <ListView layout="grid" minItemWidth="10rem" items={services.slice(0, 4)} title={(s) => s.title} />
        </div>
      </DemoSection>
      <DemoSection title="Grid loading" className="block">
        <ListView layout="grid" items={[]} title={() => ""} loading />
      </DemoSection>
    </DemoPage>
  )
}
`;export{e as default};