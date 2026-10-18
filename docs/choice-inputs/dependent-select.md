# Dependent select

A select whose options depend on another field (atoll → island). It is disabled until the parent has a value and **clears itself whenever the parent changes**. Options come from a map, a function, `loadOptions` or an API `url` (the same data layer as [API select](./api-select.md)).

```tsx
import { DependentSelect, Select } from '@javaabu/onu';

<Select options={atolls} value={atoll} onValueChange={setAtoll} />

// Static map
<DependentSelect parentValue={atoll} parentLabel="an atoll" options={{ K: kaafuIslands, S: seenuIslands }} />

// Loaded and cached per parent
<DependentSelect parentValue={atoll} loadOptions={(atoll, { query, signal }) => api.islands(atoll, query, signal)} />

// From an API: GET /api/islands?atoll_id=K&search=…
<DependentSelect parentValue={atoll} url="/api/islands" parentParam="atoll_id" />
```

## Props

All [Searchable select](./searchable-select.md) and [API select](./api-select.md) props, plus:

| Prop          | Type                                                           | Default       | Description                                         |
| ------------- | -------------------------------------------------------------- | ------------- | --------------------------------------------------- |
| `parentValue` | `string \| number \| null`                                     |               | The value this field depends on                     |
| `parentLabel` | `string`                                                       |               | Shown as "Select {parentLabel} first" while waiting |
| `options`     | `Record<string, ChoiceOption[]> \| (parent) => ChoiceOption[]` |               | Local options per parent                            |
| `loadOptions` | `(parent, { query, page, signal }) => Promise<response>`       |               | Async options (cached per parent and search)        |
| `url`         | `string`                                                       |               | API endpoint                                        |
| `parentParam` | `string`                                                       | `"parent_id"` | Request param carrying the parent value             |

When the parent changes, `onValueChange(null)` (or `[]` for multiple) is called.

## Accessibility

Same as Searchable select. While disabled the placeholder explains which field to fill first.
