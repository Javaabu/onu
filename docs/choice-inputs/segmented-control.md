# Segmented control

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

A listing's table, list, grid and board views are an icon-only segmented control. `useListingViewOptions(views?)` returns the options for those views, with translated labels and icons; their values match [`ListView`](../listing-pages/list-view.md)'s `layout`.

```tsx
import { Icon, SegmentedControl, useListingViewOptions, useTranslation } from '@javaabu/onu';

const { t } = useTranslation();
const views = useListingViewOptions(); // table, list, grid and kanban
const withMap = [...useListingViewOptions(['list', 'grid']), { value: 'map', label: 'Map', icon: <Icon name="map-pin" /> }];

<SegmentedControl
  iconOnly
  size="sm"
  aria-label={t('listing.view')}
  options={views}
  value={state.view ?? 'table'}
  onValueChange={state.setView}
/>
<SegmentedControl size="sm" aria-label={t('listing.view')} options={withMap} />
```

Store the view in [`useListingState`](../listing-pages/use-listing-state.md) (`state.view`) to keep it in the URL.

| Parameter | Type            | Default                               | Description                                                  |
| --------- | --------------- | ------------------------------------- | ------------------------------------------------------------ |
| `views`   | `ListingView[]` | `["table", "list", "grid", "kanban"]` | Built-ins get labels and icons; others are labelled by value |

It returns `ChoiceOption[]`. `t('listing.view')` names the group "View" ("ދައްކާ ގޮތް" in Dhivehi); with `iconOnly`, each segment is named by its view ("Table", "ޓޭބަލް") and shows it as a tooltip.

## Accessibility

A `radiogroup` of `radio` buttons (Radix toggle group, single mode), labelled by its FormField or `aria-label`. With `iconOnly`, each segment keeps its label as its accessible name.

| Key           | Action                                            |
| ------------- | ------------------------------------------------- |
| ← / →         | Move between segments in visual order (RTL aware) |
| Space / Enter | Select the focused segment                        |
