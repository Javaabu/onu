import tabler from "@iconify-json/tabler/icons.json"
import { describe, expect, it } from "vitest"

import { renderWithOnu } from "../../../test/utils"
import { DynamicIcon } from "../dynamic-icon"
import { Icon } from "../icon"
import { iconifyIconMap, iconifySource, registerIconifyCollections, type IconifyJSON } from "./index"

const collection = tabler as unknown as IconifyJSON

describe("Iconify adapter", () => {
  it("renders offline collections through DynamicIcon", () => {
    const source = iconifySource({ collections: [collection] })
    expect(source.prefixes).toEqual(["tabler"])
    expect(source.list?.()).toContain("tabler:home")
    const { container } = renderWithOnu(<DynamicIcon id="tabler:home" className="extra" />, {
      provider: { iconSources: [source] },
    })
    const svg = container.querySelector("svg")
    expect(svg).toBeInTheDocument()
    expect(svg!.getAttribute("class")).toContain("extra")
  })

  it("matches any prefix without collections", () => {
    expect(iconifySource().prefixes).toEqual(["*"])
  })

  it("maps semantic icons to Iconify ids", () => {
    registerIconifyCollections(collection)
    const { container } = renderWithOnu(<Icon name="close" />, {
      provider: { icons: iconifyIconMap({ close: "tabler:x", check: undefined }) },
    })
    expect(container.querySelector("svg")).toBeInTheDocument()
  })
})

describe("DynamicIcon", () => {
  it("renders Lucide ids lazily and nothing for unknown sources", () => {
    const { container } = renderWithOnu(
      <>
        <DynamicIcon id="unknown:thing" />
      </>,
    )
    expect(container.querySelector("svg")).toBeNull()
  })
})
