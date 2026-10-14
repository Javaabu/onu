import { render, screen, waitFor } from "@testing-library/react"
import { SearchIcon } from "lucide-react"
import { beforeEach, describe, expect, it, vi } from "vitest"

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
