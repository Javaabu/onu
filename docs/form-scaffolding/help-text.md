# HelpText

Supporting text under a control. [`FormField`](./form-field.md) renders it from the `help` prop and links it with `aria-describedby`.

```tsx
import { HelpText } from "@javaabu/onu"

;<HelpText id="name-help">As shown on your ID card.</HelpText>
```

## Props

| Prop        | Type                        | Default | Description                                                |
| ----------- | --------------------------- | ------- | ---------------------------------------------------------- |
| `id`        | `string`                    |         | Reference it from the control's `aria-describedby`         |
| `className` | `string`                    |         | Merged with the defaults (`text-sm text-muted-foreground`) |
| `children`  | `ReactNode`                 |         | The help text                                              |
| `ref`       | `Ref<HTMLParagraphElement>` |         |                                                            |

Every other `<p>` prop is passed through.

## Accessibility

`HelpText` is a plain paragraph: it is read as the control's description only when the control points at it with `aria-describedby`. [`FormField`](./form-field.md) gives it an id and links it (with any error messages), so screen readers read the label and then the help. Put what users need before typing (formats, limits) in help text rather than in a placeholder, which disappears on input and is not reliably read.
