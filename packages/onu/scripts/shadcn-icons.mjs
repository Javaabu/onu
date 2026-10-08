/**
 * Icon transform for scripts/sync-shadcn.mjs: shadcn's `<IconPlaceholder lucide="X" />`
 * becomes Onu's `<Icon name="…" fallback={…} />` (R6.5). The fallback glyph keeps
 * primitives working without OnuProvider while `<Icon>` stays free of the full icon map.
 */
import { readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const here = path.dirname(fileURLToPath(import.meta.url))

/** Lucide names used by shadcn → Onu semantic icon names. */
export const ICON_NAMES = {
  CheckIcon: "check",
  ChevronDownIcon: "chevron-down",
  ChevronLeftIcon: "chevron-left",
  ChevronRightIcon: "chevron-right",
  ChevronUpIcon: "chevron-up",
  ArrowDownIcon: "arrow-down",
  ArrowLeftIcon: "arrow-left",
  ArrowRightIcon: "arrow-right",
  CircleCheckIcon: "success",
  InfoIcon: "info",
  MinusIcon: "minus",
  MoreHorizontalIcon: "more",
  OctagonXIcon: "error",
  PanelLeftIcon: "sidebar",
  SearchIcon: "search",
  TriangleAlertIcon: "warning",
  XIcon: "close",
  Loader2Icon: "loading",
  LoaderIcon: "loading",
  CircleIcon: "dot",
  GripVerticalIcon: "grip-vertical",
}

export const FALLBACK_COMMENT =
  "// onu: fixed glyphs passed as Icon fallbacks, so primitives work without OnuProvider and the full icon map."

export function kebab(name) {
  return name
    .replace(/Icon$/, "")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase()
}

/** Semantic name → Lucide component name, read from src/icons/lucide-map.ts. */
export function readLucideMap(file = path.resolve(here, "../src/icons/lucide-map.ts")) {
  const source = readFileSync(file, "utf8")
  return Object.fromEntries([...source.matchAll(/^\s+"?([a-z0-9-]+)"?: (\w+),$/gm)].map((m) => [m[1], m[2]]))
}

/**
 * Rewrites icon placeholders in one vendored file.
 * - `lucide="X"`: `<Icon name="semantic" fallback={Glyph} />`, where Glyph is the default
 *   set's icon for that name (so the glyph is the same with or without OnuProvider), or X
 *   when the name is not in the default set. Glyphs are imported from lucide-react.
 * - `lucide={expr}` (dynamic): `<Icon name={expr} />`, no fallback.
 */
export function replaceIcons(code, lucideMap = readLucideMap()) {
  let used = false
  const glyphs = new Set()
  const out = code.replace(/<IconPlaceholder\b([\s\S]*?)\/>/g, (_, attrs) => {
    used = true
    const lucide = /lucide=(?:"([A-Za-z0-9]+)"|\{([^}]+)\})/.exec(attrs)
    const rest = attrs.replace(/\s(lucide|tabler|hugeicons|phosphor|remixicon)=(?:"[^"]*"|\{[^}]*\})/g, "").trim()
    let name
    let fallback = ""
    if (lucide?.[1]) {
      const semantic = ICON_NAMES[lucide[1]] ?? kebab(lucide[1])
      const glyph = lucideMap[semantic] ?? lucide[1]
      glyphs.add(glyph)
      name = `"${semantic}"`
      fallback = ` fallback={${glyph}}`
    } else {
      name = `{${lucide?.[2] ?? '"dot"'}}`
    }
    return `<Icon name=${name}${fallback}${rest ? " " + rest : ""} />`
  })
  if (!used) return code.replace(/import \{ IconPlaceholder \} from "[^"]+"\n/, "")

  const placeholderImport = /import \{ IconPlaceholder \} from "[^"]+"/
  const iconImport = 'import { Icon } from "../icons/icon"'
  const lucideImport = /^import \{([^}]*)\} from "lucide-react"\n/m
  const list = (names) => [...new Set(names)].sort().join(", ")

  if (glyphs.size === 0) return out.replace(placeholderImport, iconImport)
  if (lucideImport.test(out)) {
    // Merge the glyphs into the file's existing lucide-react import.
    return out
      .replace(lucideImport, (_, names) => {
        const existing = names
          .split(",")
          .map((n) => n.trim())
          .filter(Boolean)
        return `${FALLBACK_COMMENT}\nimport { ${list([...existing, ...glyphs])} } from "lucide-react"\n`
      })
      .replace(placeholderImport, iconImport)
  }
  return out.replace(
    placeholderImport,
    `${FALLBACK_COMMENT}\nimport { ${list(glyphs)} } from "lucide-react"\n${iconImport}`,
  )
}
