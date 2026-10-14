import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { bundle, outFile } from "../build.mjs"

it("committed code.js is up to date with src/ and tokens.json (run pnpm figma:plugin)", async () => {
  expect(readFileSync(outFile, "utf8") === (await bundle())).toBe(true)
})
