"use client"

import * as React from "react"

import { useTranslation } from "../../providers/onu-provider"
import { ConfirmDialog as BaseConfirmDialog } from "../overlays/confirm-dialog"
import type { ListingNoun } from "./listing-types"
import { registerEnglish } from "../../i18n/english"
import { common as en_common } from "../../locales/en/common"
import { listing as en_listing } from "../../locales/en/listing"

registerEnglish({ common: en_common, listing: en_listing })

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

/** The record's column: the one marked `primary`, else the first. It carries the row link and can't be hidden. */
export function primaryColumn<C extends { primary?: boolean }>(columns: readonly C[]): C | undefined {
  return columns.find((c) => c.primary) ?? columns[0]
}

/**
 * Whether a row's click handler should ignore this click: it landed on (or inside) an interactive
 * element, or outside the row's DOM altogether. React bubbles events from portals (the row's ⋯ menu,
 * its confirm dialog) through the component tree, so those clicks reach the row too.
 */
export function ignoresRowClick(event: React.MouseEvent<HTMLElement>) {
  const row = event.currentTarget
  let el = event.target instanceof Element ? event.target : null
  if (!el || !row.contains(el)) return true
  while (el && el !== row) {
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

/**
 * The overlays `ConfirmDialog`, destructive unless told otherwise (bulk
 * actions). Escape or Cancel closes it without doing anything.
 */
export function ConfirmDialog({ destructive = true, confirmLabel, ...props }: ConfirmDialogProps) {
  const { t } = useTranslation()
  return (
    <BaseConfirmDialog
      {...props}
      variant={destructive ? "destructive" : "default"}
      confirmLabel={confirmLabel ?? t("common.delete")}
    />
  )
}
