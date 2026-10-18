# Select

A select for short lists, built on shadcn's select (Radix). Pass an `options` array, or `SelectItem` children. Optional fields can show a clear button.

```tsx
import { Select, SelectGroup, SelectItem, SelectLabel } from '@javaabu/onu';

<Select options={[{ value: 'K', label: 'Kaafu' }, { value: 'S', label: 'Seenu' }]} placeholder="Select an atoll" />

<Select options={['Female', 'Male']} value={gender} onValueChange={setGender} clearable />

<Select placeholder="Choose an office">
  <SelectGroup>
    <SelectLabel>Malé</SelectLabel>
    <SelectItem value="hq">Head office</SelectItem>
  </SelectGroup>
</Select>
```

Options with the same `group` are listed under that heading. Options may be plain strings (value = label).

## Props

| Prop                                    | Type                                      | Default            | Description                                                   |
| --------------------------------------- | ----------------------------------------- | ------------------ | ------------------------------------------------------------- |
| `options`                               | `(ChoiceOption \| string)[]`              |                    | Options; or pass `SelectItem` / `SelectGroup` children        |
| `value` / `defaultValue`                | `string`                                  | `""`               | Selected value; `""` shows the placeholder                    |
| `onValueChange`                         | `(value: string) => void`                 |                    | Also called with `""` when cleared                            |
| `placeholder`                           | `string`                                  | "Select an option" | Text when empty                                               |
| `clearable`                             | `boolean`                                 | `false`            | Show a clear button when a value is set; hidden when required |
| `size`                                  | `"sm" \| "default" \| "lg"`               | `"default"`        | Trigger height                                                |
| `position`                              | `"item-aligned" \| "popper"`              | `"item-aligned"`   | Open over the trigger or below it                             |
| `name`, `required`, `disabled`, `form`  |                                           |                    | Form props (a native select is rendered inside a `<form>`)    |
| `open` / `defaultOpen` / `onOpenChange` |                                           |                    | Controlled open state                                         |
| `className`                             | `string`                                  |                    | Classes for the trigger                                       |
| `classNames`                            | `{ root, trigger, content, item, clear }` |                    | Classes for each part                                         |

Other button props (`aria-label`, `id`, …) and `ref` go to the trigger button.

:::info

`Select` replaces shadcn's `Select` root in the main export. It stays compatible: if its children contain `SelectTrigger` and `SelectContent`, it behaves exactly like the shadcn root. The primitive is still available from `@javaabu/onu/primitives`. Differences: it always manages the value (so it can be cleared), and an empty value is `""`.

:::

## Accessibility

Radix select: the trigger is a `combobox` with a listbox popup. Wrap it in a [`FormField`](../form-scaffolding/form-field.md) or give it `aria-label`.

| Key                | Action                                         |
| ------------------ | ---------------------------------------------- |
| Enter, Space, ↓, ↑ | Open the list                                  |
| ↓ / ↑, Home / End  | Move through options                           |
| Typing             | Jump to the option starting with those letters |
| Enter              | Choose the highlighted option                  |
| Escape             | Close and return focus to the trigger          |

## RTL and touch

The chevron, clear button and list mirror in RTL. On coarse pointers the trigger and items are at least 44px tall. Use [Searchable select](./searchable-select.md) for long lists (it opens as a bottom sheet on phones).
