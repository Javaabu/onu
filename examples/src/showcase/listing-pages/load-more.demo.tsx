import * as React from "react"
import { LoadMore } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"
import { people, wait } from "./_data"

export const meta = { title: "Load more", group: "Listing pages", order: 26 }

export default function LoadMoreDemo() {
  const [count, setCount] = React.useState(6)
  const [auto, setAuto] = React.useState(6)
  return (
    <DemoPage>
      <DemoSection title="Button" className="gap-2 grid">
        <ul className="gap-1 text-sm grid">
          {people.slice(0, count).map((p) => (
            <li key={p.id}>{p.name}</li>
          ))}
        </ul>
        <LoadMore
          loaded={count}
          total={20}
          noun={{ one: "user", other: "users" }}
          onLoadMore={() => wait().then(() => setCount((n) => Math.min(n + 6, 20)))}
        />
      </DemoSection>
      <DemoSection title="Loads as you scroll" className="gap-2 grid">
        {/* Scrollable regions must be keyboard-reachable (WCAG 2.1.1). */}
        {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
        <div tabIndex={0} role="region" aria-label="Results" className="max-h-48 p-2 overflow-auto rounded-lg border">
          <ul className="gap-1 text-sm grid">
            {people.slice(0, auto).map((p) => (
              <li key={p.id}>{p.nameDv}</li>
            ))}
          </ul>
          <LoadMore
            auto
            loaded={auto}
            total={30}
            onLoadMore={() => wait().then(() => setAuto((n) => Math.min(n + 6, 30)))}
          />
        </div>
      </DemoSection>
    </DemoPage>
  )
}
