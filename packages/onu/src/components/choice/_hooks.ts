"use client"

import * as React from "react"

import { useTranslation } from "../../providers/onu-provider"
import { registerEnglish } from "../../i18n/english"
import { choice as en_choice } from "../../locales/en/choice"

registerEnglish({ choice: en_choice })

/**
 * Controlled/uncontrolled state. `value === undefined` means uncontrolled;
 * `null` is a controlled empty value.
 */
export function useControllableState<T, A extends unknown[] = []>(
  value: T | undefined,
  defaultValue: T,
  onChange?: (value: T, ...args: A) => void,
) {
  const [inner, setInner] = React.useState<T>(defaultValue)
  const controlled = value !== undefined
  const current = controlled ? value : inner
  const set = React.useCallback(
    (next: T, ...args: A) => {
      if (!controlled) setInner(next)
      onChange?.(next, ...args)
    },
    [controlled, onChange],
  )
  return [current, set] as const
}

/** `value`, updated only after it stops changing for `delay` ms. */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = React.useState(value)
  React.useEffect(() => {
    if (delay <= 0) {
      const id = setTimeout(() => setDebounced(value), 0)
      return () => clearTimeout(id)
    }
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return delay <= 0 ? value : debounced
}

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
