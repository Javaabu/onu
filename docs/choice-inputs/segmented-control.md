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
| `iconOnly`               | `boolean`                    | `false`      | Show only icons; labels stay as names, tooltips |
| `name`                   | `string`                     |              | Hidden input for forms                          |
| `classNames`             | `{ item }`                   |              |                                                 |

## Layout

Segments size to their label and are never truncated. When there is spare room (for example with `fullWidth`) they share it evenly; when space runs out (a narrow toolbar or phone), the control scrolls sideways instead of cutting labels off. Focusing a segment with the keyboard scrolls it into view.

## View switcher

A listing's table, list, grid and board views are an icon-only segmented control. `ViewSwitcher` is a preset with those views built in (`iconOnly`, `size="sm"`, named "View"); its values match [`ListView`](../listing-pages/list-view)'s `layout`.

```tsx
import { ViewSwitcher } from '@javaabu/onu';

<ViewSwitcher value={state.view ?? 'table'} onValueChange={state.setView} />
<ViewSwitcher views={['list', 'grid', { value: 'map', label: 'Map', icon: 'map-pin' }]} showLabels />
```

Store the view in [`useListingState`](../listing-pages/use-listing-state) (`state.view`) to keep it in the URL.

| Prop            | Type                            | Default                               | Description                    |
| --------------- | ------------------------------- | ------------------------------------- | ------------------------------ |
| `value`         | `ListingView`                   |                                       | Controlled view                |
| `defaultValue`  | `ListingView`                   | `"table"`                             |                                |
| `onValueChange` | `(view) => void`                |                                       |                                |
| `views`         | `(ListingView \| ViewOption)[]` | `["table", "list", "grid", "kanban"]` | Built-ins get labels and icons |
| `showLabels`    | `boolean`                       | `false`                               | Text next to the icons         |

Other props are as for `SegmentedControl` (`size` defaults to `"sm"`). The group is named "View" ("ދައްކާ ގޮތް" in Dhivehi) unless you pass `aria-label`; each icon segment is named by its view ("Table", "ޓޭބަލް") and shows it as a tooltip.

## Accessibility

A `radiogroup` of `radio` buttons (Radix toggle group, single mode), labelled by its FormField or `aria-label`. With `iconOnly`, each segment keeps its label as its accessible name.

| Key           | Action                                            |
| ------------- | ------------------------------------------------- |
| ← / →         | Move between segments in visual order (RTL aware) |
| Space / Enter | Select the focused segment                        |
