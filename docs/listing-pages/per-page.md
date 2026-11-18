# PerPage

A rows-per-page select (shadcn `Select`), used by [`Pagination`](./pagination.md). Changing it should send the list back to page 1, which [`useListingState`](./use-listing-state.md) does.

```tsx
import { PerPage } from "@javaabu/onu"

;<PerPage value={state.perPage} onValueChange={state.setPerPage} />
<PerPage value={24} onValueChange={setSize} options={[12, 24, 48]} label="Cards per page" />
```

## Props

| Prop            | Type                                | Default             | Description                                    |
| --------------- | ----------------------------------- | ------------------- | ---------------------------------------------- |
| `value`         | `number`                            |                     | Current size (added to the options if missing) |
| `onValueChange` | `(perPage) => void`                 |                     |                                                |
| `options`       | `number[]`                          | `[10, 25, 50, 100]` |                                                |
| `label`         | `ReactNode \| null`                 | "Rows per page"     | `null` hides it visually (it stays the name)   |
| `size`          | `"sm" \| "default"`                 | `"default"`         | 32px (`default`, Ant's page-size changer) or 28px |
| `disabled`      | `boolean`                           |                     |                                                |
| `classNames`    | `{ root, label, trigger, content }` |                     |                                                |

## Accessibility

A combobox labelled by the visible label. Arrow keys move through the sizes, <kbd>Enter</kbd> picks one, <kbd>Escape</kbd> closes.
