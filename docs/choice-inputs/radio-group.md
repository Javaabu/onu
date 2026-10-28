# Radio group

A set of radios where one can be chosen (shadcn radio group). Give `options` or [`Radio`](./radio.md) children, in the `default` or `card` variant, stacked or side by side.

```tsx
import { RadioGroup } from '@javaabu/onu';

<RadioGroup options={['Female', 'Male']} orientation="horizontal" />
<RadioGroup
  variant="card"
  options={[
    { value: 'post', label: 'Post', description: 'Collect from the post office' },
    { value: 'courier', label: 'Courier', description: 'To your door', aside: 'MVR 50' },
  ]}
/>
```

## Props

All Radix radio group props (`value`, `defaultValue`, `onValueChange`, `name`, `required`, `disabled`, `loop`), plus:

| Prop          | Type                                      | Default      | Description                                      |
| ------------- | ----------------------------------------- | ------------ | ------------------------------------------------ |
| `options`     | `(RadioGroupOption \| string)[]`          |              | `ChoiceOption` plus `media` and `aside`          |
| `variant`     | `"default" \| "card"`                     | `"default"`  | Radios with labels, or selectable cards          |
| `orientation` | `"vertical" \| "horizontal"`              | `"vertical"` | Horizontal wraps; card columns fit the container |
| `size`        | `"default" \| "lg"`                       | `"default"`  | `lg` for kiosks                                  |
| `classNames`  | `{ item, label, description, indicator }` |              | Applied to every item                            |

:::info

`RadioGroup` replaces shadcn's primitive in the main export and is compatible with it (shadcn `RadioGroupItem` children still work). The primitive is available from `@javaabu/onu/primitives`.

:::

## Accessibility

A `radiogroup`, labelled by its [`FormField`](../form-scaffolding/form-field.md) label (or `aria-label`). Errors set `aria-invalid` on the group and its items.

| Key        | Action                                                |
| ---------- | ----------------------------------------------------- |
| Tab        | Focus the checked radio (or the first)                |
| Arrow keys | Move to and check the next/previous radio; follow RTL |
| Space      | Check the focused radio                               |
