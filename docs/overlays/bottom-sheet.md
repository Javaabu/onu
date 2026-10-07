---
title: BottomSheet
sidebar_position: 4
---

A pull-up panel anchored to the bottom of the screen. Drag it down to dismiss, drag between snap points, or use the close / expand buttons and <kbd>Escape</kbd>, so the gesture is never the only way. Built on shadcn's `Drawer` (vaul), kept behind Onu's own API so the library can be swapped later (R4.3).

```tsx
import { BottomSheet, BottomSheetClose, Button } from "@javaabu/onu"

;<BottomSheet
  trigger={<Button>Filter by island</Button>}
  title="Filter by island"
  footer={
    <BottomSheetClose asChild>
      <Button>Apply</Button>
    </BottomSheetClose>
  }
>
  …
</BottomSheet>
```

## Snap points

```tsx
<BottomSheet title="Malé → Hulhumalé ferry" snapPoints={[0.4, 1]}>
  …
</BottomSheet>
```

Snap points are fractions of the screen height (`0.4`) or pixel strings (`"320px"`), smallest first. The sheet opens at the first one. An expand/collapse button in the header switches between the first and last. Control it with `activeSnapPoint` / `onActiveSnapPointChange`.

## Not dismissible

```tsx
<BottomSheet open={open} onOpenChange={setOpen} dismissible={false} closeButton={false} title="Terms" footer={…} />
```

## Composing

`BottomSheetRoot`, `BottomSheetTrigger`, `BottomSheetContent` (`size`, `handle`, `snapping`), `BottomSheetHeader` (`closeButton`, `expandButton`), `BottomSheetTitle`, `BottomSheetDescription`, `BottomSheetBody`, `BottomSheetFooter` and `BottomSheetClose` are exported.

## Props

| Prop                                                             | Type                                                                  | Default | Description                                       |
| ---------------------------------------------------------------- | --------------------------------------------------------------------- | ------- | ------------------------------------------------- |
| `title`                                                          | `ReactNode`                                                           |         | Heading and accessible name (required)            |
| `hideTitle`                                                      | `boolean`                                                             | `false` | Hide the title visually                           |
| `description`                                                    | `ReactNode`                                                           |         | Accessible description                            |
| `footer`                                                         | `ReactNode`                                                           |         | Action bar                                        |
| `trigger`                                                        | `ReactNode`                                                           |         | Element that opens the sheet                      |
| `snapPoints`                                                     | `(number \| string)[]`                                                |         | Heights to snap to                                |
| `activeSnapPoint`, `defaultSnapPoint`, `onActiveSnapPointChange` |                                                                       |         | Snap point state                                  |
| `dismissible`                                                    | `boolean`                                                             | `true`  | Allow drag, outside click and Escape to close     |
| `handleOnly`                                                     | `boolean`                                                             | `false` | Only the handle starts a drag                     |
| `handle`                                                         | `boolean`                                                             | `true`  | Show the drag handle                              |
| `closeButton`                                                    | `boolean`                                                             | `true`  | Show the × button                                 |
| `size`                                                           | `'sm' \| 'md' \| 'lg' \| 'full'`                                      | `'md'`  | Max width on wider screens (full width on phones) |
| `open`, `defaultOpen`, `onOpenChange`, `modal`                   |                                                                       |         | Dialog state                                      |
| `classNames`                                                     | `{ handle, header, title, description, body, footer, close, expand }` |         | Classes for each part                             |

## Accessibility

- A modal dialog labelled by its title; focus is trapped and returns to the opener on close.
- The drag handle is decorative (`aria-hidden`); the close and expand buttons are the accessible alternatives (R3.27). The expand button exposes `aria-expanded`.
- The content is padded for the home indicator (`env(safe-area-inset-bottom)`, R3.30).

| Key               | Action                   |
| ----------------- | ------------------------ |
| <kbd>Tab</kbd>    | Move between controls    |
| <kbd>Escape</kbd> | Close (when dismissible) |

## RTL

The header buttons sit at the inline end and swap sides in RTL. Built-in labels ("Close", "Expand", "Collapse") are translated.
