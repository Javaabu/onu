/**
 * A `window.matchMedia` whose queries can be switched during a test, firing
 * `change` to every listener. `matches(query)` decides each query's result.
 */
export function controllableMatchMedia(initial: (query: string) => boolean) {
  const original = window.matchMedia
  let predicate = initial
  const listeners = new Map<string, Set<() => void>>()

  window.matchMedia = ((query: string) => ({
    get matches() {
      return predicate(query)
    },
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: (_: string, fn: () => void) => {
      if (!listeners.has(query)) listeners.set(query, new Set())
      listeners.get(query)!.add(fn)
    },
    removeEventListener: (_: string, fn: () => void) => listeners.get(query)?.delete(fn),
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia

  return {
    /** Changes the result of every query and notifies the listeners. */
    set(next: (query: string) => boolean) {
      predicate = next
      for (const set of listeners.values()) for (const fn of set) fn()
    },
    listenerCount: () => [...listeners.values()].reduce((n, set) => n + set.size, 0),
    restore() {
      window.matchMedia = original
    },
  }
}
