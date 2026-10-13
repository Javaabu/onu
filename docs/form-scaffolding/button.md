---
title: Button
sidebar_position: 17
---

Onu's button: shadcn's `Button` with a `loading` state, `startIcon` / `endIcon`, and extra `success` and `warning` variants. It is styled like Ant Design's button: 32px tall at the default density, 14px regular text, 15px padding and 6px corners (from `--onu-radius`), with colour transitions and no shadow.

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

| `variant`     | Ant Design equivalent | Use                           |
| ------------- | --------------------- | ----------------------------- |
| `default`     | `type="primary"`      | Primary action (solid brand)  |
| `outline`     | default button        | Secondary actions, toolbars: card fill, grey border; the border and text turn to the brand colour on hover |
| `dashed`      | `type="dashed"`       | Add a row or item             |
| `secondary`   | `variant="filled"`    | Filled grey                   |
| `ghost`       | `type="text"`         | Icon buttons, low emphasis    |
| `link`        | `type="link"`         | Looks like a link             |
| `destructive` | `type="primary" danger` | Delete, revoke (solid red)  |
| `success`     |                       | Approve, publish              |
| `warning`     |                       | Suspend, risky but reversible |

Sizes: `xs` (24px), `sm` (28px), `default` (32px), `lg` (36px), `icon`, `icon-xs`, `icon-sm`, `icon-lg`, at the default density. On touch screens every button is at least 44px tall.

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
