---
"@javaabu/onu": minor
---

The `@javaabu/onu/query-builder` entry is removed, with `FilterConditionBuilder`, its types, the re-exported `formatQuery` and the `listing.*` condition-builder strings. `react-querybuilder` is no longer an optional peer dependency; uninstall it unless the app uses it directly. `FilterPanel` with `ApiSelect` and the date pickers is the Javaabu filtering pattern:

```tsx
<FilterPanel
  filters={[
    {
      type: "custom",
      key: "island",
      label: "Island",
      render: ({ id, value, onChange }) => (
        <ApiSelect id={id} url="/api/islands" multiple value={value} onChange={onChange} />
      ),
    },
    { type: "date-range", key: "created", label: "Submitted" },
  ]}
  value={state.filters}
  onApply={state.setFilters}
/>
```
