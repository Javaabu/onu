# API select

A searchable select that loads its options from **any API** (REQUIREMENTS R16.5). Laravel resources and paginators work with no configuration. Results are cached with TanStack Query; no `QueryClientProvider` is needed (Onu falls back to its own client, and uses yours when there is one).

```tsx
import { ApiSelect } from '@javaabu/onu';

// GET /api/islands?search=mal&page=1  →  { data: [{ id, name }], meta: { current_page, last_page } }
<ApiSelect url="/api/islands" />

// Edit page: show the current value's label without opening the list
<ApiSelect url="/api/islands" defaultValue="12" valueUrl="/api/islands/{value}" />
<ApiSelect url="/api/islands" defaultValue="12" initialOptions={[{ value: '12', label: 'Malé' }]} />

// Any response shape
<ApiSelect url="https://api.example.mv/atolls" itemsPath="results.items" valueKey="code" labelKey="title.en" />
<ApiSelect url="/api/people" mapOption={(p) => ({ value: p.uuid, label: `${p.first} ${p.last}` })} />

// Your own loader
<ApiSelect fetcher={(query, { page, signal }) => client.get('/people', { query, page, signal })} cacheKey="people" />

// Dependent field: disabled until an atoll is picked, sends ?parent_id=K, clears when the atoll changes
<ApiSelect url="/api/islands" parentValue={atoll} parentLabel="an atoll" />

// Refetch and clear when anything else changes
<ApiSelect url="/api/islands" params={{ type: kind }} dependsOn={kind} />
```

## How it behaves

- **Searching** is debounced (300ms) and can require `minChars`. Each search is its own request; when the user keeps typing, older requests are cancelled with `AbortController`, and because every search has its own cache entry a slow early response can never replace newer results.
- **Paging**: when the response says there is a next page (`meta.last_page`, `last_page`, `next_page_url`, `links.next`, `next_cursor`), the next page loads as the list scrolls to the end.
- **Preloading**: options load when the list opens, or immediately with `preload`.
- **States**: loading, empty ("No results for …"), and an error with a **Retry** button. All are announced in a polite live region.
- **Caching**: per endpoint + params + query, for `staleTime` (5 minutes). After creating a record elsewhere, call `invalidateApiOptions(url)` (or `queryClient.invalidateQueries({ queryKey: apiOptionsQueryKey(url) })` with your own client). Quick-create (`onCreate`) invalidates automatically.
- **No requests without a URL or fetcher** you supply; CSRF and auth headers are yours to add (`headers`, `credentials`).

## Props

All [Searchable select](./searchable-select.md) props (including `multiple`, `thaana`, `clearable`, `selectAll`, `max`, [quick-create](./searchable-select.md#creating-options) and [dependent-field](./searchable-select.md#dependent-fields) props), plus:

| Prop                                         | Type                                                    | Default                                  | Description                                                 |
| -------------------------------------------- | ------------------------------------------------------- | ---------------------------------------- | ----------------------------------------------------------- |
| `url`                                        | `string`                                                |                                          | Endpoint (same- or cross-origin)                            |
| `fetcher`                                    | `(query, { page, signal, params }) => Promise<unknown>` |                                          | Custom loader; its response is mapped like a `url` response |
| `method`                                     | `"GET" \| "POST"`                                       | `"GET"`                                  | POST sends params as JSON                                   |
| `headers`, `credentials`                     | `HeadersInit`, `RequestCredentials`                     |                                          | Request options                                             |
| `params`                                     | `object \| (query) => object`                           |                                          | Extra params; arrays become `key[]`                         |
| `searchParam` / `pageParam` / `perPageParam` | `string`                                                | `search` / `page` / `per_page`           | Param names                                                 |
| `perPage`                                    | `number`                                                |                                          | Page size to request                                        |
| `itemsPath`                                  | `string`                                                | auto (`data`, `items`, `results`, array) | Dot path to the items                                       |
| `valueKey` / `labelKey` / `descriptionKey`   | `string`                                                | `id` / `name` (with fallbacks)           | Item keys (dot paths work)                                  |
| `mapOption`                                  | `(item) => ChoiceOption`                                |                                          | Full control over mapping                                   |
| `debounce`                                   | `number`                                                | `300`                                    | ms                                                          |
| `minChars`                                   | `number`                                                | `0`                                      | Minimum search length                                       |
| `preload`                                    | `boolean`                                               | `false`                                  | Load before opening                                         |
| `initialOptions`                             | `ChoiceOption[]`                                        |                                          | Known options (e.g. the current value)                      |
| `valueUrl`                                   | `string \| (value) => string`                           |                                          | Loads one item to label a value; `{value}` is replaced      |
| `fetchById`                                  | `(value, { signal }) => Promise<unknown>`               |                                          | Alternative to `valueUrl`                                   |
| `staleTime` / `gcTime`                       | `number`                                                | 5 / 10 minutes                           | Cache lifetime                                              |
| `cacheKey`                                   | `string`                                                | `url`                                    | Cache key for `fetcher`s                                    |
| `dependsOn`                                  | `unknown`                                               |                                          | When it changes the value clears                            |
| `parentParam`                                | `string`                                                | `"parent_id"`                            | With `parentValue`: param that carries the parent value     |
| `queryClient`                                | `QueryClient`                                           | app or Onu client                        |                                                             |

Values are strings (`id: 12` becomes `"12"`), so they round-trip through forms unchanged.

## Data layer

The helpers behind it are exported for Autocomplete and your own components: `fetchApiOptions`, `parseApiResponse`, `parseApiItem`, `mapApiItem`, `detectHasMore`, `buildUrl`, `requestJson`, `useOnuQueryClient`, `getOnuQueryClient`, `invalidateApiOptions`, `apiOptionsQueryKey`.

## Accessibility

As [Searchable select](./searchable-select.md). Loading, result counts, "No results", errors and quick-create results are announced politely; Retry is a real button.
