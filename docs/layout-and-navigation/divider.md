# Divider

A separator line built on shadcn's `Separator`, optionally with a label in the middle, at the start or at the end.

```tsx
import { Divider } from "@javaabu/onu"

;<Divider />
<Divider label="or" />
<Divider label="Today" align="start" variant="dashed" />
<Divider orientation="vertical" />
```

## Props

| Prop          | Type                             | Default        | Description                                           |
| ------------- | -------------------------------- | -------------- | ----------------------------------------------------- |
| `label`       | `ReactNode`                      |                | Text on the line                                      |
| `align`       | `'start' \| 'center' \| 'end'`   | `'center'`     | Label position                                        |
| `orientation` | `'horizontal' \| 'vertical'`     | `'horizontal'` | Direction                                             |
| `variant`     | `'solid' \| 'dashed'`            | `'solid'`      | Line style                                            |
| `spacing`     | `'none' \| 'sm' \| 'md' \| 'lg'` | `'none'`       | Margin around the line                                |
| `decorative`  | `boolean`                        | `true`         | Without a label, expose a `separator` role when false |
| `classNames`  | `{ line, label }`                |                | Classes for each part                                 |

`dividerVariants` is exported.

## Accessibility

Dividers are decorative by default (hidden from screen readers). Set `decorative={false}` when the line separates content meaningfully. A label is ordinary text and is read.

## RTL

`align="start"` puts the label on the right in RTL.
