"use client"

import * as React from "react"

import { useTranslation } from "../../providers/onu-provider"
import { useOnChange } from "./_hooks"
import type { ChoiceOptionInput } from "./options"
import { ApiSelect, type ApiSelectProps } from "./api-select"
import { SearchableSelect, type SearchableSelectProps } from "./searchable-select"

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never

export type DependentSelectProps = DistributiveOmit<ApiSelectProps, "dependsOn" | "url" | "fetcher"> & {
  /** The value of the field this one depends on (e.g. the selected atoll). */
  parentValue: string | number | null | undefined
  /** Name of the parent field, for the "Select {parent} first" placeholder. */
  parentLabel?: string
  /** Options per parent value, or a function of it. */
  options?:
    | Readonly<Record<string, ReadonlyArray<ChoiceOptionInput>>>
    | ((parentValue: string) => ReadonlyArray<ChoiceOptionInput>)
  /** Load options for a parent value (cached per parent and search, like ApiSelect). */
  loadOptions?: (parentValue: string, context: { query: string; page: number; signal: AbortSignal }) => Promise<unknown>
  /** Load options from an API; the parent value is sent as `parentParam`. */
  url?: string
  /** Request param that carries the parent value. Default `parent_id`. */
  parentParam?: string
}

function isEmpty(value: unknown) {
  return value === null || value === undefined || value === "" || (Array.isArray(value) && value.length === 0)
}

/**
 * A select whose options depend on another field (atoll → island). It is
 * disabled until the parent has a value, and clears itself whenever the parent
 * changes. Options come from a map, a function, `loadOptions` or an API `url`.
 */
export function DependentSelect(props: DependentSelectProps) {
  const {
    parentValue,
    parentLabel,
    options,
    loadOptions,
    url,
    parentParam = "parent_id",
    params,
    placeholder,
    disabled,
    ...rest
  } = props
  const { t } = useTranslation()
  const multiple = props.multiple === true
  const parent = isEmpty(parentValue) ? null : String(parentValue)
  const [inner, setInner] = React.useState<unknown>(props.defaultValue ?? (multiple ? [] : null))
  const current = props.value !== undefined ? props.value : inner

  const onValueChange = (value: unknown, option: unknown) => {
    if (props.value === undefined) setInner(value)
    ;(props.onValueChange as ((v: unknown, o: unknown) => void) | undefined)?.(value, option)
  }

  // Clear the child when the parent changes (R16.5).
  useOnChange(parent, () => {
    if (!isEmpty(current)) onValueChange(multiple ? [] : null, multiple ? [] : null)
  })

  const waiting = parent === null
  const shared = {
    ...rest,
    value: current,
    onValueChange,
    disabled: disabled || waiting,
    placeholder: waiting && parentLabel ? t("choice.selectParentFirst", { parent: parentLabel }) : placeholder,
  }
  delete (shared as { defaultValue?: unknown }).defaultValue

  if (url || loadOptions) {
    const remote = {
      ...shared,
      url,
      params: (query: string) => ({
        ...(typeof params === "function" ? params(query) : params),
        [parentParam]: parent,
      }),
      fetcher: loadOptions
        ? (query: string, ctx: { page: number; signal: AbortSignal }) =>
            loadOptions(parent ?? "", { query, page: ctx.page, signal: ctx.signal })
        : undefined,
    } as ApiSelectProps
    return <ApiSelect {...remote} />
  }

  const list: ReadonlyArray<ChoiceOptionInput> =
    parent === null ? [] : typeof options === "function" ? options(parent) : (options?.[parent] ?? [])
  return <SearchableSelect {...(shared as unknown as SearchableSelectProps)} options={list} />
}
