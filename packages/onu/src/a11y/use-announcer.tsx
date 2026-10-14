"use client"

import * as React from "react"

import { LiveRegion, type LiveRegionProps, type Politeness } from "./live-region"

/**
 * How long a repeated message is cleared before it is set again. Screen readers
 * only announce a live region when its text changes, so the same text twice in a
 * row needs a short gap.
 */
const REPEAT_DELAY = 100

export type UseAnnouncerOptions = Omit<LiveRegionProps, "children">

export interface Announcer {
  /** Reads `message` out through the region. The same message twice is read twice. */
  announce: (message: string) => void
  /** Empties the region. */
  clear: () => void
  /** The text currently in the region. */
  message: string
  /** The live region. Render it once, and keep it mounted. */
  region: React.ReactElement
}

/**
 * A live region and an `announce(message)` function for it, for status changes
 * that have no visible text of their own: "Row moved to position 3", "Saved",
 * "4 results". Options are passed to the `LiveRegion`.
 */
export function useAnnouncer(options: UseAnnouncerOptions = {}): Announcer {
  const [message, setMessage] = React.useState("")
  const last = React.useRef("")
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined)
  React.useEffect(() => () => clearTimeout(timer.current), [])

  const announce = React.useCallback((text: string) => {
    clearTimeout(timer.current)
    if (text && text === last.current) {
      setMessage("")
      timer.current = setTimeout(() => setMessage(text), REPEAT_DELAY)
    } else {
      setMessage(text)
    }
    last.current = text
  }, [])

  const clear = React.useCallback(() => {
    clearTimeout(timer.current)
    last.current = ""
    setMessage("")
  }, [])

  const region = <LiveRegion {...options}>{message}</LiveRegion>
  return { announce, clear, message, region }
}

/* ------------------------------------------------------------------------ */

export interface AnnounceOptions {
  /** Default `polite`. Use `assertive` only for messages that must interrupt, such as errors. */
  politeness?: Politeness
}

const pending = new WeakMap<HTMLElement, ReturnType<typeof setTimeout>>()

/** The page-wide region for a politeness level, created on first use. */
function globalRegion(politeness: Politeness): { el: HTMLElement; created: boolean } {
  const existing = document.querySelector<HTMLElement>(`[data-onu-announcer="${politeness}"]`)
  if (existing) return { el: existing, created: false }
  const el = document.createElement("div")
  el.dataset.onuAnnouncer = politeness
  el.setAttribute("aria-live", politeness)
  el.setAttribute("aria-atomic", "true")
  // Visually hidden without depending on the `sr-only` utility being in the app's CSS.
  Object.assign(el.style, {
    position: "absolute",
    width: "1px",
    height: "1px",
    padding: "0",
    margin: "-1px",
    overflow: "hidden",
    clip: "rect(0, 0, 0, 0)",
    whiteSpace: "nowrap",
    border: "0",
  })
  document.body.appendChild(el)
  return { el, created: true }
}

/**
 * Announces a message through a page-wide live region, from anywhere (event
 * handlers, data callbacks, code outside React). Prefer `useAnnouncer` inside
 * components, so the region is part of the component and its language and
 * direction.
 */
export function announce(message: string, { politeness = "polite" }: AnnounceOptions = {}) {
  if (typeof document === "undefined") return
  const { el, created } = globalRegion(politeness)
  clearTimeout(pending.get(el))
  // A region that appears together with its text is often not read, and the same text twice needs a gap.
  if (created || (message && el.textContent === message)) {
    el.textContent = ""
    pending.set(
      el,
      setTimeout(() => {
        el.textContent = message
      }, REPEAT_DELAY),
    )
  } else {
    el.textContent = message
  }
}
