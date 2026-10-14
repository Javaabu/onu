#!/usr/bin/env node
/**
 * Reports what the Figma token can do with the Onu file, without changing it:
 * the account, the file, and whether the Variables and Dev Resources REST APIs
 * are available (Variables needs an Enterprise plan).
 *
 *   FIGMA_TOKEN=… FIGMA_FILE_KEY=… node figma/probe.mjs
 */
const token = process.env.FIGMA_TOKEN
const file = process.env.FIGMA_FILE_KEY
if (!token || !file) {
  console.error("Set FIGMA_TOKEN and FIGMA_FILE_KEY.")
  process.exit(1)
}

async function get(path) {
  const res = await fetch(`https://api.figma.com${path}`, { headers: { "X-Figma-Token": token } })
  const text = await res.text()
  let body
  try {
    body = JSON.parse(text)
  } catch {
    body = text.slice(0, 300)
  }
  return { status: res.status, body }
}

const me = await get("/v1/me")
console.log(`me: ${me.status}${me.status === 200 ? ` (${me.body.handle})` : ` ${JSON.stringify(me.body)}`}`)

const meta = await get(`/v1/files/${file}/meta`)
if (meta.status === 200) {
  const f = meta.body.file ?? meta.body
  console.log(
    `file: 200 "${f.name}" editor=${f.editorType ?? "?"} role=${f.role ?? "?"} folder=${f.folder_name ?? "?"}`,
  )
} else console.log(`file meta: ${meta.status} ${JSON.stringify(meta.body)}`)

const doc = await get(`/v1/files/${file}?depth=2`)
if (doc.status === 200) {
  const pages = doc.body.document.children.map((p) => `${p.name} (${p.children?.length ?? 0} top-level nodes)`)
  console.log(`pages: ${pages.join(", ")}`)
  console.log(
    `components: ${Object.keys(doc.body.components ?? {}).length}, styles: ${Object.keys(doc.body.styles ?? {}).length}`,
  )
} else console.log(`file: ${doc.status} ${JSON.stringify(doc.body)}`)

const vars = await get(`/v1/files/${file}/variables/local`)
console.log(
  `variables API: ${vars.status}${vars.status === 200 ? ` (${Object.keys(vars.body.meta?.variables ?? {}).length} variables)` : ` ${JSON.stringify(vars.body)}`}`,
)

const dev = await get(`/v1/files/${file}/dev_resources`)
console.log(`dev resources API: ${dev.status}${dev.status === 200 ? "" : ` ${JSON.stringify(dev.body)}`}`)
