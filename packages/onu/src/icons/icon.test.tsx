import * as React from "react"
import { render, screen } from "@testing-library/react"
import { CheckIcon, Loader2Icon, SearchIcon } from "lucide-react"
import { describe, expect, it } from "vitest"

import { expectNoA11yViolations, renderWithOnu } from "../../test/utils"
import { Button } from "../components/form/button"
import { Spinner } from "../components/loading/spinner"
import { Checkbox } from "../ui/checkbox"
import { Spinner as PrimitiveSpinner } from "../ui/spinner"
import { fallbackIcon, Icon } from "./icon"
import { Icon as StandaloneIcon } from "./standalone-icon"

/** Shapes inside an svg, to tell which glyph rendered. */
function glyph(el: Element | null) {
  return Array.from(el?.querySelectorAll("path, circle, line, rect") ?? [])
    .map((n) => n.outerHTML)
    .join("")
}

function reference(Component: React.ComponentType) {
  const { container, unmount } = render(<Component />)
  const markup = glyph(container.querySelector("svg"))
  unmount()
  expect(markup).not.toBe("")
  return markup
}

describe("Icon", () => {
  it("is decorative by default", () => {
    const { container } = renderWithOnu(<Icon name="close" />)
    const svg = container.querySelector("svg")!
    expect(svg).toHaveAttribute("aria-hidden", "true")
    expect(svg).toHaveAttribute("data-icon-name", "close")
  })

  it("becomes an image with a label", async () => {
    renderWithOnu(<Icon name="search" label="Search" />)
    expect(screen.getByRole("img", { name: "Search" })).toBeInTheDocument()
    await expectNoA11yViolations()
  })

  it("mirrors directional icons in RTL only via the rtl: variant", () => {
    const { container } = renderWithOnu(
      <>
        <Icon name="chevron-right" />
        <Icon name="check" />
        <Icon name="check" flip />
      </>,
    )
    const [chevron, check, flipped] = Array.from(container.querySelectorAll("svg"))
    expect(chevron!.getAttribute("class")).toContain("rtl:-scale-x-100")
    expect(check!.getAttribute("class")).not.toContain("rtl:-scale-x-100")
    expect(flipped!.getAttribute("class")).toContain("rtl:-scale-x-100")
  })

  it("uses icon map overrides from the provider (component and element)", () => {
    const Custom = (props: { className?: string }) => <svg data-testid="custom" {...props} />
    renderWithOnu(
      <>
        <Icon name="close" />
        <Icon name="check" />
      </>,
      { provider: { icons: { close: Custom, check: <svg data-testid="element" /> } } },
    )
    expect(screen.getByTestId("custom")).toBeInTheDocument()
    expect(screen.getByTestId("element")).toHaveAttribute("data-icon-name", "check")
  })

  it("applies size tokens and numeric sizes", () => {
    const { container } = renderWithOnu(
      <>
        <Icon name="close" size="lg" />
        <Icon name="close" size={20} />
      </>,
    )
    const [a, b] = Array.from(container.querySelectorAll("svg"))
    expect(a!.getAttribute("class")).toContain("size-5")
    expect(b).toHaveAttribute("width", "20")
  })

  it("falls back for unknown names", () => {
    const { container } = renderWithOnu(<Icon name="does-not-exist" />)
    expect(container.querySelector("svg")).toBeInTheDocument()
  })
})

describe("Icon resolution", () => {
  it("resolves names from the default set that OnuProvider supplies", () => {
    const { container } = renderWithOnu(<Icon name="search" />)
    expect(glyph(container.querySelector("svg"))).toBe(reference(SearchIcon))
  })

  it("uses the fallback glyph outside OnuProvider", () => {
    const { container } = render(<Icon name="loading" fallback={Loader2Icon} />)
    expect(glyph(container.querySelector("svg"))).toBe(reference(Loader2Icon))
    expect(container.querySelector("svg")).toHaveAttribute("data-icon-name", "loading")
  })

  it("accepts an element as fallback", () => {
    render(<Icon name="loading" fallback={<svg data-testid="el" />} />)
    expect(screen.getByTestId("el")).toHaveAttribute("data-icon-name", "loading")
  })

  it("shows the generic glyph outside OnuProvider when there is no fallback", () => {
    const { container } = render(<Icon name="search" />)
    expect(glyph(container.querySelector("svg"))).toBe(reference(fallbackIcon))
  })

  it("lets provider overrides win over the fallback glyph", () => {
    const Custom = (props: object) => <svg data-testid="custom" {...props} />
    renderWithOnu(<Icon name="loading" fallback={Loader2Icon} />, { provider: { icons: { loading: Custom } } })
    expect(screen.getByTestId("custom")).toHaveAttribute("data-icon-name", "loading")
  })

  it("the package-root Icon resolves any name outside OnuProvider", () => {
    const { container } = render(<StandaloneIcon name="search" />)
    expect(glyph(container.querySelector("svg"))).toBe(reference(SearchIcon))
  })

  it("the package-root Icon keeps a given fallback, mirroring and overrides", () => {
    const Custom = (props: object) => <svg data-testid="custom" {...props} />
    const { container } = renderWithOnu(
      <>
        <StandaloneIcon name="chevron-right" />
        <StandaloneIcon name="close" />
        <StandaloneIcon name="not-a-name" fallback={<svg data-testid="own" />} />
      </>,
      { provider: { icons: { close: Custom } } },
    )
    expect(container.querySelector('[data-icon-name="chevron-right"]')!.getAttribute("class")).toContain(
      "rtl:-scale-x-100",
    )
    expect(screen.getByTestId("custom")).toBeInTheDocument()
    expect(screen.getByTestId("own")).toHaveAttribute("data-icon-name", "not-a-name")
  })
})

describe("components with fixed glyphs", () => {
  const MyIcon = (props: object) => <svg data-testid="my-icon" {...props} />
  const cases: [string, () => React.ReactElement, string, React.ComponentType][] = [
    ["Button (loading)", () => <Button loading>Save</Button>, "loading", Loader2Icon],
    ["Spinner", () => <Spinner />, "loading", Loader2Icon],
    ["primitive Spinner", () => <PrimitiveSpinner />, "loading", Loader2Icon],
    ["Checkbox", () => <Checkbox aria-label="Agree" defaultChecked />, "check", CheckIcon],
  ]

  it.each(cases)("%s uses OnuProvider icon overrides", (_, ui, name) => {
    renderWithOnu(ui(), { provider: { icons: { [name]: MyIcon } } })
    expect(screen.getAllByTestId("my-icon")[0]).toHaveAttribute("data-icon-name", name)
  })

  it.each(cases)("%s renders its Lucide glyph without OnuProvider", (_, ui, name, expected) => {
    const { container } = render(ui())
    expect(glyph(container.querySelector(`[data-icon-name="${name}"]`))).toBe(reference(expected))
  })
})
