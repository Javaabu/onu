"use client"

import * as React from "react"
import { useInfiniteQuery, useQueries, type QueryClient } from "@tanstack/react-query"

import { useTranslation } from "../../providers/onu-provider"
import { useFormFieldControl } from "../form/form-field"
import { ComboboxCore, type ComboboxPresentationProps } from "./_combobox"
import { useQuickCreate, type QuickCreateProps } from "./_create"
import { useDebouncedValue, useOnChange } from "./_hooks"
import { useChoiceSelection, useOpenState, type SelectionProps } from "./_selection"
import {
  apiOptionsQueryKey,
  fetchApiOptions,
  parseApiItem,
  requestJson,
  useOnuQueryClient,
  valueUrlFor,
  type ApiOptionsSource,
} from "./api-options"
import { normalizeOptions, type ChoiceOption, type ChoiceOptionInput } from "./options"
import { registerEnglish } from "../../i18n/english"
import { choice as en_choice } from "../../locales/en/choice"
import { common as en_common } from "../../locales/en/common"

registerEnglish({ choice: en_choice, common: en_common })

type TriggerProps = Omit<
  React.ComponentProps<"button">,
  "value" | "defaultValue" | "onChange" | "children" | "name" | "disabled" | "className" | "ref"
>

export type ApiSelectProps<TItem = unknown> = SelectionProps &
  ComboboxPresentationProps &
  TriggerProps &
  QuickCreateProps &
  ApiOptionsSource<TItem> & {
    ref?: React.Ref<HTMLButtonElement>
    required?: boolean
    /** Wait this long after typing before searching. Default `300` ms. */
    debounce?: number
    /** Minimum search length before a request is sent. Default `0`. */
    minChars?: number
    /** Load the first page immediately instead of on open. */
    preload?: boolean
    /** Options known up front, e.g. the current value's label on an edit page. */
    initialOptions?: ReadonlyArray<ChoiceOptionInput>
    /** Endpoint that returns one item, to label a value not in the list: `/api/islands/{value}`. */
    valueUrl?: string | ((value: string) => string)
    /** Loads one item (or option) by value, instead of `valueUrl`. */
    fetchById?: (value: string, context: { signal: AbortSignal }) => Promise<unknown>
    /** How long results stay fresh in the cache. Default 5 minutes. */
    staleTime?: number
    /** How long unused results stay in the cache. Default 10 minutes. */
    gcTime?: number
    /** Cache key when using a `fetcher` (defaults to the `url`, or one per instance). */
    cacheKey?: string
    /** When this value changes (e.g. a parent field), the value clears and options refetch. */
    dependsOn?: unknown
    /** Use this QueryClient instead of the app's (or Onu's fallback) client. */
    queryClient?: QueryClient
    selectAll?: boolean
    max?: number
    maxVisibleChips?: number
  }

const MINUTE = 60_000

/**
 * A searchable select that loads its options from any API (R16.5): debounced
 * search with stale-request cancellation, infinite scroll, Laravel paginators
 * out of the box, cached with TanStack Query (no provider needed).
 */
export function ApiSelect<TItem = unknown>(props: ApiSelectProps<TItem>) {
  const {
    multiple,
    value,
    defaultValue,
    onValueChange,
    // source
    url,
    fetcher,
    method,
    headers,
    credentials,
    params,
    searchParam,
    pageParam,
    perPageParam,
    perPage,
    itemsPath,
    valueKey,
    labelKey,
    descriptionKey,
    mapOption,
    // behaviour
    debounce = 300,
    minChars = 0,
    preload = false,
    initialOptions,
    valueUrl,
    fetchById,
    staleTime = 5 * MINUTE,
    gcTime = 10 * MINUTE,
    cacheKey,
    dependsOn,
    queryClient,
    selectAll,
    max,
    maxVisibleChips,
    onCreate,
    renderCreateDialog,
    onCreated,
    // presentation
    placeholder,
    searchPlaceholder,
    thaana,
    clearable,
    size,
    emptyText,
    renderOption,
    renderValue,
    sheet,
    open: openProp,
    defaultOpen,
    onOpenChange,
    className,
    classNames,
    ref,
    ...rest
  } = props
  const { t } = useTranslation()
  const client = useOnuQueryClient(queryClient)
  const control = useFormFieldControl(rest as Record<string, unknown>) as TriggerProps & {
    name?: string
    required?: boolean
    disabled?: boolean
  }
  const { name, required, disabled, ...triggerProps } = control
  const [open, setOpen] = useOpenState(openProp, defaultOpen, onOpenChange)
  const [query, setQuery] = React.useState("")
  const debounced = useDebouncedValue(query.trim(), debounce)
  const instanceKey = React.useId()

  const source: ApiOptionsSource<TItem> = {
    url,
    fetcher,
    method,
    headers,
    credentials,
    params,
    searchParam,
    pageParam,
    perPageParam,
    perPage,
    itemsPath,
    valueKey,
    labelKey,
    descriptionKey,
    mapOption,
  }
  const resolvedParams = typeof params === "function" ? params(debounced) : params
  const endpoint = cacheKey ?? url ?? instanceKey
  const tooShort = debounced.length > 0 ? debounced.length < minChars : minChars > 0 && !preload
  const enabled = (open || preload) && !disabled && !tooShort

  const listKey = [...apiOptionsQueryKey(endpoint), { params: resolvedParams ?? null, query: debounced, perPage }]
  const list = useInfiniteQuery(
    {
      queryKey: listKey,
      queryFn: ({ pageParam: page, signal }) => fetchApiOptions(source, debounced, page, signal),
      initialPageParam: 1,
      getNextPageParam: (last, _all, lastPage) => (last.hasMore ? lastPage + 1 : undefined),
      enabled,
      staleTime,
      gcTime,
      retry: false,
    },
    client,
  )

  // Cancel requests for searches the user has moved on from (R16.5). Each search
  // has its own cache entry, so a late response can never replace newer results.
  const keyHash = JSON.stringify(listKey)
  const previousKey = React.useRef<unknown[] | null>(null)
  React.useEffect(() => {
    const prev = previousKey.current
    if (prev && JSON.stringify(prev) !== keyHash) void client.cancelQueries({ queryKey: prev, exact: true })
    previousKey.current = JSON.parse(keyHash) as unknown[]
  }, [keyHash, client])

  const initial = React.useMemo(() => normalizeOptions(initialOptions), [initialOptions])
  const loaded = React.useMemo(() => {
    const seen = new Set<string>()
    const out: ChoiceOption[] = []
    for (const page of list.data?.pages ?? [])
      for (const o of page.options) {
        if (seen.has(o.value)) continue
        seen.add(o.value)
        out.push(o)
      }
    return out
  }, [list.data])
  const known = React.useMemo(() => [...initial, ...loaded], [initial, loaded])

  const selection = useChoiceSelection({ multiple, value, defaultValue, onValueChange } as SelectionProps, known)

  // Label values that are not in any loaded list (edit pages).
  const missing = valueUrl || fetchById ? selection.values.filter((v) => !selection.isKnown(v)) : []
  const labels = useQueries(
    {
      queries: missing.map((v) => ({
        queryKey: [...apiOptionsQueryKey(endpoint), "value", v],
        queryFn: async ({ signal }: { signal: AbortSignal }) => {
          const json = fetchById
            ? await fetchById(v, { signal })
            : await requestJson(valueUrlFor(valueUrl!, v), { headers, credentials, signal })
          return parseApiItem(json, source) ?? null
        },
        staleTime,
        gcTime,
        retry: false,
      })),
    },
    client,
  )
  const fetched = new Map<string, ChoiceOption | "loading">()
  missing.forEach((v, i) => {
    const q = labels[i]
    if (q?.data) fetched.set(v, q.data)
    else if (q?.isPending) fetched.set(v, "loading")
  })
  const selected = selection.selected.map((o) => {
    const f = fetched.get(o.value)
    if (f === "loading") return { ...o, label: t("common.loading") }
    return f ?? o
  })

  const create = useQuickCreate({
    config: {
      onCreate,
      renderCreateDialog,
      onCreated: (option) => {
        void client.invalidateQueries({ queryKey: apiOptionsQueryKey(endpoint) })
        onCreated?.(option)
      },
    },
    query,
    options: loaded,
    select: (o) => {
      selection.select(o)
      setQuery("")
    },
    close: () => setOpen(false),
    multiple: selection.multiple,
  })

  // A new parent value: clear the child (R16.5 dependent use).
  useOnChange(dependsOn, () => {
    if (selection.values.length) selection.clear()
    setQuery("")
  })

  const nextPageError = list.isFetchNextPageError
  const options = tooShort ? [] : [...loaded, ...create.created.filter((c) => !loaded.some((o) => o.value === c.value))]

  return (
    <>
      <ComboboxCore
        ref={ref}
        dataSlot="api-select"
        multiple={selection.multiple}
        selected={selected}
        options={options}
        onToggle={selection.toggle}
        onClear={selection.clear}
        onSelectAll={(opts, select) =>
          selection.setMany(
            select && max !== undefined ? opts.slice(0, Math.max(0, max - selection.values.length)) : opts,
            select,
          )
        }
        query={query}
        onQueryChange={setQuery}
        open={open}
        setOpen={setOpen}
        loading={!tooShort && list.isLoading}
        loadingMore={list.isFetchingNextPage}
        error={!tooShort && list.isError}
        onRetry={() => void (nextPageError ? list.fetchNextPage() : list.refetch())}
        hint={tooShort && minChars > 0 ? t("choice.typeMore", { count: minChars }) : undefined}
        onReachEnd={
          list.hasNextPage && !list.isFetchingNextPage && !nextPageError ? () => void list.fetchNextPage() : undefined
        }
        create={create.createItem}
        announcement={create.announcement}
        selectAll={selectAll}
        max={max}
        maxVisibleChips={maxVisibleChips}
        triggerProps={triggerProps}
        required={required}
        disabled={disabled}
        name={name}
        placeholder={placeholder}
        searchPlaceholder={searchPlaceholder}
        thaana={thaana}
        clearable={clearable}
        size={size}
        emptyText={emptyText}
        renderOption={renderOption}
        renderValue={renderValue}
        sheet={sheet}
        className={className}
        classNames={classNames}
      />
      {create.dialog}
    </>
  )
}
