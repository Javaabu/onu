import { render, screen, waitFor } from "@testing-library/react"
import { SearchIcon } from "lucide-react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import type * as ProviderModule from "./onu-provider"
import type * as IconModule from "../icons/icon"

/** Fresh modules, so module-level caches (loaded locales, the default icon set) start empty. */
async function load() {
  vi.resetModules()
  const provider: typeof ProviderModule = await import("./onu-provider")
  const icon: typeof IconModule = await import("../icons/icon")
  return { ...provider, ...icon }
}

/** Renders `t(k)` with the given provider module's hook. */
function textOf(mod: typeof ProviderModule) {
  return function Text({ k }: { k: string }) {
    return <>{mod.useTranslation().t(k)}</>
  }
}

beforeEach(() => {
  document.documentElement.removeAttribute("dir")
})

describe("OnuProvider locales", () => {
  it("resolves English text from the components in use, without the full English locale", async () => {
    const mod = await load()
    const Text = textOf(mod)
    // Loading a component registers the English namespaces it uses.
    await import("../components/form/label")
    render(
      <mod.OnuProvider>
        <Text k="form.optional" />
      </mod.OnuProvider>,
    )
    expect(screen.getByText("(optional)")).toBeInTheDocument()
  })

  it('loads Dhivehi on demand for locale="dv", in RTL from the first render', async () => {
    const mod = await load()
    const Text = textOf(mod)
    await import("../components/form/label")
    render(
      <mod.OnuProvider locale="dv">
        <Text k="form.optional" />
      </mod.OnuProvider>,
    )
    expect(document.documentElement).toHaveAttribute("dir", "rtl")
    expect(document.documentElement).toHaveAttribute("lang", "dv")
    await waitFor(() => expect(screen.queryByText("(optional)")).not.toBeInTheDocument())
    expect(document.body.textContent).toMatch(/[ހ-޿]/)
  })

  describe("when the Dhivehi chunk fails to load", () => {
    const network = { offline: true, attempts: 0 }

    beforeEach(() => {
      network.offline = true
      network.attempts = 0
      vi.useFakeTimers({ shouldAdvanceTime: true })
      vi.doMock("../locales/dv/dv", async (importOriginal) => {
        const actual = await importOriginal<typeof import("../locales/dv/dv")>()
        return {
          get dv() {
            network.attempts++
            if (network.offline) throw new Error("Failed to fetch dynamically imported module")
            return actual.dv
          },
        }
      })
    })

    afterEach(() => {
      vi.doUnmock("../locales/dv/dv")
      vi.useRealTimers()
    })

    async function renderDv() {
      const mod = await load()
      const Text = textOf(mod)
      await import("../components/form/label")
      render(
        <mod.OnuProvider locale="dv">
          <Text k="form.optional" />
        </mod.OnuProvider>,
      )
      await waitFor(() => expect(network.attempts).toBeGreaterThan(0))
    }

    it("retries after a delay", async () => {
      await renderDv()
      network.offline = false
      await vi.advanceTimersByTimeAsync(1000)
      await waitFor(() => expect(screen.queryByText("(optional)")).not.toBeInTheDocument())
      expect(document.body.textContent).toMatch(/[ހ-޿]/)
    })

    it("gives up after a few retries, then tries again when the browser comes back online", async () => {
      await renderDv()
      for (let i = 0; i < 4; i++) await vi.advanceTimersByTimeAsync(15_000)
      const attempts = network.attempts
      network.offline = false
      await vi.advanceTimersByTimeAsync(60_000)
      expect(network.attempts).toBe(attempts)
      expect(screen.getByText("(optional)")).toBeInTheDocument()
      window.dispatchEvent(new Event("online"))
      await waitFor(() => expect(screen.queryByText("(optional)")).not.toBeInTheDocument())
    })
  })

  it("uses a locale object right away", async () => {
    const mod = await load()
    const Text = textOf(mod)
    const { dv } = await import("../locales/dv")
    render(
      <mod.OnuProvider locale={dv}>
        <Text k="form.submit" />
      </mod.OnuProvider>,
    )
    expect(screen.getByText(dv.messages.form!.submit as string)).toBeInTheDocument()
  })

  it("keeps message overrides on top of component English text", async () => {
    const mod = await load()
    const Text = textOf(mod)
    await import("../components/form/label")
    render(
      <mod.OnuProvider messages={{ form: { optional: "(not required)" } }}>
        <Text k="form.optional" />
      </mod.OnuProvider>,
    )
    expect(screen.getByText("(not required)")).toBeInTheDocument()
  })
})

describe("OnuProvider default icon set", () => {
  it("loads the default set on demand, with a same-sized placeholder until then", async () => {
    const { OnuProvider, Icon } = await load()
    const { container } = render(
      <OnuProvider>
        <Icon name="search" className="size-4" />
      </OnuProvider>,
    )
    const placeholder = container.querySelector("svg")!
    expect(placeholder).toHaveAttribute("data-icon-pending")
    expect(placeholder).toHaveAttribute("data-icon-name", "search")
    expect(placeholder).toHaveAttribute("aria-hidden", "true")
    expect(placeholder.getAttribute("class")).toContain("size-4")

    const { container: ref } = render(<SearchIcon />)
    const expected = ref.querySelector("svg")!.innerHTML
    await waitFor(() => expect(container.querySelector("svg")!.innerHTML).toBe(expected))
    expect(container.querySelector("svg")).not.toHaveAttribute("data-icon-pending")
  })

  it("does not load the set when every icon has an override or a fallback", async () => {
    const { OnuProvider, Icon } = await load()
    const Mine = (props: object) => <svg data-testid="mine" {...props} />
    render(
      <OnuProvider icons={{ add: Mine }}>
        <Icon name="add" />
        <Icon name="loading" fallback={<svg data-testid="fallback" />} />
      </OnuProvider>,
    )
    expect(screen.getByTestId("mine")).toBeInTheDocument()
    expect(screen.getByTestId("fallback")).toBeInTheDocument()
    expect(document.querySelector("[data-icon-pending]")).toBeNull()
  })

  it("resolves every name on the first render with icons={lucideIconMap}", async () => {
    const { OnuProvider, Icon } = await load()
    const { lucideIconMap } = await import("../icons/lucide-map")
    const { container } = render(
      <OnuProvider icons={lucideIconMap}>
        <Icon name="search" />
      </OnuProvider>,
    )
    expect(container.querySelector("svg")).not.toHaveAttribute("data-icon-pending")
    expect(container.querySelector("svg")!.getAttribute("class")).toContain("lucide-search")
  })
})
