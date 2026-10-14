"use client"

import * as React from "react"

import { useAnnouncer } from "../../a11y/use-announcer"
import { useTranslation } from "../../providers/onu-provider"
import { hasExactMatch, type ChoiceOption } from "./options"

export interface CreateDialogRenderProps {
  /** What the user typed. */
  query: string
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Call with the new option to add and select it. */
  onCreated: (option: ChoiceOption) => void
}

export interface QuickCreateProps {
  /**
   * Create an option inline from the search text ("Create “x”"). Return the new
   * option (or a promise of it); it is added to the list and selected.
   */
  onCreate?: (label: string) => ChoiceOption | null | undefined | void | Promise<ChoiceOption | null | undefined | void>
  /**
   * Create through your own dialog instead: render it here and call
   * `onCreated(option)` when the record is saved.
   */
  renderCreateDialog?: (props: CreateDialogRenderProps) => React.ReactNode
  /** Called after an option was created (e.g. to invalidate an API cache). */
  onCreated?: (option: ChoiceOption) => void
}

export function useQuickCreate({
  config,
  query,
  options,
  select,
  close,
  multiple,
}: {
  config: QuickCreateProps
  query: string
  options: ChoiceOption[]
  select: (option: ChoiceOption) => void
  close: () => void
  multiple: boolean
}) {
  const { t, locale } = useTranslation()
  const [pending, setPending] = React.useState(false)
  const [failed, setFailed] = React.useState<string | null>(null)
  const [dialogQuery, setDialogQuery] = React.useState<string | null>(null)
  const [created, setCreated] = React.useState<ChoiceOption[]>([])
  const { message: announcement, announce } = useAnnouncer()
  const enabled = !!(config.onCreate || config.renderCreateDialog)
  const q = query.trim()
  const all = React.useMemo(() => [...options, ...created], [options, created])
  const show = enabled && !!q && !hasExactMatch(all, q, locale.code)

  const finish = (option: ChoiceOption) => {
    setCreated((c) => [...c.filter((o) => o.value !== option.value), option])
    select(option)
    announce(t("choice.created", { label: option.label }))
    config.onCreated?.(option)
  }

  const start = async () => {
    if (config.renderCreateDialog) {
      close()
      setDialogQuery(q)
      return
    }
    setPending(true)
    setFailed(null)
    try {
      const option = await config.onCreate?.(q)
      if (option) {
        finish(option)
        if (!multiple) close()
      }
    } catch {
      setFailed(q)
      announce(t("choice.createError", { query: q }))
    } finally {
      setPending(false)
    }
  }

  const createItem = show
    ? {
        label:
          failed === q
            ? t("choice.createError", { query: q })
            : pending
              ? t("choice.creating", { query: q })
              : t("choice.create", { query: q }),
        pending,
        onCreate: () => void start(),
      }
    : null

  const dialog =
    config.renderCreateDialog && dialogQuery !== null
      ? config.renderCreateDialog({
          query: dialogQuery,
          open: true,
          onOpenChange: (open) => {
            if (!open) setDialogQuery(null)
          },
          onCreated: (option) => {
            finish(option)
            setDialogQuery(null)
          },
        })
      : null

  return { createItem, dialog, announcement, created }
}
