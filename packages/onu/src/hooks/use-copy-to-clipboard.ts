"use client"

import * as React from "react"

/** Writes text to the clipboard, falling back to `execCommand("copy")`. */
export async function writeClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // fall through to the legacy path
  }
  const el = document.createElement("textarea")
  el.value = text
  el.setAttribute("readonly", "")
  el.style.position = "fixed"
  el.style.opacity = "0"
  document.body.appendChild(el)
  el.select()
  let ok: boolean
  try {
    ok = document.execCommand?.("copy") ?? false
  } catch {
    ok = false
  }
  el.remove()
  return ok
}

/** Copies text and reports `"copied"` / `"failed"` for `timeout` ms. */
export function useCopyToClipboard(timeout = 2000) {
  const [status, setStatus] = React.useState<"idle" | "copied" | "failed">("idle")
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined)
  React.useEffect(() => () => clearTimeout(timer.current), [])
  const copy = React.useCallback(
    async (text: string) => {
      const ok = await writeClipboard(text)
      setStatus(ok ? "copied" : "failed")
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setStatus("idle"), timeout)
      return ok
    },
    [timeout],
  )
  return { status, copy }
}
