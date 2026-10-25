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
