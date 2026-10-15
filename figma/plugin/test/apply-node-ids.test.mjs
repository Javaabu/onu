import { describe, expect, it } from "vitest"
import { applyNodeIds, nodeUrl } from "../../apply-node-ids.mjs"

const components = {
  "form-scaffolding/button": { title: "Button", component: "Button", import: "@javaabu/onu", figmaUrl: null },
  "display-and-feedback/tag": { title: "Tag", component: "Tag", import: "@javaabu/onu", figmaUrl: null },
}

describe("apply-node-ids", () => {
  it("fills figmaUrl from the plugin output", () => {
    const url = nodeUrl("abc", "1:2")
    const result = applyNodeIds(components, {
      fileKey: "abc",
      figmaUrls: { "form-scaffolding/button": url, "not/a-component": nodeUrl("abc", "3:4") },
      nodeIds: { "form-scaffolding/button": "1:2" },
    })
    expect(result.components["form-scaffolding/button"].figmaUrl).toBe(
      "https://www.figma.com/design/abc/Onu_Claude?node-id=1-2",
    )
    expect(result.updated).toEqual(["form-scaffolding/button"])
    expect(result.unknown).toEqual(["not/a-component"])
    // The input object is not modified.
    expect(components["form-scaffolding/button"].figmaUrl).toBeNull()
  })

  it("builds URLs from bare node ids with the file key", () => {
    const result = applyNodeIds(components, { "display-and-feedback/tag": "10:20" }, { fileKey: "KEY" })
    expect(result.components["display-and-feedback/tag"].figmaUrl).toBe(
      "https://www.figma.com/design/KEY/Onu_Claude?node-id=10-20",
    )
  })

  it("reports unchanged entries on a re-run", () => {
    const once = applyNodeIds(components, { "display-and-feedback/tag": "10:20" })
    const twice = applyNodeIds(once.components, { "display-and-feedback/tag": "10:20" })
    expect(twice.updated).toEqual([])
    expect(twice.unchanged).toEqual(["display-and-feedback/tag"])
  })
})
