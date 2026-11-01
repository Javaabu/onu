"use client"

import * as React from "react"

import { useTranslation } from "../../providers/onu-provider"
import { registerEnglish } from "../../i18n/english"
import { choice as en_choice } from "../../locales/en/choice"

registerEnglish({ choice: en_choice })

/**
 * Calls `callback` whenever `dep` changes after the first render (compared by
 * JSON so inline objects work). Used to clear a child when its parent changes.
 */
export function useOnChange(dep: unknown, callback: () => void) {
  const key = JSON.stringify(dep ?? null)
  const previous = React.useRef(key)
  const cb = React.useRef(callback)
  React.useEffect(() => {
    cb.current = callback
  })
  React.useEffect(() => {
    if (previous.current === key) return
    previous.current = key
    cb.current()
  }, [key])
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
 * the field with `useOnChange(parent, …)`.
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
