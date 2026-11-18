import * as React from "react"
import { LoadMore } from "@javaabu/onu"

// 4.4: `auto` with an inline onLoadMore. The parent re-renders when a load starts and only
// sets `loading` a moment later, as an app that fetches in an effect would.
export default function LoadMoreAutoHarness() {
  const [count, setCount] = React.useState(5)
  const [calls, setCalls] = React.useState(0)
  const [loading, setLoading] = React.useState(false)
  return (
    <div>
      <output data-testid="calls">{calls}</output>
      <ul>
        {Array.from({ length: count }, (_, i) => (
          <li key={i}>Item {i + 1}</li>
        ))}
      </ul>
      <LoadMore
        auto
        loaded={count}
        total={50}
        loading={loading}
        onLoadMore={() => {
          setCalls((c) => c + 1)
          setTimeout(() => setLoading(true), 50)
          setTimeout(() => {
            setCount((c) => c + 5)
            setLoading(false)
          }, 600)
        }}
      />
      <div style={{ height: 2000 }} />
    </div>
  )
}
