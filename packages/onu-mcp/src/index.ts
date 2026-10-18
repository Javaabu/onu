#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"

import { loadDocs } from "./docs.js"
import { createServer } from "./server.js"

const docs = loadDocs()
await createServer(docs).connect(new StdioServerTransport())
// stdout carries the protocol, so report on stderr.
console.error(
  `onu-mcp: serving @javaabu/onu ${docs.index.version} docs (${docs.pages.length} pages, ${docs.source === "project" ? "from the project" : "bundled"})`,
)
