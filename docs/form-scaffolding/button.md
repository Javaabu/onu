---
title: Button
sidebar_position: 17
---

Onu's button: shadcn's `Button` with a `loading` state, `startIcon` / `endIcon`, and extra `success` and `warning` variants.

```tsx
import { Button } from "@javaabu/onu"

<Button>Save</Button>
<Button variant="outline" startIcon="add">New user</Button>
<Button variant="success" startIcon="check">Approve</Button>
<Button variant="destructive" startIcon="trash">Delete</Button>
<Button loading loadingText="Saving…">Save</Button>
```

Buttons default to `type="button"`; use [`SubmitButton`](./submit-button) (or `type="submit"`) to submit a form. The shadcn primitive is still available from `@javaabu/onu/primitives`.

## Icons

`startIcon` and `endIcon` take a semantic icon name (it follows the configured icon set, R6.5) or any React element. Directional icons such as `arrow-right` mirror in RTL.

```tsx
<Button endIcon="arrow-right">Next</Button>
<Button startIcon={<img src={logo} alt="" className="size-4" />}>Continue</Button>
```

## Variants

| `variant`     | Use                           |
| ------------- | ----------------------------- |
| `default`     | Primary action                |
| `secondary`   | Secondary action              |
| `outline`     | Tertiary action, toolbars     |
| `ghost`       | Icon buttons, low emphasis    |
| `link`        | Looks like a link             |
| `destructive` | Delete, revoke                |
| `success`     | Approve, publish              |
| `warning`     | Suspend, risky but reversible |

Sizes: `xs`, `sm`, `default`, `lg`, `icon`, `icon-xs`, `icon-sm`, `icon-lg`. On touch screens every button is at least 44px tall.

`buttonVariants({ variant, size, className })` returns the classes, for styling other elements as buttons.

## Props

| Prop          | Type                               | Default   | Description                                    |
| ------------- | ---------------------------------- | --------- | ---------------------------------------------- |
| `variant`     | see above                          | `default` | Style                                          |
| `size`        | see above                          | `default` | Size                                           |
| `loading`     | `boolean`                          | `false`   | Spinner, `aria-busy`, clicks ignored           |
| `loadingText` | `ReactNode`                        |           | Label while loading                            |
| `startIcon`   | `SemanticIconName \| ReactElement` |           | Icon before the label                          |
| `endIcon`     | `SemanticIconName \| ReactElement` |           | Icon after the label                           |
| `asChild`     | `boolean`                          | `false`   | Render the child element (e.g. a link) instead |

All `<button>` props are passed through; `ref` points at the button. Exposes `data-slot="button"`, `data-variant`, `data-size` and `data-loading`.

## Accessibility

- Icon-only buttons need an `aria-label`.
- Loading buttons stay focusable and are `aria-busy` + `aria-disabled`; the spinner is decorative.
- Visible focus ring on `:focus-visible`.

| Key                                 | Action   |
| ----------------------------------- | -------- |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Activate |
