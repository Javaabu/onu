# FormGroup

Lays out related fields in a responsive grid and sets their label layout. Columns respond to the group's own width (container queries), so a two-column group inside a narrow card stacks to one column.

```tsx
import { FormGroup, FormField, TextInput } from "@javaabu/onu"

;<FormGroup columns={2}>
  <FormField label="First name">
    <TextInput />
  </FormField>
  <FormField label="Last name">
    <TextInput />
  </FormField>
  <FormField label="Address" className="col-span-full">
    <TextInput />
  </FormField>
</FormGroup>
```

## Props

| Prop          | Type                    | Default   | Description                          |
| ------------- | ----------------------- | --------- | ------------------------------------ |
| `columns`     | `1 \| 2 \| 3 \| 4`      | `1`       | Columns on wide containers           |
| `labelLayout` | `'stacked' \| 'inline'` | inherited | Label layout for the fields inside   |
| `disabled`    | `boolean`               | inherited | Disable the fields inside            |
| `className`   | `string`                |           | Classes for the root (the container) |
| `classNames`  | `{ grid }`              |           | Classes for the grid                 |

Column breakpoints: 2 columns from a 36rem wide group, 3–4 columns from 56rem. `formGroupVariants` is exported.

## Accessibility

A layout container only; it adds no roles. Use a [`Fieldset`](./fieldset.md) when the group needs a title that screen readers announce.
