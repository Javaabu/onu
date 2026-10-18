# FilterSubmit

Submit and Reset buttons for a classic filter form, e.g. a server-rendered filter bar above a table. The submit button is `type="submit"`; `loading` shows a spinner and blocks double submits.

```tsx
import { FilterSubmit } from "@javaabu/onu"

;<form method="get" action="/users">
  <FormField label="Name">
    <TextInput name="search" />
  </FormField>
  <FilterSubmit loading={processing} onReset={() => router.get("/users")} />
</form>
```

For an interactive listing prefer the [`FilterPanel`](./filter-panel.md).

## Props

| Prop                         | Type                | Default            | Description                             |
| ---------------------------- | ------------------- | ------------------ | --------------------------------------- |
| `loading`                    | `boolean`           | `false`            | Spinner, `aria-busy`, disabled          |
| `onReset`                    | `() => void`        |                    | Shows Reset                             |
| `resetDisabled`              | `boolean`           |                    |                                         |
| `submitLabel` / `resetLabel` | `ReactNode`         | "Filter" / "Reset" |                                         |
| `form`                       | `string`            |                    | Form id when the buttons sit outside it |
| `classNames`                 | `{ submit, reset }` |                    |                                         |

## Accessibility

Standard buttons; <kbd>Enter</kbd> in any field of the form submits it.
