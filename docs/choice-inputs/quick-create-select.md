# Select with quick-create

A [searchable select](./searchable-select.md) that can create the option the user is looking for. When nothing matches the search exactly, a "Create “…”" row appears. Create inline with `onCreate`, or open your own dialog with `renderCreateDialog`. The new option is added, selected and announced. [API select](./api-select.md) accepts the same props (and refreshes its cache afterwards).

```tsx
import { QuickCreateSelect } from '@javaabu/onu';

// Inline
<QuickCreateSelect
  options={categories}
  onCreate={async (label) => {
    const { data } = await api.post('/categories', { name: label });
    return { value: String(data.id), label: data.name };
  }}
/>

// Through a dialog
<QuickCreateSelect
  options={vendors}
  renderCreateDialog={({ query, open, onOpenChange, onCreated }) => (
    <NewVendorDialog name={query} open={open} onOpenChange={onOpenChange} onSaved={(v) => onCreated({ value: v.id, label: v.name })} />
  )}
/>
```

## Props

All [Searchable select](./searchable-select.md) props (including `multiple`), plus:

| Prop                 | Type                                                       | Description                                      |
| -------------------- | ---------------------------------------------------------- | ------------------------------------------------ |
| `onCreate`           | `(label) => ChoiceOption \| Promise<ChoiceOption \| null>` | Create inline; return the new option             |
| `renderCreateDialog` | `({ query, open, onOpenChange, onCreated }) => ReactNode`  | Render your own dialog; call `onCreated(option)` |
| `onCreated`          | `(option) => void`                                         | After any create                                 |

While `onCreate` runs the row shows "Creating…"; if it throws, the row shows "Couldn’t create “…”" and can be tried again.

## Accessibility

The create row is a normal option (Enter selects it). "“…” created and selected" is announced. With a dialog, the popover closes first, so focus returns to the field when the dialog closes.
