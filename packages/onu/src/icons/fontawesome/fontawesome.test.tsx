import { fas } from "@fortawesome/free-solid-svg-icons"
import { faCircleXmark as faCircleXmarkRegular } from "@fortawesome/free-regular-svg-icons"
import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { renderWithOnu } from "../../../test/utils"
import { DynamicIcon } from "../dynamic-icon"
import { Icon } from "../icon"
import { SEMANTIC_ICON_NAMES } from "../types"
import { FONT_AWESOME_NAMES, fontAwesomeIconMap, fontAwesomeSource, requiredFontAwesomeIcons } from "./index"

describe("FontAwesome adapter", () => {
  it("names a FontAwesome Free (solid) icon for every semantic icon", () => {
    const free = new Set(Object.values(fas).map((d) => d.iconName))
    const missing = SEMANTIC_ICON_NAMES.filter((n) => !free.has(FONT_AWESOME_NAMES[n] as never))
    expect(missing).toEqual([])
    expect(requiredFontAwesomeIcons()).toContain("xmark")
  })

  it("switches every built-in icon in one place", () => {
    const icons = fontAwesomeIconMap({ icons: [fas] })
    const { container } = renderWithOnu(
      <>
        <Icon name="close" />
        <Icon name="chevron-right" />
      </>,
      { provider: { icons } },
    )
    const svgs = container.querySelectorAll("svg")
    expect(svgs[0]).toHaveAttribute("data-icon", "xmark")
    expect(svgs[0]).toHaveAttribute("aria-hidden", "true")
    expect(svgs[1]).toHaveAttribute("data-icon", "chevron-right")
    expect(svgs[1]!.getAttribute("class")).toContain("rtl:-scale-x-100")
  })

  it("uses the chosen style, falls back, and accepts name overrides", () => {
    const icons = fontAwesomeIconMap({
      style: "regular",
      icons: [faCircleXmarkRegular, fas],
      names: { close: "circle-xmark", check: "circle-check" },
    })
    const { container } = renderWithOnu(
      <>
        <Icon name="close" />
        <Icon name="check" />
        <Icon name="search" label="Search" />
      </>,
      { provider: { icons } },
    )
    const svgs = container.querySelectorAll("svg")
    expect(svgs[0]).toHaveAttribute("data-prefix", "far")
    expect(svgs[1]).toHaveAttribute("data-icon", "circle-check")
    expect(svgs[1]).toHaveAttribute("data-prefix", "fas")
    expect(svgs[2]).toHaveAttribute("data-prefix", "fas")
    expect(screen.getByRole("img", { name: "Search" })).toBeInTheDocument()
  })

  it("renders nothing for unregistered icons", () => {
    const icons = fontAwesomeIconMap({ style: "thin", fallbackStyle: "thin", names: { close: "not-an-icon" } })
    const { container } = renderWithOnu(<Icon name="close" />, { provider: { icons } })
    expect(container.querySelector("svg")).toBeNull()
  })

  it("is a DynamicIcon source with styles in the id", () => {
    const source = fontAwesomeSource({ icons: [faCircleXmarkRegular, { faHouse: fas.faHouse! }] })
    expect(source.list?.()).toEqual(["fa:regular:circle-xmark", "fa:solid:house"])
    const { container } = renderWithOnu(
      <>
        <DynamicIcon id="fa:regular:circle-xmark" />
        <DynamicIcon id="fa:house" label="Home" />
      </>,
      { provider: { iconSources: [source] } },
    )
    const svgs = container.querySelectorAll("svg")
    expect(svgs[0]).toHaveAttribute("data-prefix", "far")
    expect(svgs[1]).toHaveAttribute("data-icon", "house")
    expect(screen.getByRole("img", { name: "Home" })).toBeInTheDocument()
    expect(fontAwesomeSource({ list: ["fa:a"] }).list?.()).toEqual(["fa:a"])
  })

  it.runIf(process.env.ONU_FONTAWESOME_PRO === "1")("works with FontAwesome Pro packages", async () => {
    const specifier = ["@fortawesome", "pro-regular-svg-icons"].join("/")
    const pro = await import(/* @vite-ignore */ specifier)
    const icons = fontAwesomeIconMap({ style: "regular", icons: [pro.far] })
    const { container } = renderWithOnu(<Icon name="close" />, { provider: { icons } })
    expect(container.querySelector("svg")).toHaveAttribute("data-prefix", "far")
  })
})
