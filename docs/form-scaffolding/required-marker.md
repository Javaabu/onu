# RequiredMarker

The `*` shown after a required field's label. [`FormField`](./form-field.md) adds it when `required` is set.

```tsx
import { RequiredMarker } from '@javaabu/onu';

<label>Name <RequiredMarker /></label>
<RequiredMarker symbol="(required)" />
```

## Props

| Prop        | Type     | Default | Description                                |
| ----------- | -------- | ------- | ------------------------------------------ |
| `symbol`    | `string` | `"*"`   | Marker text                                |
| `className` | `string` |         | Merged with the default `text-destructive` |

Every other `<span>` prop is passed through.

## Accessibility

The marker is hidden from screen readers (`aria-hidden="true"`), so a label is not read as "Name star". Mark the control itself with `required` (or `aria-required`), which screen readers announce as "required". With `required`, [`FormField`](./form-field.md) adds the marker and sets `required` / `aria-required` on its control; [`Label`](./label.md) only adds the marker, so set `required` on your control yourself. The marker has a translated tooltip (`common.required`: "Required" / "ލާޒިމް") for mouse users. On long forms, explain the `*` once at the top.
