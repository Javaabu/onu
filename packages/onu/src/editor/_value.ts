import type { Editor, JSONContent } from "@tiptap/core"

/** Editor content: an HTML string or Tiptap JSON. */
export type EditorValue = string | JSONContent
export type EditorFormat = "html" | "json"

/** The format to emit: explicit, else the shape of the value given, else HTML. */
export function resolveFormat(format: EditorFormat | undefined, value: EditorValue | undefined): EditorFormat {
  if (format) return format
  return value !== undefined && typeof value === "object" ? "json" : "html"
}

/** Reads the editor's content in a format. An empty document is `""` in HTML. */
export function readValue(editor: Editor, format: EditorFormat): EditorValue {
  if (format === "json") return editor.getJSON()
  return editor.isEmpty ? "" : editor.getHTML()
}

/** Serialises a value for a hidden form input. */
export function stringifyValue(value: EditorValue): string {
  return typeof value === "string" ? value : JSON.stringify(value)
}

/** True when two values hold the same content. */
export function sameValue(a: EditorValue | undefined, b: EditorValue | undefined): boolean {
  if (a === b) return true
  if (a === undefined || b === undefined) return false
  return stringifyValue(a) === stringifyValue(b)
}

/** Parses JSON passed as a string (e.g. from a database column); other strings are HTML. */
export function parseJsonContent(value: string | JSONContent | null | undefined): JSONContent | null {
  if (!value) return null
  if (typeof value === "object") return value
  try {
    const parsed = JSON.parse(value) as unknown
    return parsed && typeof parsed === "object" ? (parsed as JSONContent) : null
  } catch {
    return null
  }
}
