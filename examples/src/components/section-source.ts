/* Pure helpers shared by the docs UI and the build-time registry plugin (vite.config.ts). */

/** Index just past the `>` that closes the JSX opening tag starting at `start`. */
function openTagEnd(source: string, start: number) {
  let depth = 0
  let quote = ""
  for (let i = start; i < source.length; i++) {
    const ch = source[i]
    if (quote) {
      if (ch === quote) quote = ""
    } else if (ch === "{") depth++
    else if (ch === "}") depth--
    else if (depth === 0 && (ch === '"' || ch === "'")) quote = ch
    else if (depth === 0 && ch === ">") return source[i - 1] === "/" ? -1 : i + 1
  }
  return -1
}

function dedent(code: string) {
  const lines = code
    .replace(/^\s*\n/, "")
    .replace(/\s+$/, "")
    .split("\n")
  const indent = Math.min(...lines.filter((l) => l.trim()).map((l) => l.match(/^ */)![0].length))
  return lines.map((l) => l.slice(indent)).join("\n")
}

/** The JSX inside `<DemoSection title="…">` in a demo file, or "" when it can't be found. */
export function sectionSource(source: string, title: string) {
  const marker = source.indexOf(`title=${JSON.stringify(title)}`)
  if (marker === -1) return ""
  const start = source.lastIndexOf("<DemoSection", marker)
  if (start === -1) return ""
  const bodyStart = openTagEnd(source, start)
  if (bodyStart === -1) return ""
  let depth = 1
  const tag = /<DemoSection\b|<\/DemoSection>/g
  tag.lastIndex = bodyStart
  for (let m = tag.exec(source); m; m = tag.exec(source)) {
    depth += m[0] === "</DemoSection>" ? -1 : 1
    if (depth === 0) return dedent(source.slice(bodyStart, m.index))
  }
  return ""
}

/** Every `<DemoSection title="…">` in a file whose code `sectionSource` can extract. */
export function sectionTitles(source: string) {
  const titles = new Set<string>()
  for (const m of source.matchAll(/\btitle=("(?:[^"\\\n]|\\.)*")/g)) {
    let title: string
    try {
      title = JSON.parse(m[1]!) as string
    } catch {
      continue
    }
    if (sectionSource(source, title)) titles.add(title)
  }
  return [...titles]
}
