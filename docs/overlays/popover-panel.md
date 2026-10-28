# PopoverPanel

A non-modal panel anchored to a trigger, for small forms, filters and extra details: Onu's simple-API **popover**. Built on shadcn's `Popover`; the primitive parts (`Popover`, `PopoverTrigger`, `PopoverContent`, …) are also exported for custom layouts. With `mobile="sheet"` it becomes a [bottom sheet](./bottom-sheet.md) on phones (R3.20).

```tsx
import { Button, PopoverPanel } from "@javaabu/onu"

;<PopoverPanel
  trigger={<Button variant="outline">Set budget</Button>}
  title="Monthly budget"
  closeButton
  footer={<Button size="sm">Save</Button>}
>
  <FormField label="Amount (MVR)">
    <TextInput inputMode="decimal" />
  </FormField>
</PopoverPanel>
```

## On phones

```tsx
<PopoverPanel mobile="sheet" trigger={<Button>Filters</Button>} title="Filters">
  …
</PopoverPanel>
```

Below 768px this renders a `BottomSheet` with the same title, content and footer. `title` is required for the sheet.

## Props

| Prop                                  | Type                                                  | Default     | Description                               |
| ------------------------------------- | ----------------------------------------------------- | ----------- | ----------------------------------------- |
| `trigger`                             | `ReactNode`                                           |             | Element that toggles the panel (required) |
| `title`                               | `ReactNode`                                           |             | Heading; the panel's accessible name      |
| `description`                         | `ReactNode`                                           |             | Accessible description                    |
| `footer`                              | `ReactNode`                                           |             | Actions, aligned to the inline end        |
| `closeButton`                         | `boolean`                                             | `false`     | Show a × button                           |
| `mobile`                              | `'popover' \| 'sheet'`                                | `'popover'` | Presentation on phones                    |
| `side`, `align`, `sideOffset`, …      |                                                       |             | Radix `Popover.Content` positioning props |
| `open`, `defaultOpen`, `onOpenChange` |                                                       |             | Open state                                |
| `className`                           | `string`                                              |             | Classes for the panel                     |
| `classNames`                          | `{ header, title, description, body, footer, close }` |             | Classes for each part                     |

## Accessibility

- The panel is a non-modal `dialog` labelled by its title, and the trigger exposes `aria-expanded` / `aria-controls`.
- Focus moves into the panel on open and back to the trigger on close. Clicking outside closes it.

| Key                                 | Action                  |
| ----------------------------------- | ----------------------- |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Toggle from the trigger |
| <kbd>Tab</kbd>                      | Move through the panel  |
| <kbd>Escape</kbd>                   | Close and return focus  |

## RTL

`side="left"` / `"right"` are physical (Radix); prefer `top` / `bottom` with `align="start" | "end"`, which follow the direction.
