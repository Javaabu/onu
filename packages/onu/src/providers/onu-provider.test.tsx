import * as React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import { Direction } from "radix-ui"
import { describe, expect, it } from "vitest"

import { registerEnglish } from "../i18n/english"
import { Icon } from "../icons/icon"
import type { IconComponentProps } from "../icons/types"
import { dv, en } from "../locales"
import { common as en_common } from "../locales/en/common"
import { Density, OnuProvider, useDirection, useLinkComponent, useOnu, useTranslation } from "./onu-provider"

// Like a component, the probe registers the English text it uses.
registerEnglish({ common: en_common })

function Probe() {
  const onu = useOnu()
  const { t, locale } = useTranslation()
  const dir = useDirection()
  const radixDir = Direction.useDirection()
  return (
    <div>
      <span data-testid="locale">{locale.code}</span>
      <span data-testid="dir">{dir}</span>
      <span data-testid="radix-dir">{radixDir}</span>
      <span data-testid="density">{onu.density}</span>
      <span data-testid="layout">{onu.labelLayout}</span>
      <span data-testid="maps">{JSON.stringify(onu.maps)}</span>
      <span data-testid="yes">{t("common.yes")}</span>
      <LinkProbe />
    </div>
  )
}

/** The provider's link component, created with createElement because it comes from context. */
function LinkProbe() {
  return React.createElement(useLinkComponent(), { href: "/home" }, "Home")
}

const text = (id: string) => screen.getByTestId(id).textContent

describe("OnuProvider", () => {
  it("falls back to English, LTR and plain links without a provider", () => {
    render(<Probe />)
    expect(text("locale")).toBe("en")
    expect(text("dir")).toBe("ltr")
    expect(text("density")).toBe("default")
    expect(text("layout")).toBe("stacked")
    expect(text("maps")).toBe("{}")
    expect(text("yes")).toBe("Yes")
    expect(screen.getByRole("link", { name: "Home" }).tagName).toBe("A")
    expect(document.documentElement).not.toHaveAttribute("lang")
  })

  it("takes a built-in locale by code and follows its direction", async () => {
    render(
      <OnuProvider locale="dv">
        <Probe />
      </OnuProvider>,
    )
    expect(text("locale")).toBe("dv")
    expect(text("dir")).toBe("rtl")
    expect(text("radix-dir")).toBe("rtl")
    // The Dhivehi text loads on demand.
    await waitFor(() => expect(text("yes")).toBe(dv.messages.common!.yes))
  })

  it("takes a locale object, a direction override and settings", () => {
    const maps = { googleMapsApiKey: "key" }
    render(
      <OnuProvider locale={en} dir="rtl" density="compact" labelLayout="inline" maps={maps}>
        <Probe />
      </OnuProvider>,
    )
    expect(text("locale")).toBe("en")
    expect(text("dir")).toBe("rtl")
    expect(text("density")).toBe("compact")
    expect(text("layout")).toBe("inline")
    expect(text("maps")).toBe(JSON.stringify(maps))
  })

  it("overrides individual strings and falls back to English for missing ones", () => {
    const { yes: _yes, ...common } = dv.messages.common!
    const partial = { ...dv, messages: { ...dv.messages, common } }
    const { rerender } = render(
      <OnuProvider locale="en" messages={{ common: { yes: "Yep" } }}>
        <Probe />
      </OnuProvider>,
    )
    expect(text("yes")).toBe("Yep")
    rerender(
      <OnuProvider locale={partial}>
        <Probe />
      </OnuProvider>,
    )
    expect(text("yes")).toBe("Yes")
  })

  it("uses the app's link component", () => {
    const AppLink = React.forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement>>(function AppLink(
      { children, ...props },
      ref,
    ) {
      return (
        <a ref={ref} data-router-link="" {...props}>
          {children}
        </a>
      )
    })
    render(
      <OnuProvider linkComponent={AppLink}>
        <Probe />
      </OnuProvider>,
    )
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("data-router-link")
  })

  it("syncs lang, dir and density to <html> unless syncDocument is off", () => {
    const { unmount } = render(
      <OnuProvider locale="dv" density="touch">
        <Probe />
      </OnuProvider>,
    )
    const html = document.documentElement
    expect(html).toHaveAttribute("lang", "dv")
    expect(html).toHaveAttribute("dir", "rtl")
    expect(html).toHaveAttribute("data-density", "touch")
    unmount()
    for (const name of ["lang", "dir", "data-density"]) html.removeAttribute(name)

    render(
      <OnuProvider locale="dv" syncDocument={false}>
        <Probe />
      </OnuProvider>,
    )
    expect(html).not.toHaveAttribute("lang")
    expect(html).not.toHaveAttribute("dir")
    expect(html).not.toHaveAttribute("data-density")
  })

  it("supplies the default icon set and accepts a custom icon map", () => {
    const { container, rerender } = render(
      <OnuProvider>
        <Icon name="add" />
      </OnuProvider>,
    )
    expect(container.querySelector("svg.lucide[data-icon-name=add]")).toBeInTheDocument()
    const Custom = (props: IconComponentProps) => <svg data-custom="" {...props} />
    rerender(
      <OnuProvider icons={{ add: Custom }}>
        <Icon name="add" />
      </OnuProvider>,
    )
    expect(container.querySelector("svg[data-custom]")).toBeInTheDocument()
  })
})

describe("Density", () => {
  it("scopes a density mode to a subtree", () => {
    render(
      <Density value="compact" className="x">
        Rows
      </Density>,
    )
    const el = screen.getByText("Rows")
    expect(el).toHaveAttribute("data-density", "compact")
    expect(el).toHaveClass("x")
  })
})
