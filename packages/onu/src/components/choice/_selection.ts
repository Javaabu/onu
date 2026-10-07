"use client"

import * as React from "react"

import type { ChoiceOption } from "./options"

export interface SingleSelectionProps {
  /** Allow several values. */
  multiple?: false
  /** Controlled value; `null` for none. */
  value?: string | null
  defaultValue?: string | null
  onValueChange?: (value: string | null, option: ChoiceOption | null) => void
}

export interface MultipleSelectionProps {
  multiple: true
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[], options: ChoiceOption[]) => void
}

/** Single (`string | null`) or multiple (`string[]`) selection, controlled or not. */
export type SelectionProps = SingleSelectionProps | MultipleSelectionProps

/** Placeholder options made for values whose label is unknown; never cached. */
const FALLBACKS = new WeakSet<ChoiceOption>()

function toArray(value: string | string[] | null | undefined): string[] {
  if (value === null || value === undefined || value === "") return []
  return Array.isArray(value) ? value : [value]
}

/**
 * Value handling shared by the combobox-style selects. Remembers the options a
 * user picked so their labels survive when the list changes (search, paging).
 */
export function useChoiceSelection(
  props: SelectionProps,
  known: ChoiceOption[],
  resolve?: (value: string) => ChoiceOption | undefined,
) {
  const multiple = props.multiple === true
  const controlled = props.value !== undefined
  const [inner, setInner] = React.useState<string[]>(() => toArray(props.defaultValue))
  const [picked, setPicked] = React.useState<Map<string, ChoiceOption>>(() => new Map())
  const values = controlled ? toArray(props.value) : inner

  const knownMap = React.useMemo(() => new Map(known.map((o) => [o.value, o])), [known])
  const lookup = React.useCallback(
    (value: string): ChoiceOption => {
      const found = knownMap.get(value) ?? picked.get(value) ?? resolve?.(value)
      if (found) return found
      const fallback = { value, label: value }
      FALLBACKS.add(fallback)
      return fallback
    },
    [knownMap, picked, resolve],
  )
  const selected = React.useMemo(() => values.map(lookup), [values, lookup])
  const isKnown = (value: string) => knownMap.has(value) || picked.has(value)

  const emit = (next: ChoiceOption[]) => {
    const real = next.filter((o) => !FALLBACKS.has(o))
    if (real.length) {
      setPicked((prev) => {
        const map = new Map(prev)
        for (const o of real) map.set(o.value, o)
        return map
      })
    }
    const nextValues = next.map((o) => o.value)
    if (!controlled) setInner(nextValues)
    if (props.multiple === true) props.onValueChange?.(nextValues, next)
    else props.onValueChange?.(nextValues[0] ?? null, next[0] ?? null)
  }

  const toggle = (option: ChoiceOption) => {
    const has = values.includes(option.value)
    if (!multiple) return emit([option])
    emit(has ? selected.filter((o) => o.value !== option.value) : [...selected, option])
  }

  const setMany = (options: ChoiceOption[], select: boolean) => {
    const values = new Set(options.map((o) => o.value))
    const rest = selected.filter((o) => !values.has(o.value))
    emit(select ? [...rest, ...options] : rest)
  }

  const clear = () => emit([])

  const select = (option: ChoiceOption) =>
    emit(multiple ? [...selected.filter((s) => s.value !== option.value), option] : [option])

  return { multiple, values, selected, toggle, setMany, clear, select, isKnown }
}

/** Open state that may be controlled. */
export function useOpenState(open?: boolean, defaultOpen = false, onOpenChange?: (open: boolean) => void) {
  const [inner, setInner] = React.useState(defaultOpen)
  const current = open ?? inner
  const set = React.useCallback(
    (next: boolean) => {
      if (open === undefined) setInner(next)
      onOpenChange?.(next)
    },
    [open, onOpenChange],
  )
  return [current, set] as const
}
