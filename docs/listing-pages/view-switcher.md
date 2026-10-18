# ViewSwitcher

Switches a listing between table, list, grid and board views. A single-choice toggle group (shadcn `ToggleGroup`).

```tsx
import { ViewSwitcher } from "@javaabu/onu"

<ViewSwitcher value={state.view ?? "table"} onValueChange={state.setView} />
<ViewSwitcher views={["list", "grid", { value: "map", label: "Map", icon: "map-pin" }]} showLabels />
```

Store the view in [`useListingState`](./use-listing-state.md) (`state.view`) to keep it in the URL.

## Props

| Prop            | Type                            | Default                               | Description                    |
| --------------- | ------------------------------- | ------------------------------------- | ------------------------------ |
| `value`         | `ListingView`                   |                                       | Controlled view                |
| `defaultValue`  | `ListingView`                   | `"table"`                             |                                |
| `onValueChange` | `(view) => void`                |                                       |                                |
| `views`         | `(ListingView \| ViewOption)[]` | `["table", "list", "grid", "kanban"]` | Built-ins get labels and icons |
| `showLabels`    | `boolean`                       | `false`                               | Text next to the icons         |

## Accessibility

A `radiogroup` named "View"; each icon button has its view's name. Arrow keys move between views, following visual order in RTL.
