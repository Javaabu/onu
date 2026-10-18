import { mkdtempSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"

import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js"
import { afterAll, beforeAll, describe, expect, it } from "vitest"

import { writeLlms } from "../../../scripts/llms.mjs"
import { findDoc, findProjectDocs, loadDocs, searchDocs, type Docs } from "./docs.js"
import { createServer } from "./server.js"

let out: string
let docs: Docs
let client: Client

beforeAll(async () => {
  out = mkdtempSync(path.join(tmpdir(), "onu-mcp-"))
  writeLlms(out)
  docs = loadDocs({ dir: path.join(out, "docs") })
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()
  await createServer(docs).connect(serverTransport)
  client = new Client({ name: "test", version: "0" })
  await client.connect(clientTransport)
})

afterAll(async () => {
  await client.close()
  rmSync(out, { recursive: true, force: true })
})

const call = async (name: string, args: Record<string, unknown> = {}) => {
  const result = await client.callTool({ name, arguments: args })
  const [first] = result.content as { type: string; text: string }[]
  return { text: first!.text, isError: result.isError === true }
}

describe("findDoc", () => {
  it.each(["PasswordInput", "password-input", "text-inputs/password-input", "Password input", "password-input.md"])(
    "finds %s",
    (name) => expect(findDoc(docs, name)?.path).toBe("text-inputs/password-input"),
  )

  it("finds a page by one of the exports it documents", () => {
    expect(findDoc(docs, "announce")?.path).toBe("accessibility/use-announcer")
    expect(findDoc(docs, "FormSection")?.path).toBe("form-scaffolding/fieldset")
  })

  it("returns undefined for an unknown name", () => expect(findDoc(docs, "FluxCapacitor")).toBeUndefined())
})

describe("searchDocs", () => {
  it("ranks the page titled with the query first", () => {
    expect(searchDocs(docs, "date range picker")[0]?.page.path).toBe("date-and-time/date-range-picker")
  })

  it("needs every word to match", () => expect(searchDocs(docs, "thaana xylophone")).toEqual([]))
})

describe("findProjectDocs", () => {
  it("finds nothing outside a project that installs Onu", () => expect(findProjectDocs(tmpdir())).toBeUndefined())
})

describe("server", () => {
  it("lists the tools", async () => {
    const { tools } = await client.listTools()
    expect(tools.map((t) => t.name).sort()).toEqual([
      "onu_get_doc",
      "onu_get_rules",
      "onu_list_components",
      "onu_search_docs",
    ])
  })

  it("returns the rules", async () => {
    const { text } = await call("onu_get_rules")
    expect(text).toContain("FormField")
    expect(text).toContain("ms-*")
  })

  it("returns a page with its Props and Accessibility sections", async () => {
    const { text } = await call("onu_get_doc", { name: "PasswordInput" })
    expect(text).toMatch(/^# PasswordInput/)
    expect(text).toContain("## Props")
    expect(text).toContain("## Accessibility")
  })

  it("suggests pages for an unknown name", async () => {
    const result = await call("onu_get_doc", { name: "password field" })
    expect(result.isError).toBe(true)
    expect(result.text).toContain("text-inputs/password-input")
  })

  it("lists one section", async () => {
    const { text } = await call("onu_list_components", { section: "text-inputs" })
    expect(text).toContain("PasswordInput — text-inputs/password-input")
    expect(text).not.toContain("DataTable")
  })

  it("searches", async () => {
    const { text } = await call("onu_search_docs", { query: "laravel 422", limit: 3 })
    expect(text.split("\n- ")).toHaveLength(3)
  })
})
