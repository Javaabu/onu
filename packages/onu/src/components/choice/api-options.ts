"use client"

import * as React from "react"
import { QueryClient, QueryClientContext } from "@tanstack/react-query"

import type { ChoiceOption } from "./options"

/*
 * The data layer behind ApiSelect (R16.5). Dependent select and Autocomplete
 * reuse it: build requests, map any response shape to options, and share a
 * TanStack Query cache.
 */

export type ApiParamValue = string | number | boolean | null | undefined | ReadonlyArray<string | number>
export type ApiParams = Record<string, ApiParamValue>

export interface ApiFetchContext {
  page: number
  signal: AbortSignal
  /** Extra params (static or from `params(query)`), already resolved. */
  params: ApiParams
}

export interface ApiOptionsMapping<TItem = unknown> {
  /**
   * Dot path to the items array, e.g. `data` or `results.items`. By default
   * Laravel resources and paginators (`data`), `items`, `results` and plain
   * arrays are detected.
   */
  itemsPath?: string
  /** Item key for the value. Default: `id`, then `value`, `key`. Dot paths work. */
  valueKey?: string
  /** Item key for the label. Default: `name`, then `label`, `title`, `text`. */
  labelKey?: string
  /** Item key for a secondary line. */
  descriptionKey?: string
  /** Full control over mapping an item to an option. */
  mapOption?: (item: TItem) => ChoiceOption
}

export interface ApiOptionsSource<TItem = unknown> extends ApiOptionsMapping<TItem> {
  /** Any endpoint, same-origin or cross-origin. */
  url?: string
  /** A custom loader instead of `url`. Return the raw response; it is mapped like a `url` response. */
  fetcher?: (query: string, context: ApiFetchContext) => Promise<unknown>
  method?: "GET" | "POST"
  headers?: HeadersInit
  credentials?: RequestCredentials
  /** Extra request params, static or computed from the search text. */
  params?: ApiParams | ((query: string) => ApiParams)
  /** Name of the search param. Default `search`. */
  searchParam?: string
  /** Name of the page param. Default `page`. */
  pageParam?: string
  /** Name of the per-page param. Default `per_page`. */
  perPageParam?: string
  /** Page size to request. Omitted from the request when not set. */
  perPage?: number
}

export interface ApiOptionsPage {
  options: ChoiceOption[]
  hasMore: boolean
}

export class ApiOptionsError extends Error {
  status: number
  constructor(status: number, statusText: string) {
    super(`Request failed: ${status} ${statusText}`)
    this.name = "ApiOptionsError"
    this.status = status
  }
}

type AnyRecord = Record<string, unknown>

function isRecord(value: unknown): value is AnyRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

/** Reads `a.b.0.c` from an object. */
export function getPath(value: unknown, path: string): unknown {
  let current = value
  for (const part of path.split(".")) {
    if (current === null || current === undefined) return undefined
    current = (current as AnyRecord)[part]
  }
  return current
}

function firstDefined(item: unknown, keys: string[]): unknown {
  for (const key of keys) {
    const v = getPath(item, key)
    if (v !== undefined && v !== null) return v
  }
  return undefined
}

/** Maps one API item to an option, using the keys or `mapOption`. */
export function mapApiItem<TItem>(item: TItem, mapping: ApiOptionsMapping<TItem> = {}): ChoiceOption {
  if (mapping.mapOption) return mapping.mapOption(item)
  if (!isRecord(item)) return { value: String(item), label: String(item) }
  const value = firstDefined(item, mapping.valueKey ? [mapping.valueKey] : ["id", "value", "key"])
  const label = firstDefined(item, mapping.labelKey ? [mapping.labelKey] : ["name", "label", "title", "text"])
  const description = mapping.descriptionKey ? getPath(item, mapping.descriptionKey) : undefined
  return {
    value: String(value ?? label ?? ""),
    label: String(label ?? value ?? ""),
    ...(description !== undefined && description !== null ? { description: String(description) } : {}),
    data: item,
  }
}

function findItems(json: unknown, itemsPath?: string): unknown[] {
  if (itemsPath) {
    const items = getPath(json, itemsPath)
    return Array.isArray(items) ? items : []
  }
  if (Array.isArray(json)) return json
  if (!isRecord(json)) return []
  for (const key of ["data", "items", "results"]) {
    const v = json[key]
    if (Array.isArray(v)) return v
    // A paginator wrapped in a resource: { data: { data: [...], current_page } }
    if (isRecord(v) && Array.isArray(v.data)) return v.data
  }
  return []
}

/** Detects whether there is a next page in Laravel paginator / resource responses. */
export function detectHasMore(json: unknown): boolean {
  if (!isRecord(json)) return false
  const sources = [json, json.meta, isRecord(json.data) ? json.data : undefined].filter(isRecord)
  for (const s of sources) {
    const current = Number(s.current_page)
    const last = Number(s.last_page)
    if (Number.isFinite(current) && Number.isFinite(last) && s.last_page !== undefined) return current < last
    if (typeof s.next_page_url === "string" && s.next_page_url) return true
    if ("next_page_url" in s) return false
    if (typeof s.next_cursor === "string" && s.next_cursor) return true
  }
  const links = json.links
  if (isRecord(links) && "next" in links) return !!links.next
  return false
}

/** Maps a whole response to a page of options. */
export function parseApiResponse<TItem>(json: unknown, mapping: ApiOptionsMapping<TItem> = {}): ApiOptionsPage {
  const items = findItems(json, mapping.itemsPath) as TItem[]
  return { options: items.map((item) => mapApiItem(item, mapping)), hasMore: detectHasMore(json) }
}

/** Appends params to a URL, keeping any query string it already has. Arrays become `key[]`. */
export function buildUrl(url: string, params: ApiParams): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined || value === "") continue
    if (Array.isArray(value)) for (const v of value) search.append(`${key}[]`, String(v))
    else search.append(key, String(value))
  }
  const qs = search.toString()
  if (!qs) return url
  const [base, hash] = url.split("#") as [string, string | undefined]
  return `${base}${base.includes("?") ? "&" : "?"}${qs}${hash !== undefined ? `#${hash}` : ""}`
}

function resolveParams(params: ApiOptionsSource["params"], query: string): ApiParams {
  return typeof params === "function" ? params(query) : (params ?? {})
}

/** Sends one request with `fetch` (no HTTP client dependency, R16.5). */
export async function requestJson(
  url: string,
  {
    method = "GET",
    headers,
    credentials,
    params = {},
    signal,
  }: {
    method?: "GET" | "POST"
    headers?: HeadersInit
    credentials?: RequestCredentials
    params?: ApiParams
    signal?: AbortSignal
  },
): Promise<unknown> {
  const h = new Headers(headers)
  if (!h.has("Accept")) h.set("Accept", "application/json")
  const init: RequestInit = { method, headers: h, credentials, signal }
  let target = url
  if (method === "POST") {
    if (!h.has("Content-Type")) h.set("Content-Type", "application/json")
    init.body = JSON.stringify(params)
  } else {
    target = buildUrl(url, params)
  }
  const res = await fetch(target, init)
  if (!res.ok) throw new ApiOptionsError(res.status, res.statusText)
  return res.json()
}

/** Loads one page of options for a search query from a `url` or `fetcher`. */
export async function fetchApiOptions<TItem>(
  source: ApiOptionsSource<TItem>,
  query: string,
  page: number,
  signal: AbortSignal,
): Promise<ApiOptionsPage> {
  const extra = resolveParams(source.params, query)
  let json: unknown
  if (source.fetcher) {
    json = await source.fetcher(query, { page, signal, params: extra })
  } else if (source.url) {
    const params: ApiParams = { ...extra, [source.searchParam ?? "search"]: query || undefined }
    params[source.pageParam ?? "page"] = page
    if (source.perPage) params[source.perPageParam ?? "per_page"] = source.perPage
    json = await requestJson(source.url, { ...source, params, signal })
  } else {
    throw new Error("ApiSelect needs a `url` or a `fetcher`")
  }
  return parseApiResponse(json, source)
}

/** Maps a single-item response (`{ data: {...} }` or the item itself) to an option. */
export function parseApiItem<TItem>(json: unknown, mapping: ApiOptionsMapping<TItem> = {}): ChoiceOption | undefined {
  if (json === null || json === undefined) return undefined
  if (isRecord(json) && "value" in json && "label" in json && !mapping.mapOption && !mapping.valueKey)
    return json as unknown as ChoiceOption
  const item = isRecord(json) && isRecord(json.data) && !mapping.mapOption ? json.data : json
  return mapApiItem(item as TItem, mapping)
}

/** Builds the URL that loads one value's label: `{value}` is replaced, or `/value` appended. */
export function valueUrlFor(valueUrl: string | ((value: string) => string), value: string) {
  if (typeof valueUrl === "function") return valueUrl(value)
  const encoded = encodeURIComponent(value)
  return valueUrl.includes("{value}")
    ? valueUrl.replace("{value}", encoded)
    : `${valueUrl.replace(/\/$/, "")}/${encoded}`
}

/** Query key prefix for API option lists; pass a URL to target one endpoint. */
export function apiOptionsQueryKey(url?: string) {
  return url ? (["onu-api-options", url] as const) : (["onu-api-options"] as const)
}

let fallbackClient: QueryClient | undefined

/**
 * Onu's own QueryClient, used when the app has no `QueryClientProvider`, so API
 * selects work out of the box. Apps with a provider share their client instead.
 */
export function getOnuQueryClient() {
  fallbackClient ??= new QueryClient({ defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } } })
  return fallbackClient
}

/** The app's QueryClient if there is a provider, else Onu's fallback client. */
export function useOnuQueryClient(explicit?: QueryClient) {
  const context = React.useContext(QueryClientContext)
  return explicit ?? context ?? getOnuQueryClient()
}

/**
 * Clears cached API options (e.g. after creating a record elsewhere) so open
 * selects refetch. Pass a URL to limit it to one endpoint.
 */
export function invalidateApiOptions(url?: string, client: QueryClient = getOnuQueryClient()) {
  return client.invalidateQueries({ queryKey: apiOptionsQueryKey(url) })
}
