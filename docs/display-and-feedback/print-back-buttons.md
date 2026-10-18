# PrintButton and BackButton

Two small helpers for detail pages, receipts and certificates. Both are shadcn `Button`s, hide themselves when printing (`print:hidden`) and are 44px tall on touch screens.

```tsx
import { BackButton, PrintButton } from "@javaabu/onu"

<BackButton fallbackHref="/applications" />
<BackButton href="/users">All users</BackButton>
<PrintButton onBeforePrint={() => setExpanded(true)} />
<PrintButton iconOnly variant="ghost" />
```

## PrintButton props

| Prop            | Type           | Default     | Description                                  |
| --------------- | -------------- | ----------- | -------------------------------------------- |
| `onBeforePrint` | `() => void`   |             | Runs before `window.print()`                 |
| `iconOnly`      | `boolean`      | `false`     | Icon only; "Print" stays the accessible name |
| `variant`       | Button variant | `'outline'` | Look                                         |
| `children`      | `ReactNode`    | "Print"     | Label                                        |

Calling `event.preventDefault()` in `onClick` cancels printing.

## BackButton props

| Prop           | Type           | Default   | Description                                                      |
| -------------- | -------------- | --------- | ---------------------------------------------------------------- |
| `href`         | `string`       |           | Go here (rendered as a link with the provider's `linkComponent`) |
| `fallbackHref` | `string`       |           | Used when there is no history (page opened directly)             |
| `iconOnly`     | `boolean`      | `false`   | Icon only; "Back" stays the accessible name                      |
| `variant`      | Button variant | `'ghost'` | Look                                                             |
| `children`     | `ReactNode`    | "Back"    | Label                                                            |

Without `href`, it calls `history.back()`.

## Accessibility

Both are real buttons (or a link with `href`) with translated names.

## RTL

The back arrow mirrors in RTL.
