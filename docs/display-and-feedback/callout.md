---
title: Callout (Alert)
sidebar_position: 7
---

An alert box for messages that need attention: info, success, warning or destructive, with a title, description, actions and an optional dismiss button. Extends shadcn's `Alert` (which stays available as `Alert`). With `appearance` it is a quieter inline notice instead.

```tsx
import { Callout } from "@javaabu/onu"

<Callout tone="success" title="Application submitted" description="Reference APP-2026-00412." />

<Callout
  tone="warning"
  title="Permit expires in 5 days"
  description="Renew before 30 June to avoid a late fee."
  actions={<Button size="sm">Renew now</Button>}
  dismissible
/>
```

## Inline notices

With `appearance` set to `plain`, `subtle` or `bordered`, a callout is a subtle inline notice instead of a box: a short line of supporting text with an icon, for hints under a section or next to a form. Title, actions and dismiss are box-only.

```tsx
<Callout appearance="plain">Changes apply from the next billing period.</Callout>
<Callout appearance="bordered" tone="warning">Card payments may include a bank fee.</Callout>
<Callout appearance="subtle" tone="info" icon="clock">Last synced 5 minutes ago.</Callout>
```

## Props

| Prop           | Type                                                             | Default     | Description                            |
| -------------- | ---------------------------------------------------------------- | ----------- | -------------------------------------- |
| `tone` | `'neutral' \| 'info' \| 'success' \| 'warning' \| 'danger'` | `'neutral'` | Tone                                   |
| `appearance`   | `'box' \| 'plain' \| 'subtle' \| 'bordered'`                     | `'box'`     | Alert box, or a quiet inline notice    |
| `title`        | `ReactNode`                                                      |             | Title                                  |
| `description`  | `ReactNode`                                                      |             | Body (or `children`)                   |
| `actions`      | `ReactNode`                                                      |             | Buttons or links under the description |
| `icon`         | `string \| ReactNode \| false`                                   | per tone | Icon override; `false` hides it        |
| `dismissible`  | `boolean`                                                        | `false`     | Show a dismiss (×) button              |
| `open`         | `boolean`                                                        |             | Controlled visibility                  |
| `onOpenChange` | `(open) => void`                                                 |             | Called when dismissed                  |
| `onDismiss`    | `() => void`                                                     |             | Called after dismissing                |
| `role`         | `string`                                                         | see below   | ARIA role override                     |
| `classNames`   | `{ icon, title, description, actions, dismiss }`                 |             | Classes for each part                  |

Variants are exported as `calloutVariants` (box) and `calloutInlineVariants` (inline, keyed by `tone` and `appearance`).

## Accessibility

- In the box, `warning` and `destructive` use `role="alert"` (announced immediately); the others use `role="status"` (announced politely). Pass `role="note"` for static content that shouldn't be announced.
- The inline appearances use `role="note"`, so they are not announced. Use the box for messages that must interrupt.
- Each tone has its own icon, so meaning doesn't rely on colour.
- The dismiss button is labelled "Dismiss" and is 44px on touch screens.

| Key                                 | Action                    |
| ----------------------------------- | ------------------------- |
| <kbd>Tab</kbd>                      | Move to actions / dismiss |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Activate                  |

## RTL

The icon is at the inline start and the dismiss button at the inline end, so they swap sides in RTL. The `bordered` appearance draws its border on the inline start, so it moves to the right in RTL.
