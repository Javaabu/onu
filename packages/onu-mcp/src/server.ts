import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"

import { findDoc, loadDocs, searchDocs, type Docs } from "./docs.js"

export { findDoc, loadDocs, searchDocs, type Docs } from "./docs.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })

/** The Onu MCP server: docs lookup, search and the rules for writing Onu code. */
export function createServer(docs: Docs = loadDocs()) {
  const { index } = docs
  const server = new McpServer(
    { name: "onu", title: "Onu", version: index.version },
    {
      instructions: `Onu (@javaabu/onu ${index.version}) is Javaabu's React UI library: shadcn/ui and Tailwind v4, RTL and Dhivehi first. Call onu_get_rules once before writing Onu code, and onu_get_doc for each component before using it; use only the props its page lists.`,
    },
  )
  const readOnly = { readOnlyHint: true, openWorldHint: false }

  server.registerTool(
    "onu_get_rules",
    {
      title: "Rules for writing Onu code",
      description:
        "The rules for writing UI with Onu: setup, imports, forms with Laravel validation, Thaana and RTL, theming, icons and accessibility. Read once before writing Onu code.",
      annotations: readOnly,
    },
    () => text(`# Rules for writing Onu ${index.version} code\n\n${index.rules}`),
  )

  server.registerTool(
    "onu_list_components",
    {
      title: "List Onu components and guides",
      description:
        "Every Onu docs page (components, hooks and guides) by section, with its path and one line on what it is for. Pass `section` (e.g. `text-inputs`, `listing-pages`, `guides`) to list one section.",
      inputSchema: { section: z.string().optional().describe("Section id or title; omit for every section") },
      annotations: readOnly,
    },
    ({ section }) => {
      const sections = section
        ? index.sections.filter((s) => s.id === section || s.title.toLowerCase() === section.toLowerCase())
        : index.sections
      if (!sections.length) {
        return text(`No section "${section}". Sections: ${index.sections.map((s) => s.id).join(", ")}.`)
      }
      return text(
        sections
          .map((s) =>
            [`## ${s.title} (${s.id})`, ...s.pages.map((p) => `- ${p.title} — ${p.path}: ${p.description}`)].join("\n"),
          )
          .join("\n\n"),
      )
    },
  )

  server.registerTool(
    "onu_get_doc",
    {
      title: "Get an Onu docs page",
      description:
        "The full docs page of a component, hook or guide as Markdown: usage, Props table, RTL notes and Accessibility. `name` can be the component name (`PasswordInput`), the file name (`password-input`) or the path (`text-inputs/password-input`).",
      inputSchema: { name: z.string().describe("Component, hook or guide name, or a docs path") },
      annotations: readOnly,
    },
    ({ name }) => {
      const page = findDoc(docs, name)
      if (page) return text(docs.read(page))
      const hits = searchDocs(docs, name, 5)
      return {
        ...text(
          `No Onu docs page named "${name}".${
            hits.length ? ` Closest matches: ${hits.map((h) => `${h.page.title} (${h.page.path})`).join(", ")}.` : ""
          } Use onu_list_components to see every page.`,
        ),
        isError: true,
      }
    },
  )

  server.registerTool(
    "onu_search_docs",
    {
      title: "Search the Onu docs",
      description:
        "Search every Onu docs page for words, e.g. `date range laravel`, `thaana textarea`, `bulk delete`. Returns the best pages with a snippet; read one with onu_get_doc.",
      inputSchema: {
        query: z.string().describe("Words to look for"),
        limit: z.number().int().min(1).max(25).optional().describe("Maximum results (default 8)"),
      },
      annotations: readOnly,
    },
    ({ query, limit }) => {
      const hits = searchDocs(docs, query, limit ?? 8)
      if (!hits.length) return text(`No Onu docs page mentions "${query}".`)
      return text(
        hits.map((h) => `- ${h.page.title} — ${h.page.path}: ${h.page.description}\n  ${h.snippet}`).join("\n"),
      )
    },
  )

  server.registerResource(
    "rules",
    "onu://rules",
    { title: "Rules for writing Onu code", mimeType: "text/markdown" },
    (uri) => ({ contents: [{ uri: uri.href, mimeType: "text/markdown", text: index.rules }] }),
  )

  return server
}
