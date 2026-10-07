---
title: FilterConditionBuilder
sidebar_position: 27
---

Advanced filters as conditions — "Status is Active **and** Island is one of Malé, Hulhumalé" — on [`react-querybuilder`](https://react-querybuilder.js.org), with Onu controls (native selects, inputs, buttons, checkbox), translations and an RTL-aware layout.

`react-querybuilder` is an optional peer dependency, so the builder has its own entry point:

```bash
pnpm add react-querybuilder
```

```tsx
import { FilterConditionBuilder, formatQuery, type ConditionGroup } from "@javaabu/onu/query-builder"

const [query, setQuery] = useState<ConditionGroup>({ combinator: "and", rules: [] })

<FilterConditionBuilder
  query={query}
  onQueryChange={setQuery}
  fields={[
    { name: "name", label: "Name" },
    { name: "status", label: "Status", valueEditorType: "select", values: [{ name: "active", label: "Active" }] },
    { name: "island", label: "Island", valueEditorType: "multiselect", values: islands },
    { name: "balance", label: "Balance", inputType: "number" },
  ]}
/>

formatQuery(query, "sql")      // or "parameterized", "mongodb", "jsonlogic", …
```

## Props

| Prop                                       | Type                            | Default | Description                 |
| ------------------------------------------ | ------------------------------- | ------- | --------------------------- |
| `fields`                                   | `ConditionField[]`              |         | react-querybuilder `Field`s |
| `query` / `defaultQuery` / `onQueryChange` | `ConditionGroup`                |         |                             |
| `allowGroups`                              | `boolean`                       | `true`  | Nested groups               |
| `showNotToggle`                            | `boolean`                       | `false` | "Not" on groups             |
| `disabled`                                 | `boolean`                       |         |                             |
| `classNames`                               | `{ group, header, body, rule }` |         |                             |

Operator and combinator labels come from the `listing` locale namespace.

## Accessibility

Every select and input is labelled (Field, Operator, Value, Match); remove buttons are named "Remove condition" / "Remove group". Nested groups are indented with a start border, which mirrors in RTL. Number, date and other Latin-only inputs are forced `dir="ltr"`.
