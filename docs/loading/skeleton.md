---
title: Skeleton presets
sidebar_position: 2
---

Ready-made skeletons for the most common shapes: `SkeletonText`, `SkeletonCard`, `SkeletonTable` and `SkeletonField`. They are built from shadcn's `Skeleton` (also exported for custom shapes) and use the `muted` token, so they work in light and dark mode.

```tsx
import { SkeletonCard, SkeletonField, SkeletonTable, SkeletonText } from "@javaabu/onu"

<SkeletonText lines={3} />
<SkeletonCard avatar lines={3} actions={2} />
<SkeletonTable rows={10} columns={5} selectable />
<SkeletonField control="select" help />
```

## Form fields

`SkeletonField` is shaped like a form field (label, control and optional help text), for forms whose values are still loading. It follows the same stacked/inline [label layout](../form-scaffolding/form-field) as `FormField`, so the page doesn't jump when the real fields arrive.

```tsx
import { FormField, SkeletonField, TextInput } from "@javaabu/onu"

function ProfileForm({ user, loading }: Props) {
  if (loading) {
    return (
      <>
        <SkeletonField />
        <SkeletonField control="textarea" help />
        <SkeletonField control="switch" />
      </>
    )
  }
  return (
    <FormField label="Full name">
      <TextInput defaultValue={user.name} />
    </FormField>
  )
}
```

Checkboxes and switches keep their label-beside-control shape in both layouts (R3.34). Inline layout falls back to stacked in narrow containers, like `FormField`. Controls are 44px tall on touch screens, matching the real inputs.

`PlaceholderInput` is the same component under its older name, with `data-slot="placeholder-input"`. Its `label` is a boolean (show the label shape, like `showLabel`) and its screen-reader text is `srLabel`.

## Props

### SkeletonText

| Prop         | Type                   | Default        | Description                                |
| ------------ | ---------------------- | -------------- | ------------------------------------------ |
| `lines`      | `number`               | `3`            | Number of lines                            |
| `widths`     | `string[]`             | 100%, last 60% | Widths per line (cycled)                   |
| `size`       | `'sm' \| 'md' \| 'lg'` | `'md'`         | Line height, to match the text it replaces |
| `classNames` | `{ line }`             |                | Classes for each line                      |

### SkeletonCard

| Prop         | Type                                     | Default | Description                   |
| ------------ | ---------------------------------------- | ------- | ----------------------------- |
| `media`      | `boolean`                                | `false` | 16:9 image area at the top    |
| `avatar`     | `boolean`                                | `false` | Round avatar beside the title |
| `lines`      | `number`                                 | `2`     | Body lines                    |
| `actions`    | `number`                                 | `0`     | Button-shaped bars at the end |
| `classNames` | `{ media, avatar, title, line, action }` |         | Classes for each part         |

### SkeletonTable

| Prop         | Type                    | Default | Description           |
| ------------ | ----------------------- | ------- | --------------------- |
| `rows`       | `number`                | `5`     | Body rows             |
| `columns`    | `number`                | `4`     | Columns               |
| `header`     | `boolean`               | `true`  | Header row            |
| `selectable` | `boolean`               | `false` | Checkbox column       |
| `classNames` | `{ header, row, cell }` |         | Classes for each part |

The table is a container (`@container/skeleton-table`): in narrow containers only the first two columns show, as tables turn into cards on phones (R3.20).

### SkeletonField

| Prop          | Type                                                          | Default         | Description                    |
| ------------- | ------------------------------------------------------------- | --------------- | ------------------------------ |
| `control`     | `'input' \| 'textarea' \| 'select' \| 'checkbox' \| 'switch'` | `'input'`       | Shape of the control           |
| `showLabel`   | `boolean`                                                     | `true`          | Show a label placeholder       |
| `help`        | `boolean`                                                     | `false`         | Show a help-text placeholder   |
| `labelLayout` | `'stacked' \| 'inline'`                                       | form / provider | Label layout, like `FormField` |
| `classNames`  | `{ label, control, help }`                                    |                 | Classes for each part          |

### PlaceholderInput

Takes the `SkeletonField` props, with these in place of `showLabel` and `label`:

| Prop      | Type      | Default    | Description              |
| --------- | --------- | ---------- | ------------------------ |
| `label`   | `boolean` | `true`     | Show a label placeholder |
| `srLabel` | `string`  | "Loading…" | Screen-reader text       |

All the presets accept `label` (screen-reader text, default "Loading…"; `srLabel` on `PlaceholderInput`), `className` and other `<div>` props.

## Accessibility

Each preset is one `role="status"` region named "Loading…" (translated); the shapes inside are `aria-hidden`, so screen readers hear one announcement rather than a list of empty boxes. Put `aria-busy="true"` on the region being loaded if it stays mounted. When many fields load together, consider one `LoadingOverlay` or a single status message for the form instead of a `SkeletonField` per field. The pulse animation stops under `prefers-reduced-motion`.

## RTL

Shapes use logical properties and fill from the inline start, so they mirror in RTL. In `SkeletonField` the label column sits on the inline start (right in RTL), as in `FormField`.
