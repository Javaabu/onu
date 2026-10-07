"use client"

import * as React from "react"

import { useTranslation } from "../../providers/onu-provider"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../ui/alert-dialog"

export interface UnsavedChangesGuardOptions {
  /** Show the browser's own "Leave site?" warning on close/reload. Default `true`. */
  beforeUnload?: boolean
  /**
   * Ask before following same-origin links anywhere on the page (works with
   * router links too: the click is replayed after the user confirms). Default `true`.
   * Mark links to skip with `data-unsaved-guard-ignore`.
   */
  interceptLinks?: boolean
  /** Dialog text. Defaults to "You have unsaved changes. Leave anyway?". */
  message?: React.ReactNode
  title?: React.ReactNode
}

export interface UnsavedChangesGuard {
  /**
   * Resolves `true` when it is fine to leave: nothing is dirty, or the user
   * chose "Leave". Call it from your router's before-navigation hook.
   */
  confirmLeave: () => Promise<boolean>
  /** Runs `proceed` straight away when clean, or after the user confirms leaving. */
  guard: (proceed: () => void) => void
  /** The confirmation dialog. Render it once. */
  dialog: React.ReactElement
}

function isGuardedLink(event: MouseEvent): HTMLAnchorElement | null {
  if (event.defaultPrevented || event.button !== 0) return null
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return null
  const anchor = (event.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null
  if (!anchor || anchor.hasAttribute("download") || anchor.closest("[data-unsaved-guard-ignore]")) return null
  if (anchor.target && anchor.target !== "_self") return null
  const url = new URL(anchor.href, window.location.href)
  if (url.origin !== window.location.origin) return null // the browser's beforeunload prompt covers these
  const here = window.location
  if (url.pathname === here.pathname && url.search === here.search && url.hash) return null // in-page anchors
  return anchor
}

/**
 * Warns before leaving a page with unsaved changes (§25.9): the browser's own
 * prompt on close/reload, and "You have unsaved changes. Leave anyway?" for
 * in-app navigation (link clicks, or your router via `confirmLeave`).
 * No warning once `dirty` is false (saved or discarded).
 */
export function useUnsavedChangesGuard(
  dirty: boolean,
  { beforeUnload = true, interceptLinks = true, message, title }: UnsavedChangesGuardOptions = {},
): UnsavedChangesGuard {
  const { t } = useTranslation()
  const [open, setOpen] = React.useState(false)
  const resolver = React.useRef<((leave: boolean) => void) | null>(null)
  const dirtyRef = React.useRef(dirty)
  const leaving = React.useRef(false)
  const replaying = React.useRef(false)
  const returnFocus = React.useRef<HTMLElement | null>(null)

  React.useEffect(() => {
    dirtyRef.current = dirty
    if (!dirty) leaving.current = false
  }, [dirty])

  const confirmLeave = React.useCallback(() => {
    if (!dirtyRef.current || leaving.current) return Promise.resolve(true)
    resolver.current?.(false)
    returnFocus.current = document.activeElement as HTMLElement | null
    setOpen(true)
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve
    })
  }, [])

  const settle = React.useCallback((leave: boolean) => {
    setOpen(false)
    if (leave) leaving.current = true
    resolver.current?.(leave)
    resolver.current = null
  }, [])

  const guard = React.useCallback(
    (proceed: () => void) => {
      void confirmLeave().then((leave) => leave && proceed())
    },
    [confirmLeave],
  )

  React.useEffect(() => {
    if (!dirty || !beforeUnload) return
    const handler = (event: BeforeUnloadEvent) => {
      if (leaving.current) return
      event.preventDefault()
      event.returnValue = ""
    }
    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [dirty, beforeUnload])

  React.useEffect(() => {
    if (!dirty || !interceptLinks) return
    const handler = (event: MouseEvent) => {
      if (replaying.current || leaving.current) return
      const anchor = isGuardedLink(event)
      if (!anchor) return
      event.preventDefault()
      event.stopPropagation()
      guard(() => {
        replaying.current = true
        try {
          anchor.click()
        } finally {
          replaying.current = false
        }
      })
    }
    document.addEventListener("click", handler, true)
    return () => document.removeEventListener("click", handler, true)
  }, [dirty, interceptLinks, guard])

  const dialog = (
    <AlertDialog open={open} onOpenChange={(next) => !next && settle(false)}>
      <AlertDialogContent
        data-slot="unsaved-changes-dialog"
        onCloseAutoFocus={(event) => {
          // Opened without a trigger, so return focus to whatever had it (§25.10).
          event.preventDefault()
          returnFocus.current?.focus()
        }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>{title ?? t("form.leaveTitle")}</AlertDialogTitle>
          <AlertDialogDescription>{message ?? t("form.leaveMessage")}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => settle(false)}>{t("form.stay")}</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={() => settle(true)}>
            {t("form.leave")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )

  return { confirmLeave, guard, dialog }
}
