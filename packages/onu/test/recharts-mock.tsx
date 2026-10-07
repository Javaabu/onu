import * as React from "react"

/**
 * jsdom has no layout, so Recharts' ResponsiveContainer measures 0×0 and renders nothing.
 * Use in chart tests:
 *
 *   vi.mock("recharts", async (importOriginal) => mockRecharts(await importOriginal()))
 */
export function mockRecharts<T extends object>(actual: T, size = { width: 800, height: 400 }): T {
  function ResponsiveContainer({ children }: { children?: React.ReactNode }) {
    const child = React.Children.only(children) as React.ReactElement<{ width?: number; height?: number }>
    return (
      <div data-testid="responsive-container" style={size}>
        {React.cloneElement(child, { width: size.width, height: size.height })}
      </div>
    )
  }
  return { ...actual, ResponsiveContainer }
}

/** Makes `window.matchMedia(query).matches` return `predicate(query)` until restored. */
export function mockMatchMedia(predicate: (query: string) => boolean) {
  const original = window.matchMedia
  window.matchMedia = ((query: string) => ({
    matches: predicate(query),
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia
  return () => {
    window.matchMedia = original
  }
}
