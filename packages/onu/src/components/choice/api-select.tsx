"use client"

import * as React from "react"
import { useInfiniteQuery, useQueries, type QueryClient } from "@tanstack/react-query"

import { useTranslation } from "../../providers/onu-provider"
import { useFormFieldControl } from "../form/form-field"
import { ComboboxCore, type ComboboxPresentationProps } from "./_combobox"
import { useQuickCreate, type QuickCreateProps } from "./_create"
import { useDebouncedValue, useOnChange, useParentField, type ParentFieldProps } from "./_hooks"
import { useChoiceSelection, useOpenState, type SelectionProps } from "./_selection"
import {
  apiOptionsQueryKey,
  fetchApiOptions,
  parseApiItem,
  requestJson,
  useOnuQueryClient,
  valueUrlFor,
  type ApiOptionsSource,
  type ApiParams,
} from "./api-options"
import { normalizeOptions, type ChoiceOption, type ChoiceOptionInput } from "./options"
import { SearchableSelect, type SearchableSelectOptions, type SearchableSelectProps } from "./searchable-select"
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
  ParentFieldProps &
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
    /** When this value changes, the value clears and options refetch. For a parent field, use `parentValue`. */
    dependsOn?: unknown
    /** With `parentValue`: the request param that carries the parent value. Default `parent_id`. */
    parentParam?: string
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
    parentValue: _parentValue,
    parentLabel: _parentLabel,
    parentParam = "parent_id",
    queryClient,
    selectAll,
    max,
    maxVisibleChips,
    onCreate,
    renderCreateDialog,
    onCreated,
    // presentation
    placeholder: placeholderProp,
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
  const { name, required, disabled: disabledProp, ...triggerProps } = control
  const { parent, waiting, placeholder } = useParentField(props, placeholderProp)
  const disabled = disabledProp || waiting
  const [open, setOpen] = useOpenState(openProp, defaultOpen, onOpenChange)
  const [query, setQuery] = React.useState("")
  const debounced = useDebouncedValue(query.trim(), debounce)
  const instanceKey = React.useId()

  // A dependent field sends the parent value with every request (and caches per parent).
  const withParent = (q: string): ApiParams => {
    const own = typeof params === "function" ? params(q) : params
    return parent === null ? (own ?? {}) : { ...own, [parentParam]: parent }
  }
  const source: ApiOptionsSource<TItem> = {
    url,
    fetcher,
    method,
    headers,
    credentials,
    params: withParent,
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
  const resolvedParams = withParent(debounced)
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
  useOnChange([dependsOn, parent], () => {
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

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never

export type DependentSelectProps = DistributiveOmit<ApiSelectProps, "dependsOn" | "url" | "fetcher" | "parentValue"> & {
  /** The value of the field this one depends on (e.g. the selected atoll). */
  parentValue: string | number | null | undefined
  /** Options per parent value (a map), a function of it, or a list. */
  options?: SearchableSelectOptions
  /** Load options for a parent value (cached per parent and search, like ApiSelect). */
  loadOptions?: (parentValue: string, context: { query: string; page: number; signal: AbortSignal }) => Promise<unknown>
  /** Load options from an API; the parent value is sent as `parentParam`. */
  url?: string
}

/**
 * A select whose options depend on another field (atoll → island): a
 * `SearchableSelect` with `parentValue`, or an `ApiSelect` with `parentValue`
 * when options come from `loadOptions` or a `url`.
 */
export function DependentSelect({ options, loadOptions, ...props }: DependentSelectProps) {
  if (props.url || loadOptions) {
    const fetcher = loadOptions
      ? (query: string, ctx: { page: number; signal: AbortSignal }) =>
          loadOptions(String(props.parentValue ?? ""), { query, page: ctx.page, signal: ctx.signal })
      : undefined
    return <ApiSelect {...(props as ApiSelectProps)} fetcher={fetcher} />
  }
  return <SearchableSelect {...(props as unknown as SearchableSelectProps)} options={options ?? []} />
}
