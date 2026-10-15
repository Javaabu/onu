import { readFileSync } from "node:fs"
import path from "node:path"
import { expect, it } from "vitest"
import { installFigma } from "./figma-mock"

/** The committed code.js (what designers import) runs end to end against the fake API. */
it("built code.js generates the kit when the UI asks", async () => {
  const api = installFigma([
    ["Inter", "Regular"],
    ["Inter", "Medium"],
    ["Inter", "Semi Bold"],
    ["Inter", "Bold"],
    ["Faruma", "Regular"],
    ["MV Faseyha", "Regular"],
    ["JetBrains Mono", "Regular"],
  ])
  const code = readFileSync(path.join(import.meta.dirname, "../code.js"), "utf8")
  new Function("figma", "__html__", code)(api, "<html></html>")
  expect(api.posted[0]).toMatchObject({ type: "init", primary: "oklch(0.562 0.251 283.7)" })
  await api.ui.onmessage!({ type: "generate", samples: true })
  const done = api.posted.find((m) => m.type === "done")
  expect(api.posted.find((m) => m.type === "error")).toBeUndefined()
  expect(done.result.stats.componentSets).toBeGreaterThan(25)
  expect(done.result.nodeIds["form-scaffolding/button"]).toMatch(/^\d+:\d+$/)
  // Faruma and MV Faseyha are available here: Faruma for Thaana text, MV Faseyha for bold (headings).
  expect(api.styles.find((s) => s.name === "Thaana/sm/Regular").fontName.family).toBe("Faruma")
  expect(api.styles.find((s) => s.name === "Thaana/2xl/Bold").fontName.family).toBe("MV Faseyha")
  expect(done.result.notes).toEqual([])
})
