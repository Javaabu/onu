---
title: Switch
sidebar_position: 11
---

shadcn's switch plus a label and description. Use it for settings that take effect immediately. Without `label` it renders just the switch.

```tsx
import { Switch } from '@javaabu/onu';

<Switch label="Email notifications" description="A daily digest." />
<Switch label="SMS" labelPosition="start" classNames={{ root: 'justify-between w-full' }} />
<Switch aria-label="Dark mode" size="sm" />
```

## Props

All shadcn/Radix switch props (`checked`, `defaultChecked`, `onCheckedChange`, `size`, `name`, `disabled`), plus:

| Prop            | Type                           | Default | Description                               |
| --------------- | ------------------------------ | ------- | ----------------------------------------- |
| `label`         | `ReactNode`                    |         | Clickable label                           |
| `description`   | `ReactNode`                    |         | Secondary text (`aria-describedby`)       |
| `labelPosition` | `"end" \| "start"`             | `"end"` | Settings lists often use `start`          |
| `className`     | `string`                       |         | Classes for the **switch** (as in shadcn) |
| `classNames`    | `{ root, label, description }` |         |                                           |

:::info

`Switch` replaces shadcn's primitive in the main export and is API-compatible; the primitive is available from `@javaabu/onu/primitives`.

:::

## Accessibility

A `switch`; Space and Enter toggle. The thumb moves to the end in both LTR and RTL. The hit area grows to 44px on touch screens.
