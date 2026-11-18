import { act } from "@testing-library/react"
import { hydrateRoot, type Root } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { onTestFinished } from "vitest"

/**
 * Server-renders `ui`, runs `between` (to set up what only the browser has: stored values,
 * media queries, the clock), then hydrates the markup. `errors` collects React's recoverable
 * errors, which is where hydration mismatches are reported. Unmounts when the test finishes.
 */
export async function hydrateAfterServer(ui: React.ReactElement, between?: () => void) {
  const container = document.createElement("div")
  container.innerHTML = renderToString(ui)
  document.body.appendChild(container)
  between?.()
  const errors: unknown[] = []
  let root!: Root
  await act(async () => {
    root = hydrateRoot(container, ui, { onRecoverableError: (error) => errors.push(error) })
  })
  onTestFinished(() => {
    act(() => root.unmount())
    container.remove()
  })
  return { container, errors }
}
