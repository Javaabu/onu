"use client"

import * as React from "react"

import { useTranslation } from "../../providers/onu-provider"
import { registerEnglish } from "../../i18n/english"
import { choice as en_choice } from "../../locales/en/choice"

registerEnglish({ choice: en_choice })

/**
 * Calls `reset` when `parent` changes after the first render (compared by JSON
 * so inline objects work), to clear a dependent field (R16.5).
 *
 * `stale` says whether the field's value was settled under the old parent and
 * should be cleared: the field was usable then (not `waiting`), and its value
 * didn't change in the same render. When parent and value arrive together (a
 * react-hook-form `reset(data)`, a fetch on an edit page) or the value was set
 * while the field waited for its parent, the value is kept.
 */
export function useParentChange(parent: unknown, value: unknown, waiting: boolean, reset: (stale: boolean) => void) {
  const parentKey = JSON.stringify(parent ?? null)
  const valueKey = JSON.stringify(value ?? null)
  const previous = React.useRef({ parentKey, valueKey, waiting })
  const cb = React.useRef(reset)
  React.useEffect(() => {
    cb.current = reset
  })
  React.useEffect(() => {
    const before = previous.current
    previous.current = { parentKey, valueKey, waiting }
    if (before.parentKey === parentKey) return
    cb.current(!before.waiting && before.valueKey === valueKey)
  }, [parentKey, valueKey, waiting])
}

export interface ParentFieldProps {
  /**
   * The value of the field this one depends on (atoll → island). The field is
   * disabled until the parent has a value, and clears whenever it changes.
   */
  parentValue?: string | number | null
  /** Name of the parent field, for the "Select {parent} first" placeholder. */
  parentLabel?: string
}

const isEmptyValue = (value: unknown) =>
  value === null || value === undefined || value === "" || (Array.isArray(value) && value.length === 0)

/**
 * The parent of a dependent field (R16.5). A field is dependent when the
 * `parentValue` prop is passed at all, even as `undefined`. `parent` is its
 * value as a string, or `null` while the parent is empty (`waiting`). Clear
 * the field with `useParentChange(parent, …)`.
 */
export function useParentField(props: ParentFieldProps, placeholder: string | undefined) {
  const { t } = useTranslation()
  const dependent = "parentValue" in props
  const parent = dependent && !isEmptyValue(props.parentValue) ? String(props.parentValue) : null
  const waiting = dependent && parent === null
  return {
    parent,
    waiting,
    placeholder:
      waiting && props.parentLabel ? t("choice.selectParentFirst", { parent: props.parentLabel }) : placeholder,
  }
}
