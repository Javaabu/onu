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

const doc = await get(`/v1/files/${file}?depth=3`)
if (doc.status === 200) {
  console.log(`last modified: ${doc.body.lastModified}, version ${doc.body.version}`)
  for (const page of doc.body.document.children) {
    const nodes = page.children ?? []
    console.log(`page "${page.name}": ${nodes.length} top-level nodes`)
    for (const n of nodes.slice(0, 40)) {
      const b = n.absoluteBoundingBox
      const size = b ? ` ${Math.round(b.width)}x${Math.round(b.height)}` : ""
      console.log(`  - ${n.type} "${n.name}"${size}${n.children ? ` (${n.children.length} children)` : ""}`)
    }
    if (nodes.length > 40) console.log(`  … ${nodes.length - 40} more`)
  }
  const components = Object.values(doc.body.components ?? {})
  const sets = Object.values(doc.body.componentSets ?? {})
  const styles = Object.values(doc.body.styles ?? {})
  console.log(`component sets: ${sets.length}${sets.length ? ` (${sets.map((c) => c.name).join(", ")})` : ""}`)
  console.log(
    `components: ${components.length}, styles: ${styles.length}${styles.length ? ` (${[...new Set(styles.map((st) => st.styleType))].join(", ")})` : ""}`,
  )
} else console.log(`file: ${doc.status} ${JSON.stringify(doc.body)}`)

const vars = await get(`/v1/files/${file}/variables/local`)
console.log(
  `variables API: ${vars.status}${vars.status === 200 ? ` (${Object.keys(vars.body.meta?.variables ?? {}).length} variables)` : ` ${JSON.stringify(vars.body)}`}`,
)

const dev = await get(`/v1/files/${file}/dev_resources`)
console.log(`dev resources API: ${dev.status}${dev.status === 200 ? "" : ` ${JSON.stringify(dev.body)}`}`)
