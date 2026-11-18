"use client"

import * as React from "react"
import { isSameDay } from "date-fns"

const noopSubscribe = () => () => {}

let cached: Date | null = null
/** The device's date, the same object for the whole day (a stable store snapshot). */
function deviceToday() {
  const now = new Date()
  if (!cached || !isSameDay(cached, now)) cached = now
  return cached
}

/**
 * "Today" for a calendar: `pinned` when given, otherwise the device's date. A server can't know
 * the browser's date (its time zone may differ), so without `pinned` this is `null` while server
 * rendering and hydrating, and the device's date right after.
 */
export function useToday(pinned?: Date): Date | null {
  const device = React.useSyncExternalStore(noopSubscribe, deviceToday, () => null)
  return pinned ?? device
}
