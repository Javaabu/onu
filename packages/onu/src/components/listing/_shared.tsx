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
import { Spinner } from "../../ui/spinner"
import type { ListingNoun } from "./listing-types"

/** Picks the singular or plural form of a noun for a count, in the active locale. */
export function useNoun(noun: ListingNoun | undefined) {
  const { t, locale } = useTranslation()
  return React.useCallback(
    (count: number) => {
      const one = noun?.one ?? t("listing.recordOne")
      const other = noun?.other ?? t("listing.recordOther")
      return new Intl.PluralRules(locale.code).select(count) === "one" ? one : other
    },
    [noun, t, locale.code],
  )
}

/**
 * A polite live region and a function that announces a message through it.
 * The message is cleared first so the same text is announced again.
 */
export function useAnnouncer() {
  const [message, setMessage] = React.useState("")
  const announce = React.useCallback((text: string) => {
    setMessage("")
    // Next frame, so screen readers notice a repeated message.
    window.setTimeout(() => setMessage(text), 30)
  }, [])
  const region = (
    <span className="sr-only" role="status" aria-live="polite" aria-atomic="true" data-slot="listing-announcer">
      {message}
    </span>
  )
  return { announce, region, message }
}

/** Whether a click landed on (or inside) an interactive element, so row clicks can ignore it. */
export function isInteractiveTarget(target: EventTarget | null, stopAt?: Element | null) {
  let el = target instanceof Element ? target : null
  while (el && el !== stopAt) {
    if (
      el.matches(
        "a,button,input,select,textarea,label,summary,[role=button],[role=checkbox],[role=menuitem],[role=switch],[contenteditable=true]",
      )
    )
      return true
    el = el.parentElement
  }
  return false
}

export interface ConfirmOptions {
  title: React.ReactNode
  description?: React.ReactNode
  confirmLabel?: React.ReactNode
  cancelLabel?: React.ReactNode
  destructive?: boolean
}

export interface ConfirmDialogProps extends ConfirmOptions {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** May return a promise: the dialog shows a spinner and stays open until it settles. */
  onConfirm: () => void | Promise<unknown>
}

/** Confirmation built on shadcn's AlertDialog. Escape or Cancel closes it without doing anything. */
export function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmLabel,
  cancelLabel,
  destructive = true,
}: ConfirmDialogProps) {
  const { t } = useTranslation()
  const [busy, setBusy] = React.useState(false)
  // Radix only returns focus to an AlertDialogTrigger; these dialogs open from
  // menus and buttons, so remember what had focus and go back to it (§25.10).
  const returnTo = React.useRef<HTMLElement | null>(null)
  React.useLayoutEffect(() => {
    if (open) returnTo.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
  }, [open])

  const confirm = async (event: React.MouseEvent) => {
    event.preventDefault()
    setBusy(true)
    try {
      await onConfirm()
      onOpenChange(false)
    } finally {
      setBusy(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={(next) => !busy && onOpenChange(next)}>
      <AlertDialogContent
        data-slot="listing-confirm"
        onCloseAutoFocus={(event) => {
          if (!returnTo.current?.isConnected) return
          event.preventDefault()
          returnTo.current.focus()
        }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription className={description ? undefined : "sr-only"}>
            {description ?? title}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>{cancelLabel ?? t("common.cancel")}</AlertDialogCancel>
          <AlertDialogAction
            variant={destructive ? "destructive" : "default"}
            disabled={busy}
            aria-busy={busy || undefined}
            onClick={confirm}
          >
            {busy ? <Spinner /> : null}
            {confirmLabel ?? t("common.delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
