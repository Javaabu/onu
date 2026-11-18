# HiddenInput

A hidden form value. Inside a [`FormField`](../form-scaffolding/form-field.md) it takes the field's `id` and `name`, so server errors for that name show on the field like any other control.

```tsx
import { HiddenInput } from "@javaabu/onu"

<HiddenInput name="island_id" value={42} />
<HiddenInput name="is_featured" value={true} />        // submits "1"
<HiddenInput name="tags" value={["ferry", "transport"]} /> // submits tags[]=ferry&tags[]=transport

<FormField label="Location" name="location_id" hideLabel>
  <HiddenInput value={locationId} />
</FormField>
```

## Values

| Value                | Submitted as                         |
| -------------------- | ------------------------------------ |
| `string` / `number`  | As text                              |
| `true` / `false`     | `"1"` / `"0"` (what Laravel expects) |
| `null` / `undefined` | `""`                                 |
| `string[]`           | One input per item, named `name[]`   |

## Props

| Prop    | Type                                              | Description                      |
| ------- | ------------------------------------------------- | -------------------------------- |
| `value` | `string \| number \| boolean \| null \| string[]` | Value to submit                  |
| `name`  | `string`                                          | Field name (or from `FormField`) |

`id`, `form`, `disabled` and `ref` are passed to the `<input type="hidden">`.

## Accessibility

Hidden inputs are not shown or announced. Use them only for values the user does not need to see.
