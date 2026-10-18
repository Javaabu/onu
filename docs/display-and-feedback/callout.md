# Callout (Alert)

An alert box for messages that need attention: info, success, warning or destructive, with a title, description, actions and an optional dismiss button. Extends shadcn's `Alert` (which stays available as `Alert`).

```tsx
import { Callout } from "@javaabu/onu"

<Callout variant="success" title="Application submitted" description="Reference APP-2026-00412." />

<Callout
  variant="warning"
  title="Permit expires in 5 days"
  description="Renew before 30 June to avoid a late fee."
  actions={<Button size="sm">Renew now</Button>}
  dismissible
/>
```

## Props

| Prop           | Type                                                             | Default     | Description                            |
| -------------- | ---------------------------------------------------------------- | ----------- | -------------------------------------- |
| `variant`      | `'default' \| 'info' \| 'success' \| 'warning' \| 'destructive'` | `'default'` | Tone                                   |
| `title`        | `ReactNode`                                                      |             | Title                                  |
| `description`  | `ReactNode`                                                      |             | Body (or `children`)                   |
| `actions`      | `ReactNode`                                                      |             | Buttons or links under the description |
| `icon`         | `string \| ReactNode \| false`                                   | per variant | Icon override; `false` hides it        |
| `dismissible`  | `boolean`                                                        | `false`     | Show a dismiss (×) button              |
| `open`         | `boolean`                                                        |             | Controlled visibility                  |
| `onOpenChange` | `(open) => void`                                                 |             | Called when dismissed                  |
| `onDismiss`    | `() => void`                                                     |             | Called after dismissing                |
| `role`         | `string`                                                         | see below   | ARIA role override                     |
| `classNames`   | `{ icon, title, description, actions, dismiss }`                 |             | Classes for each part                  |

Variants are exported as `calloutVariants`.

## Accessibility

- `warning` and `destructive` use `role="alert"` (announced immediately); the others use `role="status"` (announced politely). Pass `role="note"` for static content that shouldn't be announced.
- Each variant has its own icon, so meaning doesn't rely on colour.
- The dismiss button is labelled "Dismiss" and is 44px on touch screens.

| Key                                 | Action                    |
| ----------------------------------- | ------------------------- |
| <kbd>Tab</kbd>                      | Move to actions / dismiss |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Activate                  |

## RTL

The icon is at the inline start and the dismiss button at the inline end, so they swap sides in RTL.
