---
title: Notice
sidebar_position: 8
---

A subtle inline notice: a short line of supporting text with an icon, quieter than a [Callout](./callout). Good for hints under a section or next to a form.

```tsx
import { Notice } from "@javaabu/onu"

<Notice>Changes apply from the next billing period.</Notice>
<Notice tone="warning" variant="bordered">Card payments may include a bank fee.</Notice>
<Notice tone="info" variant="subtle" icon="clock">Last synced 5 minutes ago.</Notice>
```

## Props

| Prop      | Type                                                             | Default     | Description                      |
| --------- | ---------------------------------------------------------------- | ----------- | -------------------------------- |
| `tone`    | `'neutral' \| 'info' \| 'success' \| 'warning' \| 'destructive'` | `'neutral'` | Colour and default icon          |
| `variant` | `'plain' \| 'subtle' \| 'bordered'`                              | `'plain'`   | Background / inline-start border |
| `icon`    | `string \| ReactNode \| false`                                   | per tone    | Icon override; `false` hides it  |

Variants are exported as `noticeVariants`.

## Accessibility

Rendered with `role="note"`, so it is not announced as an alert. Use a `Callout` for messages that must interrupt.

## RTL

The `bordered` variant draws its border on the inline start, so it moves to the right in RTL.
