---
title: Segmented control
sidebar_position: 12
---

Pick one of a few options shown side by side (shadcn toggle group, single mode). One segment is always selected.

```tsx
import { SegmentedControl, Icon } from '@javaabu/onu';

<SegmentedControl options={['Day', 'Week', 'Month']} value={period} onValueChange={setPeriod} />
<SegmentedControl
  aria-label="View"
  iconOnly
  options={[
    { value: 'table', label: 'Table', icon: <Icon name="table" /> },
    { value: 'grid', label: 'Grid', icon: <Icon name="grid" /> },
  ]}
/>
```

## Props

| Prop                     | Type                         | Default      | Description                                     |
| ------------------------ | ---------------------------- | ------------ | ----------------------------------------------- |
| `options`                | `(ChoiceOption \| string)[]` |              | Segments                                        |
| `value` / `defaultValue` | `string`                     | first option |                                                 |
| `onValueChange`          | `(value: string) => void`    |              | Never called with an empty value                |
| `size`                   | `"sm" \| "default" \| "lg"`  | `"default"`  | `segmentedControlVariants`                      |
| `fullWidth`              | `boolean`                    | `false`      | Segments share the container width              |
| `iconOnly`               | `boolean`                    | `false`      | Show only icons; labels stay for screen readers |
| `name`                   | `string`                     |              | Hidden input for forms                          |
| `classNames`             | `{ item }`                   |              |                                                 |

## Layout

Segments size to their label and are never truncated. When there is spare room (for example with `fullWidth`) they share it evenly; when space runs out (a narrow toolbar or phone), the control scrolls sideways instead of cutting labels off. Focusing a segment with the keyboard scrolls it into view.

## Accessibility

A `radiogroup` of `radio` buttons (Radix toggle group, single mode), labelled by its FormField or `aria-label`.

| Key           | Action                                            |
| ------------- | ------------------------------------------------- |
| ← / →         | Move between segments in visual order (RTL aware) |
| Space / Enter | Select the focused segment                        |
